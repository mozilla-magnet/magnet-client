package org.mozilla.magnet.tracking;

import java.util.Map;

public class TrackEvent implements CallableTracker {
    private final String mCategory;
    private final String mAction;
    private final String mLabel;
    private final Long mValue;

    public TrackEvent(String aCategory, String aAction) {
        mCategory = aCategory;
        mAction = aAction;
        mLabel = null;
        mValue = null;
    }

    public TrackEvent(String aCategory, String aAction, String aLabel, Long aValue) {
        mCategory = aCategory;
        mAction = aAction;
        mLabel = aLabel;
        mValue = aValue;
    }

    @Override
    public void call(Analytics aGa) {
        aGa.trackEvent(
            mCategory, mAction, mLabel, mValue);
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

        Object label = aMap.get("label");
        Object value = aMap.get("value");

        if (!(label == null || value == null)) {
            return new TrackEvent((String)category, (String)action, (String)label, (Long)value);
        }

        return new TrackEvent((String)category, (String)action);
    }
}
