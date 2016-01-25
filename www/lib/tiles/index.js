
/**
 * Exports
 */

module.exports = TilesView;

function TilesView() {
  this.el = document.createElement('div');
  this.className = 'tiles-view';
}

TilesView.prototype = {
  add: function(id, data) {

  },

  remove: function(id) {

  },

  appendTo: function(parent) {
    parent.appendChild(this.el);
    return this;
  }
};
