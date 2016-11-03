package org.mozilla.magnet.magnetapi;

import android.content.Context;

import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;

import java.util.HashMap;

/**
 * Created by wilsonpage on 01/11/2016.
 */

class ApiSubscriptions extends Api {

    ApiSubscriptions(Context context) {
        super(context);
    }

    /**
     * Get user's subscriptions.
     *
     * Right now these are only store locally, one
     * day they should be persisted to the magnet-service,
     * but this will require some form of user login.
     *
     * @param path
     * @param callback
     */
    @Override
    public void get(String path, Callback callback) {
        callback.resolve(getCache().getJsonObject("subscriptions"));
    }

    @Override
    public void post(String path, Object data, Callback callback) {
        JSONObject json = getCache().getJsonObject("subscriptions");

        if (json == null) {
            json = new JSONObject();
        }

        HashMap hash = (HashMap) data;
        String channelId = (String) hash.get("channel_id");
        JSONObject item = new JSONObject();

        try {
            item.put("channel_id", channelId);
            item.put("notifications_enabled", (boolean) hash.get("notifications_enabled"));
            json.put(channelId, item);
            getCache().set("subscriptions", json);
        } catch (JSONException err) {
            callback.reject(err.getMessage());
            return;
        }

        callback.resolve(item);
    }

    @Override
    public void delete(String path, HashMap data, Callback callback) {
        JSONObject json = getCache().getJsonObject("subscriptions");
        String channelId = (String) data.get("channel_id");

        if (channelId == null) {
            callback.reject("`channel_id` required");
            return;
        }

        if (json == null) {
            json = new JSONObject();
        }

        json.remove(channelId);
        getCache().set("subscriptions", json);
        callback.resolve(true);
    }
}
