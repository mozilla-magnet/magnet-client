
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
  this.el = el('li', 'grid-icon');
  this.els = {};
  this.render(data);
}

IconView.prototype.render = function(data) {
  this.els.inner = el('a', 'inner', this.el);
  this.els.inner.href = data.url;
  this.els.image = el('div', 'grid-icon-image', this.els.inner);
  this.els.imageNode = el('img', '', this.els.image);
  this.els.title = el('h3', 'grid-icon-title', this.els.inner);
  this.els.imageNode.onload = function() {
    this.els.imageNode.classList.add('loaded');
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

function populateIcon(parent, data) {
  return new Promise(function(resolve, reject) {
    var icon = getIcon(data);
    if (!icon) return resolve();
    var isSvg = ~icon.href.indexOf('.svg');
    if (isSvg) return resolve(populateSvgIcon(parent, icon));
    var img = el('img', '', parent);
    img.src = icon.href;
    img.onload = resolve;
  });
}

function populateSvgIcon(parent, icon) {
  return fetchSvg(icon.href).then(function(svg) {
    parent.innerHTML = svg;
    parent.style.fill = icon.color;
  });
}

function fetchSvg(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.onload = function() { resolve(xhr.responseText); };
    xhr.onerror = reject;
    xhr.send();
  });
}

function getIcon(data) {
  var icons = data.icons;
  if (!icons) return;

  for (var i = 0; i < icons.length; i++) {
    if (icons[i].href === data.icon) return icons[i];
  }

  return { href: data.icon };
}
