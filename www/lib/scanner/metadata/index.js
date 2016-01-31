
/**
 * Logger
 *
 * @return {Function}
 */
var debug = 0 ? console.log.bind(console, '[metadata]') : function() {};

var endpoint = 'http://10.246.27.23:3030'; // endpoint of metadata service

function Metadata() {
  this.batch = [];
}

Metadata.prototype = {
  get: function(url) {
    debug('get');
    var index = this.batch.length;
    this.batch.push({ url: url });
    return this.enqueue()
      .then(function(response) {
        debug('response', response);
        var item = response[index];

        // Shim, remove once types are implemented
        if (item.twitter) item.type = 'twitter';
        if (item.android) item.type = 'android';
        if (item.og_data) item.type = item.og_data.type;

        // fallback
        item.type = item.type || 'website';

        return item;
      }).catch(console.error.bind(console));
  },

  enqueue: function() {
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
