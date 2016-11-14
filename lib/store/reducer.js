'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('reducer', 1);
const config = require('../../config');

const {
  INCOMPLETE,
  COMPLETE,
  ERROR,
} = require('./constants');

const initialState = {
  items: {},
  itemsNearby: [],
  openItem: null,

  indicateScanning: undefined,
  userFlags: config.userFlags,
  channels: {},

  subscriptions: {
    state: null,
    value: null,
  },
};

module.exports = (state, action) => {
  if (!state) return initialState;
  debug('action', action.type);

  switch (action.type) {
    case 'ITEM_FOUND': return itemFound(state, action.id, action.value);
    case 'ITEM_LOST': return itemLost(state, action.id);
    case 'ITEM_OPENED': return itemOpened(state, action.id);
    case 'ITEM_CLOSED': return itemClosed(state, action.id);
    case 'ITEM_RESOLVING': return itemResolving(state, action.id);
    case 'ITEM_RESOLVED': return itemResolved(state, action.id, action.value);
    case 'ITEM_RESOLVE_ERROR': return itemResolveError(state, action.id, action.value);
    case 'ITEM_EXPIRING': return itemExpiring(state, action.id);
    case 'CLEAR_ITEMS': return { ...state, items: [] };

    case 'SET_USER_FLAG': return setUserFlag(state, action.key, action.value);
    case 'SET_INDICATE_SCANNING': return { ...state, indicateScanning: action.value };
    case 'CHANNELS_FETCHING': return channelsFetching(state);
    case 'CHANNELS_FETCHED': return channelsFetched(state, action);
    case 'SUBSCRIPTIONS_FETCHING': return subscriptionsFetching(state);
    case 'SUBSCRIPTIONS_FETCHED': return subscriptionsFetched(state, action);
    case 'SUBSCRIBED': return subscribed(state, action);
    case 'UNSUBSCRIBED': return unsubscribed(state, action);
    case 'SUBSCRIPTION_UPDATED': return subscriptionUpdated(state, action);
    default: return state;
  }
};

function itemResolving(state, id) {
  debug('item resolving', id);
  var item = findItem(state.items, id) || createItem(id, {});

  return {
    ...state,
    items: {
      ...state.items,
      [id]: {
        ...item,
        status: INCOMPLETE,
      },
    },
  };
}

function itemResolved(state, id, value) {
  var item = findItem(state.items, id);
  if (!item) return state;
  debug('item resolved', id, item, value);

  return {
    ...state,
    items: {
      ...state.items,
      [id]: {
        ...item,
        status: COMPLETE,
        value: {
          ...item.value,
          ...value,
        },
      },
    },
  };
}

function itemResolveError(state, id, value) {
  debug('item resolve error', id, value);
  var item = findItem(state.items, id);
  if (!item) return state;

  return {
    ...state,
    items: {
      ...state.items,
      [id]: {
        status: ERROR,
        value: {
          ...item.value,
          error: value,
        },
      },
    },
  };
}

function itemFound(state, id, { distance }) {
  debug('item found', id);
  const items = state.items;
  const previous = findItem(items, id);

  // just update the distance if item already exists
  if (previous) return itemDistanceUpdated(state, id, distance);

  return {
    ...state,
    items: {
      ...items,
      [id]: createItem(id, { distance }),
    },

    itemsNearby: [
      ...state.itemsNearby,
      id,
    ],
  };
}

function itemDistanceUpdated(state, id, { distance }) {
  debug('item found', id);
  const previous = findItem(state.items, id);
  const items = state.items;

  const item = {
    ...previous,
    value: {
      ...previous.value,
      ...normalizeDistance(distance, previous.value),
    },
  };

  return {
    ...state,
    items: {
      ...items,
      [id]: item,
    },
  };
}

function itemExpiring(state, id) {
  debug('item expiring', id);
  const { items } = state;
  const item = findItem(items, id);
  if (!item) return state;

  return {
    ...state,
    items: {
      [id]: {
        ...item,
        value: {
          ...item.value,
          expiring: true,
        },
      },
    },
  };
}

