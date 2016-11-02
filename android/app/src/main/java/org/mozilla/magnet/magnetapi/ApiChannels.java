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
            callback.resolve(getCache().getJsonArray("channels"));
            return;
        }

        requestJsonArray("https://tengam.org/content/v1/channel", new Callback() {
            @Override
            public void resolve(Object result) {
                getCache().set("channels", (JSONArray) result);
                callback.resolve(result);
            }

            @Override
            public void reject(String error) {
                callback.reject(error);
            }
        });
    }
}
