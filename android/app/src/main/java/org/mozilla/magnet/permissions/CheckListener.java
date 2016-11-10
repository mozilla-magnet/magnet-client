package org.mozilla.magnet.permissions;

/**
 * Created by wilsonpage on 09/11/2016.
 */
interface CheckListener {
    void onCheckDone(Check check);
    void onCheckAwaitingResponse(Check check);
}
