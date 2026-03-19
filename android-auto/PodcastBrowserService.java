package com.fhm.podcastsphere;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaDescriptionCompat;
import android.support.v4.media.MediaMetadataCompat;
import androidx.media.session.MediaButtonReceiver;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.MediaBrowserServiceCompat;
import androidx.media.app.NotificationCompat.MediaStyle;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * PodcastBrowserService — MediaBrowserServiceCompat
 *
 * Responsabilités :
 *  - Maintenir la MediaSession (métadonnées + état lecture)
 *  - Afficher la notification MediaStyle (mini player notif + lock screen)
 *  - Répondre aux commandes hardware (casques, boutons Bluetooth, Android Auto)
 *  - Exposer le browse tree pour Android Auto
 *
 * Communication WebView → Service  : Intent via startForegroundService()
 *   Actions : UPDATE_METADATA | UPDATE_PLAYBACK_STATE | STOP_SERVICE
 *
 * Communication Service → WebView  : Broadcast local "WEBVIEW_COMMAND"
 *   Écouté par PodcastAutoPlugin qui notifie le layer React via Capacitor
 */
public class PodcastBrowserService extends MediaBrowserServiceCompat {

    private static final String TAG = "PodcastBrowserService";

    // IDs stables
    private static final String MEDIA_ROOT_ID   = "podcast_root";
    private static final int    NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID      = "podcast_playback";
    private static final int    ARTWORK_MAX_SIZE = 500;

    // Actions entrantes (depuis PodcastAutoPlugin)
    public static final String ACTION_UPDATE_METADATA       = "UPDATE_METADATA";
    public static final String ACTION_UPDATE_PLAYBACK_STATE = "UPDATE_PLAYBACK_STATE";
    public static final String ACTION_STOP_SERVICE          = "STOP_SERVICE";

    // Action sortante (vers PodcastAutoPlugin → React)
    public static final String ACTION_WEBVIEW_COMMAND = "com.fhm.podcastsphere.WEBVIEW_COMMAND";

    // ---------------------------------------------------------------
    // État courant (mis à jour par le WebView via Intents)
    // ---------------------------------------------------------------
    private MediaSessionCompat mediaSession;
    

    private String  currentTitle    = "";
    private String  currentAuthor   = "";
    private Bitmap  currentArtwork  = null;
    private long    currentDuration = 0L;
    private boolean isPlaying       = false;
    private long    currentPosition = 0L;

    // ===============================================================
    //  Cycle de vie du Service
    // ===============================================================

    @Override
    public void onCreate() {
        super.onCreate();


        // --- MediaSession ---
        Intent mediaButtonIntent = new Intent(Intent.ACTION_MEDIA_BUTTON);
        mediaButtonIntent.setClass(this, MediaButtonReceiver.class);
        PendingIntent mediaPendingIntent = PendingIntent.getBroadcast(
            this, 0, mediaButtonIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        mediaSession = new MediaSessionCompat(this, TAG);
        mediaSession.setMediaButtonReceiver(mediaPendingIntent);
        mediaSession.setCallback(new PodcastSessionCallback());
        mediaSession.setFlags(
            MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
            MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
        );

        // État initial : session active pour rendre MediaStyle visible même en pause
        mediaSession.setActive(true);
        applyPlaybackState(false, 0);
        setSessionToken(mediaSession.getSessionToken());

        Log.d(TAG, "Service créé, session token défini");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            final String action = intent.getAction();

            if (ACTION_UPDATE_METADATA.equals(action)) {
                String title      = intent.getStringExtra("title");
                String author     = intent.getStringExtra("author");
                String artworkUrl = intent.getStringExtra("artworkUrl");
                long   duration   = intent.getLongExtra("duration", 0L);
                handleUpdateMetadata(title, author, artworkUrl, duration);
                return START_STICKY;
            }

            if (ACTION_UPDATE_PLAYBACK_STATE.equals(action)) {
                boolean playing  = intent.getBooleanExtra("isPlaying", false);
                long    position = intent.getLongExtra("position", 0L);
                handleUpdatePlaybackState(playing, position);
                return START_STICKY;
            }

            if (ACTION_STOP_SERVICE.equals(action)) {
                mediaSession.setActive(false);
                stopForeground(true);
                stopSelf();
                return START_NOT_STICKY;
            }
        }

        // Laisser passer uniquement les events hardware (casques, boutons Bluetooth)
        if (intent != null) {
            MediaButtonReceiver.handleIntent(mediaSession, intent);
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mediaSession != null) {
            mediaSession.setActive(false);
            mediaSession.release();
        }
        if (exoPlayer != null) {
            exoPlayer.release();
        }
        Log.d(TAG, "Service détruit");
    }

    // ===============================================================
    //  Gestion des métadonnées
    // ===============================================================

