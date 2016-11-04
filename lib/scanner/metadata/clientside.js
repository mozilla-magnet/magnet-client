
/**
 * Dependencies
 */

var debug = require('../../debug')('Clientside');
var parser = require('magnet-html-parser');

/**
 * Exports
 */

module.exports = function(url) {
  debug('fetch and parse', url);
  return getContent(url)
    .then(({ endUrl, content }) => {
      return parser.parse(content, endUrl)
        .then(metadata => {

          // copied from magnet-metadata-service
          metadata.id
            = metadata.url
            = metadata.displayUrl
            = metadata.unadaptedUrl
            = endUrl;

          metadata.originalUrl = url;
          return metadata;
        });
    });
};

function getContent(url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'text/html',
      'Content-Type': 'text/html',
    },
  })

  .then(res => {
    return res.text().then(text => {
      return {
        content: text,
        endUrl: res.url,
      };
    });
  });
}
