package org.mozilla.magnet;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

public class ReceiverNotificationDelete extends BroadcastReceiver {
    private final String TAG = "NotificationDelete";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "on receive");
        String action = intent.getAction();

        if (!action.equals("notification_delete")) {
            return;
        }

        sendBroadcast(context);
    }

    private void sendBroadcast(Context context) {
        Intent intent = new Intent("notification-delete");
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }
}
