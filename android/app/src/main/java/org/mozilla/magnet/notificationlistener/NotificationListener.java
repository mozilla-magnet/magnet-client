package org.mozilla.magnet.notificationlistener;

import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class NotificationListener extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private final static String TAG = "NotificationListener";
    private ReactApplicationContext mReactContext;
    private Activity mActivity;

    public NotificationListener(ReactApplicationContext reactContext, Activity activity) {
        super(reactContext);
        mReactContext = reactContext;
        mActivity = activity;

        reactContext.addLifecycleEventListener(this);

        LocalBroadcastManager
                .getInstance(reactContext)
                .registerReceiver(
                    mBroadcastReceiver,
                    new IntentFilter("notification-delete"));
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

    public void onNewIntent(Intent intent) {
        boolean foo = isFromNotification(intent);
        Log.d(TAG, "new intent: " + foo);
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

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("launchedApp", isFromNotification(mActivity.getIntent()));
        return constants;
    }

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

