package org.mozilla.magnet.database;

import android.content.ContentValues;

import java.util.ArrayList;
import java.util.HashMap;

interface SubscriptionsStore {
    boolean add(String channelName);
    boolean remove (String channelName);
    boolean update(String channelName, HashMap updates);
    ArrayList<SubscriptionRecord> get();
}
