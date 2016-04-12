
/**
 * Dependencies
 */

var debug = require('../debug')('Metadata');

/**
 * Locals
 */

var endpoint = 'http://10.246.27.23:3000'; // endpoint of metadata service

function Metadata() {
  this.batch = [];
}

Metadata.prototype = {
  get(url) {
    debug('get');
    var index = this.batch.length;
    this.batch.push({ url: url });
    return this.enqueue()
      .then(function(response) {
        debug('response', response);
        var item = response[index];
        if (!item) return debug('null response', url);
        return item;
      }).catch(console.error.bind(console));
  },

  enqueue() {
    if (this.pending) return this.pending.promise;
    this.pending = new Deferred();

    var self = this;
    setTimeout(function() {
      request({ objects: self.batch })
        .then(function(json) {
          self.pending.resolve(json);
          delete self.pending;
          self.batch = [];
        });
    }, 200);

    return this.pending.promise;
  }
};

/**
 * Exports
 */

module.exports = new Metadata();

/**
 * Utils
 */

function request(body) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var data = JSON.stringify(body);

    xhr.open('POST', endpoint + '/api/v1/metadata', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onerror = reject;
    xhr.onload = function() {
      debug('response');
      resolve(JSON.parse(xhr.responseText));
    };

    xhr.send(data);
    debug('request sent', body);
  });
}

function Deferred() {
  this.promise = new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
  }.bind(this));
}
