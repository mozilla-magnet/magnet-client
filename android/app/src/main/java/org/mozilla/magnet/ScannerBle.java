package org.mozilla.magnet;

import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothAdapter.LeScanCallback;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;

public class ScannerBle extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String TAG = "ScannerBle";
    private static final int REQUEST_ENABLE_BT = 99;

    BluetoothAdapter bluetoothAdapter;
    final ReactApplicationContext mContext;


    public ScannerBle(ReactApplicationContext context) {
        super(context);
        mContext = context;
        mContext.addActivityEventListener(this);

        final BluetoothManager bluetoothManager = (BluetoothManager) context.getSystemService(Context.BLUETOOTH_SERVICE);
        bluetoothAdapter = bluetoothManager.getAdapter();
    }

    @Override
    public String getName() {
        return TAG;
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
    @ReactMethod
    public void start() {
        Log.d(TAG, "start");

        if (bluetoothAdapter == null) {
            // Device does not support bluetooth.
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            Intent enableBluetoothIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            mContext.startActivityForResult(enableBluetoothIntent, REQUEST_ENABLE_BT, null);
            return;
        }

        bluetoothAdapter.startLeScan(onFound);
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
    @ReactMethod
    public void stop() {
        Log.d(TAG, "stop");
        bluetoothAdapter.stopLeScan(onFound);
    }

    private LeScanCallback onFound = new LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, int rssi, byte[] scanRecord) {
            Log.d(TAG, "rssi: " + rssi);
            String json = toJSON(scanRecord);
            WritableMap data = Arguments.createMap();
            data.putInt("rssi", rssi);
            data.putString("bytes", json);
            emit("magnet:bledevicefound", data);
        }
    };

    private String toJSON(byte[] bytes) {
        JSONArray array = new JSONArray();
        for (byte item:bytes) array.put(item);
        return array.toString();
    }

    private void emit(String name, WritableMap data) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(name, data);
    }

    @Override
    public void onActivityResult(int aRequestCode, int aResultCode, Intent aIntent) {
        if (aRequestCode == REQUEST_ENABLE_BT && aResultCode == Activity.RESULT_OK) {
            this.start();
        }
    }
}
