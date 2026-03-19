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

/**
 * PodcastAutoPlugin — Bridge Capacitor entre React et les services natifs Android
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  React (PlayerContext.tsx)                                       │
 * │     │                                                            │
 * │     ├─ updateNowPlaying()   ──→  PodcastBrowserService           │
 * │     ├─ updatePlaybackState() ──→  (UPDATE_METADATA /             │
 * │     ├─ syncFavorites()           UPDATE_PLAYBACK_STATE intents)  │
 * │     └─ stopPlayback()                                            │
 * │                                                                  │
 * │  PodcastBrowserService  ──→  Broadcast WEBVIEW_COMMAND           │
 * │     │                              │                             │
 * │     └─ BroadcastReceiver ──→  notifyListeners("mediaCommand")    │
 * │                                    │                             │
 * │                               React écoute avec                  │
 * │                               PodcastAutoPlugin.addListener()    │
 * └──────────────────────────────────────────────────────────────────┘
 */
@CapacitorPlugin(name = "PodcastAutoPlugin")
public class PodcastAutoPlugin extends Plugin {

    private static final String TAG = "PodcastAutoPlugin";
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1101;

    // Singleton pour accès depuis d'autres classes Java si besoin
    private static PodcastAutoPlugin instance;

    // Écoute les commandes de retour depuis PodcastBrowserService
    private BroadcastReceiver webViewCommandReceiver;

    // ===============================================================
    //  Initialisation du plugin
    // ===============================================================

    @Override
    public void load() {
        instance = this;
        requestNotificationPermissionIfNeeded();
        registerWebViewCommandReceiver();
        Log.d(TAG, "PodcastAutoPlugin chargé");
    }

    public static PodcastAutoPlugin getInstance() {
        return instance;
    }

    /**
     * Enregistre un BroadcastReceiver qui écoute les commandes envoyées
     * par PodcastBrowserService (play, pause, next, previous, seek)
     * et les transfère au layer React via notifyListeners().
     */
    private void registerWebViewCommandReceiver() {
        webViewCommandReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String command = intent.getStringExtra("command");
                if (command == null) return;

                Log.d(TAG, "Commande reçue du service : " + command);

                JSObject data = new JSObject();

                if (command.startsWith("seek:")) {
                    // Format : "seek:<position_ms>"
                    String[] parts = command.split(":");
                    data.put("action",   "seek");
                    data.put("position", parts.length > 1 ? Long.parseLong(parts[1]) : 0L);
                } else if (command.startsWith("playFromId:")) {
                    // Android Auto : lecture d'un épisode par ID
                    String[] parts = command.split(":", 2);
                    data.put("action",  "playFromId");
                    data.put("mediaId", parts.length > 1 ? parts[1] : "");
                } else {
                    // play | pause | stop | next | previous
                    data.put("action", command);
                }

                // Notifie tous les listeners React enregistrés avec
                // PodcastAutoPlugin.addListener("mediaCommand", handler)
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

    @Override
    protected void handleOnDestroy() {
        if (webViewCommandReceiver != null) {
            try {
                getContext().unregisterReceiver(webViewCommandReceiver);
            } catch (Exception e) {
                Log.w(TAG, "Receiver déjà désenregistré");
            }
        }
        super.handleOnDestroy();
    }

    // ===============================================================
    //  PluginMethods — appelés depuis React via Capacitor
    // ===============================================================

    /**
     * Met à jour les métadonnées de la notification et du lock screen.
     *
     * Appeler quand un nouvel épisode commence à jouer.
     *
     * @param title      Titre de l'épisode
     * @param author     Nom du podcast / auteur
     * @param artworkUrl URL de l'image de couverture
     * @param duration   Durée totale en millisecondes
     */
    @PluginMethod
    public void updateNowPlaying(PluginCall call) {
        String title      = call.getString("title",      "");
        String author     = call.getString("author",     "");
        String artworkUrl = call.getString("artworkUrl", "");
        Long   duration   = call.getLong("duration");
        if (duration == null) duration = 0L;

        requestNotificationPermissionIfNeeded();
        Log.d(TAG, "updateNowPlaying → " + title + " | " + author);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_METADATA);
        intent.putExtra("title",      title);
        intent.putExtra("author",     author);
        intent.putExtra("artworkUrl", artworkUrl);
        intent.putExtra("duration",   duration);

        startService(intent);
        call.resolve();
    }

    /**
     * Met à jour l'état play/pause et la position dans la notification et le lock screen.
     *
     * Appeler à chaque toggle play/pause et régulièrement (toutes les 5s) pendant la lecture.
     *
     * @param isPlaying true si lecture en cours
     * @param position  Position actuelle en millisecondes
     */
    @PluginMethod
    public void updatePlaybackState(PluginCall call) {
        Boolean isPlaying = call.getBoolean("isPlaying");
        Long    position  = call.getLong("position");
        if (isPlaying == null) isPlaying = false;
        if (position  == null) position  = 0L;

        requestNotificationPermissionIfNeeded();
        Log.d(TAG, "updatePlaybackState → isPlaying=" + isPlaying + " | position=" + position);

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_UPDATE_PLAYBACK_STATE);
        intent.putExtra("isPlaying", isPlaying);
        intent.putExtra("position",  position);

        startService(intent);
        call.resolve();
    }

    /**
     * Synchronise les favoris/abonnements dans les SharedPreferences
     * pour les exposer dans le browse tree Android Auto.
     *
     * @param favorites  JSON string : "[\"Titre|feedId\", ...]"
     * @param recent     JSON string : "[\"Titre|episodeId\", ...]"
     */
    @PluginMethod
    public void syncFavorites(PluginCall call) {
        String favorites = call.getString("favorites", "[]");
        String recent    = call.getString("recent",    "[]");

        getContext()
            .getSharedPreferences("podcast_auto_data", Context.MODE_PRIVATE)
            .edit()
            .putString("subscriptions_items", favorites)
            .putString("recent_items",        recent)
            .apply();

        Log.d(TAG, "syncFavorites → " + favorites.length() + " chars");
        call.resolve();
    }

    /**
     * Arrête proprement le foreground service et retire la notification.
     */
    @PluginMethod
    public void stopPlayback(PluginCall call) {
        Log.d(TAG, "stopPlayback");

        Intent intent = new Intent(getContext(), PodcastBrowserService.class);
        intent.setAction(PodcastBrowserService.ACTION_STOP_SERVICE);
        startService(intent);

        call.resolve();
    }

    // ===============================================================
    //  Helpers privés
    // ===============================================================

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (getActivity() == null) return;

        try {
            if (ContextCompat.checkSelfPermission(getActivity(), Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    getActivity(),
                    new String[]{ Manifest.permission.POST_NOTIFICATIONS },
                    NOTIFICATION_PERMISSION_REQUEST_CODE
                );
                Log.d(TAG, "Permission POST_NOTIFICATIONS demandée");
            }
        } catch (Exception e) {
            Log.w(TAG, "Impossible de demander POST_NOTIFICATIONS", e);
        }
    }

    /**
     * Démarre le service en Foreground si API >= 26, sinon startService normal.
     * Évite le crash "startForegroundService called but not became foreground".
     */
    private void startService(Intent intent) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }
    }
}