function itemLost(state, id) {
  debug('item lost', id);
  const { itemsNearby } = state;

  var index = itemsNearby.indexOf(id);
  if (!~index) return state;

  return {
    ...state,
    itemsNearby: [
      ...itemsNearby.slice(0, index),
      ...itemsNearby.slice(index + 1),
    ],
  };
}

function itemOpened(state, id) {
  debug('item opened', id);
  return {
    ...state,
    openItem: id,
  };
}

function itemClosed(state) {
  debug('item closed');
  return {
    ...state,
    openItem: null,
  };
}

function setUserFlag(state, key, value) {
  debug('set user flag', key, value);
  var previous = state.userFlags[key];

  // disallow unknown keys
  if (typeof previous === 'undefined') return state;

  // don't update state if nothing changed
  if (previous.value === value) return state;

  return {
    ...state,
    userFlags: {
      ...state.userFlags,
      [key]: {
        ...previous,
        value: value,
      },
    },
  };
}

function channelsFetching(state) {
  debug('channels fetching');

  return {
    ...state,
    channels: {
      ...state.channels,
      isFetching: true,
    },
  };
}

function channelsFetched(state, { responseType, value }) {
  debug('channels fetched');

  return {
    ...state,
    channels: {
      ...state.channels,
      isFetching: false,
      responseType,
      value,
    },
  };
}

function subscriptionsFetching(state) {
  debug('subscriptions fetching');

  return {
    ...state,
    subscriptions: {
      ...state.subscriptions,
      isFetching: true,
    },
  };
}

function subscriptionsFetched(state, { responseType, value }) {
  debug('subscriptions fetched');

  return {
    ...state,
    subscriptions: {
      ...state.subscriptions,
      isFetching: false,
      responseType,
      value,
    },
  };
}

function subscribed(state, { channel_id }) {
  debug('subscribed', channel_id);

  return {
    ...state,
    subscriptions: {
      ...state.subscriptions,
      value: {
        ...state.subscriptions.value,
        [channel_id]: { channel_id },
      },
    },
  };
}

function unsubscribed(state, { channel_id }) {
  debug('unsubscribed', channel_id);

  const { subscriptions } = state;
  const value = subscriptions.value;

  delete value[channel_id];

  return {
    ...state,
    subscriptions: {
      ...subscriptions,
      value,
    },
  };
}

function subscriptionUpdated(state, { subscription }) {
  debug('subscription updated', subscription);
  var value = state.subscriptions.value;
  var { channel_id } = subscription;
  var existing = value[channel_id];

  if (!existing) return state;

  return {
    ...state,
    subscriptions: {
      ...state.subscriptions,
      value: {
        ...value,
        [channel_id]: {
          ...subscription,
        },
      },
    },
  };
}

/**
 * Utils
 */

function findItem(items, id) {
  debug('find item', id);
  return items[id];
}

function createItem(id, { distance }) {
  return {
    id,
    status: null,
    value: {
      url: id,
      ...normalizeDistance(distance, {}),
    },
  };
}

function normalizeDistance(newDistance, { _distanceHistory=[] }) {
  if (typeof newDistance != 'number' || newDistance === -1) {
    return {
      distance: null,
      _distanceHistory: [],
    };
  }

  // copy
  _distanceHistory = _distanceHistory.slice();
  _distanceHistory.push(newDistance);

  // enforce max-length
  var length = _distanceHistory.length;
  if (length > 5) _distanceHistory.shift();

  // calculate normalized distance
  const distance = roundDistance(getAverage(_distanceHistory));
  debug('regulated distance', _distanceHistory, distance);

  return {
    distance,
    _distanceHistory,
  };
}

function roundDistance(value) {
  const toNearest = 2;
  return Math.max(2, Math.round(value / toNearest) * toNearest);
}

function getAverage(array) {
  if (array.length === 1) return array[0];
  var sum = array.reduce((sum, distance) => sum + distance, 0);
  return sum / array.length;
}

function equal(a, b) {
  for (var key in b) {
    if (!b.hasOwnProperty(key)) continue;
    if (a[key] !== b[key]) return false;
  }

  return true;
}
