
/**
 * Dependencies
 */

var Tile = require('./tile');
require('./android-app.css');

/**
 * Exports
 */

module.exports = AndroidAppTile;

/**
 * Extends `Tile`
 */

AndroidAppTile.prototype = Object.create(Tile.prototype);

function AndroidAppTile() {
  Tile.apply(this, arguments);
  this.el.className += ' android-app-tile';
}

AndroidAppTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);

  var icon = el('div', 'android-app-tile-icon');
  var iconImage = el('img', '', icon);
  iconImage.src = data.android.icon;

  this.el.insertBefore(icon, this.el.firstChild);
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
