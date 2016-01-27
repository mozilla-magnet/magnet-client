
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
  var self = this;
  this.els.title.textContent = data.title;

  if (!data.icon) {
    this.el.classList.add('no-icon');
    return;
  }

  this.els.imageNode.src = data.icon;
  this.els.imageNode.addEventListener('load', function(e) {
    var area = this.naturalWidth * this.naturalHeight;
    debug('icon loaded', area);
    if (area < (80 * 80)) self.el.classList.add('no-icon');
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
