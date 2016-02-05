
/**
 * Dependencies
 */

var TileProfile = require('./profile');

/**
 * Exports
 */

module.exports = TileProfileTwitter;

/**
 * Extends `Tile`
 */
TileProfileTwitter.prototype = Object.create(TileProfile.prototype);

function TileProfileTwitter() {
  TileProfile.apply(this, arguments);
  this.el.className += ' tile-profile-twitter';
}

TileProfileTwitter.prototype.render = function(data) {
  TileProfile.prototype.render.apply(this, arguments);
  this.els.imageNode.src = data.twitter.avatar.src;
  this.els.title.textContent = data.twitter.avatar.alt;
  this.els.desc.textContent = data.twitter.bio;
  this.els.handle = el('h4', 'tile-profile-twitter-handle');
  this.els.inner.insertBefore(this.els.handle, this.els.desc);
  this.els.handle.textContent = '@' + data.twitter.user_id;
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
