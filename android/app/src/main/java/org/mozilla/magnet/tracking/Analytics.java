package org.mozilla.magnet.tracking;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.analytics.GoogleAnalytics;
import com.google.android.gms.analytics.HitBuilders;
import com.google.android.gms.analytics.Tracker;
import com.google.android.gms.analytics.ecommerce.Product;
import com.google.android.gms.analytics.ecommerce.ProductAction;

import org.mozilla.magnet.api.Api.Callback;
import org.mozilla.magnet.BuildConfig;
import org.mozilla.magnet.magnetapi.ApiPreferences;

import org.json.JSONObject;

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

    private final ApiPreferences mPreferences;

    public Analytics(Context aContext) {
        mTracker = createTracker(aContext, BuildConfig.GA_TRACKER_ID);
        mPreferences = new ApiPreferences(aContext);
    }

    public void trackScreenView(final String aScreenName) {
        doTrack(new Callback() {
            @Override
            public void resolve(Object aUnused) {
              Analytics.this.doTrackScreenView(aScreenName);
            }

            @Override
            public void reject(String aError) {
                Log.e(TAG, aError);
            }
        });
    }

    public void trackEvent(
        final String aCategory, final String aAction, final String aLabel, final Long aValue) {

        doTrack(new Callback() {
            @Override
            public void resolve(Object aUnused) {
              Analytics.this.doTrackEvent(aCategory, aAction, aLabel, aValue);
            }

            @Override
            public void reject(String aError) {
                Log.e(TAG, aError);
            }
        });
    }

    public void trackTiming(final String aCategory, final Double aValue,
        final String aName, final String aLabel) {

        doTrack(new Callback() {
            @Override
            public void resolve(Object aUnused) {
              Analytics.this.doTrackTiming(aCategory, aValue, aName, aLabel);
            }

            @Override
            public void reject(String aError) {
                Log.e(TAG, aError);
            }
        });
    }

    private void doTrackScreenView(String aScreenName) {
        mTracker.setScreenName(aScreenName);
        mTracker.send(new HitBuilders.ScreenViewBuilder().build());
    }

    private void doTrackEvent(
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

    private void doTrackTiming(String aCategory, Double aValue,
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

    private static Tracker createTracker(Context aContext, String aTrackerId) {
        GoogleAnalytics analytics = GoogleAnalytics.getInstance(aContext);
        analytics.setLocalDispatchPeriod(LOCAL_DISPATCH_PERIOD);

        Tracker tracker = analytics.newTracker(aTrackerId);
        tracker.enableExceptionReporting(true);

        return tracker;
    }

    private void doTrack(final Callback aTrack) {
        mPreferences.get("", new Callback() {
            @Override
            public void resolve(Object aPrefData) {
                if (!(aPrefData instanceof JSONObject)) {
                    this.reject("Expected JSONObject from preferences API");
                    return;
                }

                JSONObject prefData = (JSONObject)aPrefData;

                boolean enableTelemetry = prefData.optBoolean("enableTelemetry");

                if (enableTelemetry) {
                    aTrack.resolve(enableTelemetry);
                }
            }

            @Override
            public void reject(String aError) {
                Log.d(TAG, "pref API call failed " + aError);
                aTrack.reject(aError);
            }
        });
    }
}
