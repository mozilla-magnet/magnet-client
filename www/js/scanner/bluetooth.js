
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
  this.ble.stopScan();
};

Bluetooth.prototype.enable = function(done) {
  this.ble.enable(done);
};

Bluetooth.prototype.startScan = function() {
  debug('start scanning');
  this.ble.startScan([], function(device) {
    debug('found', device);
    var advertising = device.advertising;
    var decoded = eddystone.decode(new Uint8Array(advertising));
    if (decoded) this.emit('found', decoded.url);
  }.bind(this));
};
