var exports = {};
/*
 * metrics.js
 *
 * Javascript implementation of CD Metrics library. The library
 * facilitates recording and sending metrics data to a server.
 * The library uses the Google Analytics Measurement Protocol.
 * The data on the server is exported to Google's BigQuery
 * which allows it to be accessed by data visualization tools
 * such as redash and Periscope.
 *
 */
(function(exports) {
  'use strict';

 /*
  * Constructor - Metrics(clientId, options)
  *
  *  clientId: Identifier that uniquely identifies the client.
  *            All metric data will be associated with this client id.
  *  options:  An object containing information about the client. All
  *            fields are optional.
  *   locale:             Locale or user language
  *   os:                 Operating system of the device
  *   os_version:         Version of the OS
  *   device:             Device name
  *   app_name:           Application name
  *   app_version:        Application version
  *   app_update_channel: Application update channel (e.g, nightly)
  *   app_build_id:       Application build Id
  *   app_platform:       Application platform
  *   arch:               Platform/device architecture
  */
  function Metrics(clientId, options) {
      this.clientId = clientId;
      this.locale = options.locale || '';
      this.os = options.os || '';
      this.os_version = options.os_version || '';
      this.device = options.device || '';
      this.app_name = options.app_name || '';
      this.app_version = options.app_version || '';
      this.app_update_channel = options.app_update_channel || '';
      this.app_build_id = options.app_build_id || '';
      this.app_platform = options.app_platform || '';
      this.arch = options.arch || '';
  }
  exports.Metrics = Metrics;

 /*
  * recordEvent - record an event (send data to the server)
  */
  Metrics.prototype.recordEvent = function(event_category, // For example, 'eng', or 'user'
                                           event_action,   // Action that triggered event (e.g., 'open-app')
                                           event_label,    // Metric label (e.g., 'memory')
                                           event_value) {  // Value of metric (numeric)
      var self = this;
      var post_url = 'https://www.google-analytics.com/batch';
      var event_string = formatEventString();
      debug('METRICS - event string:', event_string);
      if (global.__DEV__) {
        debug('METRICS - not sent for dev builds');
        return;
      }

      // The fetch interface is used by newer browsers while the XHR is used by
      // older versions of browsers including Safari which currently does not
      // support fetch interface.
      var init = { method: 'POST', body: event_string};
      fetch(post_url, init)
      .then(function(response) {
        if (response.ok) {
          debug('METRICS - Success for ', event_string);
        } else {
          debug('METRICS - Error: ' + response.status);
        }
      });

      function formatEventString() {
          encodeURIComponent(event_category);
          encodeURIComponent(event_action);
          encodeURIComponent(event_label);
          encodeURIComponent(event_value);

          encodeURIComponent(self.locale);
          encodeURIComponent(self.os);
          encodeURIComponent(self.os_version);
          encodeURIComponent(self.device);
          encodeURIComponent(self.app_name);
          encodeURIComponent(self.app_version);
          encodeURIComponent(self.app_update_channel);
          encodeURIComponent(self.app_build_id);
          encodeURIComponent(self.app_platform);
          encodeURIComponent(self.arch);

          var event_string = ('v=1&t=event&tid=UA-77033033-1&cid=' + self.clientId +
                              '&ec=' + event_category +
                              '&ea=' + event_action +
                              '&el=' + event_label +
                              '&ev=' + event_value +
                              '&an=' + self.app_name +
                              '&av=' + self.app_version +
                              '&ul=' + self.locale +
                              '&cd1=' + self.os +
                              '&cd2=' + self.os_version +
                              '&cd3=' + self.device +
                              '&cd4=' + self.arch +
                              '&cd5=' + self.app_platform +
                              '&cd6=' + self.app_build_id +
                              '&cd7=' + getFormattedTime());

          return event_string;
      }

    function getFormattedTime() {
      var date = new Date();

      var month = date.getUTCMonth() + 1;
      var day = date.getUTCDate();
      var hour = date.getUTCHours();
      var min = date.getUTCMinutes();
      var sec = date.getUTCSeconds();

      month = (month < 10 ? "0" : "") + month;
      day = (day < 10 ? "0" : "") + day;
      hour = (hour < 10 ? "0" : "") + hour;
      min = (min < 10 ? "0" : "") + min;
      sec = (sec < 10 ? "0" : "") + sec;

      var str = date.getUTCFullYear() + "-" + month + "-" +  day + " " +  hour + ":" + min + ":" + sec;

      return str;
    }
  };
})(exports);

/**
 * Wrapper around Metrics library provided by the Metrics team.
 * We had to modify it a little bit, since this tiny library is
 * made to run in a web environment.
 * Also we created a wrapper with the functions that we will be
 * invoking and some utility functions (like record an event just once)
 */

const debug = require('../debug')('Metrics');
const {AsyncStorage} = require('react-native');
const DeviceInfo = require('react-native-device-info');
const manufacturer =
  DeviceInfo.getManufacturer().indexOf('Apple') > -1 ? 'iOS' : 'android';

/**
 * Constructor, it receives optionally an storage object that must follow the
 * AsyncStorage interface. (Useful for *future* testing).
 */
function MagnetMetrics(storage) {
  this.storage = storage || AsyncStorage;
  this.metrics = new exports.Metrics(DeviceInfo.getUniqueID(),
    {
      locale: DeviceInfo.getDeviceLocale(),
      os: DeviceInfo.getSystemName(),
      os_version: DeviceInfo.getSystemVersion(),
      device: DeviceInfo.getDeviceName(),
      app_name: DeviceInfo.getBundleId(),
      app_version: DeviceInfo.getReadableVersion(),
      app_build_id: DeviceInfo.getBuildNumber(),
      app_platform: manufacturer
    }
  );
}

MagnetMetrics.prototype.launch = function() {
  this.metrics.recordEvent('user', 'startup', 'launch', 1);
};

MagnetMetrics.prototype.install = function() {
  this._recordOnce('user', 'startup', 'installation', 1);
};

MagnetMetrics.prototype.swiped = function(url) {
  const data = url || '';
  this.metrics.recordEvent('user', 'interaction.swiped', data, 1);
};

MagnetMetrics.prototype.expanded = function(url) {
  const data = url || '';
  this.metrics.recordEvent('user', 'interaction.expanded', data, 1);
};

/**
 * Utility function to record an event just once.
 * For example an installation event, it stores a key in AsyncStorage or other
 * storage and verify it before registering the event.
 */
MagnetMetrics.prototype._recordOnce = function(category, action, label, value) {
  const KEY = `${category}_${action}_${label}`;
  return this.storage.getItem(KEY)
    .then(v => {
      if (v) {
        return Promise.resolve(true);
      } else {
        return this.storage.setItem(KEY, 'true').
          then(() => {
            return false;
          });
      }
    })
    .then(installed => {
      if (!installed) {
        this.metrics.recordEvent(category, action, label, value);
        return true;
      }
      return false;
    })
}

module.exports.Metrics = new MagnetMetrics();
module.exports.MagnetMetrics = MagnetMetrics;
