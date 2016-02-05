
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
  if (data.android) return new ProfileAndroid(data);
  else if (data.twitter) return new ProfileTwitter(data);
  else return new Profile(data);
};
