
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
  var contentStart;
  var contentEnd;
  var url = '';
  var result = {

  };

  console.log('\nflags:\n');

  while (i++ < end) {
    console.log(data[i]);
  }

  console.log('\nservice uuid:\n');

  end = i + data[i];
  while (i++ < end) {
    console.log(data[i]);
  }

  console.log('\n???:\n');

  end = i + data[i];
  i++;

  result.serviceDataTypeValue = data[i++];
  result.eddystoneUUI = [data[i++], data[i++]];
  result.eddystoneFrameType = data[i++];
  result.txPower = data[i++];
  result.prefix = prefixes[data[i]];

  while (i < contentStart) {
    console.log(data[i++]);
  }

  console.log('\ncontent\n');

  while (i++ < end) {
    url += data[i] < suffixes.length
      ? suffixes[i]
      : String.fromCharCode(data[i]);
  }

  result.url = result.prefix + url;

  console.log(result);

  // var prefix = data[0];
  // if (prefix >= prefixes.length) {
  //   throw new Error('"data" does not seem to be an encoded Eddystone URL');
  // }

  // return prefixes[prefix] + decode(data.subarray(14));
};

function decode(data) {
  var url = '';

  for (var i = 0; i < data.length; i++) {
    if (data[i] < suffixes.length) return url += suffixes[data[i]];
    else url += String.fromCharCode(data[i]);
  }

  return url;
}

exports.decode(new Uint8Array([2, 1, 4, 3, 3, 216, 254, 22, 22, 216, 254, 0, 242, 2, 116, 97, 108, 116, 111, 110, 109, 105, 108, 108, 46, 99, 111, 46, 117, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));


