
/**
 * Dependencies
 */

var eddystone = require('../lib/eddystone');
var Emitter = require('events');

var debug = 1 ? console.log.bind(console, '[Bluetooth]') : function() {};

/**
 * Exports
 */

module.exports = Bluetooth;

/**
 * Extends `Emitter`
 */

Bluetooth.prototype = Object.create(Emitter.prototype);

function Bluetooth() {
  Emitter.call(this);
  this.ble = window.ble;
}

Bluetooth.prototype.start = function() {
  this.enable(this.startScan.bind(this));
  debug('started');
};

Bluetooth.prototype.stop = function() {

};

Bluetooth.prototype.enable = function(done) {
  this.ble.enable(done);
};

window.buffers = [];

Bluetooth.prototype.startScan = function() {
  debug('start scan ...');
  this.ble.startScan([], function(device) {
    debug('found', device);
    var advertising = device.advertising;
    window.buffers.push(advertising);
    var url = eddystone.decode(new Uint8Array(advertising));
    console.log(url);
    this.emit('found', url);
  }.bind(this));
};

/**
 * Utils
 */

function bytesToString(buffer) {
  return String.fromCharCode.apply(null, new Uint8Array(buffer));
}
