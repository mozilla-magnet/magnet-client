package org.mozilla.magnet.notificationlistener;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class NotificationListener extends ReactContextBaseJavaModule implements LifecycleEventListener, ActivityEventListener {
    private final static String TAG = "NotificationListener";
    private ReactApplicationContext mReactContext;

    public NotificationListener(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;

        reactContext.addLifecycleEventListener(this);
        reactContext.addActivityEventListener(this);

        LocalBroadcastManager
                .getInstance(reactContext)
                .registerReceiver(
                    mBroadcastReceiver,
                    new IntentFilter("notification-delete"));
    }

    @ReactMethod
    public void appLaunchedFromNotification(Promise promise) {
        Activity activity = getCurrentActivity();
        boolean result = false;

        if (activity != null) {
            result = isFromNotification(activity.getIntent());
        }

        promise.resolve(result);
    }

    @Override
    public String getName() {
        return TAG;
    }

    @Override
    public void onHostResume() {}

    @Override
    public void onHostPause() {}

    @Override
    public void onHostDestroy() {
        LocalBroadcastManager
                .getInstance(mReactContext)
                .unregisterReceiver(mBroadcastReceiver);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        // Ignored, required to implement ActivityEventListener
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (isFromNotification(intent)) {
            emit("applaunch", null);
        }
    }

    private BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.d(TAG, "on notification delete");
            emit("dismiss", null);
        }
    };

    private boolean isFromNotification(Intent intent) {
        String source = intent.getStringExtra("source");
        return source != null && source.equals("notification");
    }

    /**
     * Emit an event back to ReactNative JS context.
     *
     * @param name
     * @param data
     */
    private void emit(String name, WritableMap data) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("notification:" + name, data);
    }
}

