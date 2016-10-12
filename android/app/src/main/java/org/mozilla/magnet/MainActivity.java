package org.mozilla.magnet;

import android.Manifest;
import android.app.AlarmManager;
import android.app.AlertDialog;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import org.mozilla.magnet.notificationlistener.NotificationListenerPackage;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class MainActivity extends ReactActivity {
    private final static String TAG = MainActivity.class.getName();
    private final static int PERMISSION_REQUEST_COARSE_LOCATION = 1;
    private NotificationListenerPackage mNotificationEventsPackage;

    /**
     * The alarm runs every 10 minutes. We may
     * decide to tweak this as we evolve the UX.
     */
    private static final long ALARM_INTERVAL_MS = TimeUnit.MINUTES.toMillis(10);

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "Magnet";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MainActivity.setAlarm(getApplicationContext());
        checkPermissions();
    }

    /**
     * Called when the app comes to the foreground.
     */
    @Override
    protected void onResume() {
        super.onResume();
        Log.d(TAG, "on resume");
        clearNotifications();
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
     * Schedule a repeating alarm used to activate `ReceiverAlarm`
     * which in-turn triggers`NotificationService` to perform a
     * short background scan and dispatch system notifications.
     *
     * Notifications can be enabled/disabled via `res/values/flags.xml`.
     */
    public static void setAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, ReceiverAlarm.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, 0);
        boolean enabled = context.getResources().getBoolean(R.bool.notifications_enabled);

        // cancel any previously set alarms
        // if notifications are disabled
        if (!enabled) {
            Log.d(TAG, "alarm canceled");
            alarmManager.cancel(pendingIntent);
            return;
        }

        // set the alarm
        alarmManager.setInexactRepeating(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + ALARM_INTERVAL_MS,
                ALARM_INTERVAL_MS,
                pendingIntent);

        Log.d(TAG, "alarm set");
    }

    /**
     * Clear the Magnet notification.
     */
    private void clearNotifications() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notificationManager.cancel(NotificationService.NOTIFICATION_ID);
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
        if (hasPermission(Manifest.permission.ACCESS_COARSE_LOCATION)) { return; }

        final AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("This app needs location access");
        builder.setMessage("Please grant location access so this app can detect beacons.");
        builder.setPositiveButton(android.R.string.ok, null);
        builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
             @Override
             public void onDismiss(DialogInterface dialog) {
                 ActivityCompat.requestPermissions(
                         MainActivity.this,
                         new String[]{Manifest.permission.ACCESS_COARSE_LOCATION},
                         PERMISSION_REQUEST_COARSE_LOCATION);
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
            case PERMISSION_REQUEST_COARSE_LOCATION: {
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
                    public void onDismiss(DialogInterface dialog) {
                    }
                });

                builder.show();
            }
        }
    }

    private boolean hasPermission(String permission) {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED;
    }
}
