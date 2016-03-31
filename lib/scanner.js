'use strict';

/**
 * Dependencies
 */

var debug = require('./debug')('Scanner');
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
    this.onFound = this.onFound.bind(this);
  }

  onFound(item) {
    if (this.items[item.url]) return;
    debug('found', item.url);
    this.items[item.url] = item;
    metadata.get(item.url)
      .then(item => {
        if (!item) return;
        item.id = ++counter;
        this.callback(item);
      })
      .catch(err => console.error(err));
  }

  start(callback) {
    debug('start');
    this.callback = callback;
    NativeModules.MagnetScanner.start();
    DeviceEventEmitter.addListener('magnetitemfound', this.onFound);

    // dummy beacons
    this.onFound({ url: 'https://vimeo.com/152985022' });
    this.onFound({ url: 'https://www.youtube.com/watch?v=kh29_SERH0Y' });
  }

  stop() {
    debug('stop');
    NativeModules.MagnetScanner.stop();
    DeviceEventEmitter.removeListener('magnetitemfound', this.onFound);
  }
}

/**
 * Exports
 */

module.exports = Scanner;
