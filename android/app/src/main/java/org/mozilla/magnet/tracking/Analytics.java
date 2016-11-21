package org.mozilla.magnet.tracking;

import android.content.Context;

import com.google.android.gms.analytics.GoogleAnalytics;
import com.google.android.gms.analytics.HitBuilders;
import com.google.android.gms.analytics.Tracker;
import com.google.android.gms.analytics.ecommerce.Product;
import com.google.android.gms.analytics.ecommerce.ProductAction;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Contains logic for calling Google Analytics library methods
 */
public class Analytics {
    private static final String TAG = "Analytics";
    private static final int LOCAL_DISPATCH_PERIOD = 20;

    private final Tracker mTracker;

    public Analytics(Context aContext, String aTrackerId) {
        mTracker = createTracker(aContext, aTrackerId);
    }

    public void trackScreenView(String aScreenName) {
        mTracker.setScreenName(aScreenName);
        mTracker.send(new HitBuilders.ScreenViewBuilder().build());
    }

    public void trackEvent(
        String aCategory, String aAction, String aLabel, Long aValue) {

        HitBuilders.EventBuilder hit = new HitBuilders.EventBuilder()
            .setCategory(aCategory)
            .setAction(aAction);

        if (aLabel != null) {
            hit.setLabel(aLabel);
        }

        if (aValue != null) {
            hit.setValue(aValue.longValue());
        }

        mTracker.send(hit.build());
    }

    public void trackTiming(String aCategory, Double aValue,
        String aName, String aLabel) {

        HitBuilders.TimingBuilder hit = new HitBuilders.TimingBuilder()
            .setCategory(aCategory)
            .setValue(aValue.longValue());

        if (aName != null) {
            hit.setVariable(aName);
        }

        if (aLabel != null) {
            hit.setLabel(aLabel);
        }

        mTracker.send(hit.build());
    }

    public void trackScreenViewWithCustomDimensionValues(String aScreenName, Map<Integer, String> aDimensionIndexValues) {

          mTracker.setScreenName(aScreenName);

          HitBuilders.ScreenViewBuilder hit = new HitBuilders.ScreenViewBuilder();

          for (Integer index : aDimensionIndexValues.keySet()) {
              String value = aDimensionIndexValues.get(index);
              hit.setCustomDimension(index, value);
          }

          mTracker.send(hit.build());
    }

    public void trackEventWithCustomDimensionValues(
            String aCategory, String aAction, String aLabel,
            Integer aValue,    Map<Integer, String> aDimensionIndexValues) {

        HitBuilders.EventBuilder hit = new HitBuilders.EventBuilder()
            .setCategory(aCategory)
            .setAction(aAction);

        if (aLabel != null) {
            hit.setLabel(aLabel);
        }

        if (aValue != null) {
            hit.setValue(aValue.intValue());
        }

        for (Integer index : aDimensionIndexValues.keySet()) {
            String dimValue = aDimensionIndexValues.get(index);
            hit.setCustomDimension(index, dimValue);
        }

        mTracker.send(hit.build());
    }

    public void setAnonymizeIp(Boolean aEnabled) {
        mTracker.setAnonymizeIp(aEnabled);
    }

    public void setAppName(String aAppName) {
        mTracker.setAppName(aAppName);
    }

    public void setAppVersion(String aAppVersion) {
        mTracker.setAppVersion(aAppVersion);
    }

    private static Tracker createTracker(Context aContext, String aTrackerId) {
        GoogleAnalytics analytics = GoogleAnalytics.getInstance(aContext);
        analytics.setLocalDispatchPeriod(LOCAL_DISPATCH_PERIOD);

        Tracker tracker = analytics.newTracker(aTrackerId);
        tracker.enableExceptionReporting(true);

        return tracker;
    }
}
