package org.mozilla.magnet.tracking;

import com.idehub.GoogleAnalyticsBridge.GA;
import com.idehub.GoogleAnalyticsBridge.Optional;

import java.util.Map;

public class TrackTiming implements CallableTracker {
    private String mCategory;
    private Double mValue;

    public TrackTiming(String aCategory, Double aValue) {
        mCategory = aCategory;
        mValue = aValue;
    }

    @Override
    public void call(String aTrackerId, GA aGa) {
        aGa.trackTiming(
                aTrackerId, mCategory, mValue,
                Optional.emptyString(), Optional.emptyString());
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

        return new TrackTiming((String)category, (Double)value);
    }
}
