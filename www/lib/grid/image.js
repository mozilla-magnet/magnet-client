
/**
 * Dependencies
 */

var Icon = require('./icon');

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
  this.el.className += ' grid-image';
}
