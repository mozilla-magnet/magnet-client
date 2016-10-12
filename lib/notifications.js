'use strict';

/**
 * Dependencies
 */

const debug = require('./debug')('Notification');
const Emitter = require('events').EventEmitter;
const {
  DeviceEventEmitter,
  NativeModules,
  Platform,
} = require('react-native');

/**
 * Native @ReactMethod interface.
 *
 * @type {Object}
 */
const NotificationListener = NativeModules.NotificationListener;

/**
 * Exposes useful notification events
 * to JS land from Native land.
 */
class Notification extends Emitter {
  constructor() {
    super();
    this.listen();
  }

  listen() {
    DeviceEventEmitter.addListener('notification:applaunch', () => {
      debug('app launch');
      this.emit('applaunch');
    });

    // not implemented in ios yet
    if (Platform.OS === 'ios') return;
    DeviceEventEmitter.addListener('notification:dismiss', () => {
      debug('dismiss');
      this.emit('dismiss');
    });
  }

  /**
   * Detect if the app was first launched
   * (onCreate) from a notification.
   *
   * This is different from an app being
   * brought back to the foreground (onResume)
   *
   * @return {Promise<Boolean>}
   */
  launchedApp() {
    if (!NotificationListener) return Promise.resolve(false);
    return NotificationListener.appLaunchedFromNotification();
  }
}

/**
 * Exports
 */

module.exports = new Notification();
