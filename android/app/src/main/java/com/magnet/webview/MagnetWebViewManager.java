package com.magnet.webview;


import javax.annotation.Nullable;

import android.os.Build;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.build.ReactBuildConfig;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.facebook.react.views.webview.ReactWebViewManager;
import com.facebook.react.views.webview.WebViewConfig;
import com.facebook.react.bridge.ReadableArray;

import java.util.Map;

public class MagnetWebViewManager extends ReactWebViewManager {
    private static final String REACT_CLASS = "RCTMagnetWebView";

    public MagnetWebViewManager() {
        super();
        Log.d(REACT_CLASS, "init");
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected WebView createViewInstance(ThemedReactContext reactContext) {
        MagnetWebView webView = new MagnetWebView(reactContext);
        reactContext.addLifecycleEventListener(webView);

        if (ReactBuildConfig.DEBUG && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        return webView;
    }

    @Override
    protected void addEventEmitters(ThemedReactContext reactContext, WebView view) {
        // Do not register default touch emitter and let WebView implementation handle touches
        view.setWebViewClient(new MagnetWebViewClient());
    }

    @Override
    public @Nullable Map getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.of(
                "loaded",
                MapBuilder.of("registrationName", "onLoaded")
        );
    }

    @Override
    public void onDropViewInstance(WebView webView) {
        ((ThemedReactContext) webView.getContext()).removeLifecycleEventListener((MagnetWebView) webView);
        ((MagnetWebView) webView).cleanupCallbacksAndDestroy();
    }

    @ReactProp(name = "injectedJavaScript")
    public void setInjectedJavaScript(WebView view, @Nullable String injectedJavaScript) {
        ((MagnetWebView) view).setInjectedJavaScript(injectedJavaScript);
    }
}