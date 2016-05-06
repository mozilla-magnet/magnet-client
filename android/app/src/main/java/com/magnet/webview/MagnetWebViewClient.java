package com.magnet.webview;

import android.os.Handler;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class MagnetWebViewClient extends WebViewClient {

    @Override
    public void onPageFinished(WebView webView, String url) {
        super.onPageFinished(webView, url);
        final MagnetWebView magnetWebView = (MagnetWebView) webView;
        int MS_UNTIL_RENDERED = 500;

        // HACK: delayed, as sometimes the result of
        // .getContentHeight() is incorrect
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            public void run() {
                WritableMap event = Arguments.createMap();
                event.putInt("height", magnetWebView.getContentHeight());
                magnetWebView.dispatchEvent("magnetWebViewLoaded", event);
            }
        }, MS_UNTIL_RENDERED);
    }
}
