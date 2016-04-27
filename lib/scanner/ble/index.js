'use strict';

/**
 * Dependencies
 */

var debug = require('../../debug')('ScannerBle');
var bleParser = require('./parser');
var React = require('react-native');

var {
  NativeModules,
  DeviceEventEmitter
} = React;

class ScannerBle {
  constructor(callback) {
    this.callback = callback;
    this.onDeviceFound = this.onDeviceFound.bind(this);
    this.listeners = [];
  }

  onDeviceFound(data) {
    debug('device found', data);

    // bytes are transferred as json
    data.bytes = JSON.parse(data.bytes);

    var item = bleParser(data);
    if (!item) return;

    debug('item parsed', item);
    this.callback(item.url);
  }

  onUrlFound(urls) {
    debug('found urls', urls);
    if (Array.isArray(urls)) {
      urls.forEach((url) => {
        this.callback(url);
      });
    }
  }

  start() {
    debug('start');
    NativeModules.ScannerBle.start();
    this.listeners.push(DeviceEventEmitter
      .addListener('magnet:bledevicefound', this.onDeviceFound.bind(this)));
    this.listeners.push(DeviceEventEmitter
      .addListener('magnet:urlfound', this.onUrlFound.bind(this)))

    // dummy beacons
    // this.callback('https://facebook.com/mozilla');
    // this.callback('https://twitter.com/wilsonpage');
    // this.callback('http://www.bbc.co.uk/news');
    // this.callback('https://www.youtube.com/watch?v=sBG8O430uOg');
    // this.callback('http://wilsonpage.github.io/magnet-dummy-apps/tfl-countdown');
    // this.callback('https://play.google.com/store/apps/details?id=org.mozilla.firefox');
  }

  stop() {
    debug('stop');
    NativeModules.ScannerBle.stop();
    this.listeners.forEach(listener => listener.remove());
  }
}

/**
 * Exports
 */

module.exports = ScannerBle;
