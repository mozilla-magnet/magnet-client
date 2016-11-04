package org.mozilla.magnet.magnetapi;

import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by wilsonpage on 02/11/2016.
 */

class ApiMetadata extends Api {
    private static final String TAG = "ApiMetadata";
    private static final String SERVICE_URL = "https://tengam.org/api/v1/metadata";

    ApiMetadata(Context context) {
        super(context);
    }

    @Override
    public void post(String path, Object data, final Api.Callback callback) {
        Log.d(TAG, "get metadata");
        List<String> urls = (List) data;
        JSONObject body = toJson(urls);
        requestJsonArray(SERVICE_URL, body.toString(), callback);
    }

    private JSONObject toJson(List<String> urls) {
        JSONObject result = new JSONObject();
        JSONArray objects = new JSONArray();

        try {
            for (String url : urls) {
                objects.put(new JSONObject().put("url", url));
            }

            result.put("objects", objects);
        } catch(JSONException error) {
            Log.e(TAG, error.getMessage());
        }

        return result;
    }
}
