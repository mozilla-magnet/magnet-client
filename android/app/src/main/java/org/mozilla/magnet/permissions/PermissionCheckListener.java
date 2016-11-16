package org.mozilla.magnet.permissions;

/**
 * Created by wilsonpage on 09/11/2016.
 */
interface PermissionCheckListener {
    void onCheckDone(PermissionCheck check);
    void onCheckAwaitingResponse(PermissionCheck check);
}
