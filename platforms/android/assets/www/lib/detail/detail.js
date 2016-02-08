
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

function DetailView(params) {
  Emitter.call(this);
  this.el = el('div', 'detail-panel');
  this.views = {};
  this.els = { parent: params.parent };
  this.data = params.data;
  this.rendered = fastdom.mutate(this.render.bind(this, this.data));
  debug('initialized', params);
}

DetailView.prototype.render = function(data) {
  this.els.background = el('div', 'background', this.el);
  this.els.content = el('div', 'content', this.el);

  this.views.header = new HeaderView({ title: data.title });
  this.els.content.appendChild(this.views.header.el);

  if (data.embed) this.renderEmbed(data.embed);
  else if (data.image) this.renderImage(data.image);

  this.els.main = el('div', 'tile-website-main', this.els.content);

  this.renderIcon(data.icon);

  var title = el('h3', 'tile-website-title', this.els.main);
  title.textContent = data.title;

  if (data.description) {
    var desc = el('p', 'tile-website-desc', this.els.main);
    desc.textContent = data.description;
  }

  var footer = el('footer', 'detail-footer', this.els.main);
  this.els.closeButton = el('button', 'detail-close-button', footer);
  this.els.closeButton.textContent = 'close';
  this.els.closeButton.onclick = this.close.bind(this);
};

DetailView.prototype.renderIcon = function(src) {
  var icon = el('div', 'tile-website-icon', this.els.main);
  var iconInner = el('div', 'inner', icon);

  if (!src) {
    this.el.classList.add('no-icon');
    return;
  }

  var imageNode = el('img', '', iconInner);
  imageNode.src = src;
  imageNode.onload = function(e) {
    var area = imageNode.naturalWidth * imageNode.naturalHeight;
    if (area < (80 * 80)) this.el.classList.add('no-icon');
  }.bind(this);
};

DetailView.prototype.renderImage = function(src) {
  var image = el('div', 'tile-website-image', this.els.content);
  var inner = el('div', 'inner', image);
  var node = el('img', '', inner);

  node.src = src;
  node.onload = function() {
    image.classList.add('loaded');
  };
};

DetailView.prototype.renderEmbed = function(embed) {
  var container = el('div', 'detail-embed', this.els.content);
  var aspect = embed.height / embed.width || 1;

  container.innerHTML = cleanHtml(embed.html);

  var iframe = container.querySelector('iframe');
  if (iframe) {
    var hasQuery = !!~iframe.src.indexOf('?');
    iframe.src += (!hasQuery ? '?' : '&') + 'autoplay=1&rel=0&controls=0&showinfo=0&title=0&portrait=0&badge=0&modestbranding=1&byline=0';
    container.style.paddingBottom = (aspect * 100) + '%';
    this.el.classList.add('loading');
    iframe.onload = function() {
      this.el.classList.add('embed-active');
      this.el.classList.remove('loading');
    }.bind(this);
  }

  this.els.content.appendChild(container);
};

DetailView.prototype.open = function() {
  this.opened = this.rendered.then(function() {
    var background = this.els.background;
    var parent = this.els.parent;
    var self = this;
    var measurements;

    return fastdom
      .measure(function() {
        return parent.getBoundingClientRect();
      })

      .mutate(function(rect) {
        var scaleY = window.innerHeight / rect.height;
        var translateY = -(rect.top / scaleY);
        var maxDuration = 300;

        measurements =  {
          translateY: translateY,
          scaleX: window.innerWidth / rect.width,
          scaleY: scaleY,
          height: rect.height,
          width: rect.width,
          top: rect
        };

        var duration = rect.top / window.innerHeight * maxDuration;
        duration = Math.max(duration, 200);

        var style = background.style;
        style.width = rect.width + 'px';
        style.height = rect.height + 'px';
        style.left = rect.left + 'px';
        style.top = rect.top + 'px';
        style.transformOrigin = '50% 0';
        style.transition = 'transform ' + duration + 'ms';
        style.opacity = 1;
      })

      .animate(background, function() {
        background.style.transform = 'scaleX(' + measurements.scaleX + ') ' +
          'scaleY(' + measurements.scaleY + ') ' +
          'translateY(' + measurements.translateY + 'px) ';
      })

      .then(function() {
        self.el.classList.add('opened');
      });
  }.bind(this));
};

DetailView.prototype.close = function() {
  var background = this.els.background;
  var content = this.els.content;
  var parent = this.els.parent;
  var self = this;

  return fastdom
    .measure(function() {
      return parent.getBoundingClientRect();
    })

    .animate(content, function() {
      self.el.classList.remove('opened');
    })

    .animate(background, function() {
      background.style.transform = '';
      background.style.opacity = '';
    })

    .then(function() {
      self.el.remove();
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

function cleanHtml(html) {
  return html.replace(/<\!\[CDATA\[(.+)\]\]>/, '$1');
}
