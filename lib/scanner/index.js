'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const ReactNative = require('react-native');
const track = require('../utils/tracker');
const config = require('../../config');

const {
  Alert,
  NativeModules,
  DeviceEventEmitter,
} = ReactNative;

const MagnetScanner = NativeModules.MagnetScannerReact;
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
    this.started = false;
    this.expiryEnabled = options.expiryEnabled;
    this.onFound = options.onFound;
    this.onUpdate = options.onUpdate;
    this.getItems = options.getItems;
    this.onLost = options.onLost;

    this.listener = DeviceEventEmitter
      .addListener('magnetscanner:itemfound', this.onItemFound.bind(this));
  }

  start() {
    debug('start');
    return MagnetScanner.start()
      .then(() => {
        debug('started');
        this.injectTestUrls();
        this.startExpireCheck();
      });
  }

  stop() {
    debug('stop');
    MagnetScanner.stop();
    this.stopExpireCheck();
    return Promise.resolve();
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

      // mdns and test urls don't have a distance and
      // don't expire in the same way as ble beacons
      if (typeof item.distance != 'number') return;

      var age = now - item.timeLastSeen;

      // when an item expires,
      // it is removed from the list
      if (age > config.itemExpires) {
        debug('item expired', item.id);
        this.onLost(item.id);
        return;
      }

      // when an item is 'expiring' it is greyed out
      var expiring = age > config.itemExpiring;
      if (expiring) this.onItemExpiring(item.id);
    });
  }

  /**
   * Show a dialog to warn the user of the
   * consequences of not having bluetooth
   * turned on.
   *
   * We wait a few ms before prompting to
   * avoid a strange bug on android when
   * showing consecutive modals too quickly
   * prevents them from showing.
   *
   * @return {Promise}
   */
  showWarning() {
    return new Promise(resolve => {
      setTimeout(() => {
        Alert.alert(
          'Functionality limited',
          'Since bluetooth has not been enabled, Project Magnet will not be able to discover content',
          [
            {
              text: 'Cancel',
              onPress: resolve,
            },
            {
              text: 'Enable',
              onPress: () => resolve(true),
            },
          ]
        );
      }, 100);
    });
  }

  injectTestUrls() {
    if (!config.flags.injectTestUrls) return;
    config.testUrls.forEach(url => {
      this.onItemFound({ url });
    });
  }

  onItemFound({ url, distance }) {
    debug('item found', url);
    const id = url;
    const isNew = this.itemIsNew(id);
    this.onFound(id, { distance });
    if (isNew) track.itemFound(url);
  }

  itemIsNew(id) {
    return !this.getItems()[id];
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
