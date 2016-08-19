'use strict';

/**
 * Dependencies
 */

const { createStore } = require('redux');
const reducer = require('./reducer');

/**
 * Exports
 */

module.exports = createStore(reducer);
