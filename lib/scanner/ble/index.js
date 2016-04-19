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

  onURLFound(urls) {
    debug('found urls', urls);
    if (Array.isArray(urls)) {
      urls.forEach((url) => {
        this.callback(url);
      });
    }
    
  }

  start() {
    debug('start');
    NativeModules.MagnetScanner.start();
    this.listeners.push(DeviceEventEmitter
      .addListener('magnet:bledevicefound', this.onDeviceFound.bind(this)));
    this.listeners.push(DeviceEventEmitter
      .addListener('magnet:urlfound', this.onURLFound.bind(this)))
    // this.listener = DeviceEventEmitter
    //   .addListener('magnet:bledevicefound', this.onDeviceFound);

    // dummy beacons
    // this.callback('https://vimeo.com/152985022');
    // this.callback('https://www.youtube.com/watch?v=kh29_SERH0Y');
  }

  stop() {
    debug('stop');
    NativeModules.MagnetScanner.stop();
    this.listeners.forEach(listener => listener.remove());
  }
}

/**
 * Exports
 */

module.exports = ScannerBle;
