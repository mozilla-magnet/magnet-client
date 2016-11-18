package org.mozilla.magnet.api;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.util.Log;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by wilsonpage on 28/10/2016.
 */

public class Api {
    private static final String TAG = "Api";
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
    public void post(String path, Object data, Callback callback) {
        Api match = find(path);

        if (match == null) {
            callback.reject("no matching route");
            return;
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
            return;
        }

        match.delete(path, data, callback);
    }

    private RequestQueue getQueue() {
        if (mQueue != null) return mQueue;
        mQueue = Volley.newRequestQueue(mContext);
        return mQueue;
    }

    protected void requestJsonArray(String url, final Callback callback) {
        requestJsonArray(Request.Method.GET, url, null, callback);
    }

    protected void requestJsonArray(String url, String body, final Callback callback) {
        Log.d(TAG, "request json array: " + body);
        requestJsonArray(Request.Method.POST, url, body, callback);
    }

    /**
     * Request a particular URL and parse the result as `JSONArray`.
     *
     * @param url
     * @param callback
     */
    private void requestJsonArray(int method, String url, String body, final Callback callback) {
        request(method, url, body, new Callback() {
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
        requestJsonObject(Request.Method.GET, url, null, callback);
    }

    private void requestJsonObject(int method, String url, String body, final Callback callback) {
        request(method, url, body, new Callback() {
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
     * Perform an HTTP request.
     *
     * @param url
     * @param callback
     */
    private void request(int method, String url, final String body, final Callback callback) {
        getQueue().add(new StringRequest(method, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                callback.resolve(response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                callback.reject(error.toString());
            }
        }){
            @Override
            public byte[] getBody() throws AuthFailureError {
                if (body == null) { return null; }
                return body.getBytes();
            }

            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                HashMap<String, String> map = new HashMap<String, String>();
                map.put("Content-Type", "application/json; charset=UTF-8");
                return map;
            }
        });
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

    public final static Callback NoopCallback = new Callback() {
        @Override
        public void resolve(Object aResult) {}

        @Override
        public void reject(String aError) {}
    };
}
