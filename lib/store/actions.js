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

let watchID = null;

/**
 * Exports
 */

const actions = {
  itemFound(id, value) {
    return (dispatch, getState) => {
      const exists = getState().itemsNearby.indexOf(id) > -1;
      if (!exists) dispatch(actions.newItemFound(id, value));
      else dispatch(actions.itemUpdated(id, value));
    };
  },

  newItemFound(id, value) {
    track.itemFound(id);
    return {
      type: 'ITEM_FOUND',
      id,
      value,
    };
  },

  itemUpdated(id, value) {
    return {
      type: 'ITEM_UPDATED',
      id,
      value,
    };
  },

  itemLost(id) {
    track.itemLost(id);
    return {
      type: 'ITEM_LOST',
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
    track.itemFetched(id, value.url);
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

  refreshItems() {
    track.pullRefresh();
    return {
      type: 'REFRESH_ITEMS',
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

  subscriptionsFetching() {
    return {
      type: 'SUBSCRIPTIONS_FETCHING',
    };
  },

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
    track.channelSubscribed(channel_id);
    return {
      type: 'SUBSCRIBED',
      channel_id,
    };
  },

  unsubscribed(channel_id) {
    track.channelUnsubscribed(channel_id);
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

  startWatchingLocation() {
    return (dispatch) => {
      dispatch(actions.locationWatchingStarted());
      watchID = navigator.geolocation.watchPosition(
        ({ coords }) => dispatch(actions.locationChanged(coords))
      );
    };
  },

  stopWatchingLocation() {
    return (dispatch) => {
      navigator.geolocation.clearWatch(watchID);
      watchID = null;
      dispatch(actions.locationWatchingStopped());
    };
  },

  locationWatchingStarted () {
    return {
      type: 'LOCATION_WATCHING_STARTED',
    };
  },

  locationWatchingStopped ()  {
    return {
      type: 'LOCATION_WATCHING_STOPPED',
    };
  },

  locationChanged ({ latitude, longitude })  {
    return {
      type: 'LOCATION_CHANGED',
      latitude,
      longitude,
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
