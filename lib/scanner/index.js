'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const ReactNative = require('react-native');
const fetchMetadata = require('./metadata');
const track = require('../utils/tracker');
const config = require('../../config');

const {
  Alert,
  Platform,
  NativeModules,
  DeviceEventEmitter,
} = ReactNative;

const MagnetScanner = NativeModules.MagnetScannerReact;
const PromptBluetooth = NativeModules.PromptBluetoothReact;
const EXPIRE_CHECK_INTERVAL = 5000; // every 5 secs

/**
 * A JS interface for the Native `magnet-scanner-android`
 * and `magnet-scanner-ios` parts.
 *
 * Written in a stateless way so that all state
 * can be held in one place: the Redux store.
 *
 * @type {Class}
 * @extends {Emitter}
 */
class Scanner extends Emitter {
  constructor(options) {
    super();
    this.expiryEnabled = options.expiryEnabled;
    this.onMetadata = options.onMetadata;
    this.onUpdate = options.onUpdate;
    this.getItems = options.getItems;
    this.onLost = options.onLost;
  }

  start() {
    debug('start');
    this.startExpireCheck();
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
    this.stopExpireCheck();
    this.listener.remove();
  }

  startExpireCheck() {
    this.nextExpireCheck = setTimeout(() => {
      this.checkExpired();
      this.startExpireCheck();
    }, EXPIRE_CHECK_INTERVAL);
  }

  stopExpireCheck() {
    clearTimeout(this.nextExpireCheck);
  }

  checkExpired() {
    if (!this.expiryEnabled()) return;
    
    var now = Date.now();
    this.getItems().forEach(item => {
      var isMdns = item.distance === -1;
      if (isMdns) return;

      var age = now - item.timeLastSeen;

      // when an item expires,
      // it is removed from the list
      if (age > config.itemExpires) {
        debug('item expired', item.id);
        return this.onLost(item.id);
      }

      // when an item is 'expiring' it is greyed out
      var expiring = age > config.itemExpiring;
      this.onUpdate(item.id, { expiring: expiring });
    });
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
        distance: Infinity,
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
  onItemFound({ url, distance }) {
    debug('item found', url);
    const isNew = this.itemIsNew(url);

    this.onUpdate(url, {
      id: url,
      url,
      distance,
      timeLastSeen: Date.now()
    });

    // don't populate if item already found
    if (!isNew) return;

    track.itemFound(url);
    const start = Date.now();

    debug('fetching metadata ...');
    fetchMetadata(url)
      .then((metadata) => {
        if (!metadata) return debug('metadata fetch failed', url);
        debug('got metadata: %s', url, metadata);
        track.timing('system', 'fetch-metadata', start);
        track.itemPopulated(url, metadata.unadaptedUrl);
        this.onMetadata(url, metadata);
      })

      .catch(err => {
        console.info(err);
        if (!isNetworkError(err)) return;
        this.emit('networkerror', err);
      });
  }

  itemIsNew(id) {
    return !this.getItems().some(item => item.id === id);
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
