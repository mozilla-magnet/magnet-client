'use strict';

/**
 * Dependencies
 */

 const fetchItem = require('../api/fetch-item');
 const store = require('.');
 const {
   itemResolving,
   itemResolved,
   itemResolveErrored,
 } = require('./actions');


/**
 * Exports
 */

module.exports = function(id) {
  if (!id) {
    console.warn('`id` argument missing');
    return;
  }

  const item = getItem(id);
  if (item && item.status) return item;

  itemResolving(id);
  fetchItem(id)
    .then(item => {
      itemResolved(id, item);
    })

    .catch(e => {
      console.log('item resolve errored', e);
      itemResolveErrored(id, e);
    });

  // item isn't resolved yet
  return null;
};

function getItem(id) {
  const items = store.getState().items;
  return items[id];
}
