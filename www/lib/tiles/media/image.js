
/**
 * Dependencies
 */

var Tile = require('../tile');
require('./image.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[image-tile]') : function() {};

/**
 * Exports
 */

module.exports = ImageTile;

/**
 * Extends `Tile`
 */

ImageTile.prototype = Object.create(Tile.prototype);

function ImageTile(data) {
  this.embed = data.embed;
  this.data = data;

  Tile.apply(this, arguments);
  this.el.className += ' image-tile';
  this.el.addEventListener('click', this.onClick.bind(this));
}