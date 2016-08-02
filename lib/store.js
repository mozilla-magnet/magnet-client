'use strict';

/**
 * Dependencies
 */

const { createStore, bindActionCreators } = require('redux');
const actionCreators = require('./action-creators');
const debug = require('./debug')('store');

const initialState = {
  items: [],
  openItem: null,
  indicateScanning: undefined
};

var itemId = 1;

const reducer = (state, action) => {
  if (!state) return initialState;
  debug('action', action.type, action);

  switch (action.type) {
    case 'UPDATE_ITEM': return updateItem(state, action.item);
    case 'CLEAR_ITEMS': return { ...state, items: [] };
    case 'OPEN_ITEM': return openItem(state, action.originalUrl);
    case 'CLOSE_ITEM': return { ...state, openItem: null };
    case 'INDICATE_SCANNING': return { ...state, indicateScanning: action.value };
    default: return state;
  }
};

function updateItem(state, item) {
  var existing = findItem(state.items, item.originalUrl);
  if (!existing) return addItem(state, item);
  debug('update item', item);

  var updated = { ...existing.item, ...item };

  // dont' mutate if objects are equal (shallow)
  if (equal(existing.item, updated)) return state;

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
  debug('add item', item);
  item = { ...item, id: itemId++ };

  return {
    ...state,
    items: [
      item,
      ...state.items
    ]
  };
}

function openItem(state, originalUrl) {
  debug('open item', originalUrl);

  var result = findItem(state.items, originalUrl);
  if (!result) return state;

  return {
    ...state,
    openItem: result.item
  };
}

function findItem(items, url) {
  for (var i = 0; i < items.length; i++) {
    if (items[i].originalUrl === url) return { index: i, item: items[i] };
  }
}

function equal(a, b) {
  for (var key in b) {
    if (!b.hasOwnProperty(key)) continue;
    if (a[key] !== b[key]) return false;
  }

  return true;
}

/**
 * Exports
 */

exports = module.exports = createStore(reducer);
exports.actions = bindActionCreators(actionCreators, exports.dispatch);
