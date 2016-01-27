
/**
 * Dependencies
 */

var registry = {
  website: require('./tile'),
  twitter: require('./twitter'),
  android: require('./android-app')
};

require('./tiles.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 0 ? console.log.bind(console, '[tiles-view]') : function() {};

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

    // Shim, remove once types are implemented
    if (data.twitter) data.type = 'twitter';
    if (data.android) data.type = 'android';

    var type = data.type || 'website';
    var Tile = registry[type];

    if (!Tile) return debug('unknown type', type);

    var tile = new Tile(data);
    this.tiles[id] = tile;
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
  }
};
