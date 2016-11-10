package org.mozilla.magnet.permissions;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;

/**
 * Created by wilsonpage on 09/11/2016.
 */
class CheckBluetooth extends Check {
    private static int ID = 10;

    CheckBluetooth(PermissionChecker listener, Activity activity) {
        super(listener, activity);
    }

    @Override
    public int getId() {
        return ID;
    }

    void check() {
        if (!hasBluetooth()) {
            done();
            return;
        }

        if (bluetoothEnabled()) {
            done();
            return;
        }

        Intent enableBluetoothIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        getActivity().startActivityForResult(enableBluetoothIntent, ID);
        awaitingResponse();
    }

    public void onResponse(int result) {
        boolean success = result == Activity.RESULT_OK;
        done();
    }

    private boolean hasBluetooth() {
        return BluetoothAdapter.getDefaultAdapter() != null;
    }

    /**
     * Test if bluetooth is enabled on the device.
     *
     * @return boolean
     */
    private boolean bluetoothEnabled() {
        BluetoothManager bluetoothManager = (BluetoothManager) getActivity().getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter bluetoothAdapter = bluetoothManager.getAdapter();
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled();
    }
}
