
require('./header.css');

module.exports = Header;

function Header() {
  this.el = document.createElement('header');
}

Header.prototype = {
  render: function() {
    this.el.innerHTML =
      '<h1>Applicable</h1>' +
      '<button>toggle</button>';
  },

  appendTo: function(parent) {
    parent.appendChild(this.el);
    return this;
  }
};