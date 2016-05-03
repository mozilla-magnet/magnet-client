package org.mozilla.magnet;

import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothAdapter.LeScanCallback;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;

public class ScannerBle extends ReactContextBaseJavaModule {
    String TAG = "ScannerBle";
    BluetoothAdapter bluetoothAdapter;
    Context mContext;

    public ScannerBle(ReactApplicationContext context) {
        super(context);
        mContext = context;
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
}
