package org.mozilla.magnet.permissions;

/**
 * Created by wilsonpage on 09/11/2016.
 */
public interface PermissionCheckerCallback {
    void onPermissionChecksComplete();
    void onPermissionChecksError(Error error);
}
