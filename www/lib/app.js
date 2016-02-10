
/**
 * Dependencies
 */

var debug = require('./utils/debug')('[App]', 1);
var fastdom = require('fastdom-sequencer');
var HeaderView = require('./header');
var Scanner = require('./scanner');
var TilesView = require('./tiles');
var GridView = require('./grid');

require('./app.css');

/**
 * Exports
 */

module.exports = App;

function App(el) {
  this.el = el;
  this.els = {};

  document.body.addEventListener('click', this.onClick.bind(this));
  document.addEventListener('backbutton', this.onBackButton.bind(this));

  this.gridView = true;
  this.scanner = new Scanner();
  this.scanner.on('found', this.onFound.bind(this));
  this.scanner.on('lost', this.onLost.bind(this));
  this.scanner.start();

  this.render();
  this.bindEvents();
}

App.prototype = {
  render: function() {
    var content = document.createElement('div');
    content.className = 'content';

    this.grid = new GridView();
    this.tiles = new TilesView();
    this.header = new HeaderView({ title: 'magnet' });

    content.appendChild(this.grid.el);
    content.appendChild(this.tiles.el);
    this.el.appendChild(this.header.el);
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
    fastdom.animate(function() {
      this.gridView = !this.gridView;
      this.grid.toggle(this.gridView);
      this.tiles.toggle(!this.gridView);
      this.header.toggleButton(this.gridView);
      return this.tiles.el;
    }.bind(this));
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

  onBackButton: function(e) {
    debug('back button pressed');
    if (this.tiles.expanded) {
      e.preventDefault();
      this.tiles.collapse();
    }
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
