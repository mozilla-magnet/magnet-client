package org.mozilla.magnet.tracking;

import com.idehub.GoogleAnalyticsBridge.GA;
import com.idehub.GoogleAnalyticsBridge.Optional;

import java.util.Map;

public class TrackEvent implements CallableTracker {
    private String mCategory;
    private String mAction;

    public TrackEvent(String aCategory, String aAction) {
        mCategory = aCategory;
        mAction = aAction;
    }

    @Override
    public void call(String aTrackerId, GA aGa) {
        aGa.trackEvent(
            aTrackerId, mCategory, mAction, Optional.emptyString(), Optional.emptyInteger());
    }

    public static TrackEvent fromMap(Map<String, Object> aMap) {
        Object category = aMap.get("category");
        Object action = aMap.get("action");

        if (category == null) {
            throw new IllegalArgumentException("Type 'event' should have a 'category' parameter");
        }

        if (action == null) {
            throw new IllegalArgumentException("Type 'event' should have an 'action' parameter");
        }

        return new TrackEvent((String)category, (String)action);
    }
}
