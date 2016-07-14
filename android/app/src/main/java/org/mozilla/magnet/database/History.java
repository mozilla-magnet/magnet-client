package org.mozilla.magnet.database;

import android.content.Context;
import android.util.Log;

import java.util.Date;
import java.util.concurrent.TimeUnit;

public class History {
    private static final String TAG = History.class.getName();
    private static final long RECENT_TIME_PERIOD = TimeUnit.HOURS.toMillis(1);
    private HistoryDatabase mDB;

    /**
     * Factory to create new `History` interface.
     *
     * @param context
     * @return History
     */
    public static History create(Context context) {
        return new History(new HistoryDatabaseSQL(context));
    }

    /**
     * Create a new `History` interface passing
     * a `HistoryDatabase` abstraction.
     *
     * @param db
     */
    public History(HistoryDatabase db) {
        mDB = db;
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
            mDB.updateLastSeen(recentRecord.id);
            return;
        }

        // insert new record
        mDB.insert(url);
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
        return mDB.getSince(url, date);
    }
}
