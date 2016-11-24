package org.mozilla.magnet.permissions;

import android.app.Activity;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

/**
 * Created by wilsonpage on 09/11/2016.
 */

public class PermissionChecker implements PermissionCheckListener {
    private static Map<Integer,PermissionCheck> checksAwaitingResponse = new HashMap<>();
    private Stack<PermissionCheck> checks = new Stack<>();
    private PermissionCheckerCallback mCallback;
    private boolean mChecking = false;

    public void check(Activity activity, PermissionCheckerCallback callback) {
        if (mChecking) return;
        mChecking = true;
        mCallback = callback;

        checks.add(new PermissionCheckBluetooth(this, activity));
        checks.add(new PermissionCheckGooglePlayServices(this, activity));
        checks.add(new PermissionCheckLocation(this, activity));

        checkNext();
    }

    private void checkNext() {
        if (checks.size() > 0) {
            checks.pop().check();
            return;
        }

        mChecking = false;
        mCallback.onPermissionChecksComplete();
    }

    @Override
    public void onCheckDone(PermissionCheck check) {
        checkNext();
    }

    @Override
    public void onCheckAwaitingResponse(PermissionCheck check) {
        checksAwaitingResponse.put(check.getId(), check);
    }

    public static void onResponse(int checkId, int response) {
        PermissionCheck check = checksAwaitingResponse.get(checkId);
        if (check == null) return;
        checksAwaitingResponse.remove(checkId);
        check.onResponse(response);
    }
}

