package com.fhm.podcastsphere;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PodcastAutoPlugin")
public class PodcastAutoPlugin extends Plugin {

    private static final String TAG = "PodcastAutoPlugin";
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1101;
    private static final String PREFS_NAME = "PodcastAutoPrefs";

    private static PodcastAutoPlugin instance;
    private BroadcastReceiver webViewCommandReceiver;

    @Override
    public void load() {
        instance = this;
        requestNotificationPermissionIfNeeded();
        registerWebViewCommandReceiver();
        Log.d(TAG, "PodcastAutoPlugin loaded");
    }

    public static PodcastAutoPlugin getInstance() {
        return instance;
    }

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private void registerWebViewCommandReceiver() {
        webViewCommandReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String command = intent.getStringExtra("command");
                if (command == null) return;

                Log.d(TAG, "Command to React: " + command);

                JSObject data = new JSObject();
                if (command.startsWith("seek:")) {
                    String[] parts = command.split(":");
                    data.put("action",   "seek");
                    data.put("position", parts.length > 1 ? Long.parseLong(parts[1]) : 0L);
                } else if (command.startsWith("playMediaId:")) {
                    data.put("action", "playMediaId");
                    data.put("mediaId", command.substring("playMediaId:".length()));
                } else {
                    data.put("action", command);
                }

                notifyListeners("mediaCommand", data);
            }
        };

        IntentFilter filter = new IntentFilter(PodcastBrowserService.ACTION_WEBVIEW_COMMAND);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getContext().registerReceiver(webViewCommandReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            getContext().registerReceiver(webViewCommandReceiver, filter);
        }
    }

    @PluginMethod
    public void updateNowPlaying(PluginCall call) {
        String title      = call.getString("title",      "");
        String author     = call.getString("author",     "");
        String artworkUrl = call.getString("artworkUrl", "");
        
        Double durationDouble = call.getDouble("duration", 0.0);
        long duration = durationDouble.longValue();

        Log.d(TAG, "updateNowPlaying → " + title + " | Duration: " + duration);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_METADATA);
        intent.putExtra("title",      title);
        intent.putExtra("author",     author);
        intent.putExtra("artworkUrl", artworkUrl);
        intent.putExtra("duration",   duration);

        safeStartForegroundService(intent);
        call.resolve();
    }

    @PluginMethod
    public void updatePlaybackState(PluginCall call) {
        Boolean isPlaying = call.getBoolean("isPlaying", false);
        
        Double positionDouble = call.getDouble("position", 0.0);
        long position = positionDouble.longValue();

        Log.d(TAG, "updatePlaybackState → isPlaying=" + isPlaying + " | position=" + position);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_PLAYBACK_STATE);
        intent.putExtra("isPlaying", isPlaying);
        intent.putExtra("position",  position);

        if (Boolean.TRUE.equals(isPlaying)) {
            safeStartForegroundService(intent);
        } else {
            safeStartService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopPlayback(PluginCall call) {
        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_STOP_SERVICE);
        safeStartService(intent);
        call.resolve();
    }

    @PluginMethod
    public void syncFavorites(PluginCall call) {
        String favorites = call.getString("favorites", "[]");
        getPrefs().edit().putString("subscriptions", favorites).apply();
        Log.d(TAG, "syncFavorites: saved " + favorites.length() + " chars");
        call.resolve();
    }

    @PluginMethod
    public void syncListenHistory(PluginCall call) {
        String history = call.getString("history", "[]");
        getPrefs().edit().putString("listenHistory", history).apply();
        Log.d(TAG, "syncListenHistory: saved " + history.length() + " chars");
        call.resolve();
    }

    @PluginMethod
    public void syncEpisodeList(PluginCall call) {
        String feedId = call.getString("feedId", "0");
        String episodes = call.getString("episodes", "[]");
        getPrefs().edit().putString("episodes_" + feedId, episodes).apply();
        Log.d(TAG, "syncEpisodeList feed=" + feedId + ": saved " + episodes.length() + " chars");
        call.resolve();
    }

    @PluginMethod
    public void syncLanguage(PluginCall call) {
        String lang = call.getString("language", "fr");
        getPrefs().edit().putString("appLanguage", lang).apply();
        Log.d(TAG, "syncLanguage: " + lang);
        call.resolve();
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (getActivity() == null) return;
        try {
            if (ContextCompat.checkSelfPermission(getActivity(), Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(getActivity(), new String[]{ Manifest.permission.POST_NOTIFICATIONS }, NOTIFICATION_PERMISSION_REQUEST_CODE);
            }
        } catch (Exception e) {
            Log.w(TAG, "Permission error", e);
        }
    }

    private void safeStartForegroundService(Intent intent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "startForegroundService failed: " + e.getMessage());
            try {
                getContext().startService(intent);
            } catch (Exception e2) {
                Log.e(TAG, "startService fallback also failed: " + e2.getMessage());
            }
        }
    }

    private void safeStartService(Intent intent) {
        try {
            getContext().startService(intent);
        } catch (Exception e) {
            Log.e(TAG, "startService failed: " + e.getMessage());
        }
    }
}
