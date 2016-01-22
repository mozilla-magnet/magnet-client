
/**
 * Dependencies
 */

var Scanner = require('./scanner');

var debug = 1 ? console.log.bind(console, '[App]') : function() {};

/**
 * Exports
 */

module.exports = App;

function App() {
  this.scanner = new Scanner();
  this.scanner.on('found', this.onFound.bind(this));
  this.scanner.on('lost', this.onLost.bind(this));
  this.scanner.start();
}

App.prototype = {
  start: function() {
    this.scanner.start();
  },

  stop: function() {
    this.scanner.stop();
  },

  onFound: function(items) {
    debug('found', items);
  },

  onLost: function(items) {
    debug('lost', items);
  }
};
