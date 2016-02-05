
/**
 * Dependencies
 */

var Icon = require('../icon');

/**
 * Exports
 */

module.exports = IconProfile;

/**
 * Extends `Icon`
 */

IconProfile.prototype = Object.create(Icon.prototype);

function IconProfile(data) {
  Icon.apply(this, arguments);
  this.el.className += ' icon-profile';
}
