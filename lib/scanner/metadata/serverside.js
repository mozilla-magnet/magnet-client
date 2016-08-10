
/**
 * Dependencies
 */

var { metadataServiceUrl } = require('../../../config');
var debug = require('../../debug')('Metadata');

function Metadata() {
  this.batch = [];
}

Metadata.prototype = {
  get(url) {
    debug('get');

    var index = this.batch.length;
    this.batch.push({ url: url });

    return this.schedule(url)
      .then(responses => {
        var response = responses[index];
        debug('response', response);
        if (response.error) return Promise.reject(error(response.error));
        return response;
      });
  },

  schedule() {
    if (this.pending) return this.pending.promise;
    this.pending = new Deferred();

    setTimeout(() => {
      var promise = this.pending;

      request(this.batch)
        .then(json => promise.resolve(json))
        .catch(err => promise.reject(err));

      delete this.pending;
      this.batch = [];
    }, 200);

    return this.pending.promise;
  }
};

/**
 * Exports
 */

var metadata = new Metadata();
module.exports = function(url) {
  return metadata.get(url);
};

/**
 * Utils
 */

function request(urls) {
  debug('request', metadataServiceUrl, urls);

  var request = new Request(metadataServiceUrl, {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json;charset=utf-8'
    }),

    body: JSON.stringify({ objects: urls })
  });

  return fetch(request)
    .then(res => res.json());
}

function error(message) {
  return new Error(message);
}

function Deferred() {
  this.promise = new Promise(function(resolve, reject) {
    this.resolve = resolve;
    this.reject = reject;
  }.bind(this));
}
