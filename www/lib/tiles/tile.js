
/**
 * Dependencies
 */

var Emitter = require('events');
require('./tile.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[tile-view]') : function() {};

/**
 * Exports
 */

module.exports = TileView;

/**
 * Extends `Emitter`
 */

TileView.prototype = Object.create(Emitter.prototype);

function TileView(data) {
  Emitter.call(this);
  this.el = el('li', 'tile');
  this.els = {};
  this.render(data);
  debug('initialized', data);
}

TileView.prototype.render = function(data) {
  this.els.url = el('h4', 'tile-url', this.el);
  this.els.url.textContent = data.url;
  this.els.inner = el('div', 'inner', this.el);
};

/**
 * Utils
 */

function el(tag, className, parent) {
  var result = document.createElement(tag);
  result.className = className || '';
  if (parent) parent.appendChild(result);
  return result;
}
