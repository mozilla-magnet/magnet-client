'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const NetworkScanner = require('./network');
const metadata = require('./metadata');
const BleScanner = require('./ble');

/**
 * When an item hasn't be seen for
 * this amount of time, it is
 * considered 'expired' or 'lost'.
 *
 * @type {Number}
 */
const ITEM_EXPIRES = 30000; // 30secs

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
    this.onUrlFound = this.onUrlFound.bind(this);

    this.scanners = [
      new NetworkScanner(this.onUrlFound),
      new BleScanner(this.onUrlFound)
    ];
  }

  /**
   * Perform a scan.
   *
   * @public
   * @param  {Number} duration
   * @return {Promise}
   */
  scan(duration) {
    return new Promise(resolve => {
      debug('scan', duration);
      clearTimeout(this.stopScanTimeout);
      this.startScanning();
      this.stopScanTimeout = setTimeout(() => {
        this.stopScanning();
        resolve();
      }, duration);
    });
  }

  /**
   * Stop scanning.
   *
   * @public
   */
  stop() {
    if (!this.scanning) return;
    clearTimeout(this.stopScanTimeout);
    this.stopScanning();
    debug('stopped');
  }


  /**
   * Start each of the scanners.
   *
   * @private
   */
  startScanning() {
    if (this.scanning) return;
    this.scanners.forEach(scanner => scanner.start());
    this.scanning = true;
    debug('scanning started');
  }

  /**
   * Stop each of the scanners.
   *
   * @private
   */
  stopScanning() {
    if (!this.scanning) return;
    this.scanners.forEach(scanner => scanner.stop());
    this.scanning = false;
    debug('scanning stopped');
  }

  /**
   * Clear the found items cache.
   *
   * @public
   */
  clear() {
    debug('clear');
    const now = Date.now();
    const keysDeleted = Object.keys(this.items).reduce((keysDeleted, key) => {
      let item = this.items[key]
      let lastSeen = item.lastSeen;
      if (item.data && now - lastSeen < ITEM_EXPIRES) return keysDeleted;
      delete this.items[key];
      return true;
    }, false);

    if (keysDeleted) this.notify();
  }

  /**
   * When a URL is found we fetch its
   * associated metadata then notify
   * the listener.
   *
   * @param  {String} url
   * @private
   */
  onUrlFound(url) {
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
