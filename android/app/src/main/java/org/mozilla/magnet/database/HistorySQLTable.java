package org.mozilla.magnet.database;


import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.BaseColumns;
import android.util.Log;

import java.util.Date;

/**
 * Interface for the 'history' table
 */
public class HistorySQLTable implements HistoryStore, DatabaseSQL.Table {
    private final String TAG = History.class.getName();
    private DatabaseSQL mDB;

    /**
     * Create a new `History` object.
     *
     * @param db
     */
    public HistorySQLTable(DatabaseSQL db) {
        mDB = db;
    }

    /**
     * Called by `DatabaseSQL` allowing
     * @param db
     */
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + Schema.TABLE_NAME + "("
                + Schema._ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + Schema.COLUMN_NAME_URL + " TEXT,"
                + Schema.COLUMN_NAME_TIME_FIRST_SEEN + " INT,"
                + Schema.COLUMN_NAME_TIME_LAST_SEEN + " INT"
                + ")");
    }

    /**
     * Called by `DatabaseSQL` when the database version is
     * incremented giving us the opportunity to migrate data
     * to a new schema.
     *
     * Right now we're simply dropping the old table
     * and creating a new replacement.
     *
     * @param db
     * @param oldVersion
     * @param newVersion
     */
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + Schema.TABLE_NAME);
        onCreate(db);
    }

    /**
     * Insert a new record.
     *
     * @param url
     */
    public void insert(String url) {
        SQLiteDatabase db = mDB.getWritableDatabase();
        long now = System.currentTimeMillis() / 1000;

        ContentValues values = new ContentValues();
        values.put(Schema.COLUMN_NAME_URL, url);
        values.put(Schema.COLUMN_NAME_TIME_FIRST_SEEN, now);
        values.put(Schema.COLUMN_NAME_TIME_LAST_SEEN, now);

        db.insert(Schema.TABLE_NAME, null, values);
    }

    /**
     * Update the last-seen column for a previously
     * recorded entry.
     *
     * @param id
     */
    public void updateLastSeen(int id) {
        Log.d(TAG, "update last seen: " + id);
        long now = System.currentTimeMillis() / 1000;
        ContentValues values = new ContentValues();
        values.put(Schema.COLUMN_NAME_TIME_LAST_SEEN, now);
        update(id, values);
    }

    /**
     * Update a row with the given values.
     *
     * @param id
     * @param values
     */
    private void update(int id, ContentValues values) {
        SQLiteDatabase db = mDB.getWritableDatabase();

        db.update(
                Schema.TABLE_NAME,
                values,
                Schema._ID + " = ?",
                new String[]{String.valueOf(id)});
    }

    /**
     * Attempt to find a single row with the given url
     * that was last seen since the given date.
     *
     * @param url
     * @param date
     * @return HistoryRecord
     */
    public HistoryRecord getSince(String url, Date date) {
        String query = "SELECT * FROM " + Schema.TABLE_NAME
                + " WHERE " + Schema.COLUMN_NAME_TIME_LAST_SEEN + " > " + date.getTime() / 1000
                + " AND " + Schema.COLUMN_NAME_URL + " = '" + url + "'"
                + " LIMIT 1";

        SQLiteDatabase db = mDB.getReadableDatabase();
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
        int id = cursor.getInt(cursor.getColumnIndex(Schema._ID));
        String url = cursor.getString(cursor.getColumnIndex(Schema.COLUMN_NAME_URL));
        long firstSeen = cursor.getLong(cursor.getColumnIndex(Schema.COLUMN_NAME_TIME_FIRST_SEEN));
        long lastSeen = cursor.getLong(cursor.getColumnIndex(Schema.COLUMN_NAME_TIME_LAST_SEEN));
        return new HistoryRecord(id, url, firstSeen, lastSeen);
    }

    /**
     * Table contents
     */
    private static abstract class Schema implements BaseColumns {
        public static final String TABLE_NAME = "history";
        public static final String COLUMN_NAME_URL = "url";
        public static final String COLUMN_NAME_TIME_FIRST_SEEN = "timefirstseen";
        public static final String COLUMN_NAME_TIME_LAST_SEEN = "timelastseen";
    }
}
