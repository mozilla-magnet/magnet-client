'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const ReactNative = require('react-native');
const metadata = require('./metadata');

const {
  NativeModules,
  DeviceEventEmitter
} = ReactNative;

const MagnetScanner = NativeModules.MagnetScannerReact;

/**
 * Counter used to generate item ids.
 *
 * @type {Number}
 */
var counter = 0;

class Scanner extends Emitter {
  constructor() {
    super();
    this.items = {};
  }

  start() {
    debug('start');
    MagnetScanner.start();
    this.listener = DeviceEventEmitter
      .addListener('magnetscanner:itemfound', this.onItemFound.bind(this));
  }

  stop() {
    debug('stop');
    MagnetScanner.stop();
    this.listener.remove();
  }

  /**
   * Clear the found items cache.
   *
   * @public
   */
  clear() {
    debug('clear');
    this.items = {};
    this.notify();
  }

  /**
   * When a URL is found we fetch its
   * associated metadata then notify
   * the listener.
   *
   * @param  {String} url
   * @private
   */
  onItemFound(item) {
    var url = item.url;

    if (this.items[url]) {
      this.items[url].lastSeen = Date.now();
      return;
    }

    this.items[url] = {
      url: url,
      lastSeen: Date.now()
    };

    debug('fetching metadata ...');
    metadata(url)
      .then((data) => {
        if (!data) return debug('metadata fetch failed', url);
        debug('got metadata: %s', url, data);

        // check the item hasn't been cleared
        if (!this.items[url]) return;

        data.id = ++counter;
        this.items[url].data = data;
        this.notify();
      })

      .catch(err => {
        console.info(err);
        if (!isNetworkError(err)) return;
        this.emit('networkerror', err);
      });
  }

  /**
   * Notify the listener (`callback`) of
   * a change in state.
   *
   * @private
   */
  notify() {
    let items = Object.keys(this.items)
      .filter(key => !!this.items[key].data)
      .map((key) => this.items[key].data);

    this.emit('update', items);
  }
}

/**
 * Utils
 */

function isNetworkError(err) {
  return err.name === 'NetworkError'
    || err.message === 'Network request failed';
}

/**
 * Exports
 */

module.exports = Scanner;
