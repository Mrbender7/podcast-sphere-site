package com.fhm.podcastsphere;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.mediarouter.media.MediaControlIntent;
import androidx.mediarouter.media.MediaRouteSelector;
import androidx.mediarouter.media.MediaRouter;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.cast.MediaInfo;
import com.google.android.gms.cast.MediaLoadRequestData;
import com.google.android.gms.cast.MediaMetadata;
import com.google.android.gms.cast.framework.CastContext;
import com.google.android.gms.cast.framework.CastSession;
import com.google.android.gms.cast.framework.SessionManager;
import com.google.android.gms.cast.framework.SessionManagerListener;
import com.google.android.gms.cast.framework.media.RemoteMediaClient;
import com.google.android.gms.common.images.WebImage;

import android.net.Uri;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@CapacitorPlugin(
    name = "CastPlugin",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { "android.permission.NEARBY_WIFI_DEVICES" }, alias = "nearbyWifi")
    }
)
public class CastPlugin extends Plugin {

    private static final String TAG = "CastPlugin";
    private static final String CAST_APP_ID = "CC1AD845"; // Default Media Receiver (dev)
    private static final int PERMISSION_REQUEST_CODE = 9001;

    private CastContext castContext;
    private SessionManager sessionManager;
    private MediaRouter mediaRouter;
    private MediaRouteSelector mediaRouteSelector;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    private boolean initialized = false;
    private CastSession currentSession = null;

    private final SessionManagerListener<CastSession> sessionListener = new SessionManagerListener<CastSession>() {
        @Override
        public void onSessionStarting(@NonNull CastSession session) {
            Log.d(TAG, "Session starting");
        }

        @Override
        public void onSessionStarted(@NonNull CastSession session, @NonNull String sessionId) {
            Log.d(TAG, "Session started: " + sessionId);
            currentSession = session;
            JSObject data = new JSObject();
            data.put("deviceName", session.getCastDevice() != null ? session.getCastDevice().getFriendlyName() : "Chromecast");
            notifyListeners("castSessionStarted", data);
        }

        @Override
        public void onSessionStartFailed(@NonNull CastSession session, int error) {
            Log.e(TAG, "Session start failed: " + error);
            currentSession = null;
            notifyListeners("castSessionFailed", new JSObject());
        }

        @Override
        public void onSessionEnding(@NonNull CastSession session) {
            Log.d(TAG, "Session ending");
        }

        @Override
        public void onSessionEnded(@NonNull CastSession session, int error) {
            Log.d(TAG, "Session ended");
            currentSession = null;
            notifyListeners("castSessionEnded", new JSObject());
        }

        @Override
        public void onSessionResuming(@NonNull CastSession session, @NonNull String sessionId) {}

        @Override
        public void onSessionResumed(@NonNull CastSession session, boolean wasSuspended) {
            currentSession = session;
            JSObject data = new JSObject();
            data.put("deviceName", session.getCastDevice() != null ? session.getCastDevice().getFriendlyName() : "Chromecast");
            notifyListeners("castSessionStarted", data);
        }

        @Override
        public void onSessionSuspended(@NonNull CastSession session, int reason) {}
    };

