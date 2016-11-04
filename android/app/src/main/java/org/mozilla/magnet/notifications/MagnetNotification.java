package org.mozilla.magnet.notifications;

/**
 * Created by wilsonpage on 03/11/2016.
 */

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.support.v4.content.ContextCompat;

import org.mozilla.magnet.MainActivity;
import org.mozilla.magnet.R;
import org.mozilla.magnet.scanner.MagnetScannerItem;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by wilsonpage on 02/11/2016.
 */

abstract class MagnetNotification extends AsyncTask<Void, Void, Map<String,Bitmap>> {
    private Context mContext;
    private MagnetScannerItem mItem;
    private int mId;

    MagnetNotification(Context context, int id) {
        mContext = context;
        mId = id;
    }

    Bitmap getBitmap(String uri) {
        if (uri == null) return null;

        try {
            URL url = new URL(uri);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setDoInput(true);
            connection.connect();
            InputStream input = connection.getInputStream();
            return BitmapFactory.decodeStream(input);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }

    void notify(Notification.Builder builder) {
        NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(mId, builder.build());
    }

    void setColor(Notification.Builder builder, int color) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            builder.setColor(ContextCompat.getColor(mContext, color));
        }
    }

    PendingIntent createLaunchIntent() {
        Intent launchIntent = new Intent(mContext, MainActivity.class);
        int uniqueRequestCode = (int) System.currentTimeMillis();

        launchIntent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launchIntent.putExtra("source", "notification");

        return PendingIntent.getActivity(
                mContext,
                uniqueRequestCode,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT);
    }

    PendingIntent createDismissIntent() {
        return ReceiverNotificationDelete.createIntent(mContext, mId);
    }

    PendingIntent createVisitIntent(String uri) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
        return PendingIntent.getActivity(mContext, 0, intent, 0);
    }

    void addAction(Notification.Builder builder, int icon, String label, PendingIntent intent) {
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.KITKAT) {
            builder.addAction(icon, label, intent);
        } else {
            builder.addAction(new Notification.Action(icon, label, intent));
        }
    }
}