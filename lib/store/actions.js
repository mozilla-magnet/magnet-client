'use strict';

/**
 * Dependencies
 */

const { bindActionCreators } = require('redux');
const store = require('.');

/**
 * Exports
 */

const actions = {
  itemFound(id, value) {
    return {
      type: 'ITEM_FOUND',
      id,
      value,
    };
  },

  itemLost(id) {
    return {
      type: 'ITEM_LOST',
      id,
    };
  },

  itemOpened(id) {
    return {
      type: 'ITEM_OPENED',
      id,
    };
  },

  itemClosed(id) {
    return {
      type: 'ITEM_CLOSED',
      id,
    };
  },

  itemResolving(id) {
    return {
      type: 'ITEM_RESOLVING',
      id,
    };
  },

  itemResolved(id, value) {
    return {
      type: 'ITEM_RESOLVED',
      id,
      value,
    };
  },

  itemResolveErrored(id, value) {
    return {
      type: 'ITEM_RESOLVE_ERRORED',
      value,
    };
  },

  itemExpiring(id) {
    return {
      type: 'ITEM_EXPIRING',
      id,
    };
  },

  removeItem(id) {
    return {
      type: 'REMOVE_ITEM',
      id,
    };
  },

  clearItems() {
    return {
      type: 'CLEAR_ITEMS',
    };
  },

  setIndicateScanning(value) {
    return {
      type: 'SET_INDICATE_SCANNING',
      value,
    };
  },

  setUserFlag(key, value) {
    return {
      type: 'SET_USER_FLAG',
      key,
      value,
    };
  },

  channelsFetching() {
    return {
      type: 'CHANNELS_FETCHING',
    };
  },

  channelsFetched(responseType, value) {
    return {
      type: 'CHANNELS_FETCHED',
      responseType,
      value,
    };
  },

  setChannels(state, value) {
    return {
      type: 'SET_CHANNELS',
      state,
      value,
    };
  },

  subscriptionsFetching() {
    return {
      type: 'SUBSCRIPTIONS_FETCHING',
    };
  },

  subscriptionsFetched(responseType, value) {
    return {
      type: 'SUBSCRIPTIONS_FETCHED',
      responseType,
      value,
    };
  },

  subscribed(channel_id) {
    return {
      type: 'SUBSCRIBED',
      channel_id,
    };
  },

  unsubscribed(channel_id) {
    return {
      type: 'UNSUBSCRIBED',
      channel_id,
    };
  },

  subscriptionUpdated(subscription) {
    return {
      type: 'SUBSCRIPTION_UPDATED',
      subscription,
    };
  },
};

module.exports = bindActionCreators(actions, store.dispatch);
module.exports.actions = actions;
