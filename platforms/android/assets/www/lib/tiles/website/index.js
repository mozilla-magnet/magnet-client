
/**
 * Dependencies
 */

var WebsiteEmbed = require('./website-embed');
var Website = require('./website');

/**
 * Exports
 */

module.exports = function(data) {
  if (data.embed) return new WebsiteEmbed(data);
  else return new Website(data);
};
