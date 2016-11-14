'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('reducer');
const config = require('../../config');

const initialState = {
  items: [],
  openItem: {
    isFetching: false,
    value: null,
  },
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
    case 'UPDATE_ITEM': return updateItem(state, action.id, action.update);
    case 'REMOVE_ITEM': return removeItem(state, action.id);
    case 'SET_ITEM_METADATA': return setItemMetadata(state, action.id, action.metadata);
    case 'SET_USER_FLAG': return setUserFlag(state, action.key, action.value);
    case 'CLEAR_ITEMS': return { ...state, items: [] };
    case 'OPEN_ITEM_FETCHING': return openItemFetching(state, action);
    case 'OPEN_ITEM_FETCHED': return openItemFetched(state, action);
    case 'OPEN_ITEM_CLOSED': return openItemClosed(state, action);
    case 'CLOSE_ITEM': return { ...state, openItem: null };
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

function updateItem(state, id, update) {
  var existing = findItem(state.items, id);
  if (!existing) return addItem(state, update);
  debug('update item', id);

  var updated = {
    ...existing.item,
    ...update,
  };

  setDistance(updated, update.distance);

  // don't mutate if objects are equal (shallow)
  if (equal(existing.item, updated)) {
    debug('item didnt change', id);
    return state;
  }

  return {
    ...state,
    items: [
      ...state.items.slice(0, existing.index),
      updated,
      ...state.items.slice(existing.index + 1),
    ],
  };
}

function setDistance(item, newDistance) {
  if (typeof newDistance != 'number' || newDistance === -1) return;
  var distances = item.distances;
  distances.push(newDistance);
  var length = distances.length;
  if (length > 5) distances.shift();
  item.regulatedDistance = roundDistance(getAverage(distances));
  debug('regulated distance', distances, item.regulatedDistance);
}

function setItemMetadata(state, id, metadata) {
  var existing = findItem(state.items, id);
  if (!existing) return state;

  var updated = {
    ...existing.item,
    metadata: metadata,
  };

  return {
    ...state,
    items: [
      ...state.items.slice(0, existing.index),
      updated,
      ...state.items.slice(existing.index + 1),
    ],
  };
}

function addItem(state, item) {
  debug('add item', item.id);
  var copy = {
    ...item,
    id: item.id,
    url: item.url,
    expiring: false,
    distance: null,
    distances: [],
    regulatedDistance: null,
  };

  setDistance(copy, item.distance);

  return {
    ...state,
    items: [
      copy,
      ...state.items,
    ],
  };
}

function removeItem(state, id) {
  debug('remove item', id);
  var existing = findItem(state.items, id);
  if (!existing) return state;

  return {
    ...state,
    items: [
      ...state.items.slice(0, existing.index),
      ...state.items.slice(existing.index + 1),
    ],
  };
}

function setOpenItem(state, item) {
  return {
    ...state,
    openItem: item,
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
  return {
    ...state,
    channels: {
      ...state.channels,
      isFetching: true,
    },
  };
}

function channelsFetched(state, { responseType, value }) {
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

function openItemFetching(state) {
  debug('open item fetching');

  return {
    ...state,
    openItem: {
      ...state.openItem,
      isFetching: true,
    },
  };
}

function openItemFetched(state, { value }) {
  debug('open item fetched');

  // the item may have been closed before the fetch finished
  if (!state.openItem.isFetching) return state;

  return {
    ...state,
    openItem: {
      ...state.openItem,
      isFetching: false,
      value,
    },
  };
}

function openItemClosed(state) {
  debug('open item fetching');

  return {
    ...state,
    openItem: {
      ...state.openItem,
      isFetching: false,
      value: null,
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

function findItem(items, id) {
  debug('find item', id);
  if (!id) return null;

  var index;
  var item = items.find((item, i) => {
    index = i;
    return item.id === id;
  });

  return item ? { item, index } : null;
}

function roundDistance(value) {
  const toNearest = 2;
  return Math.max(2, Math.round(value / toNearest) * toNearest);
}

function getAverage(array) {
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
