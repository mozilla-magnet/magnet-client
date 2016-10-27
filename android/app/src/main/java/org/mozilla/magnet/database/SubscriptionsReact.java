package org.mozilla.magnet.database;

import android.content.ContentValues;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.mozilla.magnet.scanner.MagnetScanner;
import org.mozilla.magnet.scanner.MagnetScannerItem;
import org.mozilla.magnet.scanner.MagnetScannerListener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class SubscriptionsReact extends ReactContextBaseJavaModule {
    private final static String TAG = "SubscriptionsReact";
    private ReactApplicationContext mContext;

    public SubscriptionsReact(ReactApplicationContext context) {
        super(context);
        mContext = context;
    }

    @Override
    public String getName() {
        return TAG;
    }

    /**
     * Start the ScannerService scanning.
     */
    @ReactMethod
    public void add(String channelName, Promise promise) {
        promise.resolve(Subscriptions.get(mContext).add(channelName));
    }

    /**
     * Start the ScannerService scanning.
     */
    @ReactMethod
    public void remove(String channelName, Promise promise) {
        promise.resolve(Subscriptions.get(mContext).remove(channelName));
    }

    @ReactMethod
    public void get(Promise promise) {
        Log.d(TAG, "get");
        ArrayList<SubscriptionRecord> items = Subscriptions.get(mContext).get();
        WritableArray result = Arguments.createArray();

        for (SubscriptionRecord item: items) {
            result.pushMap(item.toWritableMap());
        }

        promise.resolve(result);
    }

    @ReactMethod
    public void update(String channelName, ReadableMap model, Promise promise) {
        Log.d(TAG, "update: " + model);
        HashMap map = ((ReadableNativeMap) model).toHashMap();
        boolean result = Subscriptions.get(mContext).update(channelName, map);
        promise.resolve(result);
    }
}

