package org.mozilla.magnet;

import android.app.IntentService;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;
import android.util.Log;

import net.jodah.expiringmap.ExpiringMap;

import org.mozilla.magnet.database.History;
import org.mozilla.magnet.net.scanner.MagnetScanner;
import org.mozilla.magnet.net.scanner.MagnetScannerCallback;
import org.mozilla.magnet.net.scanner.MagnetScannerItem;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.TimeUnit;

public class ScannerService extends IntentService implements MagnetScannerCallback {
    private final static String TAG = "ScannerService";
    private final static long ITEM_EXPIRATION_TIME_SECS = 30;
    private List<ScannerServiceCallback> mCallbacks = new ArrayList<>();
    private LocalBinder mBinder = new LocalBinder();
    private MagnetScanner mMagnetScanner;
    private History mHistory;
    private int mClients = 0;

    /**
     * A hash to store found mItems.
     *
     * Items expire after a short period of time.
     */
    private ExpiringMap<String, MagnetScannerItem> mItems = ExpiringMap.builder()
            .expiration(ITEM_EXPIRATION_TIME_SECS, TimeUnit.SECONDS)
            .build();

    public ScannerService() {
        super("ScannerService");
    }

    /**
     * Called once, when the `Service` is created.
     */
    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "on get");
        mHistory = History.get(this);
        mMagnetScanner = new MagnetScanner(this);
        mMagnetScanner
                .useBLE(null)
                .useMDNS(null);
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "on destroy");
    }

    /**
     * Callback for subscribers to this service.
     */
    public interface ScannerServiceCallback {
        void onItemFound(MagnetScannerItem item);
    }

    @Override
    public void onHandleIntent(Intent intent) {
        // no-op, service only supports binding
    }

    /**
     * Called when a client binds to the
     * service via `bindService()`
     *
     * @param intent
     * @return
     */
    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    /**
     * Called when an item is discovered.
     *
     * We store the items in a hash for a duration of time,
     * after which they are considered expired (or lost).
     *
     * The History database is instructed to record
     * the detection of a URL to allow us to make
     * more intelligent notification decisions.
     *
     * @param item
     */
    @Override
    public void onItemFound(MagnetScannerItem item) {
        String url = item.getUrl();
        Log.d(TAG, "on item found: " + url);
        mItems.put(url, item);
        mHistory.record(url);

        for (ScannerServiceCallback callback : mCallbacks) {
            callback.onItemFound(item);
        }
    }

    /**
     * Start scanning.
     *
     * We only want to start the scanner once
     * as this can throw errors if called
     * several times.
     *
     * We keep track of the number of calls.
     * Scanning is only stopped when the number
     * of calls to `.stop()` matches those to
     * `.start()`.
     */
    public void start() {
        Log.d(TAG, "start");
        if (++mClients == 1) {
            mMagnetScanner.start(this);
            Log.d(TAG, "started");
        }
    }

    /**
     * Stop scanning.
     *
     * We only want to stop the scanner once,
     * as this can throw errors if called
     * several times.
     *
     * We keep track of the number of calls.
     * Scanning is only stopped when the number
     * of calls to `.stop()` matches those to
     * `.start()`.
     */
    public void stop() {
        Log.d(TAG, "stop");
        if (--mClients == 0) {
            mMagnetScanner.stop();
            Log.d(TAG, "stopped");
        }
    }

    /**
     * Get the recently found mItems.
     *
     * This is useful as some advertisements aren't
     * very frequent (like mdns) and a client that
     * has just bound may have missed the broadcast.
     *
     * A `HashMap` copy is returned. The `ExpiringMap`
     * implementation seems to require that this copy
     * be built manually, hence the loop.
     *
     * @return HashMap
     */
    public HashMap getItems() {
        HashMap<String, MagnetScannerItem> items = new HashMap();

        for (String key : mItems.keySet()) {
            items.put(key, mItems.get(key));
        }

        return items;
    }

    /**
     * Listen for found mItems.
     *
     * @param callback
     */
    public void addListener(ScannerServiceCallback callback) {
        Log.d(TAG, "add listener");
        mCallbacks.add(callback);
    }

    /**
     * Stop listening for found mItems.
     * @param callback
     */
    public void removeListener(ScannerServiceCallback callback) {
        Log.d(TAG, "remove listener");
        mCallbacks.remove(callback);
    }

    /**
     * Class used for the client Binder.  Because we know this service always
     * runs in the same process as its clients, we don't need to deal with IPC.
     */
    public class LocalBinder extends Binder {
        ScannerService getService() {
            return ScannerService.this;
        }
    }
}
