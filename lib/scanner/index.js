'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('Scanner');
var NetworkScanner = require('./network');
var metadata = require('./metadata');
var BleScanner = require('./ble');

var counter = 0;

class Scanner {
  constructor(callback) {
    this.items = {};
    this.callback = callback;
    this.onUrlFound = this.onUrlFound.bind(this);

    this.scanners = [
      new NetworkScanner(this.onUrlFound),
      new BleScanner(this.onUrlFound)
    ];
  }

  start() {
    this.scanners.forEach(scanner => scanner.start());
  }

  stop() {
    this.scanners.forEach(scanner => scanner.stop());
  }

  onUrlFound(url) {
    if (this.items[url]) return;
    debug('url found', url);
    this.items[url] = url;
    debug('fetching metadata ...');
    metadata.get(url)
      .then(data => {
        if (!data) return debug('metadata fetch failed', url);
        debug('got metadata: %s', url, data);
        data.id = ++counter;
        this.callback(data);
      })

      .catch(err => console.error(err));
  }
}

/**
 * Exports
 */

module.exports = Scanner;
