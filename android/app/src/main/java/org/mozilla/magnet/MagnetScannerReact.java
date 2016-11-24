package org.mozilla.magnet;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
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

import org.mozilla.magnet.permissions.PermissionChecker;
import org.mozilla.magnet.permissions.PermissionCheckerCallback;
import org.mozilla.magnet.scanner.MagnetScanner;
import org.mozilla.magnet.scanner.MagnetScannerItem;
import org.mozilla.magnet.scanner.MagnetScannerListener;

import java.util.concurrent.TimeUnit;

class MagnetScannerReact extends ReactContextBaseJavaModule implements MagnetScannerListener, LifecycleEventListener, ActivityEventListener {
    private final static String TAG = "MagnetScannerReact";
    private static final long MIN_TIME_BETWEEN_CHECKS = TimeUnit.SECONDS.toMillis(10);
    private ReactApplicationContext mContext;
    private MagnetScanner mMagnetScanner;
    private boolean mStarted = false;
    private boolean mStarting = false;
    private PermissionChecker mPermissionChecker;
    private long mLastPermissionsCheck = 0;

    MagnetScannerReact(ReactApplicationContext context) {
        super(context);
        mContext = context;

        context.addLifecycleEventListener(this);
        context.addActivityEventListener(this);

        mPermissionChecker = new PermissionChecker();
        mMagnetScanner = new MagnetScanner(context)
                .useBle()
                .useGeolocation();
    }

    @Override
    public String getName() {
        return TAG;
    }

    /**
     * Start the scanner.
     *
     * Before the scanner runs we check and prompt the user
     * for all the permissions required to run the scanner.
     *
     * We don't yet block the scanner from running if
     * the user doesn't accept all the prompts, the
     * scanner will simply degrade based on the
     * permissions the app has been granted.
     *
     * The user will be prompted every time the scanner
     * is started (onResume()), so it will be annoyingly
     * persistent. We may choose to go the extra mile
     * and show a banner in the UI that informs the
     * user than the experience is degraded and why
     * (like 'you are offline' style banners).
     */
    @ReactMethod
    public void start(final Promise promise) {
        Log.d(TAG, "start");

        // it's fine for clients to hammer this
        // method, although promises will reject.
        if (mStarted || mStarting) {
            promise.reject("busy", "already starting");
            return;
        }

        mStarting = true;
        Log.d(TAG, "starting");

        checkPermissions(new PermissionCheckerCallback() {
            @Override
            public void onPermissionChecksComplete() {
                Log.d(TAG, "permission checks done");
                mLastPermissionsCheck = System.currentTimeMillis();

                // scanner can be stopped
                // during permissions check
                if (!mStarting) {
                    promise.reject("stopped", "stopped before start finished");
                    return;
                }

                mMagnetScanner.start(MagnetScannerReact.this);
                mStarting = false;
                mStarted = true;
                promise.resolve(true);
            }

            @Override
            public void onPermissionChecksError(Error error) {
                Log.e(TAG, error.toString());
                mStarting = false;
                promise.reject("permission-error", error.getMessage());
            }
        });
    }

    /**
     * Stop the ScannerService scanning.
     */
    @ReactMethod
    public void stop(Promise promise) {
        Log.d(TAG, "stop");
        mMagnetScanner.stop();
        mStarting = false;
        mStarted = false;
        promise.resolve(true);
    }

    private void checkPermissions(PermissionCheckerCallback callback) {
        if (!needsPermissionsCheck()) {
            callback.onPermissionChecksComplete();
            return;
        }

        Activity activity = mContext.getCurrentActivity();
        if (activity == null) {
            Log.e(TAG, "can't check when app in background");
            callback.onPermissionChecksError(new Error("activity null"));
            return;
        }

        mPermissionChecker.check(activity, callback);
    }

    private boolean needsPermissionsCheck() {
        long timeSince = System.currentTimeMillis() - mLastPermissionsCheck;
        return timeSince > MIN_TIME_BETWEEN_CHECKS;
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        PermissionChecker.onResponse(requestCode, resultCode);
    }

    @Override
    public void onNewIntent(Intent intent) {
        // noop
    }

    @Override
    public void onHostPause() {
        Log.d(TAG, "on host pause");
        mMagnetScanner.startBackgroundScanning();
    }

    @Override
    public void onHostResume() {
        Log.d(TAG, "on host resume");
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
        if (item.getLatitude() != null && item.getLongitude() != null) {
            data.putDouble("latitude", item.getLatitude());
            data.putDouble("longitude", item.getLongitude());
        }
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
