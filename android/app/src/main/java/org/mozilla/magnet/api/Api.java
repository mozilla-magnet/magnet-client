package org.mozilla.magnet.api;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.telecom.Call;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by wilsonpage on 28/10/2016.
 */

public abstract class Api {
    private HashMap<String,Api> routes = new HashMap<>();
    private RequestQueue mQueue;
    private Context mContext;

    public Api(Context context) {
        mContext = context;
    }

    protected void mount(String namespace, Api api) {
        routes.put(namespace, api);
    }

    private Api find(String path) {
        for (Map.Entry<String, Api> entry : routes.entrySet()) {
            String namespace = entry.getKey();
            Api api = entry.getValue();
            if (path.startsWith(namespace)) return api;
        }

        return null;
    }

    public void get(String path, Callback callback) {
        Api match = find(path);

        if (match == null) {
            callback.callback("no matching route", null);
            return;
        }

        match.get(path, callback);
    }

    protected Store getCache() {
        return Store.get(mContext);
    }

    public void post(String path, HashMap<String,Object> data, Callback callback) {
        Api match = find(path);
        if (match != null) match.post(path, data, callback);
    }

//    public void put(String path) {
//        Api match = find(path);
//        if (match != null) match.get(path);
//    }

    public void delete(String path, HashMap<String,Object> data, Callback callback) {
        Api match = find(path);
        if (match != null) match.delete(path, data, callback);
    }

    private RequestQueue getQueue() {
        if (mQueue != null) return mQueue;
        mQueue = Volley.newRequestQueue(mContext);
        return mQueue;
    }

    protected void requestJsonArray(String url, final Callback callback) {
        request(Request.Method.GET, url, null, new Callback() {
            @Override
            public void callback(String error, Object result) {
                if (error != null) {
                    callback.callback(error, null);
                    return;
                }

                try {
                    callback.callback(null, new JSONArray((String) result));
                } catch (JSONException err) {
                    callback.callback(err.getMessage(), null);
                }

            }
        });
    }

    protected void requestJsonObject(String url, final Callback callback) {
        request(Request.Method.GET, url, null, new Callback() {
            @Override
            public void callback(String error, Object result) {
                if (error != null) {
                    callback.callback(error, null);
                    return;
                }

                try {
                    callback.callback(null, new JSONObject((String) result));
                } catch (JSONException err) {
                    callback.callback(err.getMessage(), null);
                }

            }
        });
    }

    private void request(int method, String url, HashMap data, final Callback callback) {
        StringRequest request = new StringRequest(method, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String response) {
                callback.callback(null, response);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError error) {
                callback.callback(error.getMessage(), null);
            }
        });

        getQueue().add(request);
    }

    protected boolean hasConnectivity() {
        ConnectivityManager cm = (ConnectivityManager) mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
    }

    public interface Callback {
        void callback(String error, Object result);
    }
}
