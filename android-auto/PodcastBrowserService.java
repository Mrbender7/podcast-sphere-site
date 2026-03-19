package com.fhm.podcastsphere;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.net.Uri;
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
import androidx.media.session.MediaButtonReceiver;

import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.MediaItem;
import com.google.android.exoplayer2.Player;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * MediaBrowserServiceCompat for Android Auto podcast playback.
 * Browse tree: ROOT -> Subscriptions -> Episodes, In Progress, Categories
 * Uses ExoPlayer for native audio playback in car environment.
 */
public class PodcastBrowserService extends MediaBrowserServiceCompat {

    private static final String TAG = "PodcastBrowserService";
    private static final String CHANNEL_ID = "podcast_playback";
    private static final int NOTIFICATION_ID = 1001;
    private static final String ACTION_UPDATE_METADATA = "UPDATE_METADATA";
    private static final String ACTION_UPDATE_PLAYBACK = "UPDATE_PLAYBACK_STATE";
    private static final String PREFS_NAME = "podcastsphere_data";
    private static final String MEDIA_TOGGLE_ACTION = "com.fhm.podcastsphere.MEDIA_TOGGLE";

    // Browse tree root IDs
    private static final String ROOT_ID = "__ROOT__";
    private static final String SUBSCRIPTIONS_ID = "__SUBSCRIPTIONS__";
    private static final String IN_PROGRESS_ID = "__IN_PROGRESS__";
    private static final String CATEGORIES_ID = "__CATEGORIES__";

    private static PodcastBrowserService instance;

    private MediaSessionCompat mediaSession;
    private ExoPlayer player;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;
    private Handler handler;
    private ExecutorService executor;
    private final AtomicInteger playbackRequestSeq = new AtomicInteger(0);

    private String currentEpisodeId;
    private String currentTitle = "";
    private String currentArtist = "";
    private String currentImageUrl = "";
    private boolean triedProtocolFallback = false;

    private BroadcastReceiver noisyReceiver;

    public static PodcastBrowserService getInstance() {
        return instance;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        handler = new Handler(Looper.getMainLooper());
        executor = Executors.newSingleThreadExecutor();
        audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);

        // Create notification channel
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID, "Lecture Podcast", NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Contr\u00f4les de lecture Podcast Sphere");
            channel.setSound(null, null);
            channel.enableVibration(false);
            channel.setShowBadge(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }

        // Init ExoPlayer
        player = new ExoPlayer.Builder(this).build();
        player.addListener(playerListener);

