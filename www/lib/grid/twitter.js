
/**
 * Dependencies
 */

var Icon = require('./icon');
require('./twitter.css');

/**
 * Exports
 */

module.exports = TwitterIcon;

/**
 * Extends `Emitter`
 */

TwitterIcon.prototype = Object.create(Icon.prototype);

function TwitterIcon(data) {
  Icon.apply(this, arguments);
  this.el.className += ' grid-icon-twitter';
}

TwitterIcon.prototype.render = function(data) {
  Icon.prototype.render.apply(this, arguments); // super
  this.els.imageNode.src = 'images/twitter.png';
  this.els.title.textContent = data.twitter.avatar.alt;
};
