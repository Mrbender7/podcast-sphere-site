package com.fhm.podcastsphere;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * MediaToggleReceiver
 *
 * BroadcastReceiver déclaré dans AndroidManifest pour l'action
 * "com.fhm.podcastsphere.MEDIA_TOGGLE".
 *
 * Rôle : reçoit les taps sur les boutons de la notification
 * et les relaie au PodcastBrowserService qui met à jour la
 * MediaSession et notifie React.
 *
 * Note : les actions play/pause/next/prev de la notification MediaStyle
 * passent directement par MediaButtonReceiver (androidx) → PodcastBrowserService.
 * Ce receiver sert de fallback pour les actions custom si besoin.
 */
public class MediaToggleReceiver extends BroadcastReceiver {

    private static final String TAG = "MediaToggleReceiver";

    public static final String ACTION_MEDIA_TOGGLE = "com.fhm.podcastsphere.MEDIA_TOGGLE";
    public static final String EXTRA_COMMAND       = "command";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action  = intent.getAction();
        String command = intent.getStringExtra(EXTRA_COMMAND);

        Log.d(TAG, "onReceive → action=" + action + " | command=" + command);

        if (!ACTION_MEDIA_TOGGLE.equals(action)) return;
        if (command == null || command.isEmpty()) return;

        // Relayer la commande vers PodcastBrowserService via broadcast local
        // PodcastBrowserService → MediaSessionCallback → sendWebViewCommand()
        // → PodcastAutoPlugin BroadcastReceiver → notifyListeners("mediaCommand")
        // → React PlayerContext handler
        Intent serviceIntent = new Intent(context, PodcastBrowserService.class);
        switch (command) {
            case "play":
                serviceIntent.setAction("androidx.media.session.ACTION_PLAY");
                break;
            case "pause":
                serviceIntent.setAction("androidx.media.session.ACTION_PAUSE");
                break;
            case "toggle":
                // Commande toggle générique : on passe par WEBVIEW_COMMAND directement
                Intent toggleIntent = new Intent(PodcastBrowserService.ACTION_WEBVIEW_COMMAND);
                toggleIntent.putExtra("command", "toggle");
                context.sendBroadcast(toggleIntent);
                return;
            default:
                // Commande inconnue : relayer telle quelle
                Intent rawIntent = new Intent(PodcastBrowserService.ACTION_WEBVIEW_COMMAND);
                rawIntent.putExtra("command", command);
                context.sendBroadcast(rawIntent);
                return;
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
    }
}
