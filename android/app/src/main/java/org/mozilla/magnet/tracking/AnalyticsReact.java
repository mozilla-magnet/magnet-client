package org.mozilla.magnet.tracking;

import android.content.Context;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeMap;

import java.util.Map;

public class AnalyticsReact extends ReactContextBaseJavaModule {
    private static final String TAG = "AnalyticsReact";

    private final Analytics mAnalytics;

    public AnalyticsReact(ReactApplicationContext aContext) {
        super(aContext);

        mAnalytics = new Analytics(aContext);
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void trackEvent(ReadableMap aData, final Promise promise) {
        String category = aData.getString("category");
        String action = aData.getString("action");
        String label = null;
        Long longValue = null;

        if (aData.hasKey("label")) {
            label = aData.getString("label");
        }

        if (aData.hasKey("value")) {
            Double value = aData.getDouble("value");
            longValue = value.longValue();
        }

        mAnalytics.trackEvent(category, action, label, longValue);
        promise.resolve(true);
    }

    @ReactMethod
    public void trackTiming(ReadableMap aData, final Promise promise) {
        String category = aData.getString("category");
        Double value = aData.getDouble("value");
        String name = aData.getString("name");

        String label = null;
        if (aData.hasKey("label")) {
          label = aData.getString("label");
        }

        mAnalytics.trackTiming(category, value, name, label);
        promise.resolve(true);
    }

    @ReactMethod
    public void trackScreenView(ReadableMap aData, final Promise promise) {
        String name = aData.getString("name");

        mAnalytics.trackScreenView(name);
        promise.resolve(true);
    }
}
