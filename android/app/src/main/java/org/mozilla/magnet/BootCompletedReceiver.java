package org.mozilla.magnet;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * This Receiver is run when the device has booted.
 *
 * Alarms are wiped when a device reboots. We use this
 * to set the alarm to trigger background scanning.
 *
 * If we didn't do this the background Service would not start
 * running until the app was launched (when the alarm is also set).
 */
public class BootCompletedReceiver extends BroadcastReceiver {
    private final String TAG = BootCompletedReceiver.class.getName();

    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "on receive");
        MainActivity.setAlarm(context);
    }
}
