
/**
 * Dependencies
 */

var debug = require('../../debug')('Clientside', 1);
var parse = require('magnet-html-parser');

/**
 * Exports
 */

module.exports = function(url) {
  debug('fetch and parse', url);
  var start = Date.now();
  return getContent(url)
    .then(({ content, endUrl }) => parse(content, endUrl))
    .then(result => {
      debug('fetched and parsed', url, Date.now() - start);
      return result;
    });
};

function getContent(url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
      'Content-Type': 'text/html'
    }
  })

  .then(res => {
    return res.text().then(text => {
      return {
        content: text,
        endUrl: res.url
      };
    });
  });
}
