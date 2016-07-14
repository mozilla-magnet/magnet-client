package org.mozilla.magnet.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import org.mozilla.magnet.database.Schema.HistoryEntry;

import java.util.Date;

import static android.provider.BaseColumns._ID;
import static org.mozilla.magnet.database.Schema.HistoryEntry.COLUMN_NAME_TIME_LAST_SEEN;
import static org.mozilla.magnet.database.Schema.HistoryEntry.COLUMN_NAME_URL;
import static org.mozilla.magnet.database.Schema.HistoryEntry.COLUMN_NAME_TIME_FIRST_SEEN;

public class HistoryDatabaseSQL extends SQLiteOpenHelper implements HistoryDatabase {
    private static final String TAG = History.class.getName();

    /**
     * Create a new `History` interface.
     *
     * @param context
     */
    public HistoryDatabaseSQL(Context context) {
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
     * Insert a new record.
     *
     * @param url
     */
    public void insert(String url) {
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
    public void updateLastSeen(int id) {
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
     * Attempt to find a single row with the given url
     * that was last seen since the given date.
     *
     * @param url
     * @param date
     * @return HistoryRecord
     */
    public HistoryRecord getSince(String url, Date date) {
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
