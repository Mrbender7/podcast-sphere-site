package com.fhm.podcastsphere;

import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor plugin for syncing podcast data between WebView and native services.
 * Singleton pattern for bridge between notification BroadcastReceiver and JS.
 */
@CapacitorPlugin(name = "PodcastAutoPlugin")
public class PodcastAutoPlugin extends Plugin {

    private static final String TAG = "PodcastAutoPlugin";
    private static final String PREFS_NAME = "podcastsphere_data";

    private static PodcastAutoPlugin activeInstance;

    @Override
    public void load() {
        activeInstance = this;
        Log.d(TAG, "PodcastAutoPlugin loaded (singleton registered)");
    }

    public static PodcastAutoPlugin getActiveInstance() {
        return activeInstance;
    }

    /**
     * Called by MediaToggleReceiver when notification play/pause is tapped.
     * Emits a JS event that PlayerContext listens to.
     */
    public void notifyToggleFromNotification() {
        notifyListeners("mediaToggle", new JSObject());
    }

    /**
     * Called by native service on vehicle disconnect.
     * Emits event to force-pause WebView audio.
     */
    public void notifyVehicleDisconnected(String episodeId) {
        JSObject data = new JSObject();
        if (episodeId != null) data.put("episodeId", episodeId);
        notifyListeners("vehicleDisconnected", data);
    }

    /**
     * Public wrapper for notifyListeners (which is protected in Capacitor Plugin).
     */
    public void notifyListenersExternal(String eventName, JSObject data) {
        notifyListeners(eventName, data);
    }

    @PluginMethod
    public void syncFavorites(PluginCall call) {
        String json = call.getString("podcasts", "[]");
        getPrefs().edit().putString("favorites", json).apply();

        // Update native browse tree if service is running
        if (PodcastBrowserService.getInstance() != null) {
            PodcastBrowserService.getInstance().updateFavorites(json);
        }

        Log.d(TAG, "Favorites synced (" + json.length() + " chars)");
        call.resolve();
    }

    @PluginMethod
    public void syncRecents(PluginCall call) {
        String json = call.getString("podcasts", "[]");
        getPrefs().edit().putString("recents", json).apply();

        if (PodcastBrowserService.getInstance() != null) {
            PodcastBrowserService.getInstance().updateRecents(json);
        }

        Log.d(TAG, "Recents synced (" + json.length() + " chars)");
        call.resolve();
    }

    @PluginMethod
    public void notifyPlaybackState(PluginCall call) {
        String episodeId = call.getString("episodeId", "");
        String title = call.getString("title", "");
        String artist = call.getString("artist", "");
        String imageUrl = call.getString("imageUrl", "");
        boolean isPlaying = call.getBoolean("isPlaying", false);
        double currentTime = call.getDouble("currentTime", 0.0);
        double duration = call.getDouble("duration", 0.0);

        SharedPreferences.Editor editor = getPrefs().edit();
        editor.putString("current_episode_id", episodeId);
        editor.putString("current_title", title);
        editor.putString("current_artist", artist);
        editor.putString("current_image", imageUrl);
        editor.putBoolean("is_playing", isPlaying);
        editor.putFloat("current_time", (float) currentTime);
        editor.putFloat("duration", (float) duration);
        editor.apply();

        Log.d(TAG, "Playback state: " + title + " playing=" + isPlaying);
        call.resolve();
    }

    @PluginMethod
    public void clearAppData(PluginCall call) {
        getPrefs().edit().clear().apply();
        Log.d(TAG, "App data cleared");
        call.resolve();
    }

    private SharedPreferences getPrefs() {
        return getContext().getSharedPreferences(PREFS_NAME, 0);
    }
}
