'use strict';

/**
 * Dependencies
 */

var debug = require('../../debug')('metadata');
var clientside = require('./clientside');
var serverside = require('./serverside');

/**
 * Get the metadata for a given URL.
 *
 * @param  {String} url
 * @return {Promise}
 */
module.exports = function(url) {
  debug('get metadata', url);
  return (isInternal(url))
    ? clientside(url)
    : serverside(url);
};

/**
 * A crude test for internal urls.
 *
 * We should find the local IP of
 * the device and test for a matching
 * subnet mask.
 *
 * Worst case scenario is that an external
 * URI is fetched clientside. Better that
 * than an internal URL failing to be
 * fetched serverside.
 *
 * @param  {String}  url
 * @return {Boolean}
 */
function isInternal(url) {
  return /\.local/.test(url)
    || isIp(url)
}

function isIp(string) {
  return /^https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(string);
}
