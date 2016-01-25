
/**
 * Dependencies
 */

require('./grid.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[grid-view]') : function() {};

/**
 * Exports
 */

module.exports = GridView;

function GridView() {
  this.el = document.createElement('div');
  this.el.className = 'grid';
}

GridView.prototype = {
  add: function(id, data) {
    debug('add', id, data);

    var el = document.createElement('li');
    var link = document.createElement('a');
    var icon = document.createElement('div');
    var title = document.createElement('h3');

    // outer
    el.className = 'grid-app';
    el.id = 'grid-app-' + id;

    // inner
    link.href = data.url;
    link.className = 'inner';
    el.appendChild(link);

    // icon
    icon.className = 'grid-app-icon';
    link.appendChild(icon);

    // title
    title.className = 'grid-app-title';
    title.textContent = data.title;
    link.appendChild(title);

    // attach to dom
    this.el.appendChild(el);
  },

  remove: function(id) {
    debug('remove', id);
    var item = this.el.querySelector('#grid-app-' + id);
    if (!item) return;
    item.remove();
  },

  appendTo: function(parent) {
    parent.appendChild(this.el);
    return this;
  }
};
