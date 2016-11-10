package org.mozilla.magnet.permissions;

import android.app.Activity;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;

/**
 * Created by wilsonpage on 09/11/2016.
 */
class CheckGooglePlayServices extends Check {
    public static int ID = 11;

    CheckGooglePlayServices(PermissionChecker listener, Activity activity) {
        super(listener, activity);
    }

    @Override
    int getId() {
        return ID;
    }

    public void check() {
        final GoogleApiAvailability googleApiAvailability = GoogleApiAvailability.getInstance();
        final int result = googleApiAvailability.isGooglePlayServicesAvailable(getActivity());

        if (result == ConnectionResult.SUCCESS) {
            done();
            return;
        }

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                googleApiAvailability.showErrorDialogFragment(getActivity(), result, ID);
                done();
            }
        });
    }

    /**
     * Called when the upgrade prompt flow is complete.
     *
     * Right now we're not acting on the response.
     * This prompt with happen each time the app
     * is opened. We may choose to do more in
     * the future.
     *
     * @param result
     */
    public void onResponse(int result) {
        done();
    }
}
