
/**
 * Dependencies
 */

var Tile = require('../tile');
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
  this.el.className += ' website-tile';
  debug('initialized', data);
}

WebsiteTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  var icon = el('div', 'website-tile-icon', this.els.inner);
  var title = el('h3', 'website-tile-title', this.els.inner);
  var self = this;

  title.textContent = data.title;

  if (data.description) {
    var desc = el('p', 'website-tile-desc', this.els.inner);
    desc.textContent = data.description;
  }

  if (!data.icon) {
    this.el.classList.add('no-icon');
    return;
  }

  var imageNode = el('img', '', icon);
  imageNode.src = data.icon;
  imageNode.onload = function(e) {
    var area = this.naturalWidth * this.naturalHeight;
    if (area < (80 * 80)) self.el.classList.add('no-icon');
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
