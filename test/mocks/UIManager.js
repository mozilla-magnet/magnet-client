
var sinon = require('sinon');

module.exports = {
  measureLayout: sinon.spy(function(node, relativeTo, onError, onSuccess) {
    onSuccess(0, 100);
  })
};
