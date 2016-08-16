'use strict';

/**
 * Dependencies
 */

const ga = require('react-native-google-analytics-bridge');
const { analyticsTrackerId } = require('../../config');
const { AsyncStorage } = require('react-native');
const debug = require('../debug')('Tracker');

const env = global.__DEV__ ? 'development' : 'production';
const trackerId = analyticsTrackerId[env];

class Tracker {
  constructor() {
    this.storage = AsyncStorage;
    ga.setTrackerId(trackerId);
  }

  view(name) {
    debug('view', name);
    ga.trackScreenView(name);
  }

  timing(category, name, start) {
    var ms = Date.now() - start;
    ga.trackTiming(category, ms, { name });
    debug('timing', category, name, ms);
  }

  event(category, name) {
    debug('track event', category, name);
    ga.trackEvent(category, name);
  }

  /**
   * Tracks an event only once for the
   * app installation lifetime.
   *
   * @param  {String} category
   * @param  {String} action
   * @param  {String} [label]
   * @param  {Number} [value]
   * @return {Promise}
   */
  eventOnce(category, action, label, value) {
    const KEY = `${category}_${action}_${label}`;

    return this.storage.getItem(KEY)
      .then(v => {
        if (v) return Promise.resolve(true);
        return this.storage.setItem(KEY, 'true')
          .then(() => false);
      })

      .then(installed => {
        if (!installed) {
          debug('event once', category, action);
          ga.trackEvent(category, action, { label, value });
          return true;
        }

        return false;
      });
  }

  /**
   * Record app launch.
   *
   * We also call the `firstLaunch()` as this
   * will only ever be recorded once thanks
   * to the `.eventOnce()` helper.
   */
  appLaunch() {
    debug('app launch');
    ga.trackEvent('system', 'app-process-launch');
    this.firstAppLaunch();
  }

  firstAppLaunch() {
    this.eventOnce('system', 'first-app-launch');
  }

  itemFound(originalUrl) {
    ga.trackEvent('system', 'item-found', {
      label: `originalUrl:${originalUrl}`
    });
  }

  itemPopulated(originalUrl, finalUrl) {
    ga.trackEvent('system', 'item-populated', {
      label: `originalUrl:${originalUrl},finalUrl:${finalUrl}`
    });
  }

  appInBackground() {
    debug('app-in-background');
    ga.trackEvent('interaction', 'app-in-background');
  }

  appInForeground() {
    debug('app-in-foreground');
    ga.trackEvent('interaction', 'app-in-foreground');
  }

  appLaunchFromNotification() {
    debug('app launch from notification');
    ga.trackEvent('interaction', 'app-launch-from-notification');
  }

  notificationDismiss() {
    debug('notification dismiss');
    ga.trackEvent('interaction', 'notification-dismiss');
  }

  tapListItem(url) {
    debug('tap:list-item');
    ga.trackEvent('interaction', 'tap-list-item', {
      label: url,
      value: 1
    });
  }

  pullRefresh() {
    ga.trackEvent('interaction', 'pull-refresh');
  }
}

/**
 * Exports
 */

module.exports = new Tracker();
