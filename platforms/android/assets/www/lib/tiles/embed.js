
/**
 * Dependencies
 */

var debug = require('../utils/debug')('tile-website-embed', 1);
var SpinnerView = require('../spinner');
var Tile = require('./tile');
require('./embed.css');

/**
 * Exports
 */

module.exports = WebsiteEmbedTile;

/**
 * Extends `Emitter`
 */

WebsiteEmbedTile.prototype = Object.create(Tile.prototype);

function WebsiteEmbedTile(data) {
  Tile.apply(this, arguments);
  this.el.className += ' tile-embed';
  debug('initialized', data);
}

WebsiteEmbedTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);

  var embed = data.embed;
  var aspect = (embed.height / embed.width) * 100;
  this.els.frame = el('div', 'tile-embed-frame', this.els.content);
  this.els.screen = el('div', 'tile-embed-screen', this.els.frame);

  if (aspect) {
    this.els.frame.style.paddingBottom = aspect + '%';
    this.els.frame.classList.add('fixed-aspect');
  }

  if (data.image) this.addImage(data.image);
  else this.addEmbed(embed);

  debug('rendered');
};

WebsiteEmbedTile.prototype.expand = function() {
  Tile.prototype.expand.apply(this, arguments);
  this.hideImage();
  this.addEmbed(this.data.embed)
    .then(function() {
      this.els.screen.hidden = true;
    }.bind(this));
};

WebsiteEmbedTile.prototype.collapse = function() {
  Tile.prototype.collapse.apply(this, arguments);
  this.removeEmbed();
  this.showImage();
  this.els.screen.hidden = false;
};

WebsiteEmbedTile.prototype.addImage = function(src) {
  debug('add image', src);
  this.els.image = el('div', 'tile-embed-image', this.els.frame);
  this.els.imageNode = el('img', '', this.els.image);
  this.els.imageNode.src = src;
};

WebsiteEmbedTile.prototype.hideImage = function() {
  if (!this.els.image) return;
  this.els.image.hidden = true;
  debug('image hidden');
};

WebsiteEmbedTile.prototype.showImage = function() {
  if (!this.els.image) return;
  this.els.image.hidden = false;
  debug('image shown');
};

WebsiteEmbedTile.prototype.addEmbed = function(embed) {
  return new Promise(function(resolve, reject) {
    if (this.embedded) return resolve();

    var spinner = new SpinnerView();
    this.els.screen.appendChild(spinner.el);

    this.els.embed = el('div', 'tile-embed-embed');
    this.els.embed.innerHTML = cleanHtml(embed.html);

    var iframe = this.els.embed.querySelector('iframe');
    if (iframe) {
      var hasQuery = !!~iframe.src.indexOf('?');
      iframe.src += (!hasQuery ? '?' : '&') + 'autoplay=1&rel=0&controls=0&showinfo=0&title=0&portrait=0&badge=0&modestbranding=1&byline=0';

      iframe.onload = function() {
        this.el.classList.add('embed-active');
        spinner.el.remove();
        resolve();
      }.bind(this);
    }

    this.els.frame.appendChild(this.els.embed);
    this.embedded = true;
  }.bind(this));
};

WebsiteEmbedTile.prototype.removeEmbed = function() {
  if (!this.embedded) return;
  debug('remove embed');
  this.els.embed.remove();
  delete this.els.embed;
  this.embedded = false;
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

function cleanHtml(html) {
  return html.replace(/<\!\[CDATA\[(.+)\]\]>/, '$1');
}
