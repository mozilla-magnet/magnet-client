package org.mozilla.magnet.tracking;

import com.idehub.GoogleAnalyticsBridge.GA;

public interface CallableTracker {
    public void call(String aTrackerId, GA aGa);
}
