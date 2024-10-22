package org.mozilla.magnet;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import org.mozilla.magnet.magnetapi.ApiMagnetReact;
import org.mozilla.magnet.tracking.AnalyticsReact;
import org.mozilla.magnet.notifications.NotificationListenerReact;
import org.mozilla.magnet.webview.MagnetWebViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class MyAppPackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new MagnetScannerReact(reactContext));
        modules.add(new ApiMagnetReact(reactContext));
        modules.add(new NotificationListenerReact(reactContext));
        modules.add(new AnalyticsReact(reactContext));
        return modules;
    }

    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Arrays.<ViewManager>asList(
            new MagnetWebViewManager(reactContext)
        );
    }
}
