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

  start() {
    debug('start');
    NativeModules.ScannerBle.start();
    this.listener = DeviceEventEmitter
      .addListener('magnet:bledevicefound', this.onDeviceFound);

    // dummy beacons
    // this.callback('https://facebook.com/mozilla');
    // this.callback('https://www.youtube.com/watch?v=kh29_SERH0Y');
  }

  stop() {
    debug('stop');
    NativeModules.ScannerBle.stop();
    this.listener.remove();
  }
}

/**
 * Exports
 */

module.exports = ScannerBle;
