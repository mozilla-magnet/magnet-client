
/**
 * Dependencies
 */

var debug = require('../../utils/debug')('tile-website-embed', 1);
var Tile = require('../tile');
require('./website-embed.css');

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
  this.el.className += ' tile-website-embed';
  debug('initialized', data);
}

WebsiteEmbedTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  var embed = data.embed;
  var aspect = (embed.height / embed.width) * 100;
  this.els.embed = el('div', 'tile-website-embed-embed', this.els.inner);
  this.els.embed.style.paddingBottom = aspect + '%';
  this.els.embed.innerHTML = embed.html;
  debug('rendered');
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
