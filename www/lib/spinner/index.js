
/**
 * Dependencies
 */

require('./spinner.css');

/**
 * Exports
 */

module.exports = SpinnerView;

function SpinnerView(data) {
  this.el = el('div', 'spinner');
  this.render();
}

SpinnerView.prototype.render = function(data) {
  this.el.innerHTML = [
    '<div class="rect1"></div>',
    '<div class="rect2"></div>',
    '<div class="rect3"></div>',
    '<div class="rect4"></div>',
    '<div class="rect5"></div>'
  ].join('');
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
