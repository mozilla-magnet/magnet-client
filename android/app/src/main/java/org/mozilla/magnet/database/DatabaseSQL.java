package org.mozilla.magnet.database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.provider.BaseColumns;
import android.util.Log;

import java.util.Date;

/**
 * Represents the entire application database.
 */
public class DatabaseSQL extends SQLiteOpenHelper {
    private static final String TAG = HistoryTable.class.getName();
    private static final String DATABASE_NAME = "magnet.db";
    private static final int DATABASE_VERSION = 2;
    private static SQLiteDatabase mReadableDB;
    private static SQLiteDatabase mWritableDB;
    private static DatabaseSQL mDB;

    public static synchronized DatabaseSQL get(Context context) {
        if (mDB == null) { mDB = new DatabaseSQL(context); }
        return mDB;
    }

    public static synchronized SQLiteDatabase getWritable(Context context) {
        if (mWritableDB == null) { mWritableDB = DatabaseSQL.get(context).getWritableDatabase(); }
        return mWritableDB;
    }

    public static synchronized SQLiteDatabase getReadable(Context context) {
        if (mReadableDB == null) { mReadableDB = DatabaseSQL.get(context).getReadableDatabase(); }
        return mReadableDB;
    }

    /**
     * Create a new `History` object.
     *
     * @param context
     */
    public DatabaseSQL(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    /**
     * Called once when the database is first created.
     *
     * Creates all the tables in the database.
     *
     * @param db
     */
    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_CONTACTS_TABLE = "CREATE TABLE " + HistoryTable.Schema.TABLE_NAME + "("
                + HistoryTable.Schema._ID + " INTEGER PRIMARY KEY AUTOINCREMENT,"
                + HistoryTable.Schema.COLUMN_NAME_URL + " TEXT,"
                + HistoryTable.Schema.COLUMN_NAME_TIME_FIRST_SEEN + " INT,"
                + HistoryTable.Schema.COLUMN_NAME_TIME_LAST_SEEN + " INT"
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
        db.execSQL("DROP TABLE IF EXISTS " + HistoryTable.Schema.TABLE_NAME);
        onCreate(db);
    }

    /**
     * Interface for the 'history' table
     */
    public static class HistoryTable implements HistoryDatabase {
        private final String TAG = HistoryTable.class.getName();
        private Context mContext;

        /**
         * Table contents
         */
        public static abstract class Schema implements BaseColumns {
            public static final String TABLE_NAME = "history";
            public static final String COLUMN_NAME_URL = "url";
            public static final String COLUMN_NAME_TIME_FIRST_SEEN = "timefirstseen";
            public static final String COLUMN_NAME_TIME_LAST_SEEN = "timelastseen";
        }

        /**
         * Create a new `History` object.
         *
         * @param context
         */
        public HistoryTable(Context context) {
            mContext = context;
        }

        /**
         * Insert a new record.
         *
         * @param url
         */
        public void insert(String url) {
            SQLiteDatabase db = DatabaseSQL.getWritable(mContext);
            long now = System.currentTimeMillis() / 1000;

            ContentValues values = new ContentValues();
            values.put(Schema.COLUMN_NAME_URL, url);
            values.put(Schema.COLUMN_NAME_TIME_FIRST_SEEN, now);
            values.put(Schema.COLUMN_NAME_TIME_LAST_SEEN, now);

            db.insert(HistoryTable.Schema.TABLE_NAME, null, values);
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
            SQLiteDatabase db = DatabaseSQL.getWritable(mContext);

            db.update(
                    HistoryTable.Schema.TABLE_NAME,
                    values,
                    HistoryTable.Schema._ID + " = ?",
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

            SQLiteDatabase db = DatabaseSQL.getReadable(mContext);
            Cursor cursor = db.rawQuery(query, null);

            // return null if nothing was found
            if (!cursor.moveToFirst()) {
                return null;
            }

            return toHistoryRecord(cursor);
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
    }
}
