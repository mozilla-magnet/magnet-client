
var sinon = require('sinon');

module.exports = {
  measureLayout: sinon.spy(function(relativeTo, callback) {
    callback(0, 100);
  })
};
