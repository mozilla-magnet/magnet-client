package org.mozilla.magnet;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

/**
 * Created by wilsonpage on 17/10/2016.
 */

public class ReceiverMagnetScannerItemsFound extends BroadcastReceiver {
    private final String TAG = "ReceiverMagnetScanner";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "on receive");

        Bundle bundle = intent.getExtras();
        Intent serviceIntent = new Intent(context, NotificationService.class);
        serviceIntent.putExtras(bundle);

        context.startService(serviceIntent);
    }
}
