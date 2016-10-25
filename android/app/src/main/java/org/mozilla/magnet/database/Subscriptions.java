package org.mozilla.magnet.database;

import android.content.ContentValues;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Promise;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.TimeUnit;

public class Subscriptions {
    private static final String TAG = Subscriptions.class.getName();
    private static Subscriptions mSubscriptions;
    private SubscriptionsStore mStore;

    /**
     * Factory to get new `Subscriptions` object.
     *
     * We use a factory here instead of calling the
     * constructor directly to allow us to pass
     * a mock `SubscriptionsStore` object into the
     * constructor for testing.
     *
     * @param context
     * @return History
     */
    public static Subscriptions get(Context context) {
        if (mSubscriptions != null) { return mSubscriptions; }
        SubscriptionsStore store = DatabaseSQL.get(context).getSubscriptionsTable();
        mSubscriptions = new Subscriptions(store);
        return mSubscriptions;
    }

    /**
     * Create a new `Subscriptions` object passing
     * a `SubscriptionsStore` abstraction.
     *
     * @param store
     */
    private Subscriptions(SubscriptionsStore store) {
        mStore = store;
    }

    public boolean add(String channelName) {
        return mStore.add(channelName);
    }

    public boolean remove(String channelName) {
        return mStore.remove(channelName);
    }

    public ArrayList<SubscriptionRecord> get() {
        return mStore.get();
    }

    public boolean update(String channelName, HashMap model) {
        return mStore.update(channelName, model);
    }
}