    /**
     * Appelé quand un nouvel épisode commence à jouer côté WebView.
     * Met à jour la MediaSession immédiatement (sans artwork),
     * puis charge l'artwork en arrière-plan et reconstruit la notif.
     */
    private void handleUpdateMetadata(String title, String author, String artworkUrl, long duration) {
        currentTitle    = title    != null ? title    : "";
        currentAuthor   = author   != null ? author   : "";
        currentDuration = duration;
        currentArtwork  = null;

        applyMetadata(null);
        mediaSession.setActive(true);
        rebuildNotification();

        Log.d(TAG, "Métadonnées mises à jour : " + currentTitle);

        if (artworkUrl != null && !artworkUrl.isEmpty()) {
            final String url = artworkUrl;
            new Thread(() -> {
                Bitmap bitmap = null;
                try (InputStream stream = new URL(url).openStream()) {
                    bitmap = BitmapFactory.decodeStream(stream);
                    bitmap = scaleArtwork(bitmap);
                } catch (Exception e) {
                    Log.w(TAG, "Artwork non chargé : " + e.getMessage());
                }
                final Bitmap bmp = bitmap;
                new Handler(Looper.getMainLooper()).post(() -> {
                    currentArtwork = bmp;
                    applyMetadata(bmp);
                    rebuildNotification();
                });
            }).start();
        }
    }

    /**
     * Appelé à chaque play/pause/seek depuis le WebView.
     */
    private void handleUpdatePlaybackState(boolean playing, long position) {
        isPlaying       = playing;
        currentPosition = position;
        mediaSession.setActive(true);
        applyPlaybackState(playing, position);
        rebuildNotification();
    }

    private Bitmap scaleArtwork(Bitmap bitmap) {
        if (bitmap == null) return null;

        int width = bitmap.getWidth();
        int height = bitmap.getHeight();
        if (width <= ARTWORK_MAX_SIZE && height <= ARTWORK_MAX_SIZE) {
            return bitmap;
        }

        float ratio = Math.min((float) ARTWORK_MAX_SIZE / width, (float) ARTWORK_MAX_SIZE / height);
        int targetWidth = Math.max(1, Math.round(width * ratio));
        int targetHeight = Math.max(1, Math.round(height * ratio));

        return Bitmap.createScaledBitmap(bitmap, targetWidth, targetHeight, true);
    }

    // ===============================================================
    //  MediaSession — application des états
    // ===============================================================

