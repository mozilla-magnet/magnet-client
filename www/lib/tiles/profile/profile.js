
/**
 * Dependencies
 */

var Tile = require('../tile');
require('./profile.css');

/**
 * Exports
 */

module.exports = ProfileAppTile;

/**
 * Extends `Tile`
 */

ProfileAppTile.prototype = Object.create(Tile.prototype);

function ProfileAppTile() {
  Tile.apply(this, arguments);
  this.el.className += ' tile-profile';
}

ProfileAppTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  this.els.icon = el('div', 'tile-profile-icon', this.els.inner);
  this.els.imageNode = el('img', '', this.els.icon);
  this.els.title = el('h3', 'tile-profile-title', this.els.inner);
  this.els.desc = el('p', 'tile-profile-desc', this.els.inner);
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
