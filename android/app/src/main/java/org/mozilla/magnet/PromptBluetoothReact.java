package org.mozilla.magnet;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class PromptBluetoothReact extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String TAG = "PromptBluetoothReact";
    private static final int REQUEST_ENABLE_BT = 99;
    private ReactApplicationContext mContext;
    private Promise mPromise;

    public PromptBluetoothReact(ReactApplicationContext context) {
        super(context);
        mContext = context;
        mContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void prompt(Promise promise) {

        // if bluetooth isn't enabled
        // prompt the user to enable it
        if (!bluetoothEnabled()) {
            mPromise = promise;
            promptEnableBluetooth();
            return;
        }

        promise.resolve(true);
    }

    /**
     * Test if bluetooth is enabled on the device.
     *
     * @return boolean
     */
    private boolean bluetoothEnabled() {
        BluetoothManager bluetoothManager = (BluetoothManager) mContext.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled();
    }

    private void promptEnableBluetooth() {
        Intent enableBluetoothIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        mContext.startActivityForResult(enableBluetoothIntent, REQUEST_ENABLE_BT, null);
    }

    @Override
    public void onActivityResult(Activity activty, int aRequestCode, int aResultCode, Intent aIntent) {
        switch(aRequestCode) {
            case REQUEST_ENABLE_BT:
                if (aResultCode != Activity.RESULT_OK) {
                    mPromise.resolve(false);
                    return;
                }

                mPromise.resolve(true);
                break;
        }
    }

    @Override
    public void onNewIntent(Intent intent) {
        // Ignored, required to implement ActivityEventListener
    }
}
