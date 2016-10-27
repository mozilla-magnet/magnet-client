'use strict';

// Shim API until ios native side ready
module.exports = {
  get() {
    return Promise.resolve([]);
  },

  add() {
    return Promise.resolve(false);
  }
}
