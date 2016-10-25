package org.mozilla.magnet.database;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

public class SubscriptionRecord {
    public String channelName;
    public boolean notificationsEnabled;

    SubscriptionRecord(String channelName, boolean notificationsEnabled) {
        this.channelName = channelName;
        this.notificationsEnabled = notificationsEnabled;
    }

    WritableMap toWritableMap() {
        WritableMap result = Arguments.createMap();
        result.putString(SubscriptionsSQLTable.Schema.COLUMN_NAME_CHANNEL_NAME, channelName);
        result.putBoolean(SubscriptionsSQLTable.Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED, notificationsEnabled);
        return result;
    }
}
