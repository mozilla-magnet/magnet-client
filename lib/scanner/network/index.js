'use strict';

/**
 * Dependencies
 */

var debug = require('../../debug')('NetworkScanner', 1);
var React = require('react-native');

var {
  NativeModules,
  DeviceEventEmitter
} = React;

class NetworkScanner {
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
    NativeModules.NetworkScanner.start();
    DeviceEventEmitter.addListener('magnet:networkurlfound', this.onUrlFound);
  }

  stop() {
    debug('stop');
    NativeModules.NetworkScanner.stop();
    DeviceEventEmitter.removeListener('magnet:networkurlfound', this.onUrlFound);
  }
}

/**
 * Exports
 */

module.exports = NetworkScanner;
