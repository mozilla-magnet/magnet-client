
/**
 * Dependencies
 */

var Icon = require('./icon');
require('./website.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[website-icon]') : function() {};

/**
 * Exports
 */

module.exports = WebsiteIconView;

/**
 * Extends `Emitter`
 */

WebsiteIconView.prototype = Object.create(Icon.prototype);

function WebsiteIconView(data) {
  Icon.apply(this, arguments);
  this.el.className += ' grid-icon-website';
}

WebsiteIconView.prototype.render = function(data) {
  Icon.prototype.render.apply(this, arguments); // super
  this.els.title.textContent = data.title || data.url;
};
