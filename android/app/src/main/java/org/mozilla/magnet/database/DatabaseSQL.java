package org.mozilla.magnet.database;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

/**
 * Represents the entire application database.
 * All tables should be accessed through this class.
 */
public class DatabaseSQL extends SQLiteOpenHelper {
    private static final String TAG = "DatabaseSQL";
    private static final String DATABASE_NAME = "magnet.db";
    private static final int DATABASE_VERSION = 3;
    private SubscriptionsSQLTable mSubscriptionsSQLTable;
    private HistorySQLTable mHistorySQLTable;
    private static DatabaseSQL mDB;

    /**
     * Factory to get `DatabaseSQL` object.
     *
     * It's designed to ensure only one instance
     * is ever created across and app context.
     *
     * @param context
     * @return
     */
    public static synchronized DatabaseSQL get(Context context) {
        if (mDB == null) { mDB = new DatabaseSQL(context); }
        return mDB;
    }

    /**
     * Create a new `History` object.
     *
     * @param context
     */
    public DatabaseSQL(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
        mSubscriptionsSQLTable = new SubscriptionsSQLTable(this);
        mHistorySQLTable = new HistorySQLTable(this);
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
        Log.d(TAG, "on create");
        mSubscriptionsSQLTable.onCreate(db);
        mHistorySQLTable.onCreate(db);
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
        Log.d(TAG, "on upgrade");
        mSubscriptionsSQLTable.onUpgrade(db, oldVersion, newVersion);
        mHistorySQLTable.onUpgrade(db, oldVersion, newVersion);
    }

    /**
     * Get the history table interface from the database.
     *
     * @return HistoryStore
     */
    public HistoryStore getHistoryTable() {
        return mHistorySQLTable;
    }

    /**
     * Get the history table interface from the database.
     *
     * @return HistoryStore
     */
    public SubscriptionsStore getSubscriptionsTable() {
        return mSubscriptionsSQLTable;
    }

    public static interface Table {
        public void onCreate(SQLiteDatabase db);
        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion);
    }
}
