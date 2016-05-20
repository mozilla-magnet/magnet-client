package org.mozilla.magnet.webview;

import android.util.Log;
import android.webkit.WebView;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * Created by wilsonpage on 03/05/2016.
 */
public class MagnetWebView extends WebView implements LifecycleEventListener {
    String TAG = "MagnetWebView";
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
        getSettings().setJavaScriptEnabled(true);
        getSettings().setDomStorageEnabled(true);

        // prevents 1px padding in some embeds (eg. youtube)
        getSettings().setUseWideViewPort(true);
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

    public void dispatchEvent(String name, WritableMap event) {
        ((ReactContext) getContext())
                .getJSModule(RCTEventEmitter.class)
                .receiveEvent(getId(), name, event);
    }

}
