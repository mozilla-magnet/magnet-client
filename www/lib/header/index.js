
var Emitter = require('events');

require('./header.css');

module.exports = Header;

function Header() {
  Emitter.call(this); // super

  this.el = document.createElement('header');
  this.el.className = 'app-header';
  this.render();
  this.els = {
    gridButton: this.el.querySelector('.grid-button'),
    tilesButton: this.el.querySelector('.tiles-button')
  };

  this.els.tilesButton.addEventListener('click', function() {
    this.emit('buttonclick');
  }.bind(this));

  this.els.gridButton.addEventListener('click', function() {
    this.emit('buttonclick');
  }.bind(this));
}

/**
 * Extends `Emitter`
 */

Header.prototype = Object.create(Emitter.prototype);

Header.prototype.render = function() {
  this.el.innerHTML =
    '<h1>Magnet</h1>' +
    '<button class="grid-button"><svg class="icon icon-view_module"><use xlink:href="#icon-view_module"></use></svg></button>' +
    '<button class="tiles-button"><svg class="icon icon-view_stream"><use xlink:href="#icon-view_stream"></use></svg></button>';
};

Header.prototype.toggleButton = function(grid) {
  this.els.tilesButton.hidden = !grid;
  this.els.gridButton.hidden = grid;
};

Header.prototype.appendTo = function(parent) {
  parent.appendChild(this.el);
  return this;
};