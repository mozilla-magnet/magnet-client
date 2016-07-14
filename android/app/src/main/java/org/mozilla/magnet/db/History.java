package org.mozilla.magnet.db;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import org.mozilla.magnet.db.Schema.HistoryEntry;

import java.util.Date;
import java.util.concurrent.TimeUnit;

import static android.provider.BaseColumns._ID;
import static org.mozilla.magnet.db.Schema.HistoryEntry.COLUMN_NAME_TIME_LAST_SEEN;
import static org.mozilla.magnet.db.Schema.HistoryEntry.COLUMN_NAME_URL;
import static org.mozilla.magnet.db.Schema.HistoryEntry.COLUMN_NAME_TIME_FIRST_SEEN;

public class History extends SQLiteOpenHelper {
    private static final String TAG = History.class.getName();
    private static final long RECENT_TIME_PERIOD = TimeUnit.HOURS.toMillis(1);

    /**
     * Create a new `History` interface.
     *
     * @param context
     */
    public History(Context context) {
        super(context, Schema.DATABASE_NAME, null, Schema.DATABASE_VERSION);
    }

    /**
     * Called once when the database is first created
     * and each time the database upgrades.
     *
     * @param db
     */
    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_CONTACTS_TABLE = "CREATE TABLE " + HistoryEntry.TABLE_NAME + "("
                + HistoryEntry._ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + COLUMN_NAME_URL + " TEXT,"
                + HistoryEntry.COLUMN_NAME_TIME_FIRST_SEEN + " INT,"
                + COLUMN_NAME_TIME_LAST_SEEN + " INT"
                + ")";

        db.execSQL(CREATE_CONTACTS_TABLE);
    }

    /**
     * Called when the database version is incremented
     * giving us the opportunity to migrate tables to
     * a new schema.
     *
     * Right now we're simply dropping the old table
     * and creating a new replacement.
     *
     * @param db
     * @param oldVersion
     * @param newVersion
     */
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + HistoryEntry.TABLE_NAME);
        onCreate(db);
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
            updateLastSeen(recentRecord.id);
            return;
        }

        SQLiteDatabase db = this.getWritableDatabase();
        long now = System.currentTimeMillis() / 1000;

        ContentValues values = new ContentValues();
        values.put(COLUMN_NAME_URL, url);
        values.put(HistoryEntry.COLUMN_NAME_TIME_FIRST_SEEN, now);
        values.put(COLUMN_NAME_TIME_LAST_SEEN, now);

        db.insert(HistoryEntry.TABLE_NAME, null, values);
        db.close();
    }

    /**
     * Update the last-seen column for a previously
     * recorded entry.
     *
     * @param id
     */
    private void updateLastSeen(int id) {
        Log.d(TAG, "update last seen: " + id);
        long now = System.currentTimeMillis() / 1000;
        ContentValues values = new ContentValues();
        values.put(COLUMN_NAME_TIME_LAST_SEEN, now);
        update(id, values);
    }

    /**
     * Update a row with the given values.
     *
     * @param id
     * @param values
     */
    private void update(int id, ContentValues values) {
        SQLiteDatabase db = this.getWritableDatabase();

        db.update(
                HistoryEntry.TABLE_NAME,
                values,
                HistoryEntry._ID + " = ?",
                new String[]{String.valueOf(id)});

        db.close();
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
        return getSince(url, date);
    }

    /**
     * Attempt to find a single row with the given url
     * that was last seen since the given date.
     *
     * @param url
     * @param date
     * @return HistoryRecord
     */
    private HistoryRecord getSince(String url, Date date) {
        String query = "SELECT * FROM " + HistoryEntry.TABLE_NAME
                + " WHERE " + COLUMN_NAME_TIME_LAST_SEEN + " > " + date.getTime() / 1000
                + " AND " + COLUMN_NAME_URL + " = '" + url + "'"
                + " LIMIT 1";

        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        // return null if nothing was found
        if (!cursor.moveToFirst()) {
            cursor.close();
            return null;
        }

        HistoryRecord result = toHistoryRecord(cursor);
        cursor.close();
        return result;
    }

    /**
     * Return a HistoryRecord from the given cursor.
     *
     * @param cursor
     * @return HistoryRecord
     */
    private HistoryRecord toHistoryRecord(Cursor cursor) {
        int id = cursor.getInt(cursor.getColumnIndex(_ID));
        String url = cursor.getString(cursor.getColumnIndex(COLUMN_NAME_URL));
        long firstSeen = cursor.getLong(cursor.getColumnIndex(COLUMN_NAME_TIME_FIRST_SEEN));
        long lastSeen = cursor.getLong(cursor.getColumnIndex(COLUMN_NAME_TIME_LAST_SEEN));
        return new HistoryRecord(id, url, firstSeen, lastSeen);
    }
}
