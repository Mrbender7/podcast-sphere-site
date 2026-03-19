package com.fhm.podcastsphere;

import android.content.Context;

import com.google.android.gms.cast.framework.CastOptions;
import com.google.android.gms.cast.framework.OptionsProvider;
import com.google.android.gms.cast.framework.SessionProvider;
import com.google.android.gms.cast.CastMediaControlIntent;

import java.util.List;

/**
 * Required by the Cast SDK framework.
 * Must be declared in AndroidManifest.xml as meta-data.
 */
public class CastOptionsProvider implements OptionsProvider {

    // Default Media Receiver for development
    // Replace with custom receiver App ID for production
    private static final String CAST_APP_ID = "CC1AD845";

    @Override
    public CastOptions getCastOptions(Context context) {
        return new CastOptions.Builder()
            .setReceiverApplicationId(CAST_APP_ID)
            .build();
    }

    @Override
    public List<SessionProvider> getAdditionalSessionProviders(Context context) {
        return null;
    }
}
