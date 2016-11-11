package org.mozilla.magnet.permissions;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.support.v4.content.ContextCompat;

/**
 * Created by wilsonpage on 09/11/2016.
 */
abstract class Check {
    private Activity mActivity;
    private PermissionChecker mListener;

    Check(PermissionChecker listener, Activity activity) {
        mActivity = activity;
        mListener = listener;
    }

    abstract int getId();
    abstract void check();

    public void onResponse(int result) {
        // noop
    }

    protected void done() {
        mListener.onCheckDone(this);
    }

    protected Activity getActivity() {
        return mActivity;
    }

    void awaitingResponse() {
        mListener.onCheckAwaitingResponse(this);
    }

    boolean hasPermission(String permission) {
        return ContextCompat.checkSelfPermission(mActivity, permission) == PackageManager.PERMISSION_GRANTED;
    }
}
