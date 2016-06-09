package org.mozilla.magnet.webview;

import android.os.Build;
import android.util.Log;
import android.webkit.WebView;

import android.view.View;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * Created by wilsonpage on 03/05/2016.
 */
public class MagnetWebView extends WebView implements LifecycleEventListener {
    private static final String TAG = "MagnetWebView";
    private boolean layoutSet;

    // Record the last seen size changed event so we can update the webview content target,
    // after layout
    private int mLastSeenWidth = -1;
    private int mLastSeenHeight = -1;

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

        // From version 4.4 WebViews are not debuggable with DevTools
        // by default, this turns on WebView debugging.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            setWebContentsDebuggingEnabled(true);
        }
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
        Log.d(TAG, "on layout");
        super.onLayout(changed, left, top, right, bottom);
        setLayout();

        // Force size change AFTER layout, see `onSizeChanged`
        forceSizeChanged();
    }

    // prevent html document from collapsing
    private void setLayout() {
        getLayoutParams().width = LayoutParams.MATCH_PARENT;
        getLayoutParams().height = LayoutParams.MATCH_PARENT;
    }

    public void forceSizeChanged() {
        // If the height and width have been set by onSizeChanged already,
        // i.e. are non-negative, call onSizeChanged again
        if (mLastSeenHeight >= 0 && mLastSeenWidth >= 0) {
            onSizeChanged(mLastSeenWidth, mLastSeenHeight, 0, 0);
        }
    }

    @Override
    protected void  onSizeChanged(int aWidth, int aHeight, int aOldWidth, int aOldHeight) {

        // Record the last reported size, we then need to use this to force a
        // size change AFTER onLayout. This then updates the underlying Chrome
        // content target.
        mLastSeenWidth = aWidth;
        mLastSeenHeight = aHeight;

        super.onSizeChanged(aWidth, aHeight, aOldWidth, aOldHeight);
    }

    public void dispatchEvent(String name, WritableMap event) {
        ((ReactContext) getContext())
                .getJSModule(RCTEventEmitter.class)
                .receiveEvent(getId(), name, event);
    }
}
