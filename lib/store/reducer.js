'use strict';

/**
 * Dependencies
 */

const debug = require('../debug')('reducer');
const config = require('../../config');

const initialState = {
  items: [],
  openItem: null,
  indicateScanning: undefined,
  userFlags: config.userFlags,
  channels: {},
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
    case 'SET_OPEN_ITEM': return setOpenItem(state, action.id);
    case 'CLOSE_ITEM': return { ...state, openItem: null };
    case 'SET_INDICATE_SCANNING': return { ...state, indicateScanning: action.value };
    case 'SET_CHANNELS': return fetchChannels(state, action.state, action.value);
    default: return state;
  }
};

function updateItem(state, id, update) {
  var existing = findItem(state.items, id);
  if (!existing) return addItem(state, update);
  debug('update item', id);

  var updated = {
    ...existing.item,
    ...update
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
      ...state.items.slice(existing.index + 1)
    ]
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
    metadata: metadata
  };

  return {
    ...state,
    items: [
      ...state.items.slice(0, existing.index),
      updated,
      ...state.items.slice(existing.index + 1)
    ]
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
    regulatedDistance: null
  };

  setDistance(copy, item.distance);

  return {
    ...state,
    items: [
      copy,
      ...state.items
    ]
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
      ...state.items.slice(existing.index + 1)
    ]
  };
}

function setOpenItem(state, id) {
  var found = findItem(state.items, id);
  return {
    ...state,
    openItem: found && found.item
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
        value: value
      }
    }
  };
}

function fetchChannels(state, channelsState, value = null) {
  return {
    ...state,
    channels: {
      ...state.channels,
      state: channelsState,
      value,
    }
  };
}

function findItem(items, id) {
  debug('find item', id);
  if (!id) return null;

  var index;
  var item = items.find((item, i) => {
    index = i;
    return item.id === id
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
