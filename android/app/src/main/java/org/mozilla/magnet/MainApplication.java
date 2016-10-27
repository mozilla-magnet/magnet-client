package org.mozilla.magnet;

import android.app.Application;
import android.util.Log;

import com.BV.LinearGradient.LinearGradientPackage;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;

import org.mozilla.magnet.BuildConfig;
import org.mozilla.magnet.MyAppPackage;
import org.mozilla.magnet.notificationlistener.NotificationListenerPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        /**
         * A list of packages used by the app. If the app uses additional views
         * or modules besides the default ones, add more packages here.
         */
        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new NotificationListenerPackage(),
                    new GoogleAnalyticsBridgePackage(),
                    new LinearGradientPackage(),
                    new MyAppPackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }
}
