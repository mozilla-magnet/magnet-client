package org.mozilla.magnet.notifications;

import android.app.Notification;
import android.app.PendingIntent;
import android.content.Context;
import android.graphics.Bitmap;

import org.mozilla.magnet.R;
import org.mozilla.magnet.scanner.MagnetScannerItem;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by wilsonpage on 02/11/2016.
 */

class ImageNotification extends MagnetNotification {
    private Context mContext;
    private MagnetScannerItem mItem;

    private ImageNotification(Context context, MagnetScannerItem item, int id) {
        super(context, id);
        mContext = context;
        mItem = item;
    }

    static ImageNotification create(Context context, MagnetScannerItem item, int id) {
        ImageNotification notification = new ImageNotification(context, item, id);
        notification.execute();
        return notification;
    }

    @Override
    protected Map<String,Bitmap> doInBackground(Void... voids) {
        Map<String,Bitmap> result = new HashMap<>();
        result.put("image", getBitmap(mItem.getImage()));
        result.put("icon", getBitmap(mItem.getIcon()));
        return result;
    }

    @Override
    protected void onPostExecute(Map<String,Bitmap> bitmaps) {
        super.onPostExecute(bitmaps);
        PendingIntent dismissIntent = createDismissIntent();
        Bitmap bitmapImage = bitmaps.get("image");
        Bitmap bitmapIcon = bitmaps.get("icon");


        Notification.Builder builder = new Notification.Builder(mContext)
                .setContentTitle(mItem.getTitle())
                .setContentText(mItem.getChannelId())
                .setSmallIcon(R.drawable.ic_stat_notify)
                .setAutoCancel(true)
                .setDeleteIntent(dismissIntent)
                .setContentIntent(createItemDeepLinkIntent(mItem.getUrl()));

        // add image if there is one
        if (bitmapImage != null) {
            builder.setStyle(new Notification.BigPictureStyle()
                    .bigPicture(bitmapImage)
                    .setSummaryText(mItem.getChannelId()));
        }

        // add icon if there is one
        if (bitmapIcon != null) {
            builder.setLargeIcon(bitmapIcon);
        }

        addAction(builder, R.drawable.dismiss, "Dismiss", dismissIntent);
        addAction(builder, R.drawable.visit, "Visit", createVisitIntent(mItem.getUrl()));

        notify(builder);
    }
}