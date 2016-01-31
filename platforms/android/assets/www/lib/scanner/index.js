
/**
 * Dependencies
 */

var Bluetooth = require('./bluetooth');
var metadata = require('./metadata');
var Emitter = require('events');
var MDNS = require('./mdns');

/**
 * Exports
 */

module.exports = Scanner;

/**
 * Extends `Emitter`
 */

Scanner.prototype = Object.create(Emitter.prototype);

function Scanner() {
  this.sources = [
    new Bluetooth(),
    new MDNS()
  ];
}

Scanner.prototype.start = function() {
  this.sources.forEach(function(source) {
    source.on('found', this.onFound.bind(this));
    source.on('lost', this.onLost.bind(this));
    source.start();
  }, this);
};

Scanner.prototype.stop =function() {
  this.sources.forEach(function(source) {
    source.stop();
  });
};

Scanner.prototype.onFound = function(item) {
  metadata.get(item).then(function(data) {
    this.emit('found', item, data);
  }.bind(this))
  .catch(console.error.bind(console));
};

Scanner.prototype.onLost = function(item) {
  this.emit('lost', item);
};
