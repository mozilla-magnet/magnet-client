'use strict';

/**
 * Dependencies
 */

import { createStore, applyMiddleware } from 'redux';
import reducer from './reducer';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

const middlewares = [
  thunk,
];

if (global.__DEV__) {
  middlewares.push(createLogger({
    collapsed: true,
    diff: true,
  }));
}

/**
 * Exports
 */

module.exports = createStore(
  reducer,
  applyMiddleware.apply(null, middlewares)
);
