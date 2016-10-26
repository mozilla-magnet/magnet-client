package org.mozilla.magnet.database;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.provider.BaseColumns;

import java.util.ArrayList;
import java.util.HashMap;

public class SubscriptionsSQLTable implements SubscriptionsStore, DatabaseSQL.Table {
    private final String TAG = History.class.getName();
    private DatabaseSQL mDB;

    /**
     * Create a new `Subscription` object.
     *
     * @param db
     */
    public SubscriptionsSQLTable(DatabaseSQL db) {
        mDB = db;
    }

    /**
     * Called by `DatabaseSQL`.
     * @param db
     */
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + Schema.TABLE_NAME + "("
                    + Schema.COLUMN_NAME_CHANNEL_NAME + " TEXT PRIMARY KEY,"
                    + Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED + " INT"
                + ")");
    }

    /**
     * Called by `DatabaseSQL` when the database version is
     * incremented giving us the opportunity to migrate data
     * to a new schema.
     *
     * @param db
     * @param oldVersion
     * @param newVersion
     */
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // no migrations yet
    }

    /**
     * Insert a new record.
     *
     * @param channelName
     */
    public boolean add(String channelName) {
        if (exists(channelName)) { return false; }

        SQLiteDatabase db = mDB.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(Schema.COLUMN_NAME_CHANNEL_NAME, channelName);
        values.put(Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED, 1);

        db.insert(Schema.TABLE_NAME, null, values);
        return true;
    }

    public boolean remove(String channelName) {
        SQLiteDatabase db = mDB.getWritableDatabase();
        return db.delete(
                Schema.TABLE_NAME,
                Schema.COLUMN_NAME_CHANNEL_NAME + " = ?",
                new String[]{ channelName }) > 0;
    }

    private boolean exists(String channelName) {
        String query = "SELECT * FROM " + Schema.TABLE_NAME
                + " WHERE " + Schema.COLUMN_NAME_CHANNEL_NAME + " = '" + channelName + "'"
                + " LIMIT 1";

        SQLiteDatabase db = mDB.getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        boolean result = cursor.getCount() > 0;
        cursor.close();

        return result;
    }

    /**
     * Update a row with the given values.
     *
     * @param channelName
     * @param model
     */
    public boolean update(String channelName, HashMap model) {
        SQLiteDatabase db = mDB.getWritableDatabase();
        ContentValues values = new ContentValues();

        // add known keys
        if (model.containsKey(Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED)) {
            boolean valueBoolean = (boolean) model.get(Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED);
            int value = valueBoolean ? 1 : 0;
            values.put(Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED, value);
        }

        int result = db.update(
                Schema.TABLE_NAME,
                values,
                Schema.COLUMN_NAME_CHANNEL_NAME + " = ?",
                new String[]{ channelName });

        return result > 0;
    }

    /**
     * Get all the user's subscriptions.
     * @return list of subscriptions
     */
    public ArrayList<SubscriptionRecord> get() {
        ArrayList<SubscriptionRecord> result = new ArrayList<>();
        String query = "SELECT * FROM " + Schema.TABLE_NAME;
        SQLiteDatabase db = mDB.getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        while (cursor.moveToNext()) {
            result.add(toRecord(cursor));
        }

        cursor.close();
        return result;
    }

    /**
     * Return a HistoryRecord from the given cursor.
     *
     * @param cursor
     * @return HistoryRecord
     */
    private SubscriptionRecord toRecord(Cursor cursor) {
        String channelName = cursor.getString(cursor.getColumnIndex(Schema.COLUMN_NAME_CHANNEL_NAME));
        int notificationsEnabledInt = cursor.getInt(cursor.getColumnIndex(Schema.COLUMN_NAME_NOTIFICATIONS_ENABLED));
        boolean notificationsEnabled = notificationsEnabledInt != 0;
        return new SubscriptionRecord(channelName, notificationsEnabled);
    }

    /**
     * Table contents
     */
    public static abstract class Schema {
        static final String TABLE_NAME = "subscriptions";
        static final String COLUMN_NAME_CHANNEL_NAME = "channel_name";
        static final String COLUMN_NAME_NOTIFICATIONS_ENABLED = "notifications_enabled";
    }
}
