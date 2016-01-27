
/**
 * Dependencies
 */

var Tile = require('./tile');
require('./twitter.css');

/**
 * Exports
 */

module.exports = TwitterTile;

/**
 * Extends `Tile`
 */

TwitterTile.prototype = Object.create(Tile.prototype);

function TwitterTile() {
  Tile.apply(this, arguments);
  this.el.className += ' twitter-tile';
}

TwitterTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  var cover = el('div', 'twitter-tile-cover');
  var coverImage = el('img', '', cover);
  coverImage.src = data.twitter.profile_banner.mobile;

  var avatar = el('div', 'twitter-tile-avatar', cover);
  var avatarImage = el('img', '', avatar);
  avatarImage.src = data.twitter.avatar.src;

  var follow = el('a', 'action-follow', this.els.footer);
  follow.textContent = 'Follow';
  follow.href = data.twitter.follow_url;

  this.el.insertBefore(cover, this.el.firstChild);
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
