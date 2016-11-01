package org.mozilla.magnet.api;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by wilsonpage on 28/10/2016.
 */

public class Store extends SQLiteOpenHelper {
    private static final String TAG = "APIStore";
    private static final String DATABASE_NAME = "apistore.db";
    private static final int DATABASE_VERSION = 1;
    private static Store mStoreSingleton;

    /**
     * Factory to get `DatabaseSQL` object.
     *
     * It's designed to ensure only one instance
     * is ever created across and app context.
     *
     * @param context
     * @return
     */
    public static synchronized Store get(Context context) {
        if (mStoreSingleton == null) { mStoreSingleton = new Store(context); }
        return mStoreSingleton;
    }

    /**
     * Create a new `Store`.
     *
     * @param context
     */
    private Store(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    /**
     * Called by `DatabaseSQL` allowing
     * @param db
     */
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE " + Schema.TABLE_NAME + "("
                + Schema.COLUMN_NAME_KEY + " TEXT PRIMARY KEY,"
                + Schema.COLUMN_NAME_VALUE + " TEXT"
                + ")");
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
        db.execSQL("DROP TABLE IF EXISTS " + Schema.TABLE_NAME);
        onCreate(db);
    }

    public JSONObject getJsonObject(String key) {
        String result = get(key);
        if (result == null) return null;

        try {
            return new JSONObject(result);
        } catch (JSONException error) {
            return null;
        }
    }

    public JSONArray getJsonArray(String key) {
        String result = get(key);
        if (result == null) return null;

        try {
            return new JSONArray(result);
        } catch (JSONException error) {
            return null;
        }
    }

    public String get(String key) {
        String query = "SELECT * FROM " + Schema.TABLE_NAME
                + " WHERE " + Schema.COLUMN_NAME_KEY + " = '" + key + "'"
                + " LIMIT 1";

        SQLiteDatabase db = getReadableDatabase();
        Cursor cursor = db.rawQuery(query, null);

        if (cursor.getCount() < 1) return null;

        try {
            cursor.moveToFirst();
            return cursor.getString(cursor.getColumnIndex(Schema.COLUMN_NAME_VALUE));
        } finally {
            cursor.close();
        }
    }

    public boolean set(String key, JSONObject value) {
        return set(key, value.toString());
    }

    public boolean set(String key, JSONArray value) {
        return set(key, value.toString());
    }

    private boolean set(String key, String value) {
        Log.d(TAG, "set: " + key);
        SQLiteDatabase db = getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(Schema.COLUMN_NAME_KEY, key);
        values.put(Schema.COLUMN_NAME_VALUE, value);
        db.insert(Schema.TABLE_NAME, null, values);
        return true;
    }

    /**
     * Table contents
     */
    private static abstract class Schema {
        static final String TABLE_NAME = "key_value";
        static final String COLUMN_NAME_KEY = "key";
        static final String COLUMN_NAME_VALUE = "value";
    }
}
