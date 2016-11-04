package org.mozilla.magnet.notifications;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.support.annotation.Nullable;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

public class ReceiverNotificationDelete extends BroadcastReceiver {
    private final String TAG = "NotificationDelete";

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "on receive");
        String action = intent.getAction();
        if (!action.startsWith("notification-dismiss")) { return; }
        int id = (int) intent.getExtras().get("id");
        clearNotification(context, id);
        sendBroadcast(context);
    }

    private void clearNotification(Context context, int id) {
        if (id == 0) return;
        NotificationManager manager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        manager.cancel(id);
    }

    private void sendBroadcast(Context context) {
        Intent intent = new Intent("notification-delete");
        LocalBroadcastManager.getInstance(context).sendBroadcast(intent);
    }

    public static PendingIntent createIntent(Context context, int id) {
        Intent intent = new Intent(context, ReceiverNotificationDelete.class);
        intent.putExtra("id", id);

        // action string must be unique so that we can
        // have one dismiss intent per notification
        intent.setAction("notification-dismiss:" + id);

        return PendingIntent.getBroadcast(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);
    }
}
