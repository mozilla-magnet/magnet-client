package org.mozilla.magnet;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import org.mozilla.magnet.net.scanner.MagnetScannerItem;

import java.util.HashMap;

public class NotificationService extends Service implements ScannerService.ScannerServiceCallback {
    private String TAG = "NotificationService";
    private static final int SCAN_DURATION_MS = 5000;
    public static final int NOTIFICATION_ID = 1;
    private HashMap<String, MagnetScannerItem> mItems;
    private ServiceConnection mServiceConnection;
    private ScannerService mScannerService;
    private boolean mConnected = false;

    /**
     * Called once, when the service is created.
     */
    @Override
    public void onCreate() {
        Log.d(TAG, "on get");

        // background scanning isn't required
        // if the app is 'active' (in foreground)
        if (appActive()) {
            Log.d(TAG, "app is active, terminating ...");
            stopSelf();
            return;
        }

        connect();
    }

    /**
     * Called once, when the service is terminated.
     */
    @Override
    public void onDestroy() {
        Log.d(TAG, "on destroy");
        disconnect();
    }

    /**
     * Connects to the service.
     */
    private void connect() {
        mServiceConnection = new ServiceConnection() {

            @Override
            public void onServiceConnected(ComponentName className, IBinder service) {
                Log.d(TAG, "on service connected");
                mConnected = true;
                ScannerService.LocalBinder binder = (ScannerService.LocalBinder) service;
                mScannerService = binder.getService();
                onConnected();
            }

            @Override
            public void onServiceDisconnected(ComponentName arg0) {
                Log.d(TAG, "on service disconnected");
            }
        };

        Intent serviceIntent = new Intent(this, ScannerService.class);
        bindService(serviceIntent, mServiceConnection, Context.BIND_AUTO_CREATE);
    }

    /**
     * Cleans up and disconnects from the service.
     */
    private void disconnect() {
        if (!mConnected) {
            return;
        }

        mScannerService.removeListener(this);
        mScannerService.stop();
        unbindService(mServiceConnection);
    }

    /**
     * Gets currently found items and listens for new items
     * for a few seconds (SCAN_DURATION_MS). Once complete
     * the service terminates itself, which in-turn triggers
     * the cleanup in `onDestroy()`.
     */
    private void onConnected() {
        mScannerService.addListener(NotificationService.this);
        mItems = mScannerService.getItems();
        updateNotification();

        mScannerService.start();
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                stopSelf();
            }
        }, SCAN_DURATION_MS);
    }

    /**
     * Updates the notification to reflect number of items found.
     *
     * @param item
     */
    @Override
    public void onItemFound(MagnetScannerItem item) {
        Log.d(TAG, "item found");
        mItems.put(item.getUrl(), item);
        updateNotification();
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
    private void updateNotification() {
        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        int itemCount = mItems.size();

        // when there are no found items
        // we should not show any notification
        if (itemCount == 0) {
            notificationManager.cancel(NOTIFICATION_ID);
            return;
        }

        // get intent to launch the app when the notification is tapped
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setAction(Intent.ACTION_MAIN);
        launchIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                (int) System.currentTimeMillis(),
                launchIntent, 0);

        NotificationCompat.Builder mBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.drawable.ic_stat_notify)
                .setContentTitle("Content found nearby")
                .setContentText("Tap to explore")
                .setAutoCancel(true)
                .setShowWhen(false)
                .setContentIntent(pendingIntent);

        notificationManager.notify(NOTIFICATION_ID, mBuilder.build());
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
