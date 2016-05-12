'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('ScannerNetwork');
var React = require('react-native');

var {
  NativeModules,
  DeviceEventEmitter
} = React;

class ScannerNetwork {
  constructor(callback) {
    this.callback = callback;
    this.onUrlFound = this.onUrlFound.bind(this);
  }

  onUrlFound(data) {
    debug('url found', data);
    this.callback(data.url);
  }

  start() {
    debug('start');
    NativeModules.ScannerNetwork.start();
    this.listener = DeviceEventEmitter
      .addListener('magnet:networkurlfound', this.onUrlFound);
  }

  stop() {
    debug('stop');
    NativeModules.ScannerNetwork.stop();
    this.listener.remove();
  }
}

/**
 * Exports
 */

module.exports = ScannerNetwork;
