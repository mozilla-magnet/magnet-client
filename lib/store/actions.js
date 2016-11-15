'use strict';

/**
 * Dependencies
 */

const { bindActionCreators } = require('redux');
const fetchItem = require('../api/fetch-item');
const { isNetworkError } = require('../utils');
const debug = require('../debug')('actions');
const track = require('../utils/tracker');
const { dispatch } = require('.');
const api = require('../api');

const {
  INCOMPLETE,
  COMPLETE,
  ERROR,
  HEALTHY,
} = require('./constants');

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

  fetchItemIfNeeded(id) {
    return (dispatch, getState) => {
      if (!id) return Promise.resolve();
      if (!shouldFetchItem(getState(), id)) return Promise.resolve();

      dispatch(actions.itemFetching(id));

      return fetchItem(id)
        .then(item => {
          dispatch(actions.networkStatusUpdate(HEALTHY));
          dispatch(actions.itemFetched(id, item));
        })

        .catch(e => {
          dispatch(actions.itemFetchErrored(id, e));
          if (isNetworkError(e)) dispatch(actions.networkStatusUpdate(ERROR));
        });
    };
  },

  itemFetching(id) {
    return {
      type: 'ITEM_FETCHING',
      id,
    };
  },

  itemFetched(id, value) {
    return {
      type: 'ITEM_FETCHED',
      id,
      value,
    };
  },

  itemFetchErrored(id, value) {
    return {
      type: 'ITEM_FETCH_ERRORED',
      value,
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

  fetchChannelsIfNeeded() {
    return (dispatch, getState) => {
      if (!shouldFetchChannels(getState())) return Promise.resolve();

      // update local state
      dispatch(actions.channelsFetching());
      debug('fetching channels ...');

      // fetch remote data
      return api.get('channels')
        .then(result => dispatch(actions.channelsFetched(result)))
        .catch(err => dispatch(actions.channelsFetchErrored(err)));
    };
  },

  channelsFetching() {
    return {
      type: 'CHANNELS_FETCHING',
    };
  },

  channelsFetched(value) {
    return {
      type: 'CHANNELS_FETCHED',
      value,
    };
  },

  channelsFetchErrored(value) {
    return {
      type: 'CHANNELS_FETCH_ERRORED',
      value,
    };
  },

  fetchSubscriptionsIfNeeded() {
    return (dispatch, getState) => {
      if (!shouldFetchSubscriptions(getState())) return Promise.resolve();

      // update local state
      dispatch(actions.subscriptionsFetching());
      debug('fetching subscriptions ...');

      // fetch remote data
      return api.get('subscriptions')
        .then(result => dispatch(actions.subscriptionsFetched(result)))
        .catch(err => dispatch(actions.subscriptionsFetchErrored(err)));
    };
  },

  // TODO: Migrate to async action like `items`
  subscriptionsFetching() {
    return {
      type: 'SUBSCRIPTIONS_FETCHING',
    };
  },

  // TODO: Migrate to async action like `items`
  subscriptionsFetched(value) {
    return {
      type: 'SUBSCRIPTIONS_FETCHED',
      value,
    };
  },

  subscriptionsFetchErrored(value) {
    return {
      type: 'SUBSCRIPTIONS_FETCH_ERRORED',
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

  networkStatusUpdate(value) {
    return {
      type: 'NETWORK_STATUS_UPDATE',
      value: {
        status: value,
        timestamp: Date.now(),
      },
    };
  },
};

function shouldFetchItem(state, id) {
  const item = state.items[id];
  if (!item) return true;

  switch (item.status) {
    case COMPLETE:
    case INCOMPLETE:
    case ERROR:
      return false;
    default:
      return true;
  }
}

function shouldFetchChannels({ channels }) {
  switch (channels.status) {
    case COMPLETE:
    case INCOMPLETE:
      return false;
    case ERROR:
    default:
      return true;
  }
}

function shouldFetchSubscriptions({ subscriptions }) {
  switch (subscriptions.status) {
    case COMPLETE:
    case INCOMPLETE:
      return false;
    case ERROR:
    default:
      return true;
  }
}

module.exports = actions;
module.exports.bound = bindActionCreators(actions, dispatch);
