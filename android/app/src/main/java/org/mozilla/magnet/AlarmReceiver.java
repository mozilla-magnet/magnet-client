package org.mozilla.magnet;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;
import android.util.Log;

import org.mozilla.magnet.net.scanner.MagnetScannerItem;

public class AlarmReceiver extends BroadcastReceiver {
    String TAG = "AlarmReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "on receive");
        Intent serviceIntent = new Intent(context, NotificationService.class);
        context.startService(serviceIntent);
    }
}