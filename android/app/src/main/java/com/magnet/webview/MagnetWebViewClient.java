package com.magnet.webview;

import android.graphics.Bitmap;
import android.os.Handler;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.catalyst.views.webview.events.TopLoadingErrorEvent;
import com.facebook.catalyst.views.webview.events.TopLoadingFinishEvent;
import com.facebook.catalyst.views.webview.events.TopLoadingStartEvent;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.SystemClock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class MagnetWebViewClient extends WebViewClient {

    @Override
    public void onPageFinished(final WebView webView, String url) {
        super.onPageFinished(webView, url);

        // HACK: delayed as sometimes the result of
        // .getContentHeight() is incorrect
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            public void run() {
                WritableMap event = Arguments.createMap();
                event.putInt("height", webView.getContentHeight());
                ReactContext reactContext = (ReactContext) webView.getContext();
                reactContext
                        .getJSModule(RCTEventEmitter.class)
                        .receiveEvent(webView.getId(), "loaded", event);
            }
        }, 500);
    }
}
