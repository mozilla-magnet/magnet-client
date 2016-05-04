package com.magnet.webview;

import android.os.Build;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.WebView;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.uimanager.ThemedReactContext;

import javax.annotation.Nullable;

/**
 * Created by wilsonpage on 03/05/2016.
 */
public class MagnetWebView extends WebView implements LifecycleEventListener {
    String TAG = "MagnetWebView";
    private @Nullable String injectedJS;
    private boolean layoutSet;

    /**
     * WebView must be created with an context of the current activity
     *
     * Activity Context is required for creation of dialogs internally by WebView
     * Reactive Native needed for access to ReactNative internal system functionality
     *
     */
    public MagnetWebView(ThemedReactContext reactContext) {
        super(reactContext);
    }

    @Override
    public void onHostResume() {
        // do nothing
    }

    @Override
    public void onHostPause() {
        // do nothing
    }

    @Override
    public void onHostDestroy() {
        cleanupCallbacksAndDestroy();
    }

    public void setInjectedJavaScript(@Nullable String js) {
        injectedJS = js;
    }

    public void callInjectedJavaScript() {
        if (!canRunJS(injectedJS)) return;
        runJS(injectedJS);
    }

    private boolean canRunJS(String js) {
        return getSettings().getJavaScriptEnabled() &&
                injectedJS != null &&
                !TextUtils.isEmpty(js);
    }

    public void cleanupCallbacksAndDestroy() {
        setWebViewClient(null);
        destroy();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        Log.d(TAG, "on layout");
        setLayout();
    }

    // prevent html document from collapsing
    private void setLayout() {
        if (layoutSet) return;
        getLayoutParams().width = LayoutParams.MATCH_PARENT;
        getLayoutParams().height = LayoutParams.MATCH_PARENT;
        layoutSet = true;
    }

    private void runJS(String script) {
        Log.d(TAG, "run js:" + script);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            evaluateJavascript(script, null);
        } else {
            loadUrl("javascript:(function() {\n" + script + ";\n})();");
        }
    }

    public void dispatchEvent() {}

}
