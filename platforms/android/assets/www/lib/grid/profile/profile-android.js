
/**
 * Dependencies
 */

var Profile = require('./profile');
require('./profile-android.css');

var debug = 1 ? console.log.bind(console, '[icon-android]') : function() {};

/**
 * Exports
 */

module.exports = ProfileAndroid;

/**
 * Extends `Emitter`
 */

ProfileAndroid.prototype = Object.create(Profile.prototype);

function ProfileAndroid(data) {
  Profile.apply(this, arguments);
  this.el.className += ' grid-icon-android-app';
  this.packageId = data.android.package;
  this.storeUrl = data.url;
}

ProfileAndroid.prototype.render = function(data) {
  Profile.prototype.render.apply(this, arguments); // super

  if (data.android.icon) {
    this.els.imageNode.src = data.android.icon;
    this.el.classList.remove('no-icon');
  }

  this.els.title.textContent = data.android.name;
  this.els.inner.addEventListener('click', this.onClick.bind(this));
};

ProfileAndroid.prototype.onClick = function(e) {
  e.stopPropagation();
  navigator.startApp.check(
    this.packageId,
    this.openApp.bind(this),
    this.openStore.bind(this)
  );
};

ProfileAndroid.prototype.openApp = function() {
  debug('open app');
  navigator.startApp.start(this.packageId);
};

ProfileAndroid.prototype.openStore = function() {
  debug('open store');
  window.open(this.storeUrl, '_system');
};
