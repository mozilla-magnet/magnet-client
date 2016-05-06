'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('Scanner');
var NetworkScanner = require('./network');
var metadata = require('./metadata');
var BleScanner = require('./ble');

const SCAN_INTERVAL = 30000; // 30secs
const SCAN_LENGTH = 10000; // 10secs
const ITEM_EXPIRES = 30000; // 30secs
var counter = 0;

class Scanner {
  constructor(config) {
    if (!config.callback) throw new Error('configuration error');

    this.items = {};
    this.callback = config.callback;
    this.onUrlFound = this.onUrlFound.bind(this);
    this.netErrorListener = config.netErrorListener;

    this.scanners = [
      new NetworkScanner(this.onUrlFound),
      new BleScanner(this.onUrlFound)
    ];
  }

  /**
   * Start scanning.
   *
   * @public
   */
  start() {
    debug('start');
    this.cycle();
  }

  /**
   * Stop scanning.
   *
   * @public
   */
  stop() {
    if (!this.scanning) return;
    clearTimeout(this.stopScanTimeout);
    this.clearNextCycle();
    this.stopScanning();
    debug('stopped');
  }

  /**
   * Starts the scan cycle.
   *
   * This will loop indefinitely
   * until `.stop()` is called.
   *
   * Returns a Promise which resolves
   * once the first scan has completed.
   *
   * @return {Promise}
   */
  cycle() {
    debug('cycle');
    return this.scan().then(() => {
      this.nextCycleTimeout = setTimeout(() => this.cycle(), SCAN_INTERVAL);
    });
  }

  /**
   * Stop the next scan from running.
   *
   * @private
   */
  clearNextCycle() {
    clearTimeout(this.nextCycleTimeout);
  }

  /**
   * Advance the next scheduled scan cycle.
   *
   * @return {Promise}
   */
  advance() {
    debug('advance');
    this.clearNextCycle();
    return this.cycle();
  }

  /**
   * Perform a scan.
   *
   * @return {Promise}
   */
  scan() {
    return new Promise(resolve => {
      clearTimeout(this.stopScanTimeout);
      this.startScanning();
      this.stopScanTimeout = setTimeout(() => {
        this.stopScanning();
        resolve();
      }, SCAN_LENGTH);
    });
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
    const now = Date.now();

    const keysDeleted = Object.keys(this.items).reduce((keysDeleted, key) => {
      if ((now - this.items[key].lastSeen) > ITEM_EXPIRES) {
        delete this.items[key];
        return true;
      } else {
        return keysDeleted;
      }
    }, false);

    if (keysDeleted) {
      this.notify();
    }
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
      lastSeen: Date.now(),
    };

    debug('fetching metadata ...');
    metadata(url)
      .then((data) => {
        if (!data) return debug('metadata fetch failed', url);

        debug('got metadata: %s', url, data);
        data.id = ++counter;
        this.items[url].data = data;
        this.notify();
      })

      .catch(err => {
        console.info(err);
        if (['NetworkError'].indexOf(err.name) > -1
          && this.netErrorListener) {
          this.netErrorListener(err);
        }
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

    this.callback(items);
  }
}

/**
 * Exports
 */

module.exports = Scanner;
