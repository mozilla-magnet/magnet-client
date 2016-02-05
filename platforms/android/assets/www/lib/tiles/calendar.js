
/**
 * Dependencies
 */

var el = require('../utils/el');
var Tile = require('./tile');
require('./calendar.css');

/**
 * Exports
 */

module.exports = CalendarTile;

/**
 * Extends `Tile`
 */

CalendarTile.prototype = Object.create(Tile.prototype);

function CalendarTile() {
  Tile.apply(this, arguments);
  this.el.className += ' tile-calendar';
}

CalendarTile.prototype.render = function(data) {
  Tile.prototype.render.apply(this, arguments);
  this.els.icon = el('div', 'tile-calenar-icon', this.els.inner);
  this.els.imageNode = el('img', '', this.els.icon);
  this.els.title = el('h3', 'tile-calendar-title', this.els.inner);
  this.els.list = el('ul', 'tile-calendar-list', this.els.inner);

  data.calendar
    .slice(0, 5)
    .forEach(function(event) {
      var li = el('li', 'tile-calendar-item', this.els.list);
      var time = el('time', 'tile-calendar-item-time', li);
      var summary = el('h4', 'tile-calendar-item-summary', li);
      var start = new Date(event.start * 1000);
      var end = new Date(event.end * 1000);

      summary.textContent = event.summary;
      time.textContent = [
        format(start, '%A'),
        start.getDate(),
        format(start, '%b'),
        pad(start.getHours()) + ':' + pad(start.getMinutes()),
        '-',
        pad(end.getHours()) + ':' + pad(end.getMinutes()),
      ].join(' ');
    }, this);
};

/**
 * Utils
 */

function format(date, token) {
  var strings = {
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  };

  switch (token) {
    case '%b': return strings.months[date.getMonth()];
    case '%A': return strings.days[date.getDay()];
    case '%Y': return String(date.getFullYear());
    case '%d': return String(date.getDate());
  }
}

function pad(n) {
  return n > 9 ? n : '0' + n;
}
