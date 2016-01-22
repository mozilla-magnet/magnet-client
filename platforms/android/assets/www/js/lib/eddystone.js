
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
  var prefix = data[0];
  if (prefix > prefixes.length) {
    throw new Error('"data" does not seem to be an encoded Eddystone URL');
  }

  return prefixes[prefix] + decode(data);
};

function decode(data) {
  console.log(data);
  var url = '';

  for (var i = 0; i < data.length; i++) {
    var s = String.fromCharCode(data[i]);
    url +=
      (data[i] < suffixes.length)
        ? suffixes[data[i]]
        : s;
  }

  return url;
}
