package org.mozilla.magnet.permissions;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.support.v4.content.ContextCompat;

abstract class PermissionCheck {
    private Activity mActivity;
    private PermissionCheckListener mListener;

    PermissionCheck(PermissionCheckListener listener, Activity activity) {
        mActivity = activity;
        mListener = listener;
    }

    protected abstract int getId();
    protected abstract void check();

    public void onResponse(int result) {
        // noop
    }

    protected void done() {
        mListener.onCheckDone(this);
    }

    protected Activity getActivity() {
        return mActivity;
    }

    protected void awaitingResponse() {
        mListener.onCheckAwaitingResponse(this);
    }

    boolean hasPermission(String permission) {
        return ContextCompat.checkSelfPermission(mActivity, permission) == PackageManager.PERMISSION_GRANTED;
    }
}
