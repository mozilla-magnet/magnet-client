
/**
 * Dependencies
 */

var Tile = require('./tile');
require('./website-embed.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[website-embed-tile]') : function() {};

/**
 * Exports
 */

module.exports = WebsiteEmbedTile;

/**
 * Extends `Emitter`
 */

WebsiteEmbedTile.prototype = Object.create(Tile.prototype);

function WebsiteEmbedTile(data) {
  Tile.apply(this, arguments);
  this.el.className += ' website-embed-tile';
  debug('initialized', data);
}

WebsiteEmbedTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  var embed = data.embed;
  var aspect = (embed.height / embed.width) * 100;
  this.els.embed = el('div', 'website-embed-tile-embed', this.els.inner);
  this.els.embed.style.paddingBottom = aspect + '%';
  this.els.embed.innerHTML = embed.html;
};

/**
 * Utils
 */

function el(tag, className, parent) {
  var result = document.createElement(tag);
  result.className = className || '';
  if (parent) parent.appendChild(result);
  return result;
}
