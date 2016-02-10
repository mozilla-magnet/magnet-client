
/**
 * Dependencies
 */

var debug = require('../utils/debug')('tile-embed', 1);
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
  this.els.frame = el('div', 'tile-embed-frame', this.els.expanded);
  this.els.screen = el('div', 'tile-embed-screen', this.els.frame);

  if (data.image) this.addImage(data.image);
  else this.addEmbed(embed);

  this.els.collapsed.appendChild(this.els.main);
  debug('rendered');
};

WebsiteEmbedTile.prototype.expand = function() {
  debug('expand');

  return fastdom
    .mutate(function() {
      this.els.collapsed.style.transition = 'transform 300ms ease-in-out';
    }, this)

    .animate(function() {
      this.els.collapsed.style.transform = 'translateY(0%)';
      return this.els.collapsed;
    }, this)

    .then(function() {
      return this.addEmbed(this.data.embed);
    }.bind(this))

    .then(function() {
      return this.hideImage();
    }.bind(this));
};

WebsiteEmbedTile.prototype.collapse = function() {
  return fastdom
    .mutate(function() {
      return this.hideLoading();
    }.bind(this))

    .mutate(function() {
      if (this.data.image) {
        return this.showImage()
          .then(this.removeEmbed.bind(this));
      }
    }.bind(this))

    .animate(function() {
      return this.scrollToTop();
    }, this);
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
  if (!this.els.image) return Promise.resolve();
  debug('hiding image');
  return fastdom.animate(function() {
    this.els.image.hidden = true;
    return this.els.image;
  }, this);
};

WebsiteEmbedTile.prototype.showImage = function() {
  if (!this.els.image) return Promise.resolve();
  debug('showing image');
  return fastdom.animate(function() {
    this.els.image.hidden = false;
    return this.els.image;
  }, this);
};

WebsiteEmbedTile.prototype.scrollToTop = function() {
  return fastdom
    .measure(function() {
      return -this.el.scrollTop;
    }.bind(this))

    .mutate(function(translateY) {
      debug('translateY', translateY);
      this.els.inner.style.transform = 'translateY(' + translateY + 'px)';
      this.el.scrollTop = 0;
    }.bind(this)) // fix ctx arg

    .animate(function() {
      this.els.collapsed.style.transform = '';
      this.els.inner.style.transition = 'transform 300ms';
      this.els.inner.style.transform = '';
      return this.els.inner;
    }, this)

    .then(function() {
      this.els.inner.style.transition = '';
    }.bind(this));
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
      this.els.loading.style.transition = 'opacity 600ms 100ms';
    }.bind(this))

    .animate(function() {
      this.els.loading.style.opacity = 1;
      return this.els.loading;
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
