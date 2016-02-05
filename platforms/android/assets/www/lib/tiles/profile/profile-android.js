
/**
 * Dependencies
 */

var TileProfile = require('./profile');

/**
 * Exports
 */

module.exports = TileProfileAndroid;

/**
 * Extends `Tile`
 */
TileProfileAndroid.prototype = Object.create(TileProfile.prototype);

function TileProfileAndroid() {
  TileProfile.apply(this, arguments);
  this.el.className += ' tile-profile-android';
}

TileProfileAndroid.prototype.render = function(data) {
  TileProfile.prototype.render.apply(this, arguments);
  this.els.imageNode.src = data.android.icon;
  this.els.title = data.android.name;
  this.els.desc = data.description;
};
