package org.mozilla.magnet.magnetapi;

import android.content.Context;
import android.util.Log;

import com.android.volley.Request;

import org.json.JSONArray;
import org.mozilla.magnet.api.Api;

/**
 * Created by wilsonpage on 28/10/2016.
 */

class ApiChannels extends Api {
    private static final String TAG = "ApiChannels";

    ApiChannels(Context context) {
        super(context);
    }

    @Override
    public void get(String path, final Callback callback) {
        Log.d(TAG, "get channels");

        // when not connected fetch from cache
        if (!hasConnectivity()) {
            Log.d(TAG, "no connectivity, using cache");
            callback.callback(null, getCache().getJsonArray("channels"));
            return;
        }

        requestJsonArray(
                "https://tengam.org/content/v1/channel",
                new Callback() {
                    @Override
                    public void callback(String error, Object result) {
                        if (error != null) {
                            callback.callback(null, getCache().getJsonArray("channels"));
                            return;
                        }

                        getCache().set("channels", (JSONArray) result);
                        callback.callback(null, result);
                    }
                });
    }
}
