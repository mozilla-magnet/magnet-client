package org.mozilla.magnet;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.SystemClock;
import android.support.v4.app.NotificationCompat;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.facebook.react.ReactActivity;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import com.learnium.RNDeviceInfo.RNDeviceInfo;

public class MainActivity extends ReactActivity {
    private final static String TAG = MainActivity.class.getName();

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

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new RNDeviceInfo(),
                new MyAppPackage()
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        MainActivity.setAlarm(getApplicationContext());
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
     * Schedule a repeating alarm used to activate `AlarmReceiver`
     * which in-turn triggers`NotificationService` to perform a
     * short background scan and dispatch system notifications.
     *
     * Notifications can be enabled/disabled via `res/values/flags.xml`.
     */
    public static void setAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, AlarmReceiver.class);
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
}
