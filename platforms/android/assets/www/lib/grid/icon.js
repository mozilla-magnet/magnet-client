
/**
 * Dependencies
 */

var Emitter = require('events');
require('./icon.css');

/**
 * Exports
 */

module.exports = IconView;

/**
 * Extends `Emitter`
 */

IconView.prototype = Object.create(Emitter.prototype);

function IconView(data) {
  Emitter.call(this);
  this.el = el('li', 'grid-icon no-icon');
  this.els = {};
  this.render(data);
}

IconView.prototype.render = function(data) {
  this.els.inner = el('a', 'inner', this.el);
  this.els.inner.href = data.url;
  this.els.image = el('div', 'grid-icon-image', this.els.inner);
  var img = this.els.imageNode = el('img', '', this.els.image);
  this.els.title = el('h3', 'grid-icon-title', this.els.inner);
  this.els.title.textContent = data.title;

  // child classes free to override
  if (data.icon) this.els.imageNode.src = data.icon;

  img.onload = function() {
    var area = img.naturalWidth * img.naturalHeight;
    if (area < 80 * 80) return;
    this.els.imageNode.classList.add('loaded');
    this.el.classList.remove('no-icon');
  }.bind(this);
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
