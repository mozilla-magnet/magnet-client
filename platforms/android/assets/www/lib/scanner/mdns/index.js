
/**
 * Dependencies
 */

var Emitter = require('events');

var debug = 1 ? console.log.bind(console, '[MDNS]') : function() {};

/**
 * Exports
 */

module.exports = MDNS;

/**
 * Extends `Emitter`
 */

MDNS.prototype = Object.create(Emitter.prototype);

function MDNS() {
  Emitter.call(this);
  this.zeroconf = window.ZeroConf;
  this.cache = {};
}

MDNS.prototype.start = function() {
  this.zeroconf.watch('_http._tcp.local.', this.onStateChange.bind(this));
  debug('started');
};

MDNS.prototype.stop = function() {

};

MDNS.prototype.onStateChange = function(item) {
  debug('change', item);
  switch (item.action) {
    case 'added': return this.onFound(item.service);
    case 'removed': return this.onLost(item.service);
  }
};

MDNS.prototype.onFound = function(service) {
  debug('found', service);
  var url = service.urls && service.urls[0];
  if (!url) return;
  this.cache[url] = service;
  this.emit('found', url);
};

MDNS.prototype.onLost = function(service) {
  debug('lost', service);
  var url = service.urls && service.urls[0];
  if (!url) return;
  if (!this.cache[url]) return;
  delete this.cache[url];
  this.emit('lost', url);
};
