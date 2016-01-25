
/**
 * Dependencies
 */

var HeaderView = require('./header');
var Scanner = require('./scanner');
var GridView = require('./grid');

require('./app.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 1 ? console.log.bind(console, '[App]') : function() {};

/**
 * Exports
 */

module.exports = App;

function App(el) {
  this.el = el;
  this.els = {
    icons: []
  };

  document.body.addEventListener('click', this.onClick.bind(this));

  this.scanner = new Scanner();
  this.scanner.on('found', this.onFound.bind(this));
  this.scanner.on('lost', this.onLost.bind(this));
  this.scanner.start();

  this.header = new HeaderView().appendTo(this.el);
  this.grid = new GridView().appendTo(this.el);
  // this.tiles = new TilesView().appendTo(this.el);
}

App.prototype = {
  start: function() {
    this.scanner.start();
  },

  stop: function() {
    this.scanner.stop();
  },

  /**
   * Open any link clicks in the
   * device's default browser.
   *
   * @param  {Event} e
   */
  onClick: function(e) {
    var link = e.target.closest('a');
    if (!link) return;
    debug('click', link.href);
    window.open(link.href, '_system');
  },

  onFound: function(url, data) {
    debug('found', url);
    this.grid.add(url, data);
  },

  onLost: function(url) {
    debug('lost', url);
  },

  addApp: function(url) {

  },

  remove: function() {

  }
};
