
/**
 * Dependencies
 */

var Icon = require('./icon');
require('./android-app.css');

var debug = 1 ? console.log.bind(console, '[android-app-icon]') : function() {};

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
  this.packageId = data.android.package;
  this.storeUrl = data.url;
}

AndroidAppIcon.prototype.render = function(data) {
  Icon.prototype.render.apply(this, arguments); // super
  this.els.imageNode.src = data.android.icon;
  this.els.title.textContent = data.android.name;
  this.els.inner.addEventListener('click', this.onClick.bind(this));
};

AndroidAppIcon.prototype.onClick = function(e) {
  e.stopPropagation();

  navigator.startApp.check(
    this.packageId,
    this.openApp.bind(this),
    this.openStore.bind(this)
  );
};

AndroidAppIcon.prototype.openApp = function() {
  debug('open app');
  navigator.startApp.start(this.packageId);
};

AndroidAppIcon.prototype.openStore = function() {
  debug('open store');
  window.open(this.storeUrl, '_system');
};
