
/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[metadata]') : function() {};

var endpoint = 'http://192.168.0.5:3030'; // endpoint of metadata service

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
        if (!item) return debug('null response', url);
        return normalize(item);
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

function normalize(data) {
  var normalized = {
    url: data.url,
    type: data.type || 'website',
    title: data.title || data.url,
    description: data.description,
    icon: data.icon,
    embed: data.embed
  };

  if (data.og_data) normalizeOg(normalized, data.og_data);
  if (data.twitter) normalizeTwitter(normalized, data.twitter);
  if (data.android) normalizeAndroid(normalized, data.android);

  return normalized;
}

function normalizeOg(result, og) {
  if (og.description) result.description = og.description;
  if (og.title) result.title = og.title;
  if (og.image) result.image = og.image;
  result.data = og;
}

function normalizeTwitter(result, twitter) {
  result.type = 'profile';
  if (twitter.description) result.description = twitter.bio;
  if (twitter.avatar.alt) result.title = twitter.avatar.alt;
  if (twitter.user_id) result.title2 = twitter.user_id;
  // if (twitter.avatar.src) result.image = twitter.avatar.src;
  if (twitter.avatar.src) result.icon = twitter.avatar.src;
  twitter.type = 'twitter';
  result.data = twitter;
}

function normalizeAndroid(result, android) {
  result.type = 'profile';
  if (android.icon) result.icon = android.icon;
  if (android.name) result.title = android.name;
  android.type = 'android';
  result.data = android;
}

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
