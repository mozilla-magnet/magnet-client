
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
  this.els.content = el('div', 'tile-content', this.els.inner);
  this.els.collapsed = el('div', 'tile-collpased', this.els.inner);
  this.els.footer = el('footer', 'tile-footer', this.els.hidden);
  this.els.close = el('button', 'tile-close-button', this.els.footer);
  this.els.open = el('a', 'tile-open-button', this.els.footer);
  this.els.open.href = data.url;
  this.els.open.textContent = 'Open';
  this.els.close.textContent = 'Close';
};

TileView.prototype.expand = function() {
  if (this.expanded) return;
  var inner = this.els.inner;

  return fastdom
    .measure(function() {
      return inner.getBoundingClientRect();
    })

    .animate(inner, function(rect) {
      var translateY = -(rect.top - 50);
      debug('animate', rect, translateY);
      inner.style.transition = 'transform 300ms';
      inner.style.transform = 'translateY(' + translateY + 'px)';
    }.bind(this))

    .then(function() {
      this.el.classList.add('expanded');
      this.expanded = true;
    }.bind(this));
};

TileView.prototype.collapse = function(e) {
  if (e) e.stopPropagation();
  if (!this.expanded) return;
  debug('collapsing');
  this.expanded = false;

  var inner = this.els.inner;

  return fastdom
    .animate(inner, function() {
      console.log('12222');
      inner.style.removeProperty('transform');
    })

    .then(function() {
      inner.style.removeProperty('transition');
      this.el.classList.remove('expanded');
      debug('collapsed');
    }.bind(this));
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
