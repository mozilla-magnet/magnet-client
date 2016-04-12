'use strict';

/**
 * Dependencies
 */

var debug = require('../../debug')('BleScanner');
var bleParser = require('./parser');
var React = require('react-native');

var {
  NativeModules,
  DeviceEventEmitter
} = React;

class BleScanner {
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
    NativeModules.MagnetScanner.start();
    DeviceEventEmitter.addListener('magnet:bledevicefound', this.onDeviceFound);

    // dummy beacons
    // this.onUrlFound({ url: 'https://vimeo.com/152985022' });
    // this.onUrlFound({ url: 'https://www.youtube.com/watch?v=kh29_SERH0Y' });
  }

  stop() {
    debug('stop');
    NativeModules.MagnetScanner.stop();
    DeviceEventEmitter.removeListener('magnet:bledevicefound', this.onDeviceFound);
  }
}

/**
 * Exports
 */

module.exports = BleScanner;
