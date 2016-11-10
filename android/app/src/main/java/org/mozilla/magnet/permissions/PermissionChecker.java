package org.mozilla.magnet.permissions;

import android.app.Activity;

import java.util.HashMap;
import java.util.Map;
import java.util.Stack;

/**
 * Created by wilsonpage on 09/11/2016.
 */

public class PermissionChecker implements CheckListener {
    private static Map<Integer,Check> checksAwaitingResponse = new HashMap<>();
    private Stack<Check> checks = new Stack<>();
    private PermissionCheckerCallback mCallback;
    private boolean mChecking = false;

    public void check(Activity activity, PermissionCheckerCallback callback) {
        if (mChecking) return;
        mChecking = true;
        mCallback = callback;

        checks.add(new CheckBluetooth(this, activity));
        checks.add(new CheckGooglePlayServices(this, activity));
        checks.add(new CheckLocationPermission(this, activity));

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
    public void onCheckDone(Check check) {
        checkNext();
    }

    @Override
    public void onCheckAwaitingResponse(Check check) {
        checksAwaitingResponse.put(check.getId(), check);
    }

    public static void onResponse(int checkId, int response) {
        Check check = checksAwaitingResponse.get(checkId);
        if (check == null) return;
        checksAwaitingResponse.remove(checkId);
        check.onResponse(response);
    }
}

