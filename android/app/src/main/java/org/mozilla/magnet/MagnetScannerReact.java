package org.mozilla.magnet;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.mozilla.magnet.scanner.MagnetScanner;
import org.mozilla.magnet.scanner.MagnetScannerItem;
import org.mozilla.magnet.scanner.MagnetScannerListener;

public class MagnetScannerReact extends ReactContextBaseJavaModule implements MagnetScannerListener, LifecycleEventListener {
    private final static String TAG = "MagnetScannerReact";
    private ReactApplicationContext mContext;
    private MagnetScanner mMagnetScanner;

    public MagnetScannerReact(ReactApplicationContext context) {
        super(context);
        mContext = context;

        context.addLifecycleEventListener(this);

        mMagnetScanner = new MagnetScanner(context)
                .useBle()
                .useMdns()
                .useGeolocation();
    }

    @Override
    public String getName() {
        return TAG;
    }

    /**
     * Start the ScannerService scanning.
     */
    @ReactMethod
    public void start() {
        mMagnetScanner.start(this);
    }

    /**
     * Stop the ScannerService scanning.
     */
    @ReactMethod
    public void stop() {
        mMagnetScanner.stop();
    }

    @Override
    public void onHostPause() {
        mMagnetScanner.startBackgroundScanning();
    }

    @Override
    public void onHostResume() {
        mMagnetScanner.stopBackgroundScanning();
    }

    @Override
    public void onHostDestroy() {
        // noop
    }

    @Override
    public void onItemFound(MagnetScannerItem item) {
        Log.d(TAG, "item found");
        WritableMap data = Arguments.createMap();
        data.putString("url", item.getUrl());
        data.putDouble("distance", item.getDistance());
        emit("magnetscanner:itemfound", data);
    }

    @Override
    public void onItemLost(MagnetScannerItem item) {
        Log.d(TAG, "item found");
        WritableMap data = Arguments.createMap();
        data.putString("url", item.getUrl());
        data.putDouble("distance", item.getDistance());
        emit("magnetscanner:itemlost", data);
    }

    /**
     * Emit an event back to ReactNative JS context.
     *
     * @param name
     * @param data
     */
    private void emit(String name, WritableMap data) {
        mContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(name, data);
    }
}
