'use strict';

/**
 * Dependencies
 */

const { bindActionCreators } = require('redux');
const store = require('./');

/**
 * Exports
 */

module.exports = bindActionCreators({
  updateItem(id, update) {
    return {
      type: 'UPDATE_ITEM',
      id,
      update
    };
  },

  setItemMetadata(id, metadata) {
    return {
      type: 'SET_ITEM_METADATA',
      metadata,
      id
    };
  },

  setOpenItem(id) {
    return {
      type: 'SET_OPEN_ITEM',
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
      type: 'SUBSCRIPTIONS_FETCHING'
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
}, store.dispatch);
