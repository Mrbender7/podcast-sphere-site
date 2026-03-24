package com.fhm.podcastsphere;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.media.MediaBrowserServiceCompat;
import androidx.media.app.NotificationCompat.MediaStyle;
import androidx.media.session.MediaButtonReceiver;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class PodcastBrowserService extends MediaBrowserServiceCompat {

    private static final String TAG = "PodcastBrowserService";
    private static final int    NOTIFICATION_ID = 998877;
    private static final String CHANNEL_ID      = "podcast_playback";
    private static final int    ARTWORK_MAX_SIZE = 512;

    // Browse tree IDs
    private static final String MEDIA_ROOT_ID       = "root";
    private static final String ID_NOW_PLAYING      = "__now_playing__";
    private static final String ID_SUBSCRIPTIONS    = "__subscriptions__";
    private static final String ID_IN_PROGRESS      = "__in_progress__";
    private static final String ID_SAFETY_WARNING   = "__safety_warning__";
    private static final String PREFIX_FEED         = "feed:";
    private static final String PREFIX_EPISODE      = "episode:";

    public static final String ACTION_UPDATE_METADATA       = "UPDATE_METADATA";
    public static final String ACTION_UPDATE_PLAYBACK_STATE = "UPDATE_PLAYBACK_STATE";
    public static final String ACTION_STOP_SERVICE          = "STOP_SERVICE";
    public static final String ACTION_WEBVIEW_COMMAND       = "com.fhm.podcastsphere.WEBVIEW_COMMAND";

    private static final String PREFS_NAME = "PodcastAutoPrefs";

    private MediaSessionCompat mediaSession;
    private String  currentTitle    = "Podcast Sphere";
    private String  currentAuthor   = "";
    private Bitmap  currentArtwork  = null;
    private long    currentDuration = 0L;
    private boolean isPlaying       = false;
    private long    currentPosition = 0L;
    private boolean foregroundStarted = false;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "onCreate service");

        createNotificationChannel();

        ComponentName mbr = new ComponentName(this, MediaButtonReceiver.class);
        mediaSession = new MediaSessionCompat(this, TAG, mbr, null);
        
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | 
                             MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        mediaSession.setCallback(new PodcastSessionCallback(), new Handler(Looper.getMainLooper()));

        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        if (launchIntent != null) {
            PendingIntent pi = PendingIntent.getActivity(this, 0, launchIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            mediaSession.setSessionActivity(pi);
        }

        setSessionToken(mediaSession.getSessionToken());
        mediaSession.setActive(true);

        applyPlaybackState(false, 0);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && nm.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Lecture Podcast", NotificationManager.IMPORTANCE_DEFAULT);
                channel.setDescription("Contrôles de lecture");
                channel.setShowBadge(false);
                channel.setSound(null, null);
                channel.enableVibration(false);
                nm.createNotificationChannel(channel);
            }
        }
    }

    // ── SharedPreferences helpers ──

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private String getAppLanguage() {
        return getPrefs().getString("appLanguage", "fr");
    }

    private String getSafetyTitle() {
        String lang = getAppLanguage();
        switch (lang) {
            case "en": return "Warning: Never browse menus while driving";
            case "es": return "Atención: Nunca navegue por los menús mientras conduce";
            case "de": return "Achtung: Navigieren Sie niemals während der Fahrt in Menüs";
            case "ja": return "警告：運転中にメニューを操作しないでください";
            default:   return "Attention : Ne naviguez jamais dans les menus en conduisant";
        }
    }

    private String getSafetySubtitle() {
        String lang = getAppLanguage();
        switch (lang) {
            case "en": return "Leave this task to the passenger";
            case "es": return "Deje esta tarea al pasajero";
            case "de": return "Überlassen Sie diese Aufgabe dem Beifahrer";
            case "ja": return "この操作は同乗者に任せてください";
            default:   return "Laissez cette tâche au passager";
        }
    }

    // ── Browse Tree ──

    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) {
        return new BrowserRoot(MEDIA_ROOT_ID, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        // Detach to load on background thread (avoid ANR)
        result.detach();

        new Thread(() -> {
            List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

            try {
                if (MEDIA_ROOT_ID.equals(parentId)) {
                    items = buildRootItems();
                } else if (ID_SUBSCRIPTIONS.equals(parentId)) {
                    items = buildSubscriptionsList();
                } else if (ID_IN_PROGRESS.equals(parentId)) {
                    items = buildInProgressList();
                } else if (parentId.startsWith(PREFIX_FEED)) {
                    String feedId = parentId.substring(PREFIX_FEED.length());
                    items = buildFeedEpisodes(feedId);
                }
            } catch (Exception e) {
                Log.e(TAG, "onLoadChildren error for " + parentId, e);
            }

            final List<MediaBrowserCompat.MediaItem> finalItems = items;
            new Handler(Looper.getMainLooper()).post(() -> result.sendResult(finalItems));
        }).start();
    }

    private List<MediaBrowserCompat.MediaItem> buildRootItems() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

        // 1. Now Playing
        MediaDescriptionCompat nowPlayingDesc = new MediaDescriptionCompat.Builder()
                .setMediaId(ID_NOW_PLAYING)
                .setTitle("🎧 " + currentTitle)
                .setSubtitle(currentAuthor)
                .setIconBitmap(currentArtwork)
                .build();
        items.add(new MediaBrowserCompat.MediaItem(nowPlayingDesc, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE));

        // 2. Subscriptions (browsable)
        String lang = getAppLanguage();
        String subsLabel;
        switch (lang) {
            case "en": subsLabel = "Subscriptions"; break;
            case "es": subsLabel = "Suscripciones"; break;
            case "de": subsLabel = "Abonnements"; break;
            case "ja": subsLabel = "登録済み"; break;
            default:   subsLabel = "Abonnements"; break;
        }
        MediaDescriptionCompat subsDesc = new MediaDescriptionCompat.Builder()
                .setMediaId(ID_SUBSCRIPTIONS)
                .setTitle("⭐ " + subsLabel)
                .build();
        items.add(new MediaBrowserCompat.MediaItem(subsDesc, MediaBrowserCompat.MediaItem.FLAG_BROWSABLE));

        // 3. In Progress (browsable)
        String progressLabel;
        switch (lang) {
            case "en": progressLabel = "In progress"; break;
            case "es": progressLabel = "En curso"; break;
            case "de": progressLabel = "Läuft"; break;
            case "ja": progressLabel = "再生中"; break;
            default:   progressLabel = "En cours de lecture"; break;
        }
        MediaDescriptionCompat progressDesc = new MediaDescriptionCompat.Builder()
                .setMediaId(ID_IN_PROGRESS)
                .setTitle("▶️ " + progressLabel)
                .build();
        items.add(new MediaBrowserCompat.MediaItem(progressDesc, MediaBrowserCompat.MediaItem.FLAG_BROWSABLE));

        return items;
    }

    private List<MediaBrowserCompat.MediaItem> buildSubscriptionsList() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

        // Safety warning as first non-playable item
        MediaDescriptionCompat safetyDesc = new MediaDescriptionCompat.Builder()
                .setMediaId(ID_SAFETY_WARNING)
                .setTitle(getSafetyTitle())
                .setSubtitle(getSafetySubtitle())
                .build();
        items.add(new MediaBrowserCompat.MediaItem(safetyDesc, 0)); // Not playable, not browsable

        try {
            String json = getPrefs().getString("subscriptions", "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject pod = arr.getJSONObject(i);
                String id = String.valueOf(pod.optInt("id", 0));
                String title = pod.optString("title", "");
                String author = pod.optString("author", "");

                MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
                        .setMediaId(PREFIX_FEED + id)
                        .setTitle(title)
                        .setSubtitle(author)
                        .build();
                items.add(new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_BROWSABLE));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading subscriptions", e);
        }

        return items;
    }

    private List<MediaBrowserCompat.MediaItem> buildFeedEpisodes(String feedId) {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

        // Safety warning
        MediaDescriptionCompat safetyDesc = new MediaDescriptionCompat.Builder()
                .setMediaId(ID_SAFETY_WARNING)
                .setTitle(getSafetyTitle())
                .setSubtitle(getSafetySubtitle())
                .build();
        items.add(new MediaBrowserCompat.MediaItem(safetyDesc, 0));

        try {
            String json = getPrefs().getString("episodes_" + feedId, "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject ep = arr.getJSONObject(i);
                String epId = String.valueOf(ep.optInt("id", 0));
                String title = ep.optString("title", "");
                String feedTitle = ep.optString("feedTitle", "");

                MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
                        .setMediaId(PREFIX_EPISODE + epId + ":" + feedId)
                        .setTitle(title)
                        .setSubtitle(feedTitle)
                        .build();
                items.add(new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading episodes for feed " + feedId, e);
        }

        return items;
    }

    private List<MediaBrowserCompat.MediaItem> buildInProgressList() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

        try {
            String json = getPrefs().getString("listenHistory", "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject entry = arr.getJSONObject(i);
                boolean completed = entry.optBoolean("completed", false);
                if (completed) continue;

                JSONObject ep = entry.optJSONObject("episode");
                if (ep == null) continue;

                String epId = String.valueOf(ep.optInt("id", 0));
                String feedId = String.valueOf(ep.optInt("feedId", 0));
                String title = ep.optString("title", "");
                String feedTitle = ep.optString("feedTitle", "");
                double progress = entry.optDouble("progress", 0);

                String subtitle = feedTitle;
                if (progress > 0 && progress < 1) {
                    subtitle += " — " + Math.round(progress * 100) + "%";
                }

                MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
                        .setMediaId(PREFIX_EPISODE + epId + ":" + feedId)
                        .setTitle(title)
                        .setSubtitle(subtitle)
                        .build();
                items.add(new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_PLAYABLE));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading listen history", e);
        }

        return items;
    }

    // ── Playback commands from browse tree ──

    private void handlePlayFromMediaId(String mediaId) {
        if (mediaId == null) return;

        if (ID_NOW_PLAYING.equals(mediaId)) {
            // Resume current / autoplay last
            sendWebViewCommand("autoplay");
            return;
        }

        if (mediaId.startsWith(PREFIX_EPISODE)) {
            // Format: episode:<episodeId>:<feedId>
            sendWebViewCommand("playMediaId:" + mediaId);
            return;
        }
    }

    // ── Service lifecycle ──

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();

            if (ACTION_UPDATE_METADATA.equals(action) || ACTION_UPDATE_PLAYBACK_STATE.equals(action)) {
                ensureForeground();
            }

            if (ACTION_UPDATE_METADATA.equals(action)) {
                handleUpdateMetadata(
                    intent.getStringExtra("title"),
                    intent.getStringExtra("author"),
                    intent.getStringExtra("artworkUrl"),
                    intent.getLongExtra("duration", 0L)
                );
            } else if (ACTION_UPDATE_PLAYBACK_STATE.equals(action)) {
                handleUpdatePlaybackState(
                    intent.getBooleanExtra("isPlaying", false),
                    intent.getLongExtra("position", 0L)
                );
            } else if (ACTION_STOP_SERVICE.equals(action)) {
                handleStop();
            } else {
                MediaButtonReceiver.handleIntent(mediaSession, intent);
            }
        }
        return START_STICKY;
    }

    private void ensureForeground() {
        if (foregroundStarted) return;
        try {
            Notification n = buildNotification();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, n);
            }
            foregroundStarted = true;
        } catch (Exception e) {
            Log.e(TAG, "ensureForeground failed: " + e.getMessage());
        }
    }

    // ── Metadata & Playback State ──

    private void handleUpdateMetadata(String title, String author, String artworkUrl, long duration) {
        currentTitle    = (title != null && !title.isEmpty()) ? title : "Podcast Sphere";
        currentAuthor   = (author != null) ? author : "";
        currentDuration = duration;
        
        mediaSession.setActive(true);
        applyMetadata(currentArtwork); 
        rebuildNotification();

        if (artworkUrl != null && !artworkUrl.isEmpty()) {
            new Thread(() -> {
                try {
                    InputStream is = new URL(artworkUrl).openStream();
                    Bitmap bmp = BitmapFactory.decodeStream(is);
                    if (bmp != null) {
                        int size = Math.min(Math.max(bmp.getWidth(), bmp.getHeight()), ARTWORK_MAX_SIZE);
                        bmp = Bitmap.createScaledBitmap(bmp, size, size, true);
                        final Bitmap finalBmp = bmp;
                        new Handler(Looper.getMainLooper()).post(() -> {
                            currentArtwork = finalBmp;
                            applyMetadata(finalBmp);
                            rebuildNotification();
                        });
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Artwork error: " + e.getMessage());
                }
            }).start();
        }
    }

    private void handleUpdatePlaybackState(boolean playing, long position) {
        isPlaying = playing;
        currentPosition = position;
        mediaSession.setActive(true);
        applyPlaybackState(playing, position);
        rebuildNotification();
    }

    private void applyMetadata(Bitmap artwork) {
        MediaMetadataCompat.Builder builder = new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, "current_track")
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE,    currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST,   currentAuthor)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM,    currentAuthor)
            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION,   currentDuration)
            .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_TITLE,    currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, currentAuthor);

        Bitmap displayBitmap = artwork;
        if (displayBitmap == null) {
            displayBitmap = BitmapFactory.decodeResource(getResources(), R.drawable.podcast_placeholder);
        }

        if (displayBitmap != null) {
            builder.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, displayBitmap);
            builder.putBitmap(MediaMetadataCompat.METADATA_KEY_ART,       displayBitmap);
            builder.putBitmap(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON, displayBitmap);
        }
        
        mediaSession.setMetadata(builder.build());
    }

    private void applyPlaybackState(boolean playing, long position) {
        int state = playing ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
        
        long actions = PlaybackStateCompat.ACTION_PLAY | 
                      PlaybackStateCompat.ACTION_PAUSE | 
                      PlaybackStateCompat.ACTION_PLAY_PAUSE | 
                      PlaybackStateCompat.ACTION_SEEK_TO | 
                      PlaybackStateCompat.ACTION_STOP |
                      PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                      PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                      PlaybackStateCompat.ACTION_PLAY_FROM_MEDIA_ID;

        PlaybackStateCompat ps = new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, position, playing ? 1.0f : 0.0f)
            .build();
        mediaSession.setPlaybackState(ps);
    }

    // ── Notification ──

    private Notification buildNotification() {
        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        long playPauseAction = isPlaying ? PlaybackStateCompat.ACTION_PAUSE : PlaybackStateCompat.ACTION_PLAY;
        String playPauseLabel = isPlaying ? "Pause" : "Play";

        Intent launchIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentIntent = null;
        if (launchIntent != null) {
            contentIntent = PendingIntent.getActivity(this, 0, launchIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        }

        NotificationCompat.Builder nb = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(currentTitle)
            .setContentText(currentAuthor)
            .setContentIntent(contentIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setOngoing(isPlaying)
            .setCategory(NotificationCompat.CATEGORY_TRANSPORT)
            .setShowWhen(false)
            .setSilent(true)
            .setStyle(new MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(1))  // Show play/pause (middle) in compact
            .addAction(android.R.drawable.ic_media_previous, "Previous",
                MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS))
            .addAction(playPauseIcon, playPauseLabel,
                MediaButtonReceiver.buildMediaButtonPendingIntent(this, playPauseAction))
            .addAction(android.R.drawable.ic_media_next, "Next",
                MediaButtonReceiver.buildMediaButtonPendingIntent(this, PlaybackStateCompat.ACTION_SKIP_TO_NEXT));

        Bitmap art = currentArtwork;
        if (art == null) {
            art = BitmapFactory.decodeResource(getResources(), R.drawable.podcast_placeholder);
        }
        if (art != null) {
            nb.setLargeIcon(art);
        }

        return nb.build();
    }

    private void rebuildNotification() {
        Notification notification = buildNotification();
        
        try {
            if (isPlaying) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                } else {
                    startForeground(NOTIFICATION_ID, notification);
                }
                foregroundStarted = true;
            } else {
                if (foregroundStarted) {
                    stopForeground(false);
                    foregroundStarted = false;
                }
                NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
                if (nm != null) {
                    nm.notify(NOTIFICATION_ID, notification);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Foreground error", e);
        }
    }

    // ── Stop & Cleanup ──

    private void handleStop() {
        Log.d(TAG, "handleStop");
        isPlaying = false;
        foregroundStarted = false;
        mediaSession.setActive(false);
        stopForeground(true);
        stopSelf();
        sendWebViewCommand("stop");
    }

    private void sendWebViewCommand(String command) {
        Intent intent = new Intent(ACTION_WEBVIEW_COMMAND);
        intent.putExtra("command", command);
        sendBroadcast(intent);
    }

    // ── MediaSession Callbacks ──

    private class PodcastSessionCallback extends MediaSessionCompat.Callback {
        @Override public void onPlay() { 
            Log.d(TAG, "Callback onPlay");
            sendWebViewCommand("play"); 
        }
        @Override public void onPause() { 
            Log.d(TAG, "Callback onPause");
            sendWebViewCommand("pause"); 
        }
        @Override public void onSeekTo(long pos) { 
            Log.d(TAG, "Callback onSeekTo: " + pos);
            sendWebViewCommand("seek:" + pos); 
        }
        @Override public void onSkipToNext() {
            Log.d(TAG, "Callback onSkipToNext");
            sendWebViewCommand("next");
        }
        @Override public void onSkipToPrevious() {
            Log.d(TAG, "Callback onSkipToPrevious");
            sendWebViewCommand("previous");
        }
        @Override public void onPlayFromMediaId(String mediaId, Bundle extras) {
            Log.d(TAG, "Callback onPlayFromMediaId: " + mediaId);
            handlePlayFromMediaId(mediaId);
        }
        @Override public void onStop() { handleStop(); }
    }

    @Override public void onDestroy() { if (mediaSession != null) mediaSession.release(); super.onDestroy(); }
}
