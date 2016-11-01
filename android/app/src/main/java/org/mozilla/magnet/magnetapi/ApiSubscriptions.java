package org.mozilla.magnet.magnetapi;

import android.content.Context;

import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;

import java.util.HashMap;

/**
 * Created by wilsonpage on 01/11/2016.
 */

public class ApiSubscriptions extends Api {

    ApiSubscriptions(Context context) {
        super(context);
    }

    @Override
    public void get(String path, Callback callback) {
        callback.callback(null, getCache().getJsonObject("subscriptions"));
    }

    @Override
    public void post(String path, HashMap data, Callback callback) {
        JSONObject json = getCache().getJsonObject("subscriptions");

        if (json == null) {
            json = new JSONObject();
        }

        String channelId = (String) data.get("channel_id");
        JSONObject item = new JSONObject();

        try {
            item.put("channel_id", channelId);
            item.put("notifications_enabled", (Boolean) data.get("notifications_enabled"));
            json.put(channelId, item);
            getCache().set("subscriptions", json);
        } catch (JSONException err) {
            callback.callback(err.getMessage(), null);
            return;
        }

        callback.callback(null, item);
    }
}
