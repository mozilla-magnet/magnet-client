
/**
 * Dependencies
 */

var Icon = require('./icon');

/**
 * Exports
 */

module.exports = AudioIcon;

/**
 * Extends `Emitter`
 */

AudioIcon.prototype = Object.create(Icon.prototype);

function AudioIcon(data) {
  Icon.apply(this, arguments);
  this.el.className += ' grid-icon-audio';
}
