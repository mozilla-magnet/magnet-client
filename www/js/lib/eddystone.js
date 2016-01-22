
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
  result.eddystoneUUI = [data[i++], data[i++]];
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

// var test1 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 19, 22, 216, 254, 0, 242, 3, 103, 111, 111, 46, 103, 108, 47, 104, 113, 66, 88, 69, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
// var test2 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 22, 22, 216, 254, 0, 242, 2, 116, 97, 108, 116, 111, 110, 109, 105, 108, 108, 46, 99, 111, 46, 117, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// exports.decode(test1);
