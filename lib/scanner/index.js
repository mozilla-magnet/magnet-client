'use strict';

/**
 * Dependencies
 */

const Emitter = require('events').EventEmitter;
const debug = require('../debug')('Scanner');
const ReactNative = require('react-native');
const config = require('../../config');

const {
  Alert,
  NativeModules,
  DeviceEventEmitter,
  InteractionManager,
} = ReactNative;

const MagnetScanner = NativeModules.MagnetScannerReact;

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
    this.onFound = options.onFound;
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
      });
  }

  stop() {
    debug('stop');
    MagnetScanner.stop();
    return Promise.resolve();
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

  /**
   * Called when an item is found by the scanner.
   * Can be called several times per second.
   *
   * We don't fire the callback until all interactions
   * (touches/animations) are complete to prevent
   * re-rendering and dropping frames.
   */
  onItemFound({ url, distance, latitude, longitude }) {
    InteractionManager.runAfterInteractions(() => {
      debug('item found', url);
      const id = url;
      this.onFound(id, {
        distance,
        latitude,
        longitude,
      });
    });
  }
}

/**
 * Exports
 */

module.exports = Scanner;
