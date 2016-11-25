package org.mozilla.magnet.magnetapi;

import android.content.Context;

import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;
import org.mozilla.magnet.BuildConfig;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;
import java.util.Map;
import java.util.HashMap;

class ApiPreferences extends Api {

    private static final String PREFERENCES_STORE_KEY = "preferences";
    private static final String PREFERENCES_KEY = "pref_key";

    private final Lock mWriteLock = new ReentrantLock();

    ApiPreferences(Context aContext) {
        super(aContext);

        initializeDefaults();
    }

    private void initializeDefaults() {
        for (String[] defaultRecord : BuildConfig.DEFAULT_PREFS) {
            Map<String, String> defaultPref = new HashMap<String, String>();
            defaultPref.put(PREFERENCES_KEY, defaultRecord[0]);
            defaultPref.put("value", defaultRecord[1]);

            this.post("", defaultPref, new Callback() {
                @Override
                public void resolve(Object aResult) {
                    // Noop
                }

                @Override
                public void reject(String aError) {
                    // Noop
                }
            });
        }
    }

    /**
     * Get user's preferences.
     *
     */
    @Override
    public void get(String aPath, Callback aCallback) {
        JSONObject json = getCache().getJsonObject(PREFERENCES_STORE_KEY);

        if (json == null) {
          json = new JSONObject();
        }

        aCallback.resolve(json);
    }

    /**
     * Update or set a preference given a Map with structure:
     * `{ "pref_key": "string", "value": "string" }`
     */
    @Override
    public void post(String aPath, Object aData, Callback aCallback) {
        if (!(aData instanceof Map)) {
            aCallback.reject("Data must be a Map type");
            return;
        }

        Map data = (Map) aData;

        // Lock everything between getting the JSON object from the cache and
        // writing it back - a synchronize on the method isn't enough as the
        // resource is used in the delete method too.
        mWriteLock.lock();

        JSONObject json = getCache().getJsonObject(PREFERENCES_STORE_KEY);

        if (json == null) {
          json = new JSONObject();
        }

        String prefKey = (String) data.get(PREFERENCES_KEY);
        Object value = data.get("value");

        try {
          json.put(prefKey, value);
          getCache().set(PREFERENCES_STORE_KEY, json);
        } catch (JSONException err) {
          aCallback.reject(err.getMessage());
          return;
        } finally {

          // In a finally block so that the lock is released no matter what
          // type of error is thrown (the catch block is for `JSONException`s)
          mWriteLock.unlock();
        }

        aCallback.resolve(true);
    }

    /**
     * Remove a preference key given a map of structure
     * `{ "pref_key": "string" }`
     */
    @Override
    public void delete(String aPath, HashMap aData, Callback aCallback) {

      String prefKey = (String) aData.get(PREFERENCES_KEY);

      if (prefKey == null) {
        aCallback.reject("`" + PREFERENCES_KEY + "` required");
        return;
      }

      // Lock everything between getting from the cache and setting the cache.
      mWriteLock.lock();

      JSONObject json = getCache().getJsonObject(PREFERENCES_STORE_KEY);

      if (json == null) {
        json = new JSONObject();
      } else {
        json.remove(prefKey);
      }

      getCache().set(PREFERENCES_STORE_KEY, json);

      mWriteLock.unlock();
      aCallback.resolve(true);
    }
}
