package org.mozilla.magnet;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.app.BundleCompat;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import java.util.ArrayList;

public class NotificationService extends Service {
    private String TAG = "NotificationService";
    public static final int NOTIFICATION_ID = 1;

    /**
     * Called once, when the service is created.
     */
    @Override
    public void onCreate() {
        Log.d(TAG, "on get");

        // notifications aren't required if
        // the app is 'active' (in foreground)
        if (appActive()) {
            Log.d(TAG, "app is active, terminating ...");
            stopSelf();
            return;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "on start command");

        if (intent != null) {
            ArrayList items = (ArrayList) intent.getSerializableExtra("items");
            Log.d(TAG, "items:" + items);
            updateNotification(items);
        }

        return super.onStartCommand(intent, flags, startId);
    }

    /**
     * Called once, when the service is terminated.
     */
    @Override
    public void onDestroy() {
        Log.d(TAG, "on destroy");
    }

    /**
     * Check if the main activity is in the foreground.
     *
     * @return boolean
     */
    private boolean appActive() {
        SharedPreferences prefs = getSharedPreferences("MAGNET", MODE_PRIVATE);
        return prefs.getBoolean("active", false);
    }

    /**
     * Update the current notification state.
     */
    private void updateNotification(ArrayList items) {
        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        int itemCount = items.size();

        // when there are no found items
        // we should not show any notification
        if (itemCount == 0) {
            notificationManager.cancel(NOTIFICATION_ID);
            return;
        }

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.drawable.ic_stat_notify)
                .setContentTitle("Content found nearby")
                .setContentText("Tap to explore")
                .setAutoCancel(true)
                .setShowWhen(false)
                .setDeleteIntent(createDeleteIntent())
                .setContentIntent(createLaunchIntent());

        notificationManager.notify(NOTIFICATION_ID, mBuilder.build());
    }

    private PendingIntent createLaunchIntent() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        int uniqueRequestCode = (int) System.currentTimeMillis();

        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launchIntent.putExtra("source", "notification");

        return PendingIntent.getActivity(
                this,
                uniqueRequestCode,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private PendingIntent createDeleteIntent() {
        Intent intent = new Intent(this, ReceiverNotificationDelete.class);
        intent.setAction("notification_delete");
        return PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
