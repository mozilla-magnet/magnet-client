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

        // IMPORTANT: We can't be sure that this code is
        // running on main-ui-thread, it depends where the
        // method was called from. For example React Native
        // responds to native bridge methods off main-ui-thread.
        // If a dialog is dispatched from a non-ui-thread thread,
        // when it is dismissed on main-ui-thread the app will crash.
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                googleApiAvailability.showErrorDialogFragment(getActivity(), result, ID);
                done();
            }
        });
    }
}
