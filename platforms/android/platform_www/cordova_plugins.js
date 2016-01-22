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
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-plugin-ble-central": "1.0.4",
    "cordova-zeroconf-plugin": "1.2.0"
}
// BOTTOM OF METADATA
});