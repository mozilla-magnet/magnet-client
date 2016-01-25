
var SUPPORTED_SERVICES = [
  0xfed8, // uri beacon
  0xfeaa // eddystone beacon
];

var prefixes = [
  'http://www.',
  'https://www.',
  'http://',
  'https://'
];

var suffixes = [
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

exports.decode = function(data) {
  var end = data[0];
  var i = 0;
  var url = '';
  var result = {};

  // Flags:

  while (i++ < end) {}

  // Complete service list (UUIDs):

  end = i + data[i];
  while (i++ < end) {}

  // Service Data:

  end = i + data[i];
  result.serviceDataLength = data[i++];
  result.serviceDataTypeValue = data[i++];
  result.serviceUUI = [data[i++], data[i++]];

  if (!isEddyStoneBeacon(result.serviceUUI)) return false;

  result.eddystoneFrameType = data[i++];
  result.txPower = data[i++];
  result.prefix = prefixes[data[i]];

  // URI:

  while (i++ < end) {
    url += data[i] < suffixes.length
      ? suffixes[i]
      : String.fromCharCode(data[i]);
  }

  // prepend prefix
  result.url = result.prefix + url;

  return result;
};

function isEddyStoneBeacon(uuid) {
  var id = ((uuid[1] << 8) ^ uuid[0]);
  return !!~SUPPORTED_SERVICES.indexOf(id);
}

// var beacon1 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 19, 22, 216, 254, 0, 242, 3, 103, 111, 111, 46, 103, 108, 47, 104, 113, 66, 88, 69, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
// var beacon2 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 22, 22, 216, 254, 0, 242, 2, 116, 97, 108, 116, 111, 110, 109, 105, 108, 108, 46, 99, 111, 46, 117, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// var nonBeacon = new Uint8Array([2, 1, 6, 26, 255, 76, 0, 2, 21, 80, 114, 111, 120, 97, 109, 65, 66, 140, 69, 66, 101, 97, 99, 111, 110, 171, 219, 174, 136, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// console.log(exports.decode(beacon1));
// console.log(exports.decode(beacon2));
// console.log(exports.decode(nonBeacon));
