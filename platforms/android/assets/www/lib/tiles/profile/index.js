
/**
 * Dependencies
 */

var ProfileTwitter = require('./profile-twitter');
var ProfileAndroid = require('./profile-android');
var Profile = require('./profile');

/**
 * Exports
 */

module.exports = function(data) {
  if (data.twitter) return new ProfileTwitter(data);
  else if (data.android) return new ProfileAndroid(data);
  else return new Profile(data);
};
