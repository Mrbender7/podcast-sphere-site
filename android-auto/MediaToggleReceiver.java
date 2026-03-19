package com.fhm.podcastsphere;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * BroadcastReceiver for play/pause toggle from notification.
 * Routes the signal to PodcastAutoPlugin which emits a JS event.
 * Action: com.fhm.podcastsphere.MEDIA_TOGGLE
 */
public class MediaToggleReceiver extends BroadcastReceiver {

    private static final String TAG = "MediaToggleReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "Media toggle received");
        PodcastAutoPlugin plugin = PodcastAutoPlugin.getActiveInstance();
        if (plugin != null) {
            plugin.notifyToggleFromNotification();
        } else {
            Log.w(TAG, "No active PodcastAutoPlugin instance");
        }
    }
}
