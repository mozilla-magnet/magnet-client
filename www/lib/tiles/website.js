
/**
 * Dependencies
 */

var Tile = require('./tile');
require('./website.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[website-tile]') : function() {};

/**
 * Exports
 */

module.exports = WebsiteTile;

/**
 * Extends `Emitter`
 */

WebsiteTile.prototype = Object.create(Tile.prototype);

function WebsiteTile(data) {
  Tile.apply(this, arguments);
  this.el.className += ' tile-website';
  debug('initialized', data);
}

WebsiteTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);

  if (data.image) this.renderImage(data.image);

  var main = el('div', 'tile-website-main', this.els.inner);
  var icon = el('div', 'tile-website-icon', main);
  var iconInner = el('div', 'inner', icon);
  var title = el('h3', 'tile-website-title', main);
  var self = this;

  title.textContent = data.title;

  if (data.description) {
    var desc = el('p', 'tile-website-desc', main);
    desc.textContent = data.description;
  }

  if (!data.icon) {
    this.el.classList.add('no-icon');
    return;
  }

  var imageNode = el('img', '', iconInner);
  imageNode.src = data.icon;
  imageNode.onload = function(e) {
    var area = this.naturalWidth * this.naturalHeight;
    if (area < (80 * 80)) self.el.classList.add('no-icon');
  };
};

WebsiteTile.prototype.renderImage = function(src) {
  var image = el('div', 'tile-website-image', this.els.inner);
  var inner = el('div', 'inner', image);
  var node = el('img', '', inner);

  node.src = src;
  node.onload = function() {
    image.classList.add('loaded');
  };
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
