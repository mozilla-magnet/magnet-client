
/**
 * Dependencies
 */

var debug = require('../utils/debug')('tile-website-embed', 1);
var fastdom = require('fastdom-sequencer');
var SpinnerView = require('../spinner');
var WebsiteTile = require('./website');
require('./embed.css');

/**
 * Exports
 */

module.exports = WebsiteEmbedTile;

/**
 * Extends `Emitter`
 */

WebsiteEmbedTile.prototype = Object.create(WebsiteTile.prototype);

function WebsiteEmbedTile(data) {
  WebsiteTile.apply(this, arguments);
  this.el.className += ' tile-embed';
  debug('initialized', data);
}

WebsiteEmbedTile.prototype.render = function(data) {
  WebsiteTile.prototype.render.call(this, data, { image: false });

  var embed = data.embed;
  this.els.frame = el('div', 'tile-embed-frame', this.els.content);
  this.els.screen = el('div', 'tile-embed-screen', this.els.frame);

  if (data.image) this.addImage(data.image);
  else this.addEmbed(embed);

  this.els.collapsed.appendChild(this.els.main);
  debug('rendered');
};

WebsiteEmbedTile.prototype.expand = function() {
  var promise = WebsiteTile.prototype.expand.apply(this, arguments);
  if (!promise) return;

  promise
    .then(function() {
      return this.addEmbed(this.data.embed);
    }.bind(this))
    .then(function() {
      return this.hideImage();
    }.bind(this));
};

WebsiteEmbedTile.prototype.collapse = function() {
  var promise = WebsiteTile.prototype.collapse.apply(this, arguments);
  if (!promise) return;

  promise
    .then(function() {
      return this.hideLoading();
    }.bind(this))

    .then(function() {
      if (this.data.image) {
        this.removeEmbed();
        this.showImage();
      }
    }.bind(this));
};

WebsiteEmbedTile.prototype.setFrameApect = function() {
  if (this.aspectSet) return;
  var embed = this.data.embed;
  var aspect = (embed.height / embed.width) * 100;
  this.els.frame.style.paddingBottom = (aspect || 100) + '%';
  this.el.classList.add('aspect-set');
  this.aspectSet = true;
};

WebsiteEmbedTile.prototype.addImage = function(src) {
  debug('add image', src);
  this.setFrameApect();
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
    debug('embedding', embed);

    this.els.embed = el('div', 'tile-embed-embed');
    this.els.embed.innerHTML = cleanHtml(embed.html);
    var iframe = this.els.embed.querySelector('iframe');

    if (iframe) {
      this.setFrameApect();
      this.showLoading()
        .then(function() {
          var hasQuery = !!~iframe.src.indexOf('?');
          iframe.src += (!hasQuery ? '?' : '&') + 'autoplay=1&rel=0&controls=0&showinfo=0&title=0&portrait=0&badge=0&modestbranding=1&byline=0';

          iframe.onload = function() {
            debug('embedded', embed);
            this.el.classList.add('embed-active');
            this.hideLoading();
            resolve();
          }.bind(this);

          fastdom.mutate(function() {
            this.els.frame.appendChild(this.els.embed);
          }, this);
        }.bind(this));
    } else {
      this.els.frame.appendChild(this.els.embed);
    }

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

WebsiteEmbedTile.prototype.showLoading = function() {
  if (this.loading) return Promise.resolve();

  this.loading = true;
  var spinner = new SpinnerView();
  this.els.loading = el('div', 'tile-embed-loading');

  return fastdom
    .mutate(function() {
      this.els.loading.appendChild(spinner.el);
      this.els.frame.appendChild(this.els.loading);
      this.els.loading.style.opacity = 0;
      this.els.loading.style.transition = 'opacity 300ms';
    }.bind(this))

    .animate(this.els.loading, 300, function() {
      this.els.loading.style.opacity = 1;
    }.bind(this));
};

WebsiteEmbedTile.prototype.hideLoading = function() {
  if (!this.loading) return;
  this.els.loading.remove();
  this.loading = false;
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
