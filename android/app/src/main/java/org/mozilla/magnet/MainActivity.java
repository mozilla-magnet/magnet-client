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
    private final long ALARM_INTERVAL_MS = TimeUnit.MINUTES.toMillis(10);

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
        setupAlarm();
    }

    /**
     * Called when the app comes to the foreground.
     */
    @Override
    protected void onResume() {
        super.onResume();
        clearNotifications();
        setActive(true);
    }

    /**
     * Called when the app goes to the background.
     */
    @Override
    protected void onPause() {
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
        SharedPreferences prefs = getSharedPreferences("MAGNET", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putBoolean("active", active);
        editor.apply();
    }

    /**
     * Schedule a repeating alarm used to activate `AlarmReceiver`
     * which in-turn triggers`NotificationService` to perform a
     * short background scan and dispatch system notifications.
     */
    private void setupAlarm() {
        Context context = getApplicationContext();
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, AlarmReceiver.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, 0, intent, 0);

        alarmManager.setInexactRepeating(
                AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + ALARM_INTERVAL_MS,
                ALARM_INTERVAL_MS,
                pendingIntent);
    }

    /**
     * Clear the Magnet notification.
     */
    private void clearNotifications() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notificationManager.cancel(NotificationService.NOTIFICATION_ID);
    }
}
