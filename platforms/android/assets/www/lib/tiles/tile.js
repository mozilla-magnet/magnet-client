
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
  this.el.href = data.url;
  this.els = {};
  this.render(data);
  debug('initialized', data);
}

TileView.prototype.render = function(data) {
  this.els.text = el('div', 'tile-text', this.el);
  var title = el('h3', 'tile-title', this.els.text);
  var desc = el('p', 'tile-desc', this.els.text);
  this.els.footer = el('footer', 'tile-footer', this.el);
  var a = el('a', 'tile-action-link', this.els.footer);

  a.textContent = 'Visit';
  a.href = data.url;
  title.textContent = data.title;
  desc.textContent = data.description;
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
