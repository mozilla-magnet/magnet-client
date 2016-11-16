package org.mozilla.magnet.permissions;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;

/**
 * Created by wilsonpage on 09/11/2016.
 */
class PermissionCheckBluetooth extends PermissionCheck {
    private static final int ID = 10;

    PermissionCheckBluetooth(PermissionChecker listener, Activity activity) {
        super(listener, activity);
    }

    @Override
    protected int getId() {
        return ID;
    }

    protected void check() {
        if (!hasBluetooth() || bluetoothEnabled()) {
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
        return getAdapter() != null;
    }

    /**
     * Test if bluetooth is enabled on the device.
     *
     * @return boolean
     */
    private boolean bluetoothEnabled() {
        BluetoothAdapter bluetoothAdapter = getAdapter();
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled();
    }

    static BluetoothAdapter getAdapter() {
        return BluetoothAdapter.getDefaultAdapter();
    }
}
