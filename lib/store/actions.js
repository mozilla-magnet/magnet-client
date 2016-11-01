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

  setChannels(state, value) {
    return {
      type: 'SET_CHANNELS',
      state,
      value,
    };
  },

  subscriptionsFetch(eventState, value) {
    return {
      type: 'SUBSCRIPTIONS_FETCH',
      eventState,
      value,
    };
  },

  subscriptionChange(channelId, value) {
    console.log('SUBBBBB', channelId, value);
    return {
      type: 'SUBSCRIPTION_CHANGE',
      channelId,
      value,
    };
  }
}, store.dispatch);
