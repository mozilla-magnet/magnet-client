
/**
 * Dependencies
 */

var fastdom = require('fastdom-sequencer');
var HeaderView = require('../header');
var Emitter = require('events');
require('./detail.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[detail-view]') : function() {};

/**
 * Exports
 */

module.exports = DetailView;

/**
 * Extends `Emitter`
 */

DetailView.prototype = Object.create(Emitter.prototype);

function DetailView(data) {
  Emitter.call(this);
  this.el = el('div', 'detail-panel');
  this.views = {};
  this.els = {};
  this.render(data);
  fastdom.on(this.el, 'click', this.onClick.bind(this));
  debug('initialized', data);
}

DetailView.prototype.render = function(data) {
  this.views.header = new HeaderView({ title: data.title });
  this.els.inner = el('div', 'inner', this.el);
};

DetailView.prototype.open = function(parent) {
  var placeholder = document.createElement('div');
  var measurements;

  return fastdom
    .measure(function() {
      return parent.getBoundingClientRect();
    })

    .mutate(function(rect) {
      var scaleY = window.innerHeight / rect.height;

      measurements =  {
        translateY: -(rect.top / scaleY),
        scaleX: window.innerWidth / rect.width,
        scaleY: scaleY,
        height: rect.height,
        width: rect.width,
        top: rect
      };

      var style = placeholder.style;
      style.background = 'white';
      style.position = 'absolute';
      style.width = rect.width + 'px';
      style.height = rect.height + 'px';
      style.left = rect.left + 'px';
      style.top = rect.top + 'px';
      style.transformOrigin = '50% 0';
      style.transition = 'transform 200ms';

      document.body.appendChild(placeholder);
    })

    .animate(placeholder, function() {
      placeholder.style.transform = 'scaleX(' + measurements.scaleX + ') ' +
        'scaleY(' + measurements.scaleY + ') ' +
        'translateY(' + measurements.translateY + 'px) ';
    });
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
