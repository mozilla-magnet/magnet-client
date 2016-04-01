'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('Scanner', 1);
var bleParser = require('./ble-parser');
var metadata = require('./metadata');
var React = require('react-native');

var {
  NativeModules,
  DeviceEventEmitter
} = React;

var counter = 0;

class Scanner {
  constructor() {
    this.items = {};
    this.onBleDeviceFound = this.onBleDeviceFound.bind(this);
  }

  onBleDeviceFound(data) {
    debug('beacon found', data);

    // bytes are transferred as json
    data.bytes = JSON.parse(data.bytes);

    var item = bleParser(data);
    debug('item found', item);
    this.onUrlFound(item);
  }

  onUrlFound(item) {
    if (!(item && item.url)) return;
    if (this.items[item.url]) return;
    debug('url found', item.url);
    this.items[item.url] = item;
    debug('fetching metadata ...');
    metadata.get(item.url)
      .then(data => {
        if (!data) return debug('metadata fetch failed', item.url);
        debug('got metadata: %s', item.url, data);
        data.id = ++counter;
        this.callback(data);
      })

      .catch(err => console.error(err));
  }

  start(callback) {
    debug('start');
    this.callback = callback;
    NativeModules.MagnetScanner.start();
    DeviceEventEmitter.addListener('magnet:bledevicefound', this.onBleDeviceFound);

    // dummy beacons
    // this.onUrlFound({ url: 'https://vimeo.com/152985022' });
    // this.onUrlFound({ url: 'https://www.youtube.com/watch?v=kh29_SERH0Y' });
  }

  stop() {
    debug('stop');
    NativeModules.MagnetScanner.stop();
    DeviceEventEmitter.removeListener('magnet:bledevicefound', this.onBleDeviceFound);
  }
}

/**
 * Exports
 */

module.exports = Scanner;
