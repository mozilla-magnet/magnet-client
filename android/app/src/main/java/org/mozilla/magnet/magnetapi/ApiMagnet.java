package org.mozilla.magnet.magnetapi;

import android.content.Context;

import org.mozilla.magnet.api.Api;

import java.util.HashMap;

/**
 * Created by wilsonpage on 28/10/2016.
 */

public class ApiMagnet extends Api {
    private HashMap<String,Api> routes = new HashMap<>();

    ApiMagnet(Context context) {
        super(context);
        mount("channels", new ApiChannels(context));
    }
}