    @Override
    public void load() {
        Log.d(TAG, "CastPlugin loaded");
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        if (initialized) {
            call.resolve(new JSObject().put("status", "already_initialized"));
            return;
        }

        // Check permissions for Android 13+
        if (Build.VERSION.SDK_INT >= 33) {
            if (ContextCompat.checkSelfPermission(getActivity(), "android.permission.NEARBY_WIFI_DEVICES")
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(getActivity(),
                    new String[]{"android.permission.NEARBY_WIFI_DEVICES", Manifest.permission.ACCESS_FINE_LOCATION},
                    PERMISSION_REQUEST_CODE);
            }
        } else {
            if (ContextCompat.checkSelfPermission(getActivity(), Manifest.permission.ACCESS_FINE_LOCATION)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(getActivity(),
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    PERMISSION_REQUEST_CODE);
            }
        }

        try {
            castContext = CastContext.getSharedInstance(getContext());
            sessionManager = castContext.getSessionManager();
            sessionManager.addSessionManagerListener(sessionListener, CastSession.class);

            mediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast(CAST_APP_ID))
                .build();

            mediaRouter = MediaRouter.getInstance(getContext());
            mediaRouter.addCallback(mediaRouteSelector, new MediaRouter.Callback() {
                @Override
                public void onRouteAdded(@NonNull MediaRouter router, @NonNull MediaRouter.RouteInfo route) {
                    Log.d(TAG, "Route added: " + route.getName());
                    notifyListeners("castDeviceAvailable", new JSObject().put("available", true));
                }

                @Override
                public void onRouteRemoved(@NonNull MediaRouter router, @NonNull MediaRouter.RouteInfo route) {
                    Log.d(TAG, "Route removed: " + route.getName());
                }
            }, MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);

            initialized = true;
            call.resolve(new JSObject().put("status", "initialized"));
        } catch (Exception e) {
            Log.e(TAG, "Cast init failed", e);
            call.reject("Cast initialization failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void showCastPicker(PluginCall call) {
        if (!initialized || mediaRouter == null) {
            call.reject("Cast not initialized");
            return;
        }

        getActivity().runOnUiThread(() -> {
            try {
                androidx.mediarouter.app.MediaRouteChooserDialog dialog =
                    new androidx.mediarouter.app.MediaRouteChooserDialog(getActivity());
                dialog.setRouteSelector(mediaRouteSelector);
                dialog.show();
                call.resolve();
            } catch (Exception e) {
                call.reject("Failed to show picker: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void loadMedia(PluginCall call) {
        if (currentSession == null) {
            call.reject("No active Cast session");
            return;
        }

        String streamUrl = call.getString("url", "");
        String title = call.getString("title", "");
        String artist = call.getString("artist", "");
        String imageUrl = call.getString("imageUrl", "");
        double duration = call.getDouble("duration", 0.0);

        if (streamUrl == null || streamUrl.isEmpty()) {
            call.reject("No URL provided");
            return;
        }

        // Resolve URL and load on background thread
        new Thread(() -> {
            try {
                String resolvedUrl = resolveStreamUrlSafely(streamUrl);
                String mime = detectMimeType(resolvedUrl);

                MediaMetadata metadata = new MediaMetadata(MediaMetadata.MEDIA_TYPE_MUSIC_TRACK);
                metadata.putString(MediaMetadata.KEY_TITLE, title != null ? title : "");
                metadata.putString(MediaMetadata.KEY_ARTIST, artist != null ? artist : "");
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    String safeImageUrl = imageUrl.replace("http://", "https://");
                    metadata.addImage(new WebImage(Uri.parse(safeImageUrl)));
                }

                // For podcasts: use STREAM_TYPE_BUFFERED (finite content) instead of LIVE
                MediaInfo mediaInfo = new MediaInfo.Builder(resolvedUrl)
                    .setStreamType(MediaInfo.STREAM_TYPE_BUFFERED)
                    .setContentType(mime)
                    .setMetadata(metadata)
                    .setStreamDuration((long)(duration * 1000))
                    .build();

                RemoteMediaClient remoteClient = currentSession.getRemoteMediaClient();
                if (remoteClient != null) {
                    getActivity().runOnUiThread(() -> {
                        remoteClient.load(new MediaLoadRequestData.Builder()
                            .setMediaInfo(mediaInfo)
                            .setAutoplay(true)
                            .build());
                        call.resolve(new JSObject().put("status", "loaded"));
                    });
                } else {
                    call.reject("No remote media client");
                }
            } catch (Exception e) {
                Log.e(TAG, "loadMedia failed", e);
                call.reject("Failed to load media: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void togglePlayPause(PluginCall call) {
        if (currentSession == null) {
            call.reject("No active session");
            return;
        }
        RemoteMediaClient client = currentSession.getRemoteMediaClient();
        if (client != null) {
            if (client.isPlaying()) {
                client.pause();
            } else {
                client.play();
            }
            call.resolve();
        } else {
            call.reject("No remote client");
        }
    }

    @PluginMethod
    public void stopCasting(PluginCall call) {
        if (sessionManager != null) {
            sessionManager.endCurrentSession(true);
        }
        currentSession = null;
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("initialized", initialized);
        result.put("connected", currentSession != null);
        if (currentSession != null && currentSession.getCastDevice() != null) {
            result.put("deviceName", currentSession.getCastDevice().getFriendlyName());
        }
        call.resolve(result);
    }

    // --- Stream URL resolution ---

    private String resolveStreamUrlSafely(String url) {
        try {
            Future<String> future = executor.submit(() -> resolveStreamUrl(url));
            return future.get(8000, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            Log.w(TAG, "URL resolution timeout, using raw URL: " + url);
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

        String lower = resolved.toLowerCase();
        if (lower.endsWith(".m3u") || lower.endsWith(".m3u8")) {
            return parseM3uPlaylist(resolved);
        }
        if (lower.endsWith(".pls")) {
            return parsePlsPlaylist(resolved);
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
        conn.setReadTimeout(5000);
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
        conn.setReadTimeout(5000);
        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String line;
        while ((line = reader.readLine()) != null) {
            line = line.trim();
            if (line.toLowerCase().startsWith("file1=")) {
                String streamUrl = line.substring(6);
                reader.close();
                conn.disconnect();
                return streamUrl;
            }
        }
        reader.close();
        conn.disconnect();
        return url;
    }

    private String detectMimeType(String url) {
        String lower = url.toLowerCase();
        if (lower.contains(".aac")) return "audio/aac";
        if (lower.contains(".ogg") || lower.contains(".opus")) return "audio/ogg";
        if (lower.contains(".flac")) return "audio/flac";
        if (lower.contains(".m4a")) return "audio/mp4";
        return "audio/mpeg"; // default MP3
    }
}
