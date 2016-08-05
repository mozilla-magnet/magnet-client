'use strict';

/**
 * Dependencies
 */

const ga = require('react-native-google-analytics-bridge');
const { analyticsTrackerId } = require('../../config');
const debug = require('../debug')('Tracker',1);

const env = global.__DEV__ ? 'development' : 'production';
const trackerId = analyticsTrackerId[env];

class Tracker {
  constructor() {
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