    private void applyMetadata(Bitmap artwork) {
        MediaMetadataCompat.Builder builder = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE,    currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST,   currentAuthor)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM,    currentAuthor)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION,   currentDuration);

        if (artwork != null) {
            builder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART,       artwork);
            builder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, artwork);
        }

        mediaSession.setMetadata(builder.build());
    }

    private void applyPlaybackState(boolean playing, long position) {
        int state = playing
            ? PlaybackStateCompat.STATE_PLAYING
            : PlaybackStateCompat.STATE_PAUSED;

        PlaybackStateCompat ps = new PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY            |
                PlaybackStateCompat.ACTION_PAUSE           |
                PlaybackStateCompat.ACTION_PLAY_PAUSE      |
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT    |
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS|
                PlaybackStateCompat.ACTION_SEEK_TO         |
                PlaybackStateCompat.ACTION_STOP
            )
            .setState(state, position, 1.0f)
            .build();

        mediaSession.setPlaybackState(ps);
    }

    // ===============================================================
    //  Notification MediaStyle
    // ===============================================================

    /**
     * Construit (ou reconstruit) la notification MediaStyle.
     *
     * Points critiques :
     *  - VISIBILITY_PUBLIC  → visible sur le lock screen
     *  - setShowActionsInCompactView(0,1,2) → 3 boutons en vue compacte
     *  - startForeground()  → le service reste vivant en arrière-plan
     */
    private void rebuildNotification() {
        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent launchPending = launchIntent == null
            ? null
            : PendingIntent.getActivity(
                this, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseLabel = isPlaying ? "Pause" : "Lecture";

        if (!mediaSession.isActive()) {
            mediaSession.setActive(true);
        }

        NotificationCompat.Builder nb = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(currentTitle.isEmpty() ? "Podcast Sphere" : currentTitle)
            .setContentText(currentAuthor.isEmpty() ? "" : currentAuthor)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setOnlyAlertOnce(true)
            .setOngoing(true)
            .setAutoCancel(false)
            .setStyle(new MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2)
                .setShowCancelButton(true)
                .setCancelButtonIntent(
                    MediaButtonReceiver.buildMediaButtonPendingIntent(
                        this, PlaybackStateCompat.ACTION_STOP)))
            .addAction(new NotificationCompat.Action(
                android.R.drawable.ic_media_previous, "Précédent",
                MediaButtonReceiver.buildMediaButtonPendingIntent(
                    this, PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS)))
            .addAction(new NotificationCompat.Action(
                playPauseIcon, playPauseLabel,
                MediaButtonReceiver.buildMediaButtonPendingIntent(
                    this, PlaybackStateCompat.ACTION_PLAY_PAUSE)))
            .addAction(new NotificationCompat.Action(
                android.R.drawable.ic_media_next, "Suivant",
                MediaButtonReceiver.buildMediaButtonPendingIntent(
                    this, PlaybackStateCompat.ACTION_SKIP_TO_NEXT)));

        if (launchPending != null) {
            nb.setContentIntent(launchPending);
        }

        if (currentArtwork != null) {
            nb.setLargeIcon(currentArtwork);
        }

        Notification notification = nb.build();
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
                );
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (SecurityException e) {
            Log.e(TAG, "Impossible d'afficher la notification media (permission ou config manquante)", e);
        }
    }

    // ===============================================================
    //  Communication Service → WebView
    // ===============================================================

    /**
     * Envoie une commande au WebView React via broadcast local.
     * PodcastAutoPlugin écoute ce broadcast et appelle notifyListeners().
     *
     * Commandes : "play" | "pause" | "next" | "previous" | "seek:<ms>"
     */
    private void sendWebViewCommand(String command) {
        Intent intent = new Intent(ACTION_WEBVIEW_COMMAND);
        intent.putExtra("command", command);
        sendBroadcast(intent);
        Log.d(TAG, "Commande WebView envoyée : " + command);
    }

    // ===============================================================
    //  MediaSession Callbacks
    //  Reçoit les commandes hardware (casques, Android Auto, Bluetooth)
    // ===============================================================

    private class PodcastSessionCallback extends MediaSessionCompat.Callback {

        @Override
        public void onPlay() {
            isPlaying = true;
            applyPlaybackState(true, currentPosition);
            rebuildNotification();
            sendWebViewCommand("play");
        }

        @Override
        public void onPause() {
            isPlaying = false;
            applyPlaybackState(false, currentPosition);
            rebuildNotification();
            sendWebViewCommand("pause");
        }

        @Override
        public void onStop() {
            mediaSession.setActive(false);
            stopForeground(true);
            stopSelf();
            sendWebViewCommand("stop");
        }

        @Override
        public void onSkipToNext() {
            sendWebViewCommand("next");
        }

        @Override
        public void onSkipToPrevious() {
            sendWebViewCommand("previous");
        }

        @Override
        public void onSeekTo(long pos) {
            currentPosition = pos;
            applyPlaybackState(isPlaying, pos);
            sendWebViewCommand("seek:" + pos);
        }

        @Override
        public void onPlayFromMediaId(String mediaId, Bundle extras) {
            // Android Auto : lecture d'un item du browse tree
            sendWebViewCommand("playFromId:" + mediaId);
        }
    }

    // ===============================================================
    //  Android Auto — MediaBrowserServiceCompat
    // ===============================================================

    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName,
                                 int clientUid,
                                 @Nullable Bundle rootHints) {
        // Toujours accepter la connexion (Android Auto, contrôleurs Bluetooth, etc.)
        return new BrowserRoot(MEDIA_ROOT_ID, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId,
                               @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

        if (MEDIA_ROOT_ID.equals(parentId)) {
            // Racine : catégories de navigation
            items.add(makeBrowsableItem("subscriptions", "Mes abonnements", "Vos podcasts favoris"));
            items.add(makeBrowsableItem("recent",         "Récents",          "Derniers épisodes écoutés"));
            items.add(makeBrowsableItem("trending",       "Tendances",        "Podcasts populaires"));
        } else {
            // Sous-éléments alimentés par les SharedPreferences
            // (synchronisées par PodcastAutoPlugin.syncFavorites)
            android.content.SharedPreferences prefs =
                getSharedPreferences("podcast_auto_data", MODE_PRIVATE);
            String json = prefs.getString(parentId + "_items", "");
            if (!json.isEmpty()) {
                // Parsing minimal JSON array de strings "title|mediaId"
                // Remplacer par Gson si besoin de données plus riches
                String[] entries = json.replace("[","").replace("]","")
                                       .replace("\"","").split(",");
                for (String entry : entries) {
                    String[] parts = entry.trim().split("\\|");
                    if (parts.length >= 2) {
                        items.add(makePlayableItem(parts[1].trim(), parts[0].trim()));
                    }
                }
            }
        }

        result.sendResult(items);
    }

    private MediaBrowserCompat.MediaItem makeBrowsableItem(String id, String title, String subtitle) {
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(id)
            .setTitle(title)
            .setSubtitle(subtitle)
            .build();
        return new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_BROWSABLE);
    }

    private MediaBrowserCompat.MediaItem makePlayableItem(String id, String title) {
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(id)
            .setTitle(title)
            .build();
        return new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE);
    }
}
