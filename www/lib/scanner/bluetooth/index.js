
/**
 * Dependencies
 */

var eddystone = require('./eddystone');
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
  this.beacons = {};
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
  this.ble.startScan([], this.onFound.bind(this));
};

Bluetooth.prototype.onFound = function(device) {
  debug('found', device);

  var data = eddystone.decode(new Uint8Array(device.advertising));
  var url = data && data.url;
  if (!url) return debug('invalid device', url);

  var isNew = !this.hasBeacon(url);
  var beacon = this.createBeacon(url).renew();

  if (isNew) this.emit('found', beacon.url);
};

Bluetooth.prototype.hasBeacon = function(url) {
  return !!this.beacons[url];
};

Bluetooth.prototype.createBeacon = function(url) {
  if (this.hasBeacon(url)) return this.beacons[url];
  var beacon = this.beacons[url] = new Beacon(url);
  beacon.on('expired', this.onLost.bind(this, beacon));
  return beacon;
};

Bluetooth.prototype.onLost = function(beacon) {
  debug('lost', beacon);
  delete this.beacons[beacon.url];
  this.emit('lost', beacon.url);
};

/**
 * Represents an found beacon. Will
 * 'expire' is not renewed.
 *
 * @param {String} url
 */
function Beacon(url) {
  this.url = url;
  this.onexpiry = this.onexpiry.bind(this);
}

/**
 * Extends `Emitter`
 */

Beacon.prototype = Object.create(Emitter.prototype);

Beacon.prototype.expires = 60000;

Beacon.prototype.renew = function() {
  if (this.expired) return;
  clearTimeout(this.timeout);
  this.timeout = setTimeout(this.onexpiry, this.expires);
  return this;
};

Beacon.prototype.onexpiry = function() {
  this.expired = true;
  this.emit('expired');
};