        // Init MediaSession
        mediaSession = new MediaSessionCompat(this, TAG);
        mediaSession.setCallback(mediaSessionCallback);
        mediaSession.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS |
            MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);
        setSessionToken(mediaSession.getSessionToken());

        // Audio focus
        AudioAttributes attrs = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build();
        player.setAudioAttributes(
            new com.google.android.exoplayer2.audio.AudioAttributes.Builder()
                .setUsage(com.google.android.exoplayer2.C.USAGE_MEDIA)
                .setContentType(com.google.android.exoplayer2.C.AUDIO_CONTENT_TYPE_MUSIC)
                .build(),
            false
        );
        audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
            .setAudioAttributes(attrs)
            .setOnAudioFocusChangeListener(audioFocusChangeListener)
            .setWillPauseWhenDucked(true) // Required for Google Play compliance
            .build();

        // AUDIO_BECOMING_NOISY receiver (vehicle disconnect)
        noisyReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (AudioManager.ACTION_AUDIO_BECOMING_NOISY.equals(intent.getAction())) {
                    player.pause();
                    updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
                    PodcastAutoPlugin plugin = PodcastAutoPlugin.getActiveInstance();
                    if (plugin != null) {
                        plugin.notifyVehicleDisconnected(currentEpisodeId);
                    }
                }
            }
        };
        registerReceiver(noisyReceiver, new IntentFilter(AudioManager.ACTION_AUDIO_BECOMING_NOISY));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();

            if (ACTION_UPDATE_METADATA.equals(action)) {
                String title = intent.getStringExtra("title");
                String author = intent.getStringExtra("author");
                String artworkUrl = intent.getStringExtra("artworkUrl");
                long duration = intent.getLongExtra("duration", 0);

                currentTitle = title != null ? title : "";
                currentArtist = author != null ? author : "";
                currentImageUrl = artworkUrl != null ? artworkUrl : "";

                // Build metadata on background thread (artwork download)
                new Thread(() -> {
                    Bitmap artwork = null;
                    if (artworkUrl != null && !artworkUrl.isEmpty()) {
                        try {
                            java.io.InputStream is = new URL(artworkUrl.replace("http://", "https://")).openStream();
                            artwork = BitmapFactory.decodeStream(is);
                            is.close();
                        } catch (Exception e) {
                            Log.w(TAG, "Artwork download failed", e);
                        }
                    }

                    final Bitmap finalArt = artwork;
                    handler.post(() -> {
                        MediaMetadataCompat.Builder mb = new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                            .putLong(MediaMetadataCompat.METADATA_KEY_DURATION, duration);
                        if (finalArt != null) {
                            mb.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, finalArt);
                            mb.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, finalArt);
                        }
                        mediaSession.setMetadata(mb.build());
                        mediaSession.setActive(true);
                        rebuildNotification();
                    });
                }).start();

                return START_NOT_STICKY;
            }

            if (ACTION_UPDATE_PLAYBACK.equals(action)) {
                boolean isPlaying = intent.getBooleanExtra("isPlaying", false);
                long position = intent.getLongExtra("position", 0);

                long actions = PlaybackStateCompat.ACTION_PLAY |
                    PlaybackStateCompat.ACTION_PAUSE |
                    PlaybackStateCompat.ACTION_PLAY_PAUSE |
                    PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
                    PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
                    PlaybackStateCompat.ACTION_SEEK_TO;

                int state = isPlaying ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED;
                mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
                    .setActions(actions)
                    .setState(state, position, 1.0f)
                    .build());
                rebuildNotification();

                return START_NOT_STICKY;
            }
        }

        MediaButtonReceiver.handleIntent(mediaSession, intent);
        return START_NOT_STICKY;
    }

        super.onDestroy();
        instance = null;
        if (noisyReceiver != null) {
            try { unregisterReceiver(noisyReceiver); } catch (Exception ignored) {}
        }
        if (player != null) {
            player.release();
            player = null;
        }
        if (mediaSession != null) {
            mediaSession.release();
        }
        if (executor != null) {
            executor.shutdownNow();
        }
    }

    // --- Browse Tree ---

    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) {
        return new BrowserRoot(ROOT_ID, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        result.detach();

        new Thread(() -> {
            List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();

            switch (parentId) {
                case ROOT_ID:
                    items.add(buildBrowsableItem(SUBSCRIPTIONS_ID, "Abonn\u00e9s", "Vos podcasts abonn\u00e9s"));
                    items.add(buildBrowsableItem(IN_PROGRESS_ID, "En cours", "\u00c9pisodes en cours de lecture"));
                    items.add(buildBrowsableItem(CATEGORIES_ID, "Cat\u00e9gories", "D\u00e9couvrir par cat\u00e9gorie"));
                    break;

                case SUBSCRIPTIONS_ID:
                    items.addAll(loadFavorites());
                    break;

                case IN_PROGRESS_ID:
                    items.addAll(loadInProgress());
                    break;

                case CATEGORIES_ID:
                    items.addAll(buildCategoryItems());
                    break;

                default:
                    // Could be a podcast ID -> load its episodes
                    items.addAll(loadEpisodesForPodcast(parentId));
                    break;
            }

            handler.post(() -> result.sendResult(items));
        }).start();
    }

    private MediaBrowserCompat.MediaItem buildBrowsableItem(String mediaId, String title, String subtitle) {
        MediaDescriptionCompat desc = new MediaDescriptionCompat.Builder()
            .setMediaId(mediaId)
            .setTitle(title)
            .setSubtitle(subtitle)
            // No icon for browsable items — avoids broken icons on some car screens
            .build();
        return new MediaBrowserCompat.MediaItem(desc, MediaBrowserCompat.MediaItem.FLAG_BROWSABLE);
    }

    private MediaBrowserCompat.MediaItem buildPlayableItem(String mediaId, String title, String subtitle, String imageUrl) {
        MediaDescriptionCompat.Builder builder = new MediaDescriptionCompat.Builder()
            .setMediaId(mediaId)
            .setTitle(title)
            .setSubtitle(subtitle);

        if (imageUrl != null && !imageUrl.isEmpty()) {
            builder.setIconUri(Uri.parse(imageUrl.replace("http://", "https://")));
        } else {
            builder.setIconUri(Uri.parse("android.resource://" + getPackageName() + "/drawable/podcast_placeholder"));
        }

        return new MediaBrowserCompat.MediaItem(builder.build(), MediaBrowserCompat.MediaItem.FLAG_PLAYABLE);
    }

    private List<MediaBrowserCompat.MediaItem> loadFavorites() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();
        try {
            String json = getPrefs().getString("favorites", "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                String id = obj.optString("id", "");
                String title = obj.optString("title", "Podcast");
                String author = obj.optString("author", "");
                String image = obj.optString("image", "");
                // Podcasts are browsable (contain episodes)
                items.add(buildBrowsableItem("podcast_" + id, title, author));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading favorites", e);
        }
        return items;
    }

    private List<MediaBrowserCompat.MediaItem> loadInProgress() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();
        try {
            String json = getPrefs().getString("recents", "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < Math.min(arr.length(), 20); i++) {
                JSONObject obj = arr.getJSONObject(i);
                String id = obj.optString("id", "");
                String title = obj.optString("title", "");
                String artist = obj.optString("feedTitle", obj.optString("feedAuthor", ""));
                String image = obj.optString("image", obj.optString("feedImage", ""));
                items.add(buildPlayableItem("episode_" + id, title, artist, image));
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading recents", e);
        }
        return items;
    }

    private List<MediaBrowserCompat.MediaItem> buildCategoryItems() {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();
        String[][] categories = {
            {"technology", "Technologie"},
            {"comedy", "Com\u00e9die"},
            {"news", "Actualit\u00e9s"},
            {"education", "\u00c9ducation"},
            {"science", "Science"},
            {"health", "Sant\u00e9"},
            {"sports", "Sports"},
            {"music", "Musique"},
            {"society", "Soci\u00e9t\u00e9"},
            {"business", "Business"},
            {"history", "Histoire"},
            {"fiction", "Fiction"},
            {"truecrime", "True Crime"},
        };
        for (String[] cat : categories) {
            items.add(buildBrowsableItem("category_" + cat[0], cat[1], ""));
        }
        return items;
    }

    private List<MediaBrowserCompat.MediaItem> loadEpisodesForPodcast(String parentId) {
        List<MediaBrowserCompat.MediaItem> items = new ArrayList<>();
        // This would need podcast episode data from SharedPreferences or API
        // For now return empty — will be populated via syncFavorites with episode data
        Log.d(TAG, "loadEpisodesForPodcast: " + parentId);
        return items;
    }

    // --- Playback ---

    private void playEpisode(String episodeId) {
        final int reqSeq = playbackRequestSeq.incrementAndGet();

        // Find episode data from recents/favorites
        String audioUrl = null;
        try {
            String json = getPrefs().getString("recents", "[]");
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.getJSONObject(i);
                if (episodeId.equals(obj.optString("id"))) {
                    audioUrl = obj.optString("enclosureUrl", "");
                    currentTitle = obj.optString("title", "");
                    currentArtist = obj.optString("feedTitle", obj.optString("feedAuthor", ""));
                    currentImageUrl = obj.optString("image", obj.optString("feedImage", ""));
                    break;
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error finding episode", e);
        }

        if (audioUrl == null || audioUrl.isEmpty()) {
            Log.w(TAG, "No audio URL for episode: " + episodeId);
            return;
        }

        currentEpisodeId = episodeId;
        triedProtocolFallback = false;

        final String url = audioUrl;
        new Thread(() -> {
            String resolvedUrl = resolveStreamUrlSafely(url);
            handler.post(() -> {
                if (reqSeq != playbackRequestSeq.get()) return;

                forceResetPlayer();

                // Set metadata BEFORE playback state
                MediaMetadataCompat metadata = new MediaMetadataCompat.Builder()
                    .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
                    .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
                    .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, currentArtist)
                    .putString(MediaMetadataCompat.METADATA_KEY_ART_URI,
                        currentImageUrl != null ? currentImageUrl.replace("http://", "https://") : "")
                    .build();
                mediaSession.setMetadata(metadata);
                updatePlaybackState(PlaybackStateCompat.STATE_BUFFERING);

                requestAudioFocus();
                player.setMediaItem(MediaItem.fromUri(resolvedUrl));
                player.prepare();
                player.play();

                startForegroundNotification(true);
            });
        }).start();
    }

    private void forceResetPlayer() {
        if (player != null) {
            player.stop();
            player.clearMediaItems();
        }
    }

    // --- Audio Focus ---

    private void requestAudioFocus() {
        audioManager.requestAudioFocus(audioFocusRequest);
    }

    private void abandonAudioFocus() {
        audioManager.abandonAudioFocusRequest(audioFocusRequest);
    }

    private final AudioManager.OnAudioFocusChangeListener audioFocusChangeListener = focusChange -> {
        switch (focusChange) {
            case AudioManager.AUDIOFOCUS_GAIN:
                player.setVolume(1.0f);
                // v1.2.2: Do NOT auto-resume — prevents unwanted restart after vehicle disconnect
                break;
            case AudioManager.AUDIOFOCUS_LOSS:
                player.pause();
                updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
                abandonAudioFocus();
                break;
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                player.pause();
                updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
                break;
            case AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                // With willPauseWhenDucked=true, Android converts this to LOSS_TRANSIENT
                player.setVolume(0.2f);
                break;
        }
    };

    // --- ExoPlayer Listener ---

    private final Player.Listener playerListener = new Player.Listener() {
        @Override
        public void onPlaybackStateChanged(int playbackState) {
            switch (playbackState) {
                case Player.STATE_BUFFERING:
                    updatePlaybackState(PlaybackStateCompat.STATE_BUFFERING);
                    break;
                case Player.STATE_READY:
                    if (player.isPlaying()) {
                        updatePlaybackState(PlaybackStateCompat.STATE_PLAYING);
                        startForegroundNotification(true);
                    }
                    break;
                case Player.STATE_ENDED:
                    updatePlaybackState(PlaybackStateCompat.STATE_STOPPED);
                    break;
            }
        }

        @Override
        public void onIsPlayingChanged(boolean isPlaying) {
            updatePlaybackState(isPlaying ?
                PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED);
            startForegroundNotification(isPlaying);
        }
    };

    // --- MediaSession Callback ---

    private final MediaSessionCompat.Callback mediaSessionCallback = new MediaSessionCompat.Callback() {
        @Override
        public void onPlay() {
            requestAudioFocus();
            player.play();
            updatePlaybackState(PlaybackStateCompat.STATE_PLAYING);
            startForegroundNotification(true);
            mediaSession.setActive(true);
        }

        @Override
        public void onPause() {
            player.pause();
            updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
            startForegroundNotification(false);
        }

        @Override
        public void onStop() {
            player.stop();
            updatePlaybackState(PlaybackStateCompat.STATE_STOPPED);
            abandonAudioFocus();
            stopForeground(true);
            stopSelf();
        }

        @Override
        public void onSeekTo(long pos) {
            player.seekTo(pos);
        }

        @Override
        public void onSkipToNext() {
            player.seekTo(Math.min(player.getDuration(), player.getCurrentPosition() + 30000));
        }

        @Override
        public void onSkipToPrevious() {
            player.seekTo(Math.max(0, player.getCurrentPosition() - 15000));
        }

        @Override
        public void onPrepare() {
            // Restore metadata without autoplay (MA-1 compliance)
            SharedPreferences prefs = getPrefs();
            String title = prefs.getString("current_title", "");
            String artist = prefs.getString("current_artist", "");
            if (!title.isEmpty()) {
                MediaMetadataCompat metadata = new MediaMetadataCompat.Builder()
                    .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
                    .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)
                    .build();
                mediaSession.setMetadata(metadata);
                updatePlaybackState(PlaybackStateCompat.STATE_PAUSED);
            }
        }

        @Override
        public void onPlayFromMediaId(String mediaId, Bundle extras) {
            if (mediaId != null && mediaId.startsWith("episode_")) {
                String episodeId = mediaId.substring(8);
                playEpisode(episodeId);
            }
        }

        @Override
        public void onPlayFromSearch(String query, Bundle extras) {
            // Search through recents/favorites for matching episode
            if (query == null || query.isEmpty()) return;
            String lowerQuery = query.toLowerCase();
            try {
                String json = getPrefs().getString("recents", "[]");
                JSONArray arr = new JSONArray(json);
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    String title = obj.optString("title", "").toLowerCase();
                    String feedTitle = obj.optString("feedTitle", "").toLowerCase();
                    if (title.contains(lowerQuery) || feedTitle.contains(lowerQuery)) {
                        playEpisode(obj.optString("id"));
                        return;
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Search error", e);
            }
        }
    };

    // --- Playback State ---

    private void updatePlaybackState(int state) {
        long actions = PlaybackStateCompat.ACTION_PLAY |
            PlaybackStateCompat.ACTION_PAUSE |
            PlaybackStateCompat.ACTION_STOP |
            PlaybackStateCompat.ACTION_SEEK_TO |
            PlaybackStateCompat.ACTION_SKIP_TO_NEXT |
            PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS |
            PlaybackStateCompat.ACTION_PLAY_FROM_SEARCH |
            PlaybackStateCompat.ACTION_PLAY_FROM_MEDIA_ID;

        long position = player != null ? player.getCurrentPosition() : PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN;

        mediaSession.setPlaybackState(new PlaybackStateCompat.Builder()
            .setActions(actions)
            .setState(state, position, 1.0f)
            .build());
    }

    // --- Notification ---

    private void startForegroundNotification(boolean isPlaying) {
        Intent toggleIntent = new Intent(MEDIA_TOGGLE_ACTION);
        toggleIntent.setPackage(getPackageName());
        PendingIntent togglePI = PendingIntent.getBroadcast(this, 0, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .addAction(isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isPlaying ? "Pause" : "Play", togglePI)
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0))
            .setOngoing(isPlaying)
            .setPriority(NotificationCompat.PRIORITY_LOW);

        Notification notification = builder.build();

        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    /**
     * Rebuilds the foreground notification with current metadata and playback state.
     * Uses MediaStyle for lock screen and notification shade display.
     */
    private void rebuildNotification() {
        boolean isPlaying = false;
        PlaybackStateCompat pbState = mediaSession.getController().getPlaybackState();
        if (pbState != null) {
            isPlaying = pbState.getState() == PlaybackStateCompat.STATE_PLAYING;
        }

        // PendingIntents for prev, play/pause, next
        Intent prevIntent = new Intent(MEDIA_TOGGLE_ACTION + ".PREV");
        prevIntent.setPackage(getPackageName());
        PendingIntent prevPI = PendingIntent.getBroadcast(this, 1, prevIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent toggleIntent = new Intent(MEDIA_TOGGLE_ACTION);
        toggleIntent.setPackage(getPackageName());
        PendingIntent togglePI = PendingIntent.getBroadcast(this, 0, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        Intent nextIntent = new Intent(MEDIA_TOGGLE_ACTION + ".NEXT");
        nextIntent.setPackage(getPackageName());
        PendingIntent nextPI = PendingIntent.getBroadcast(this, 2, nextIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_media_previous, "Prev", prevPI)
            .addAction(isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                isPlaying ? "Pause" : "Play", togglePI)
            .addAction(android.R.drawable.ic_media_next, "Next", nextPI)
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2))
            .setOngoing(isPlaying)
            .setPriority(NotificationCompat.PRIORITY_LOW);

        // Set large icon from current metadata artwork
        MediaMetadataCompat meta = mediaSession.getController().getMetadata();
        if (meta != null) {
            Bitmap art = meta.getBitmap(MediaMetadataCompat.METADATA_KEY_ART);
            if (art != null) {
                builder.setLargeIcon(art);
            }
        }

        Notification notification = builder.build();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    // --- Data sync from WebView ---

    public void updateFavorites(String json) {
        notifyChildrenChanged(SUBSCRIPTIONS_ID);
        Log.d(TAG, "Browse tree updated: favorites");
    }

    public void updateRecents(String json) {
        notifyChildrenChanged(IN_PROGRESS_ID);
        Log.d(TAG, "Browse tree updated: recents");
    }

    // --- Stream URL Resolution ---

    private String resolveStreamUrlSafely(String url) {
        try {
            Future<String> future = executor.submit(() -> resolveStreamUrl(url));
            return future.get(8000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            return url;
        }
    }

    private String resolveStreamUrl(String urlStr) throws Exception {
        String resolved = followRedirects(urlStr, 5);

        HttpURLConnection headConn = (HttpURLConnection) new URL(resolved).openConnection();
        headConn.setRequestMethod("HEAD");
        headConn.setConnectTimeout(5000);
        headConn.setReadTimeout(5000);
        headConn.setRequestProperty("User-Agent", "PodcastSphere/1.0");

        String contentType = headConn.getContentType();
        headConn.disconnect();

        if (contentType != null) {
            String ct = contentType.toLowerCase();
            if (ct.contains("audio/x-mpegurl") || ct.contains("application/vnd.apple.mpegurl")) {
                return parseM3uPlaylist(resolved);
            }
            if (ct.contains("audio/x-scpls")) {
                return parsePlsPlaylist(resolved);
            }
        }

        return resolved;
    }

    private String followRedirects(String urlStr, int maxRedirects) throws Exception {
        for (int i = 0; i < maxRedirects; i++) {
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestProperty("User-Agent", "PodcastSphere/1.0");
            int code = conn.getResponseCode();
            if (code >= 300 && code < 400) {
                String location = conn.getHeaderField("Location");
                conn.disconnect();
                if (location == null) break;
                urlStr = location;
            } else {
                conn.disconnect();
                break;
            }
        }
        return urlStr;
    }

    private String parseM3uPlaylist(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(5000);
        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (!line.isEmpty() && !line.startsWith("#")) {
                reader.close();
                conn.disconnect();
                return line;
            }
        }
        reader.close();
        conn.disconnect();
        return url;
    }

    private String parsePlsPlaylist(String url) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setConnectTimeout(5000);
        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.trim().toLowerCase().startsWith("file1=")) {
                String streamUrl = line.trim().substring(6);
                reader.close();
                conn.disconnect();
                return streamUrl;
            }
        }
        reader.close();
        conn.disconnect();
        return url;
    }

    private SharedPreferences getPrefs() {
        return getSharedPreferences(PREFS_NAME, 0);
    }
}
