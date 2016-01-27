
/**
 * Dependencies
 */

var Icon = require('./icon');
require('./android-app.css');

/**
 * Exports
 */

module.exports = AndroidAppIcon;

/**
 * Extends `Emitter`
 */

AndroidAppIcon.prototype = Object.create(Icon.prototype);

function AndroidAppIcon(data) {
  Icon.apply(this, arguments);
  this.el.className += ' grid-icon-android-app';
}

AndroidAppIcon.prototype.render = function(data) {
  Icon.prototype.render.apply(this, arguments); // super
  this.els.imageNode.src = data.android.icon;
  this.els.title.textContent = data.android.name;
};
