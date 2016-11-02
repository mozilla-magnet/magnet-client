package org.mozilla.magnet.api;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

/**
 * Created by wilsonpage on 28/10/2016.
 */

public class Api {
    private HashMap<String,Api> routes = new HashMap<>();
    private RequestQueue mQueue;
    private Context mContext;

    public Api(Context context) {
        mContext = context;
    }

    protected void mount(String namespace, Api api) {
        routes.put(namespace, api);
    }

    /**
     * Right now this simply returns a key match,
     * but this should be advanced to match a defined
     * regex/string pattern (expressjs like).
     *
     * @param path
     * @return
     */
    private Api find(String path) {
        return routes.get(path);
    }

    /**
     * Perform a GET-like request on a mounted route.
     *
     * @param path
     * @param callback
     */
    public void get(String path, Callback callback) {
        Api match = find(path);

        if (match == null) {
            callback.reject("no matching route");
            return;
        }

        match.get(path, callback);
    }

    /**
     * Perform a POST-like request on a mounted route.
     *
     * @param path
     * @param callback
     */
    public void post(String path, HashMap<String,Object> data, Callback callback) {
        Api match = find(path);

        if (match == null) {
            callback.reject("no matching route");
        }

        match.post(path, data, callback);
    }

    /**
     * Perform a DELETE-like request on a mounted route.
     *
     * @param path
     * @param callback
     */
    public void delete(String path, HashMap<String,Object> data, Callback callback) {
        Api match = find(path);

        if (match == null) {
            callback.reject("no matching route");
        }

        match.delete(path, data, callback);
    }

    private RequestQueue getQueue() {
        if (mQueue != null) return mQueue;
        mQueue = Volley.newRequestQueue(mContext);
        return mQueue;
    }

    /**
     * Request a particular URL and parse the result as `JSONArray`.
     *
     * @param url
     * @param callback
     */
    protected void requestJsonArray(String url, final Callback callback) {
        request(Request.Method.GET, url, new Callback() {
            @Override
            public void resolve(Object result) {
                try {
                    callback.resolve(new JSONArray((String) result));
                } catch (JSONException err) {
                    callback.reject(err.getMessage());
                }
            }

            @Override
            public void reject(String error) {
                callback.reject(error);
            }
        });
    }

    /**
     * Request a particular URL and parse the result as `JSONObject`.
     *
     * @param url
     * @param callback
     */
    protected void requestJsonObject(String url, final Callback callback) {
        request(Request.Method.GET, url, new Callback() {
            @Override
            public void resolve(Object result) {
                try {
                    callback.resolve(new JSONObject((String) result));
                } catch (JSONException err) {
                    callback.reject(err.getMessage());
                }
            }

            @Override
            public void reject(String error) {
                callback.reject(error);
            }
        });
    }

    /**
     * Perform an HTTP request.
     *
     * @param url
     * @param callback
     */
    private void request(int method, String url, final Callback callback) {
        StringRequest request = new StringRequest(method, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                callback.resolve(response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                callback.reject(error.getMessage());
            }
        });

        getQueue().add(request);
    }

    /**
     * Get a reference to the generic key/value cache store.
     *
     * @return
     */
    protected Store getCache() {
        return Store.get(mContext);
    }

    /**
     * Check if the device has an internet connection.
     * @return
     *
     */
    protected boolean hasConnectivity() {
        ConnectivityManager cm = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    public interface Callback {
        void resolve(Object result);
        void reject(String error);
    }
}
