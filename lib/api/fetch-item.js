'use strict';

/**
 * Dependencies
 */

const { searchServiceUrl } = require('../../config');
const debug = require('../debug')('get-item');
const api = require('.');

/**
 * Exports
 */

module.exports = function(url) {
  return Promise.all([
      fetchBeaconData(url),
      fetchMetadata(url),
    ])

    .then(results => {
      var item = results[0][0];
      var metadata = results[1][0];

      return {
        ...item,
        metadata,
      };
    });
};

function fetchMetadata(url) {
  return api.postArray('metadata', [url]);
}

function fetchBeaconData(url) {
  debug('fetch beacon data', url);
  const request = new Request(searchServiceUrl, {
    method: 'post',
    headers: new Headers({ 'Content-Type': 'application/json;charset=utf-8' }),
    body: JSON.stringify([url]),
  });

  return fetch(request)
    .then(res => res.json())
    .catch(() => {
      debug('no beacon data', url);
      return [];
    });
}
