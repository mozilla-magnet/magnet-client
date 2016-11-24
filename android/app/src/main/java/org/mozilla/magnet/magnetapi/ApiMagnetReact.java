package org.mozilla.magnet.magnetapi;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;

import org.json.JSONArray;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;
import org.mozilla.magnet.api.Utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ApiMagnetReact extends ReactContextBaseJavaModule {
    private static final String TAG = "APIMagnetReact";
    private ApiMagnet mApiMagnet;

    public ApiMagnetReact(ReactApplicationContext context) {
        super(context);
        mApiMagnet = new ApiMagnet(context);
    }

    @Override
    public String getName() {
        return "ApiMagnetReact";
    }

    @ReactMethod
    public void get(String path, final Promise promise) {
        mApiMagnet.get(path, new Api.Callback() {
            @Override
            public void resolve(Object result) {
                promise.resolve(toReactArgument(result));
            }

            @Override
            public void reject(String error) {
                promise.reject(error, error);
            }
        });
    }

    @ReactMethod
    public void post(String path, ReadableMap map, final Promise promise) {
        Log.d(TAG, "post");
        Object data = fromReactArgument(map);

        if (data == null) {
            promise.reject("invalid-data-type", "invalid data type");
            return;
        }

        mApiMagnet.post(path, data, new Api.Callback() {
            @Override
            public void resolve(Object result) {
                promise.resolve(toReactArgument(result));
            }

            @Override
            public void reject(String error) {
                promise.reject(error, error);
            }
        });
    }

    @ReactMethod
    public void postArray(String path, ReadableArray array, final Promise promise) {
        Log.d(TAG, "post");
        Object data = fromReactArgument(array);

        if (data == null) {
            promise.reject("invalid-data-type", "invalid data type");
            return;
        }

        mApiMagnet.post(path, data, new Api.Callback() {
            @Override
            public void resolve(Object result) {
                promise.resolve(toReactArgument(result));
            }

            @Override
            public void reject(String error) {
                promise.reject(error, error);
            }
        });
    }

    @ReactMethod
    public void delete(String path, ReadableMap data, final Promise promise) {
        Log.d(TAG, "delete: " + path);
        HashMap<String,Object> map = ((ReadableNativeMap) data).toHashMap();

        mApiMagnet.delete(path, map, new Api.Callback() {
            @Override
            public void resolve(Object result) {
                promise.resolve(toReactArgument(result));
            }

            @Override
            public void reject(String error) {
                promise.reject(error, error);
            }
        });
    }

    static private Object toReactArgument(Object object) {
        if (object instanceof JSONArray) return Utils.jsonArrayToWritableArray((JSONArray) object);
        else if (object instanceof JSONObject) return Utils.jsonToWritableMap((JSONObject) object);
        else return null;
    }

    static private Object fromReactArgument(Object object) {
        if (object instanceof ReadableNativeArray) return ((ReadableNativeArray) object).toArrayList();
        else if (object instanceof ReadableNativeMap) return ((ReadableNativeMap) object).toHashMap();
        else return null;
    }
}
