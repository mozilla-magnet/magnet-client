package org.mozilla.magnet;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.IBinder;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.mozilla.magnet.net.scanner.MagnetScannerItem;

public class MagnetScannerReact extends ReactContextBaseJavaModule implements ScannerService.ScannerServiceCallback {
    private final static String TAG = "MagnetScannerReact";
    private ReactApplicationContext mContext;
    private Boolean mNeedsStarting = false;
    private ScannerService mService;
    private Boolean mBound = false;

    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            mBound = true;
            ScannerService.LocalBinder binder = (ScannerService.LocalBinder) service;
            mService = binder.getService();
            mService.addListener(MagnetScannerReact.this);
            if (mNeedsStarting) {
                start();
            }
        }

        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            mBound = false;
        }
    };

    public MagnetScannerReact(ReactApplicationContext context) {
        super(context);
        mContext = context;
        Intent intent = new Intent(context, ScannerService.class);
        context.bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
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

        // if service hasn't connected yet set a
        // flag to start the scanner once it has
        if (!mBound) {
            mNeedsStarting = true;
            return;
        }

        // start scanning
        mService.start();
        mNeedsStarting = false;
    }

    /**
     * Stop the ScannerService scanning.
     */
    @ReactMethod
    public void stop() {
        if (!mBound) {
            return;
        }

        mService.stop();
    }

    @Override
    public void onItemFound(MagnetScannerItem item) {
        Log.d(TAG, "item found");
        WritableMap data = Arguments.createMap();
        data.putString("url", item.getUrl());
        data.putDouble("distance", item.getDistance());
        emit("magnetscanner:itemfound", data);
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
