
/**
 * Dependencies
 */

var Profile = require('./profile');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[icon-profile-twitter]') : function() {};

/**
 * Exports
 */

module.exports = ProfileTwitter;

/**
 * Extends `Emitter`
 */

ProfileTwitter.prototype = Object.create(Profile.prototype);

function ProfileTwitter(data) {
  Profile.apply(this, arguments);
  this.el.className += ' icon-profile-twitter';
}

ProfileTwitter.prototype.render = function(data) {
  Profile.prototype.render.apply(this, arguments); // super
  this.els.imageNode.src = 'images/twitter.png';
  this.els.title.textContent = '@' + data.twitter.user_id;
  debug('rendered', data);
};
