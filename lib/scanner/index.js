'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const ReactNative = require('react-native');
const metadata = require('./metadata');
const config = require('../../config');

const {
  Alert,
  Platform,
  NativeModules,
  DeviceEventEmitter,
} = ReactNative;

const MagnetScanner = NativeModules.MagnetScannerReact;
const PromptBluetooth = NativeModules.PromptBluetoothReact;

class Scanner extends Emitter {
  constructor(options) {
    super();
    this.onUpdate = options.onUpdate;
    this.onLost = options.onLost;
    this.shouldPopulateItem = options.shouldPopulateItem;
  }

  start() {
    debug('start');
    return this.checkBluetooth()
      .then(() => {
        MagnetScanner.start();
        this.injectTestUrls();
        this.listener = DeviceEventEmitter
          .addListener('magnetscanner:itemfound', this.onItemFound.bind(this));
      });
  }

  stop() {
    debug('stop');
    MagnetScanner.stop();
    this.listener.remove();
  }

  checkBluetooth() {
    if (Platform.OS == 'ios') return Promise.resolve();
    return PromptBluetooth.prompt()
      .catch(this.showWarning.bind(this));
  }

  showWarning() {
    Alert.alert(
      'Functionality limited',
      'Since bluetooth has not been enabled, Project Magnet will not be able to discover content'
    );
  }

  injectTestUrls() {
    if (!config.flags.injectTestUrls) return;
    config.testUrls.forEach(url => {
      this.onItemFound({
        distance: -1,
        url
      });
    });
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
    var shouldPopulate = this.shouldPopulateItem(item.url);

    // TODO: metadata service should keep
    // `url` key the same and return `finalUrl`
    // to represent the url after redirects
    item.originalUrl = item.url;
    this.onUpdate(item);

    if (!shouldPopulate) return;

    debug('fetching metadata ...');
    metadata(item.url)
      .then((data) => {
        if (!data) return debug('metadata fetch failed', item.url);
        debug('got metadata: %s', item.url, data);
        this.onUpdate(data);
      })

      .catch(err => {
        console.info(err);
        if (!isNetworkError(err)) return;
        this.emit('networkerror', err);
      });
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
