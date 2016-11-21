package org.mozilla.magnet.magnetapi;

import android.content.Context;
import android.util.Log;

import org.json.JSONException;
import org.json.JSONObject;

import org.mozilla.magnet.BuildConfig;
import org.mozilla.magnet.api.Api;
import org.mozilla.magnet.tracking.*;

import java.util.Map;

public class ApiAnalytics extends Api {
    private static final String TAG = "ApiAnalytics";
    private final Context mContext;

    private final Api mApiPreferences;
    private final Analytics mGa;

    ApiAnalytics(Context aContext) {
        super(aContext);
        mContext = aContext;
        mGa = new Analytics(aContext, BuildConfig.GA_TRACKER_ID);
        mApiPreferences = new ApiPreferences(aContext);
    }

    @Override
    public void post(String aPath, final Object aData, final Callback aCallback) {
        mApiPreferences.get("", new Callback() {
            @Override
            public void resolve(Object aPrefData) {
                if (!(aPrefData instanceof JSONObject)) {
                    aCallback.reject("expected JSONObject from preferences API");
                    return;
                }

                JSONObject prefData = (JSONObject)aPrefData;
                boolean enableTelemetry = prefData.optBoolean("enableTelemetry");

                if (enableTelemetry) {

                    // Given the data, translate it to a 'CallableTracker'
                    // instance. Will throw if the data can not be converted
                    // into a tracker object.
                    asCallableTracker(aData).call(mGa);
                }

                aCallback.resolve(true);
            }

            @Override
            public void reject(String aError) {
                Log.d(TAG, "pref API call failed" + aError);
                aCallback.reject(aError);
            }
        });
    }

    public static TrackEvent createEvent(String aCategory, String aAction) {
      return new TrackEvent(aCategory, aAction);
    }

    public static CallableTracker asCallableTracker(Object aObject) {
        if (aObject instanceof CallableTracker) {
            return (CallableTracker)aObject;
        }

        if (!(aObject instanceof Map)) {
            throw new IllegalArgumentException("API request must be a 'Map' or instance of 'CallableTracker'");
        }

        Map<String, Object> data = (Map<String, Object>)aObject;

        String trackingType = (String)data.get("type");

        if (trackingType == null) {
            throw new IllegalArgumentException("Unspecified 'type' paramter");
        }

        switch(trackingType) {
            case "event":
                return TrackEvent.fromMap(data);
            case "timing":
                return TrackTiming.fromMap(data);
            case "screenview":
                return TrackScreenView.fromMap(data);
            default:
                throw new IllegalArgumentException("Unknown 'type' " + trackingType);
        }
    }
}
