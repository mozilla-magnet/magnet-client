package org.mozilla.magnet.database;

import android.provider.BaseColumns;

public class Schema {
    protected static final String DATABASE_NAME = "magnet.db";
    protected static final int DATABASE_VERSION = 2;

    // To prevent someone from accidentally instantiating the contract class,
    // give it an empty constructor.
    public Schema() {}

    /* Inner class that defines the table contents */
    public static abstract class HistoryEntry implements BaseColumns {
        public static final String TABLE_NAME = "history";
        public static final String COLUMN_NAME_URL = "url";
        public static final String COLUMN_NAME_TIME_FIRST_SEEN = "timefirstseen";
        public static final String COLUMN_NAME_TIME_LAST_SEEN = "timelastseen";
    }
}
