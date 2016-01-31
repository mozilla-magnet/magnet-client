
/**
 * Dependencies
 */

var Tile = require('./tile');
require('./video.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[video-tile]') : function() {};

/**
 * Exports
 */

module.exports = VideoTile;

/**
 * Extends `Tile`
 */

VideoTile.prototype = Object.create(Tile.prototype);

function VideoTile(data) {
  this.embed = data.embed;
  this.data = data;

  Tile.apply(this, arguments);
  this.el.className += ' video-tile';
  this.el.addEventListener('click', this.onClick.bind(this));
}

VideoTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  var imageSrc = data.og_data && data.og_data.image;
  var self = this;

  if (this.embed) {
    var aspect = (this.embed.height / this.embed.width) * 100;
    this.els.inner.style.paddingBottom = aspect + '%';
    this.els.inner.classList.add('fixed-aspect');
  }

  if (imageSrc) {
    this.els.poster = el('div', 'video-tile-poster', this.els.inner);
    this.els.title = el('h3', 'video-tile-title', this.els.poster);
    this.els.title.textContent = data.og_data.title;
    var imageNode = el('img', 'video-tile-image', this.els.poster);
    imageNode.src = imageSrc;
    imageNode.onload = function() {
      self.els.poster.classList.add('loaded');
    };
  }
};

VideoTile.prototype.onClick = function(e) {
  var embed = this.data.embed;
  if (!embed) return;
  debug('embedding', embed);
  var container = el('div', 'video-tile-embed');
  container.innerHTML = embed.html;

  var iframe = container.querySelector('iframe');
  if (iframe) {
    var hasQuery = !!~iframe.src.indexOf('?');
    iframe.src += (!hasQuery ? '?' : '&') + 'autoplay=1&rel=0&controls=0&showinfo=0&title=0&portrait=0&badge=0&modestbranding=1&byline=0';
    iframe.onload = function() {
      this.el.classList.add('embed-active');
    }.bind(this);
  }

  this.els.inner.appendChild(container);
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
