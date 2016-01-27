
/**
 * Dependencies
 */

var HeaderView = require('./header');
var Scanner = require('./scanner');
var TilesView = require('./tiles');
var GridView = require('./grid');

require('./app.css');

/**
 * Logger
 *
 * @return {Function}
 */
var debug = 0 ? console.log.bind(console, '[App]') : function() {};

/**
 * Exports
 */

module.exports = App;

function App(el) {
  this.el = el;
  this.els = {};

  document.body.addEventListener('click', this.onClick.bind(this));
  this.gridView = true;

  this.scanner = new Scanner();
  this.scanner.on('found', this.onFound.bind(this));
  this.scanner.on('lost', this.onLost.bind(this));
  this.scanner.start();

  this.render();
  this.bindEvents();

  // this.toggleView();
}

App.prototype = {
  render: function() {
    var content = document.createElement('div');
    content.className = 'content';

    this.grid = new GridView().appendTo(content);
    this.tiles = new TilesView().appendTo(content);

    // attach to document
    this.header = new HeaderView().appendTo(this.el);
    this.el.appendChild(content);
  },

  bindEvents: function() {
    this.header.on('buttonclick', this.toggleView.bind(this));
  },

  start: function() {
    this.scanner.start();
  },

  stop: function() {
    this.scanner.stop();
  },

  toggleView: function() {
    this.gridView = !this.gridView;
    this.grid.toggle(this.gridView);
    this.tiles.toggle(!this.gridView);
    this.header.toggleButton(this.gridView);
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
    this.tiles.add(url, data);
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
