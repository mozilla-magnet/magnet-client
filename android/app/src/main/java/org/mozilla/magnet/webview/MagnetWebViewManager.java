package org.mozilla.magnet.webview;

import javax.annotation.Nullable;

import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.webkit.WebView;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class MagnetWebViewManager extends SimpleViewManager<WebView> {
    private static final String TAG = "MagnetWebViewManager";
    private static final String REACT_CLASS = "MagnetWebView";
    private static final String HTML_ENCODING = "UTF-8";
    private static final String HTML_MIME_TYPE = "text/html; charset=utf-8";
    private static final String HTTP_METHOD_POST = "POST";

    // Use `webView.loadUrl("about:blank")` to reliably reset the view
    // state and release page resources (including any running JavaScript).
    private static final String BLANK_URL = "about:blank";

    private ReactContext mContext;

    public MagnetWebViewManager(ReactContext reactContext) {
        Log.d(TAG, "new");
        mContext = reactContext;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        MagnetWebView magnetWebView = new MagnetWebView(mContext);
        reactContext.addLifecycleEventListener(magnetWebView);

        Context otherContext = magnetWebView.getContext();

        if (ReactBuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        return magnetWebView;
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, WebView webView) {
        Log.d(TAG, "add event emitters");
        // Do not register default touch emitter and let WebView implementation handle touches
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "magnetWebViewLoaded",
                MapBuilder.of("registrationName", "onMagnetWebViewLoaded")
        );
    }

    @Override
    public void onDropViewInstance(WebView webView) {
        MagnetWebView magnetWebView = (MagnetWebView) webView;
        mContext.removeLifecycleEventListener(magnetWebView);
        magnetWebView.destroy();
    }

    @ReactProp(name = "source")
    public void setSource(WebView view, @Nullable ReadableMap source) {
        if (source != null) {
            if (source.hasKey("html")) {
                String html = source.getString("html");

                if (source.hasKey("baseUrl")) {
                    view.loadDataWithBaseURL(
                            source.getString("baseUrl"), html, HTML_MIME_TYPE, HTML_ENCODING, null);
                } else {
                    view.loadData(html, HTML_MIME_TYPE, HTML_ENCODING);
                }

                return;
            }

            if (source.hasKey("uri")) {
                String url = source.getString("uri");

                if (source.hasKey("method")) {
                    String method = source.getString("method");
                    if (method.equals(HTTP_METHOD_POST)) {
                        byte[] postData = null;
                        if (source.hasKey("body")) {
                            String body = source.getString("body");
                            try {
                                postData = body.getBytes("UTF-8");
                            } catch (UnsupportedEncodingException e) {
                                postData = body.getBytes();
                            }
                        }
                        if (postData == null) {
                            postData = new byte[0];
                        }
                        view.postUrl(url, postData);
                        return;
                    }
                }

                HashMap<String, String> headerMap = new HashMap<>();
                if (source.hasKey("headers")) {
                    ReadableMap headers = source.getMap("headers");
                    ReadableMapKeySetIterator iter = headers.keySetIterator();
                    while (iter.hasNextKey()) {
                        String key = iter.nextKey();
                        headerMap.put(key, headers.getString(key));
                    }
                }
                view.loadUrl(url, headerMap);
                return;
            }
        }

        view.loadUrl(BLANK_URL);
    }

    @ReactProp(name = "scrollEnabled")
    public void setScrollEnabled(WebView view, boolean enabled) {

    }
}