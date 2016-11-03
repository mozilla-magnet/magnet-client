package org.mozilla.magnet.notifications;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.mozilla.magnet.MainActivity;
import org.mozilla.magnet.api.Api;
import org.mozilla.magnet.magnetapi.ApiMagnet;
import org.mozilla.magnet.scanner.MagnetScannerItem;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class NotificationService extends Service {
    private String TAG = "NotificationService";
    private ApiMagnet mApi;

    /**
     * Called once, when the service is created.
     */
    @Override
    public void onCreate() {
        Log.d(TAG, "on create");

        // notifications aren't required if
        // the app is 'active' (in foreground)
        if (appActive()) {
            Log.d(TAG, "app is active, terminating ...");
            stopSelf();
            return;
        }

        mApi = new ApiMagnet(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "on start command");

        if (intent != null) {
            List<MagnetScannerItem> items = inflateItems((List<Map>) intent.getSerializableExtra("items"));
            Log.d(TAG, "items:" + items);
            process(items);
        }

        return super.onStartCommand(intent, flags, startId);
    }

    /**
     * Called once, when the service is terminated.
     */
    @Override
    public void onDestroy() {
        Log.d(TAG, "on destroy");
    }

    private void onError(String error) {
        Log.e(TAG, "error: " + error);
        stopSelf();
    }

    private List<MagnetScannerItem> inflateItems(List<Map> items) {
        List<MagnetScannerItem> result = new ArrayList<>();

        for (Map item: items) {
            result.add(new MagnetScannerItem((String) item.get("url"))
                    .setChannelId((String) item.get("channel_id")));
        }

        return result;
    }

    /**
     * Check if the main activity is in the foreground.
     *
     * @return boolean
     */
    private boolean appActive() {
        SharedPreferences prefs = getSharedPreferences("MAGNET", MODE_PRIVATE);
        return prefs.getBoolean("active", false);
    }

    private void process(final List<MagnetScannerItem> items) {
        getSubscriptions(new Api.Callback() {
            @Override
            public void resolve(Object result) {
                onGotSubscriptions((JSONObject) result, items);
            }

            @Override
            public void reject(String error) {
                onError("get-subscriptions-error: " + error);
            }
        });
    }

    private void onGotSubscriptions(JSONObject subscriptions, List<MagnetScannerItem> items) {
        Log.d(TAG, "got subscriptions: " + subscriptions);
        final List<MagnetScannerItem> subscribedItems = filterSubscribed(items, subscriptions);

        // abort if no subscribed items found
        if (subscribedItems.isEmpty()) {
            Log.d(TAG, "no subscribed items");
            return;
        }

        getMetadata(subscribedItems, new Api.Callback() {
            @Override
            public void resolve(Object result) {
                onGotMetadata((JSONArray) result, subscribedItems);
            }

            @Override
            public void reject(String error) {
                onError("get-metadata-error: " + error);
            }
        });
    }

    private void onGotMetadata(JSONArray metadataItems, List<MagnetScannerItem> subscribedItems) {
        Log.d(TAG, "got metadata: " + metadataItems);

        try {
            for (int i=0; i < metadataItems.length(); i++){
                MagnetScannerItem item = subscribedItems.get(i);
                JSONObject metadata = (JSONObject) metadataItems.get(i);
                item.setTitle((String) metadata.get("title"));
                item.setImage((String) metadata.get("image"));
                item.setIcon((String) metadata.get("icon"));
            }
        } catch(JSONException error) {
            onError("json-error: " + error);
        }

        updateNotification(subscribedItems);
    }


    private List<MagnetScannerItem> filterSubscribed(List<MagnetScannerItem> items, JSONObject subscriptions) {
        List<MagnetScannerItem> result = new ArrayList<>();

        for (MagnetScannerItem item : items) {
            String channel_id = item.getChannelId();
            if (channel_id == null) continue;
            if (subscriptions.has(channel_id)) result.add(item);
        }

        return result;
    }

    private void getMetadata(List<MagnetScannerItem> items, Api.Callback callback) {
        mApi.post("metadata", toUrls(items), callback);
    }

    private List<String> toUrls(List<MagnetScannerItem> items) {
        List<String> result = new ArrayList<>();

        for (MagnetScannerItem item: items) {
            result.add(item.getUrl());
        }

        return result;
    }

    private void getSubscriptions(Api.Callback callback) {
        mApi.get("subscriptions", callback);
    }

    /**
     * Update the current notification state.
     */
    private void updateNotification(List<MagnetScannerItem> items) {
        for (MagnetScannerItem item : items) {
            Log.d(TAG, "hash-code:" + item.getUrl().hashCode());
            ImageNotification.create(this, item, item.getUrl().hashCode());
        }
    }

    private PendingIntent createLaunchIntent() {
        Intent launchIntent = new Intent(this, MainActivity.class);
        int uniqueRequestCode = (int) System.currentTimeMillis();

        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launchIntent.putExtra("source", "notification");

        return PendingIntent.getActivity(
                this,
                uniqueRequestCode,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);
    }

    private PendingIntent createDeleteIntent() {
        Intent intent = new Intent(this, ReceiverNotificationDelete.class);
        intent.setAction("notification_delete");
        return PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
