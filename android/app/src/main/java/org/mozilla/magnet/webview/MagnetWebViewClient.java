package org.mozilla.magnet.webview;

import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.util.Log;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;

public class MagnetWebViewClient extends WebViewClient {
    private static final String LOG_TAG = "MagnetWebviewClient";
    private final static int MS_UNTIL_RENDERED = 500;
    private boolean loaded = false;
    private ReactContext mReactContext;

    public MagnetWebViewClient(ReactContext reactContext) {
        super();
        mReactContext = reactContext;
    }

    @Override
    public void onPageFinished(final WebView webView, String url) {
        super.onPageFinished(webView, url);
        final MagnetWebView magnetWebView = (MagnetWebView) webView;

        // HACK: delayed, as sometimes the result of
        // .getContentHeight() is incorrect
        Handler handler = new Handler();
        handler.postDelayed(new Runnable() {
            public void run() {
                loaded = true;
                WritableMap event = Arguments.createMap();
                event.putInt("height", magnetWebView.getContentHeight());
                magnetWebView.dispatchEvent("magnetWebViewLoaded", event);
            }
        }, MS_UNTIL_RENDERED);
    }

    /**
     * Decides whether a navigation change should load
     * inside the webview or in the device's browser.
     *
     * We want any http:// navigation change *after*
     * the initial load, to open in the browser.
     * This primarily means link clicks.
     * However, if the navigation is to the same URL,
     * ie. a refresh, then the URL is loaded.
     *
     * If we don't check for `loaded`, initial http
     * redirects can end up opening in the browser.
     *
     * @param webView
     * @param url
     * @return boolean
     */
    @Override
    public boolean shouldOverrideUrlLoading(WebView webView, String url) {
        Log.d(LOG_TAG, "Current URL: " + webView.getUrl() + " new URL: " + url);
        if (!loaded || url == null || !url.startsWith("http") || webView.getUrl().equals(url)) {
            return false;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mReactContext.startActivity(intent);
        return true;
    }
}
