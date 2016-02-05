
/**
 * Dependencies
 */

require('./grid.css');

var registry = {
  website: require('./website'),
  profile: require('./profile'),
  image: require('./image'),
  video: require('./video'),
  audio: require('./audio')
};

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 0 ? console.log.bind(console, '[grid-view]') : function() {};

/**
 * Exports
 */

module.exports = GridView;

function GridView() {
  this.el = document.createElement('div');
  this.el.className = 'grid';
  this.icons = {};
  this.els = {};
  this.render();
}

GridView.prototype = {
  render: function() {
    this.els.inner = document.createElement('div');
    this.els.inner.className = 'inner';
    this.el.appendChild(this.els.inner);
  },

  add: function(id, data) {
    debug('add', id, data);

    if (!data) return;
    if (this.icons[id]) return debug('already exists');

    var Icon = registry[data.type] || registry.website;
    var icon = new Icon(data);

    this.icons[id] = icon;
    this.els.inner.appendChild(icon.el);
  },

  toggle: function(value) {
    if (value) this.el.classList.remove('hidden');
    else this.el.classList.add('hidden');
  },

  remove: function(id) {
    debug('remove', id);
    var tile = this.tiles[id];
    if (tile) tile.remove();
  },

  appendTo: function(parent) {
    parent.appendChild(this.el);
    return this;
  }
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
