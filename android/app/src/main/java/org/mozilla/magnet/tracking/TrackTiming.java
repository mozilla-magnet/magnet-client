package org.mozilla.magnet.tracking;

import java.util.Map;

public class TrackTiming implements CallableTracker {
    private final String mCategory;
    private final Double mValue;
    private final String mName;
    private final String mLabel;

    public TrackTiming(String aCategory, Double aValue,
        String aName, String aLabel) {

        mCategory = aCategory;
        mValue = aValue;
        mName = aName;
        mLabel = aLabel;
    }

    @Override
    public void call(Analytics aGa) {
        aGa.trackTiming(mCategory, mValue, mName, mLabel);
    }

    public static TrackTiming fromMap(Map<String, Object> aMap) {
        Object category = aMap.get("category");
        Object value = aMap.get("value");

        if (category == null) {
            throw new IllegalArgumentException("Type 'timing' should have a 'category' parameter");
        }

        if (value == null) {
            throw new IllegalArgumentException("Type 'timing' should have a numeric 'value' paramter");
        }

        Object name = aMap.get("name");
        Object label = aMap.get("label");

        // TODO: These may be null, but null is 'OK' as we're pretty much using it as an
        // optional type... Android's Jack compiler supports Java 8 +
        // the Optional type so we should move to that when we support it.
        return new TrackTiming((String)category, (Double)value, (String)name, (String)label);
    }
}
