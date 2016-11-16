package org.mozilla.magnet.permissions;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.support.v4.app.ActivityCompat;

/**
 * Created by wilsonpage on 09/11/2016.
 */
class PermissionCheckLocation extends PermissionCheck {
    public static int ID = 12;

    PermissionCheckLocation(PermissionChecker listener, Activity activity) {
        super(listener, activity);
    }

    @Override
    protected int getId() {
        return ID;
    }

    public void check() {
        if (hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) {
            done();
            return;
        }

        ActivityCompat.requestPermissions(
                getActivity(),
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                ID);

        awaitingResponse();
    }

    /**
     * Called when we get the response from the user prompt.
     *
     * Right now we're not acting on the response. In the
     * future we may wish to show an annoying banner
     * prompting the user to enable.
     *
     * @param result
     */
    public void onResponse(int result) {
        boolean granted = result == PackageManager.PERMISSION_GRANTED;
        done();
    }
}
