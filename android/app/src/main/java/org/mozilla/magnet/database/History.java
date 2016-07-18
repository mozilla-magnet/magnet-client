package org.mozilla.magnet.database;

import android.content.Context;
import android.util.Log;

import java.util.Date;
import java.util.concurrent.TimeUnit;

public class History {
    private static final String TAG = History.class.getName();
    private static final long RECENT_TIME_PERIOD = TimeUnit.HOURS.toMillis(1);
    private HistoryStore mStore;

    /**
     * Factory to get new `History` object.
     *
     * We use a factory here instead of calling the
     * constructor directly to allow us to pass
     * a mock `HistoryStore` object into the
     * constructor for testing.
     *
     * @param context
     * @return History
     */
    public static History get(Context context) {
        HistoryStore store = DatabaseSQL.get(context).getHistoryTable();
        return new History(store);
    }

    /**
     * Create a new `History` object passing
     * a `HistoryStore` abstraction.
     *
     * @param store
     */
    public History(HistoryStore store) {
        mStore = store;
    }

    /**
     * Record the detection of a URL in the history database.
     *
     * When a URL has been 'recently' seen prior, we update
     * the 'last-seen' value instead of creating a new entry.
     * This prevents us from filling the table with 1000s of
     * rows and allows us to easily discern: 'url x was in
     * range of the device for y minutes'.
     *
     * If the 'recent' time period between detections is
     * exceeded, a new database entry is made.
     *
     * @param url
     */
    public void record(String url) {
        Log.d(TAG, "add: " + url);
        HistoryRecord recentRecord = getRecent(url);

        // when a recent record has been found just
        // update it instead of creating another
        if (recentRecord != null) {
            Log.d(TAG, "found recent record");
            mStore.updateLastSeen(recentRecord.id);
            return;
        }

        // insert new record
        mStore.insert(url);
    }

    /**
     * Attempt to find a row of the given URL in
     * the 'recent' time period.
     *
     * @param url
     * @return HistoryRecord
     */
    private HistoryRecord getRecent(String url) {
        Date date = new Date(System.currentTimeMillis() - RECENT_TIME_PERIOD);
        return mStore.getSince(url, date);
    }
}
