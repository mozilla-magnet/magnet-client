cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/cordova-plugin-whitelist/whitelist.js",
        "id": "cordova-plugin-whitelist.whitelist",
        "pluginId": "cordova-plugin-whitelist",
        "runs": true
    },
    {
        "file": "plugins/cordova-plugin-ble-central/www/ble.js",
        "id": "cordova-plugin-ble-central.ble",
        "pluginId": "cordova-plugin-ble-central",
        "clobbers": [
            "ble"
        ]
    },
    {
        "file": "plugins/cordova-zeroconf-plugin/www/ZeroConf.js",
        "id": "cordova-zeroconf-plugin.zeroconf",
        "pluginId": "cordova-zeroconf-plugin",
        "clobbers": [
            "ZeroConf"
        ]
    },
    {
        "file": "plugins/cordova-plugin-inappbrowser/www/inappbrowser.js",
        "id": "cordova-plugin-inappbrowser.inappbrowser",
        "pluginId": "cordova-plugin-inappbrowser",
        "clobbers": [
            "cordova.InAppBrowser.open",
            "window.open"
        ]
    },
    {
        "file": "plugins/com.lampa.startapp/www/startApp.js",
        "id": "com.lampa.startapp.startapp",
        "pluginId": "com.lampa.startapp",
        "merges": [
            "navigator.startApp"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-plugin-ble-central": "1.0.4",
    "cordova-zeroconf-plugin": "1.2.0",
    "cordova-plugin-inappbrowser": "1.2.0",
    "com.lampa.startapp": "0.0.6"
}
// BOTTOM OF METADATA
});