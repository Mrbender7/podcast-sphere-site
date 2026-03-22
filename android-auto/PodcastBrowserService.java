package com.fhm.podcastsphere;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.media.MediaBrowserCompat;
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

import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

public class PodcastBrowserService extends MediaBrowserServiceCompat {

    private static final String TAG = "PodcastBrowserService";
    private static final int    NOTIFICATION_ID = 998877;
    private static final String CHANNEL_ID      = "podcast_playback";
    private static final int    ARTWORK_MAX_SIZE = 512;
    private static final String MEDIA_ROOT_ID = "root";

    public static final String ACTION_UPDATE_METADATA       = "UPDATE_METADATA";
    public static final String ACTION_UPDATE_PLAYBACK_STATE = "UPDATE_PLAYBACK_STATE";
    public static final String ACTION_STOP_SERVICE          = "STOP_SERVICE";
    public static final String ACTION_WEBVIEW_COMMAND       = "com.fhm.podcastsphere.WEBVIEW_COMMAND";

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

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            String action = intent.getAction();

            // If started via startForegroundService, we MUST call startForeground quickly
            // Build a minimal notification immediately to satisfy the system requirement
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

    /** Ensure startForeground has been called at least once to avoid ANR / crash */
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
        
        // Only play/pause and seek — no skip next/previous
        long actions = PlaybackStateCompat.ACTION_PLAY | 
                      PlaybackStateCompat.ACTION_PAUSE | 
                      PlaybackStateCompat.ACTION_PLAY_PAUSE | 
                      PlaybackStateCompat.ACTION_SEEK_TO | 
                      PlaybackStateCompat.ACTION_STOP;

        PlaybackStateCompat ps = new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, position, playing ? 1.0f : 0.0f)
            .build();
        mediaSession.setPlaybackState(ps);
    }

    private Notification buildNotification() {
        // Explicit play or pause action based on current state
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
                .setShowActionsInCompactView(0))  // Only show play/pause in compact
            .addAction(playPauseIcon, playPauseLabel,
                MediaButtonReceiver.buildMediaButtonPendingIntent(this, playPauseAction));

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

    private class PodcastSessionCallback extends MediaSessionCompat.Callback {
        @Override public void onPlay() { 
            Log.d(TAG, "Callback onPlay reçu");
            sendWebViewCommand("play"); 
        }
        @Override public void onPause() { 
            Log.d(TAG, "Callback onPause reçu");
            sendWebViewCommand("pause"); 
        }
        @Override public void onSeekTo(long pos) { 
            Log.d(TAG, "Callback onSeekTo reçu: " + pos);
            sendWebViewCommand("seek:" + pos); 
        }
        @Override public void onStop() { handleStop(); }
    }

    @Nullable @Override public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) { return new BrowserRoot(MEDIA_ROOT_ID, null); }
    @Override public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) { result.sendResult(new ArrayList<>()); }
    @Override public void onDestroy() { if (mediaSession != null) mediaSession.release(); super.onDestroy(); }
}
