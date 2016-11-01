package org.mozilla.magnet.magnetapi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONObject;
import org.mozilla.magnet.api.Api;
import org.mozilla.magnet.api.Utils;

public class ApiMagnetReact extends ReactContextBaseJavaModule {
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
            public void callback(String error, Object result) {
                if (error != null) {
                    promise.reject(error, error);
                    return;
                }

                promise.resolve(toReactArgument(result));
            }
        });
    }

    static private Object toReactArgument(Object object) {
        if (object instanceof JSONArray) return Utils.jsonArrayToWritableArray((JSONArray) object);
        else if (object instanceof JSONObject) return Utils.jsonToWritableMap((JSONObject) object);
        else return null;
    }
}
