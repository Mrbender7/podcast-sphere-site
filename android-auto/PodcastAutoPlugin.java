package com.fhm.podcastsphere;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
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

    private static PodcastAutoPlugin instance;
    private BroadcastReceiver webViewCommandReceiver;

    @Override
    public void load() {
        instance = this;
        requestNotificationPermissionIfNeeded();
        registerWebViewCommandReceiver();
        Log.d(TAG, "PodcastAutoPlugin chargé et prêt");
    }

    public static PodcastAutoPlugin getInstance() {
        return instance;
    }

    private void registerWebViewCommandReceiver() {
        webViewCommandReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String command = intent.getStringExtra("command");
                if (command == null) return;

                Log.d(TAG, "Envoi commande vers React : " + command);

                JSObject data = new JSObject();
                if (command.startsWith("seek:")) {
                    String[] parts = command.split(":");
                    data.put("action",   "seek");
                    data.put("position", parts.length > 1 ? Long.parseLong(parts[1]) : 0L);
                } else {
                    data.put("action", command);
                }

                // Important : on notifie TOUS les listeners
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
        
        // Utilisation de Double pour être sûr de récupérer la valeur du JS
        Double durationDouble = call.getDouble("duration", 0.0);
        long duration = durationDouble.longValue();

        Log.d(TAG, "updateNowPlaying → " + title + " | Durée: " + duration);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_METADATA);
        intent.putExtra("title",      title);
        intent.putExtra("author",     author);
        intent.putExtra("artworkUrl", artworkUrl);
        intent.putExtra("duration",   duration);

        startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void updatePlaybackState(PluginCall call) {
        Boolean isPlaying = call.getBoolean("isPlaying", false);
        
        // Utilisation de Double pour éviter les problèmes de cast JS/Java
        Double positionDouble = call.getDouble("position", 0.0);
        long position = positionDouble.longValue();

        Log.d(TAG, "updatePlaybackState → isPlaying=" + isPlaying + " | position=" + position);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_PLAYBACK_STATE);
        intent.putExtra("isPlaying", isPlaying);
        intent.putExtra("position",  position);

        startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void stopPlayback(PluginCall call) {
        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_STOP_SERVICE);
        startService(intent);
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

    private void startService(Intent intent) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                getContext().startForegroundService(intent);
            } else {
                getContext().startService(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Erreur démarrage service: " + e.getMessage());
        }
    }
}
