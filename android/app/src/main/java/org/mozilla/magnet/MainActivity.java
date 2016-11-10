package org.mozilla.magnet;

import android.content.SharedPreferences;
import android.util.Log;

import com.facebook.react.ReactActivity;

import org.mozilla.magnet.permissions.PermissionChecker;

public class MainActivity extends ReactActivity {
    private final static String TAG = MainActivity.class.getName();

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Magnet";
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
     * Responds to a permission request result.
     *
     * The user will be warned if they declined a permission
     *
     * @param requestCode
     * @param permissions
     * @param results
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        PermissionChecker.onResponse(requestCode, results[0]);
    }
}
