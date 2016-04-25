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
var counter = 0;

class Scanner {
  constructor(config) {
    if (!config.callback) {
      throw new Error('Configuration error');
    }
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
    this.items = {};
  }

  /**
   * When a URL is found we fetch its
   * associated metadata then call
   * the given callback.
   *
   * @param  {String} url
   * @private
   */
  onUrlFound(url) {
    if (this.items[url]) return;
    debug('url found', url);
    this.items[url] = url;
    debug('fetching metadata ...');
    metadata(url)
      .then(data => {
        if (!data) return debug('metadata fetch failed', url);
        debug('got metadata: %s', url, data);
        data.id = ++counter;
        this.callback(data);
      })

      .catch(err => {
        console.info(err);
        if (['NetworkError', 'TypeError'].indexOf(err.name) > -1
          && this.netErrorListener) {
          this.netErrorListener(err);
        }
      });
  }
}

/**
 * Exports
 */

module.exports = Scanner;
