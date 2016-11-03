package org.mozilla.magnet;

import android.Manifest;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import com.facebook.react.ReactActivity;

import org.mozilla.magnet.notifications.NotificationService;

public class MainActivity extends ReactActivity {
    private final static String TAG = MainActivity.class.getName();
    private final static int PERMISSION_REQUEST_LOCATION = 1;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Magnet";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        checkPermissions();
    }

    /**
     * Called when the app comes to the foreground.
     */
    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "on resume");
        setActive(true);
    }

    /**
     * Called when the app goes to the background.
     */
    @Override
    protected void onPause() {
        Log.d(TAG, "on pause");
        super.onPause();
        setActive(false);
    }

    /**
     * Sets the 'active' state in a datastore shared by
     * both `MainActivity` and `NotificationService`.
     *
     * The Service uses this value to determine whether the
     * app is visible and if it should dispatch notifications.
     *
     * @param active
     */
    private void setActive(boolean active) {
        Log.d(TAG, "set active: " + active);
        SharedPreferences prefs = getSharedPreferences("MAGNET", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("active", active);
        editor.commit();
    }

    /**
     * Checks for existence of required permissions
     * and prompts user if need be.
     *
     * Android M requires additional location permissions
     * to perform bluetooth scanning in a background
     * service.
     */
    private void checkPermissions() {
        if (hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)) { return; }

        final AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("This app needs location access");
        builder.setMessage("Please grant location access so this app can detect beacons.");
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
             @Override
             public void onDismiss(DialogInterface dialog) {
                 ActivityCompat.requestPermissions(
                         MainActivity.this,
                         new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                         PERMISSION_REQUEST_LOCATION);
             }
        });

        builder.show();
    }

    /**
     * Responds to a permission request result.
     *
     * The user will be warned if they declined a permission
     *
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_LOCATION: {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Log.d(TAG, "coarse location permission granted");
                    return;
                }

                final AlertDialog.Builder builder = new AlertDialog.Builder(this);
                builder.setTitle("Functionality limited");
                builder.setMessage("Since location access has not been granted, this app will not be able to discover beacons when in the background.");
                builder.setPositiveButton(android.R.string.ok, null);
                builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
                    @Override
                    public void onDismiss(DialogInterface dialog) {}
                });

                builder.show();
            }
        }
    }

    private boolean hasPermission(String permission) {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
    }
}
