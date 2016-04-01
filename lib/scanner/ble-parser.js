'use strict';

/**
 * Dependencies
 */

var debug = require('../debug')('ble-parser');

const URI_SCHEMES = [
  'http://www.',
  'https://www.',
  'http://',
  'https://',
  'urn:uuid:'
];

const URL_CODES = [
  '.com/',
  '.org/',
  '.edu/',
  '.net/',
  '.info/',
  '.biz/',
  '.gov/',
  '.com',
  '.org',
  '.edu',
  '.net',
  '.info',
  '.biz',
  '.gov'
];

const EDDY_STONE_SERVICE_16_BIT_UUID_BYTES = [0xaa, 0xfe];
const URI_BEACON_SERVICE_16_BIT_UUID_BYTES = [0xd8, 0xfe];
const EDDY_STONE_URL_FRAME_TYPE = 0x10;
const DATA_TYPE_SERVICE_DATA = 0x16;

/**
 * Decodes raw BLE beacon scan record bytes.
 *
 * WARNING: Currently only tested with older
 * 'uri-beacon'. May need some tweaks to
 * support 'eddy-stone' beacon format.
 *
 * @param  {Array} bytes
 * @return {(Object|undefined)}
 */
module.exports = function(data) {
  debug('parse');

  var bytes = new Uint8Array(data.bytes);
  var rssi = data.rssi;

  // attempt parsing both beacon types
  var parsed = parseUriBeaconServiceData(bytes)
    || parseEddyStoneServiceData(bytes);

  if (!parsed) return;

  var i = 0;
  var flags = parsed[i++];
  var txPowerLevel = uintToInt(parsed[i++]);
  var url = decodeUrl(parsed, i);

  if (!url) return;

  return {
    url: url,
    distance: calculateDistance(txPowerLevel, rssi)
  }
};

function parseUriBeaconServiceData(bytes) {
  var i = 0;

  try {
    while (i < bytes.length) {
      var fieldLength = bytes[i++];
      if (fieldLength == 0) break;

      var fieldType = bytes[i];
      if (fieldType == DATA_TYPE_SERVICE_DATA) {

        // The first two bytes of the service data are service data UUID.
        if (bytes[i + 1] == URI_BEACON_SERVICE_16_BIT_UUID_BYTES[0]
              && bytes[i + 2] == URI_BEACON_SERVICE_16_BIT_UUID_BYTES[1]) {

          // jump to data
          i += 3;

          // return just the service data bytes
          return bytes.slice(i, i + (fieldLength - 3));
        }
      }

      // length includes the length of the field type
      i += fieldLength;
    }
  } catch (err) {
    console.error('unable to parse scan record', err);
  }

  return null;
}

function parseEddyStoneServiceData(bytes) {
  var i = 0;

  try {
    while (i < bytes.length) {
      var fieldLength = bytes[i++];
      if (fieldLength == 0) break;

      var fieldType = bytes[i];
      if (fieldType == DATA_TYPE_SERVICE_DATA) {
        if (bytes[i + 1] == EDDY_STONE_SERVICE_16_BIT_UUID_BYTES[0]
              && bytes[i + 2] == EDDY_STONE_SERVICE_16_BIT_UUID_BYTES[1]
              && bytes[i + 3] == EDDY_STONE_URL_FRAME_TYPE) {

          // jump to beginning of frame
          i += 4;

          // return just the service data bytes
          return bytes.slice(i, i + (fieldLength - 4));
        }
      }

      // length includes the length of the field type.
      i += fieldLength;
    }
  } catch (err) {
    console.error('unable to parse scan record', err);
  }

  return null;
}

function decodeUrl(bytes, offset) {
  if (bytes.length == offset) return '';

  var url = '';

  if (offset < bytes.length) {
    var b = bytes[offset++];
    var scheme = URI_SCHEMES[b];
    if (scheme != null) {
      url += scheme;

      while (offset < bytes.length) {
        b = bytes[offset++];
        var code = URL_CODES[b];
        if (code) url += code;
        else url += String.fromCharCode(b);
      }

      return url;
    }

    console.error("decodeUrl unknown url scheme code=" + b);
  }

  return null;
}

/**
 * Converts an 8-bit unsigned integer
 * into a signed integer.
 *
 * @param  {Number} value
 * @return {Number}
 */
function uintToInt(value) {
  debug('uint to int', value);
  if (value > 127) value -= 256;
  return value;
}

function calculateDistance(txPower, rssi) {
  debug('calculate distance', txPower, rssi);
  return Math.pow(10, ((txPower - rssi) - 41) / 20);
}
