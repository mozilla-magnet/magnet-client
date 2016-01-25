
var App = require('./lib/app');

document.addEventListener('deviceready', function() {
  var el = document.querySelector('.app');
  window.app = new App(el);
});
