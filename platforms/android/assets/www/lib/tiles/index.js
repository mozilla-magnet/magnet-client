
/**
 * Dependencies
 */

var debug = require('../utils/debug')('[tiles-view]', 1);
var fastdom = require('fastdom-sequencer');
var registry = {
  website: require('./website'),
  embed: require('./embed')
};

require('./tiles.css');

/**
 * Exports
 */

module.exports = TilesView;

function TilesView() {
  this.el = document.createElement('div');
  this.el.className = 'tiles hidden';
  this.tiles = {};
}

TilesView.prototype = {
  add: function(id, data) {
    debug('add', id, data);
    if (!data) return;
    if (this.tiles[id]) return debug('already exists');

    var Tile = data.embed ? registry.embed : registry.website;
    var tile = new Tile(data);

    this.tiles[id] = tile;
    tile.el.addEventListener('click', this.onTileClick.bind(this, tile));
    tile.on('close', this.collapseTile.bind(this, tile));
    this.el.appendChild(tile.el);
  },

  remove: function(id) {
    debug('remove', id);
    var tile = this.tiles[id];
    if (tile) tile.remove();
  },

  toggle: function(value) {
    if (value) this.el.classList.remove('hidden');
    else this.el.classList.add('hidden');
  },

  appendTo: function(parent) {
    parent.appendChild(this.el);
    return this;
  },

  onTileClick: function(tile, e) {
    debug('tile click');
    this.expandTile(tile);
  },

  expandTile: function(tile) {
    var before = tile.el.previousElementSibling;
    var after = tile.el.nextElementSibling;
    var measurements;

    return fastdom
      .measure(function() {
        var tilesHeight = this.el.clientHeight;
        var top = rect(tile.el).top;

        measurements = this.measurements = {
          scrollTop: tile.el.offsetTop,
          translateY: -(top - 50),
          afterTranslateY: Math.max(tilesHeight - (rect(after).top - 50), 0),
          previousScrollTop: this.el.scrollTop,
          tileHeight: tilesHeight
        };
      }, this)

      .animate(tile.el, function() {
        debug('animate', measurements);
        var translateY = measurements.translateY;
        style([tile.el, before, after], { transition: 'transform 300ms' });
        style([tile.el, before], { transform: 'translateY(' + translateY + 'px)' });
        style(after, { transform: 'translateY(' + measurements.afterTranslateY + 'px)' });

      }.bind(this))

      .mutate(function() {
        this.el.scrollTop = measurements.scrollTop;
        style(this.el, { overflow: 'hidden' });

        style(tile.el, {
          height: measurements.tileHeight + 'px',
          overflowX: 'hidden',
          overflowY: 'scroll'
        });

        style([tile.el, before, after], {
          transition: '',
          transform: '',
        });
      }.bind(this))

      .animate(this.el, 200, function() {
        tile.el.classList.add('expanded');
      }.bind(this));
  },

  collapseTile: function(tile) {
    debug('collapse tile');

    var before = tile.el.previousElementSibling;
    var after = tile.el.nextElementSibling;
    var measurements = this.measurements;

    return fastdom
      .animate(this.el, 200, function() {
        tile.el.classList.remove('expanded');
      }.bind(this))

      .mutate(function() {
        debug('animate', measurements);
        var translateY = measurements.translateY;

        style([tile.el, before], {
          transform: 'translateY(' + translateY + 'px)'
        });

        style(after, {
          transform: 'translateY(' + measurements.afterTranslateY + 'px)'
        });

        style(this.el, { overflow: '' });
        this.el.scrollTop = measurements.previousScrollTop;

        style(tile.el, {
          overflowX: '',
          overflowY: '',
          height: ''
        });
      }.bind(this))

      .animate(tile.el, function() {
        style([tile.el, before, after], {
          transition: 'transform 300ms',
          transform: ''
        });
      })

      .mutate(function() {
        style([tile.el, before, after], { transition: '' });
      }.bind(this));
  }
};

/**
 * Utils
 */

function rect(el) {
  return el.getBoundingClientRect();
}

function style(el, props) {
  var els = [].concat(el);
  els.forEach(function(el) {
    if (el) for (var key in props) el.style[key] = props[key];
  });
}
