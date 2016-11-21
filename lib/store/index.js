'use strict';

/**
 * Dependencies
 */

import { createStore, applyMiddleware } from 'redux';
import reducer from './reducer';
import thunk from 'redux-thunk';

/**
 * Exports
 */

module.exports = createStore(
  reducer,
  applyMiddleware(thunk)
);
