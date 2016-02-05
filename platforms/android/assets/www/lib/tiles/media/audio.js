
/**
 * Dependencies
 */

var debug = require('../../utils/debug')('tile-audio', 1);
var el = require('../../utils/el');
var Tile = require('../tile');
require('./audio.css');

/**
 * Logger
 *
 * @return {Function}
 */

/**
 * Exports
 */

module.exports = AudioTile;

/**
 * Extends `Tile`
 */

AudioTile.prototype = Object.create(Tile.prototype);

function AudioTile(data) {
  Tile.apply(this, arguments); // super
  this.el.className += ' tile-audio';
}

AudioTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  debug('render', data);
  this.data = data;
  this.els.image = el('div', 'tile-audio-image', this.els.inner);
  this.els.loading = el('div', 'tile-audio-loading', this.els.inner);
  this.els.imageNode = el('img', '', this.els.image);
  this.els.imageNode.src = data.og_data.image;
  this.els.image.addEventListener('click', this.onClick.bind(this));
};

AudioTile.prototype.onClick = function(e) {
  var embed = this.data.embed;
  debug('embedding', embed);
  if (!embed) return;
  var container = el('div', 'tile-audio-embed');
  container.innerHTML = cleanHtml(embed.html);

  var iframe = container.querySelector('iframe');
  if (iframe) {
    this.el.classList.add('loading');
    iframe.onload = function() {
      this.el.classList.add('embed-active');
      this.el.classList.remove('loading');
    }.bind(this);
  }

  this.els.inner.appendChild(container);
};

function cleanHtml(html) {
  return html.replace(/<\!\[CDATA\[(.+)\]\]>/, '$1');
}
