
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
  this.el._view = this;
  this.els = {};
  this.data = data;
  this.render(data);
  this.els.close.addEventListener('click', function(e) {
    e.stopPropagation();
    this.emit('close');
  }.bind(this));

  debug('initialized', data);
}

TileView.prototype.render = function(data) {
  this.els.url = el('h4', 'tile-url', this.el);
  this.els.url.textContent = data.url;
  this.els.inner = el('div', 'inner', this.el);
  this.els.expanded = el('div', 'tile-expanded', this.els.inner);
  this.els.collapsed = el('div', 'tile-collapsed', this.els.inner);
  this.els.footer = el('footer', 'tile-footer', this.els.hidden);
  this.els.close = el('button', 'tile-close-button', this.els.footer);
  this.els.open = el('a', 'tile-open-button', this.els.footer);
  this.els.open.href = data.url;
  this.els.open.textContent = 'Open';
  this.els.close.textContent = 'Close';
};

TileView.prototype.expand = function() {
  return Promise.resolve();
};

TileView.prototype.collapse = function(e) {
  return Promise.resolve();
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
