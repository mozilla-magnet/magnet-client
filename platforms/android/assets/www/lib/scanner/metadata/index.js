
/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[metadata]') : function() {};

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
        if (!item) return debug('null response', url);

        // fallback
        item.type = getType(item);

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

function getType(data) {
  switch(true) {
    case !!data.twitter:
    case !!data.android: return 'profile';
    case !!data.og_data: return data.og_data.type;
    default: return data.type || 'website';
  }
}

function normalize(data) {
  var normalized = {
    type: getType(data),
    title: data.title,
    description: data.description,
    icon: data.icon,
    embed: data.embed
  };

  if (data.og_data) normalizeOg(normalized, data.og_data);
  if (data.twitter) normalizeTwitter(normalized, data);
  if (data.android) normalizeAndroid(normalized, data);

  return normalized;
}

function normalizeOg(result, og) {
  if (og.description) result.description = og.description;
  if (og.title) result.title = og.title;
}

function normalizeTwitter(result, twitter) {
  if (twitter.description) result.description = twitter.bio;
  if (twitter.avatar.alt) result.title = twitter.avatar.alt;
  if (twitter.user_id) result.title2 = twitter.user_id;
  if (twitter.avatar.src) result.image = twitter.avatar.src;
}

function normalizeAndroid(data) {
  var og = data.og_data;

  return {
    type: getType(data),
    title: (og && og.title) || data.title,
    description: (og && og.description) || data.description,
    icon: data.icon,
    image: (og && og.image) || data.image,
    embed: data.embed
  };
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
