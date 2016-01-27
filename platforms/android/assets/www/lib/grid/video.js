
/**
 * Dependencies
 */

var Icon = require('./icon');
require('./video.css');

/**
 * Exports
 */

module.exports = VideoIcon;

/**
 * Extends `Emitter`
 */

VideoIcon.prototype = Object.create(Icon.prototype);

function VideoIcon(data) {
  Icon.apply(this, arguments);
  this.el.className += ' grid-icon-video';
}

VideoIcon.prototype.render = function(data) {
  Icon.prototype.render.apply(this, arguments); // super
  this.els.imageNode.src = 'images/twitter.png';
  this.els.title.textContent = data.twitter.avatar.alt;
};
