package org.mozilla.magnet.webview;

import android.content.Intent;
import android.net.Uri;
import android.os.Handler;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

public class MagnetWebViewClient extends WebViewClient {
    private final static int MS_UNTIL_RENDERED = 500;

    @Override
    public void onPageFinished(WebView webView, String url) {
        super.onPageFinished(webView, url);
        final MagnetWebView magnetWebView = (MagnetWebView) webView;

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

    // Links should be open in the default browser
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return false;
        // if (url == null || !url.startsWith("http")) {
//            return false;
//        }
//
//        view.getContext().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
//        return true;
//    }
    }

}
