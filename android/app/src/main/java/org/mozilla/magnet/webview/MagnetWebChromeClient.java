package org.mozilla.magnet.webview;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.ReactContext;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class MagnetWebChromeClient extends WebChromeClient implements ActivityEventListener {
    private static final String TAG = "MagnetWebChromeClient";
    private static final int INPUT_FILE_REQUEST_CODE = 1;
    private ReactContext mReactContext;
    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;

    public MagnetWebChromeClient(ReactContext reactContext) {
        super();
        mReactContext = reactContext;
        mReactContext.addActivityEventListener(this);
    }

    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        Log.d(TAG, "on show file chooser");

        // make sure there is no existing message
        if (mFilePathCallback != null) {
            mFilePathCallback.onReceiveValue(null);
            mFilePathCallback = null;
        }

        mFilePathCallback = filePathCallback;

        // file picker
        Intent fileChooserIntent = fileChooserParams.createIntent();
        Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
        chooserIntent.putExtra(Intent.EXTRA_INTENT, fileChooserIntent);
        chooserIntent.putExtra(Intent.EXTRA_TITLE, "Image Chooser");

        // camera
        Intent takePictureIntent = createTakePictureIntent();
        if (takePictureIntent != null) {
            Intent[] intentArray = new Intent[]{takePictureIntent};
            chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);
        }

        try {
            mReactContext.startActivityForResult(chooserIntent, INPUT_FILE_REQUEST_CODE, null);
        } catch(Exception err) {
            Log.d(TAG, err.toString());
            return false;
        }

        return true;
    }

    private Intent createTakePictureIntent() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);

        if (takePictureIntent.resolveActivity(mReactContext.getPackageManager()) == null) {
            return null;
        }

        // get the File where the photo should go
        File photoFile = null;

        try {
            photoFile = createImageFile();
            takePictureIntent.putExtra("PhotoPath", mCameraPhotoPath);
        } catch (IOException ex) {
            // Error occurred while creating the File
            Log.e(TAG, "Unable to get Image File", ex);
            return null;
        }

        // continue only if the File was successfully created
        if (photoFile == null) {
            return null;
        }

        mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(photoFile));

        return takePictureIntent;
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String imageFileName = "JPEG_" + timeStamp + "_";
        File storageDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);

        File imageFile = File.createTempFile(
                imageFileName,  /* prefix */
                ".jpg",         /* suffix */
                storageDir      /* directory */
        );

        return imageFile;
    }

    @Override
    public void onActivityResult(Activity activity, final int requestCode, final int resultCode, final Intent intent) {
        Log.d(TAG, "on activity result");

        if (requestCode != INPUT_FILE_REQUEST_CODE || mFilePathCallback == null) {
            return;
        }

        Uri[] results = null;

        // Check that the response is a good one
        if (resultCode == Activity.RESULT_OK) {
            if (intent == null) {
                // If there is not data, then we may have taken a photo
                if (mCameraPhotoPath != null) {
                    results = new Uri[]{Uri.parse(mCameraPhotoPath)};
                }
            } else {
                String dataString = intent.getDataString();
                if (dataString != null) {
                    results = new Uri[]{Uri.parse(dataString)};
                }
            }
        }

        mFilePathCallback.onReceiveValue(results);
        mFilePathCallback = null;
    }

    @Override
    public void onNewIntent(Intent intent) {
        // Ignored, required to implement ActivityEventListener
    }
}
