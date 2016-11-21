package org.mozilla.magnet.tracking;

import java.util.Map;

public class TrackScreenView implements CallableTracker {
    private final String mScreenName;

    public TrackScreenView(String aScreenName) {
        mScreenName = aScreenName;
    }

    @Override
    public void call(Analytics aGa) {
        aGa.trackScreenView(mScreenName);
    }

    public static TrackScreenView fromMap(Map<String, Object> aMap) {
        Object name = aMap.get("name");

        if (name == null) {
            throw new IllegalArgumentException("Type 'screenview' should have a 'name' parameter");
        }

        return new TrackScreenView((String)name);
    }
}

