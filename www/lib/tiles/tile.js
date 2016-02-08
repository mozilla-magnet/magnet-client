
/**
 * Dependencies
 */

var fastdom = require('fastdom-sequencer');
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
  this.data = data;
  this.render(data);
  this.el.addEventListener('click', this.expand.bind(this));
  this.els.close.addEventListener('click', this.collapse.bind(this));
  debug('initialized', data);
}

TileView.prototype.render = function(data) {
  this.els.url = el('h4', 'tile-url', this.el);
  this.els.url.textContent = data.url;
  this.els.inner = el('div', 'inner', this.el);
  this.els.content = el('div', 'tile-content', this.els.inner);
  this.els.footer = el('footer', 'tile-footer', this.els.inner);
  this.els.close = el('button', 'tile-close-button', this.els.footer);
  this.els.open = el('button', 'tile-open-button', this.els.footer);
  this.els.open.textContent = 'Open';
  this.els.close.textContent = 'Close';
  this.els.footer.hidden = true;
};

TileView.prototype.expand = function() {
  this.els.footer.hidden = false;
  this.el.classList.add('expanded');
};

TileView.prototype.collapse = function(e) {
  if (e) e.stopPropagation();
  this.els.footer.hidden = true;
  this.el.classList.remove('expanded');
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
