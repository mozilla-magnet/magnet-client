package com.magnet;

import android.content.Context;
import android.net.nsd.NsdManager;
import android.net.nsd.NsdManager.DiscoveryListener;
import android.net.nsd.NsdServiceInfo;
import android.util.Log;
import android.webkit.URLUtil;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * Created by wilsonpage on 12/04/2016.
 */
public class NetworkScanner extends ReactContextBaseJavaModule {
    DiscoveryListener discoveryListener;
    NsdManager nsdManager;
    String TAG = "NetworkScanner";
    String MDNS_SERVICE_TYPE = "_http._tcp.";

    public NetworkScanner(ReactApplicationContext context){
        super(context);
        nsdManager = (NsdManager) context.getSystemService(Context.NSD_SERVICE);
        discoveryListener = createListener();
    }

    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void start() {
        Log.d(TAG, "start");
        nsdManager.discoverServices(MDNS_SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener);
    }

    public DiscoveryListener createListener() {
        return new DiscoveryListener() {

            //  Called as soon as service discovery begins.
            @Override
            public void onDiscoveryStarted(String regType) {
                Log.d(TAG, "Service discovery started");
            }

            @Override
            public void onServiceFound(NsdServiceInfo service) {
                // A service was found!  Do something with it
                Log.d(TAG, "Service discovery success" + service);
                String name = service.getServiceName();
                if (URLUtil.isNetworkUrl(name)) {
                    WritableMap data = Arguments.createMap();
                    data.putString("url", name);
                    emit("magnet:networkurlfound", data);
                }
            }

            @Override
            public void onServiceLost(NsdServiceInfo service) {
                // When the network service is no longer available.
                // Internal bookkeeping code goes here.
                Log.e(TAG, "service lost" + service);
            }

            @Override
            public void onDiscoveryStopped(String serviceType) {
                Log.i(TAG, "Discovery stopped: " + serviceType);
            }

            @Override
            public void onStartDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "Discovery failed: Error code:" + errorCode);
                nsdManager.stopServiceDiscovery(this);
            }

            @Override
            public void onStopDiscoveryFailed(String serviceType, int errorCode) {
                Log.e(TAG, "Discovery failed: Error code:" + errorCode);
                nsdManager.stopServiceDiscovery(this);
            }
        };
    }

    private void emit(String name, WritableMap data) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(name, data);
    }
}
