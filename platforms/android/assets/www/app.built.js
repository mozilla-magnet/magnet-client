/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	var App = __webpack_require__(1);

	document.addEventListener('deviceready', function() {
	  var el = document.querySelector('.app');
	  window.app = new App(el);
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var HeaderView = __webpack_require__(15);
	var Scanner = __webpack_require__(2);
	var GridView = __webpack_require__(7);

	__webpack_require__(12);

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Bluetooth = __webpack_require__(3);
	var metadata = __webpack_require__(14);
	var Emitter = __webpack_require__(5);
	var MDNS = __webpack_require__(6);

	/**
	 * Exports
	 */

	module.exports = Scanner;

	/**
	 * Extends `Emitter`
	 */

	Scanner.prototype = Object.create(Emitter.prototype);

	function Scanner() {
	  this.sources = [
	    new Bluetooth(),
	    new MDNS()
	  ];
	}

	Scanner.prototype.start = function() {
	  this.sources.forEach(function(source) {
	    source.on('found', this.onFound.bind(this));
	    source.on('lost', this.onLost.bind(this));
	    source.start();
	  }, this);
	};

	Scanner.prototype.stop =function() {
	  this.sources.forEach(function(source) {
	    source.stop();
	  });
	};

	Scanner.prototype.onFound = function(item) {
	  metadata(item).then(function(data) {
	    this.emit('found', item, data);
	  }.bind(this));
	};

	Scanner.prototype.onLost = function(item) {
	  this.emit('lost', item);
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var eddystone = __webpack_require__(4);
	var Emitter = __webpack_require__(5);

	var debug = 1 ? console.log.bind(console, '[Bluetooth]') : function() {};

	/**
	 * Exports
	 */

	module.exports = Bluetooth;

	/**
	 * Extends `Emitter`
	 */

	Bluetooth.prototype = Object.create(Emitter.prototype);

	function Bluetooth() {
	  Emitter.call(this);
	  this.ble = window.ble;
	  this.beacons = {};
	}

	Bluetooth.prototype.start = function() {
	  this.enable(this.startScan.bind(this));
	  debug('started');
	};

	Bluetooth.prototype.stop = function() {
	  this.ble.stopScan();
	};

	Bluetooth.prototype.enable = function(done) {
	  this.ble.enable(done);
	};

	Bluetooth.prototype.startScan = function() {
	  debug('start scanning');
	  this.ble.startScan([], this.onFound.bind(this));
	};

	Bluetooth.prototype.onFound = function(device) {
	  debug('found', device);

	  var data = eddystone.decode(new Uint8Array(device.advertising));
	  var url = data && data.url;
	  if (!url) return debug('invalid device', url);

	  var isNew = !this.hasBeacon(url);
	  var beacon = this.createBeacon(url).renew();

	  if (isNew) this.emit('found', beacon.url);
	};

	Bluetooth.prototype.hasBeacon = function(url) {
	  return !!this.beacons[url];
	};

	Bluetooth.prototype.createBeacon = function(url) {
	  if (this.hasBeacon(url)) return this.beacons[url];
	  var beacon = this.beacons[url] = new Beacon(url);
	  beacon.on('expired', this.onLost.bind(this, beacon));
	  return beacon;
	};

	Bluetooth.prototype.onLost = function(beacon) {
	  debug('lost', beacon);
	  delete this.beacons[beacon.url];
	  this.emit('lost', beacon.url);
	};

	/**
	 * Represents an found beacon. Will
	 * 'expire' is not renewed.
	 *
	 * @param {String} url
	 */
	function Beacon(url) {
	  this.url = url;
	  this.onexpiry = this.onexpiry.bind(this);
	}

	/**
	 * Extends `Emitter`
	 */

	Beacon.prototype = Object.create(Emitter.prototype);

	Beacon.prototype.expires = 60000;

	Beacon.prototype.renew = function() {
	  if (this.expired) return;
	  clearTimeout(this.timeout);
	  this.timeout = setTimeout(this.onexpiry, this.expires);
	  return this;
	};

	Beacon.prototype.onexpiry = function() {
	  this.expired = true;
	  this.emit('expired');
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	
	var SUPPORTED_SERVICES = [
	  0xfed8, // uri beacon
	  0xfeaa // eddystone beacon
	];

	var prefixes = [
	  'http://www.',
	  'https://www.',
	  'http://',
	  'https://'
	];

	var suffixes = [
	  '.com/',
	  '.org/',
	  '.edu/',
	  '.net/',
	  '.info/',
	  '.biz/',
	  '.gov/',
	  '.com',
	  '.org',
	  '.edu',
	  '.net',
	  '.info',
	  '.biz',
	  '.gov'
	];

	exports.decode = function(data) {
	  var end = data[0];
	  var i = 0;
	  var url = '';
	  var result = {};

	  // Flags:

	  while (i++ < end) {}

	  // Complete service list (UUIDs):

	  end = i + data[i];
	  while (i++ < end) {}

	  // Service Data:

	  end = i + data[i];
	  result.serviceDataLength = data[i++];
	  result.serviceDataTypeValue = data[i++];
	  result.serviceUUI = [data[i++], data[i++]];

	  if (!isEddyStoneBeacon(result.serviceUUI)) return false;

	  result.eddystoneFrameType = data[i++];
	  result.txPower = data[i++];
	  result.prefix = prefixes[data[i]];

	  // URI:

	  while (i++ < end) {
	    url += data[i] < suffixes.length
	      ? suffixes[i]
	      : String.fromCharCode(data[i]);
	  }

	  // prepend prefix
	  result.url = result.prefix + url;

	  return result;
	};

	function isEddyStoneBeacon(uuid) {
	  var id = ((uuid[1] << 8) ^ uuid[0]);
	  return !!~SUPPORTED_SERVICES.indexOf(id);
	}

	// var beacon1 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 19, 22, 216, 254, 0, 242, 3, 103, 111, 111, 46, 103, 108, 47, 104, 113, 66, 88, 69, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	// var beacon2 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 22, 22, 216, 254, 0, 242, 2, 116, 97, 108, 116, 111, 110, 109, 105, 108, 108, 46, 99, 111, 46, 117, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	// var nonBeacon = new Uint8Array([2, 1, 6, 26, 255, 76, 0, 2, 21, 80, 114, 111, 120, 97, 109, 65, 66, 140, 69, 66, 101, 97, 99, 111, 110, 171, 219, 174, 136, 191, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	// console.log(exports.decode(beacon1));
	// console.log(exports.decode(beacon2));
	// console.log(exports.decode(nonBeacon));


/***/ },
/* 5 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Emitter = __webpack_require__(5);

	var debug = 0 ? console.log.bind(console, '[MDNS]') : function() {};

	/**
	 * Exports
	 */

	module.exports = MDNS;

	/**
	 * Extends `Emitter`
	 */

	MDNS.prototype = Object.create(Emitter.prototype);

	function MDNS() {
	  Emitter.call(this);
	  this.zeroconf = window.ZeroConf;
	  this.cache = {};
	}

	MDNS.prototype.start = function() {
	  this.zeroconf.watch('_http._tcp.local.', this.onStateChange.bind(this));
	  debug('started');
	};

	MDNS.prototype.stop = function() {

	};

	MDNS.prototype.onStateChange = function(item) {
	  debug('change', item);
	  switch (item.action) {
	    case 'added': return this.onFound(item.service);
	    case 'removed': return this.onLost(item.service);
	  }
	};

	MDNS.prototype.onFound = function(service) {
	  debug('found', service);
	  var url = service.urls && service.urls[0];
	  if (!url) return;
	  this.cache[url] = service;
	  this.emit('found', url);
	};

	MDNS.prototype.onLost = function(service) {
	  debug('lost', service);
	  var url = service.urls && service.urls[0];
	  if (!url) return;
	  if (!this.cache[url]) return;
	  delete this.cache[url];
	  this.emit('lost', url);
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	__webpack_require__(8);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[grid-view]') : function() {};

	/**
	 * Exports
	 */

	module.exports = GridView;

	function GridView() {
	  this.el = document.createElement('div');
	  this.el.className = 'grid';
	}

	GridView.prototype = {
	  add: function(id, data) {
	    debug('add', id, data);

	    var el = document.createElement('li');
	    var link = document.createElement('a');
	    var icon = document.createElement('div');
	    var title = document.createElement('h3');

	    // outer
	    el.className = 'grid-app';
	    el.id = 'grid-app-' + id;

	    // inner
	    link.href = data.url;
	    link.className = 'inner';
	    el.appendChild(link);

	    // icon
	    icon.className = 'grid-app-icon';
	    link.appendChild(icon);

	    // title
	    title.className = 'grid-app-title';
	    title.textContent = data.title;
	    link.appendChild(title);

	    // attach to dom
	    this.el.appendChild(el);
	  },

	  remove: function(id) {
	    debug('remove', id);
	    var item = this.el.querySelector('#grid-app-' + id);
	    if (!item) return;
	    item.remove();
	  },

	  appendTo: function(parent) {
	    parent.appendChild(this.el);
	    return this;
	  }
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(9);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(11)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./grid.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./grid.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "\n/*.grid-app {\n  display: block;\n  width: 128px;\n  float: left;\n}*/\n\n.grid {\n  box-sizing: border-box;\n  flex-flow: row wrap;\n  display: flex;\n  margin: 0;\n  padding: 7px;\n  width: 100%;\n\n  list-style: none;\n}\n\n.grid-app {\n  display: flex;\n  flex: 0 0 33%;\n  justify-content: center;\n  transition: opacity 200ms;\n}\n\n.grid-app > .inner {\n  flex: 0 1 auto;\n  display: block;\n  width: 100px;\n  padding: 8px;\n\n  color: inherit;\n  text-decoration: none;\n}\n\n.grid-app-icon {\n  width: 100%;\n  padding-bottom: 100%;\n  border-radius: 50%;\n  background: #eee;\n}\n\n.grid-app-title {\n  margin: 0;\n  overflow: hidden;\n\n  font-size: 13px;\n  font-style: italic;\n  font-weight: normal;\n  text-align: center;\n  line-height: 2.6em;\n\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: #555;\n}\n", ""]);

	// exports


/***/ },
/* 10 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(13);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(11)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./app.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./app.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "\n* {\n  -webkit-tap-highlight-color: rgba(0,0,0,0); /* make transparent link selection, adjust last value opacity 0 to 1.0 */\n}\n\nbody {\n  -webkit-touch-callout: none; /* prevent callout to copy image, etc when tap to hold */\n  -webkit-text-size-adjust: none; /* prevent webkit from resizing text to fit */\n  -webkit-user-select: none; /* prevent copy paste, to allow, change 'none' to 'text' */\n\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n\n  font-size: 12px;\n  font-family: sans-serif;\n}\n", ""]);

	// exports


/***/ },
/* 14 */
/***/ function(module, exports) {

	
	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[metadata]') : function() {};


	var endpoint = 'http://10.246.27.23:3030'; // endpoint of metadata service



	module.exports = function(url) {
	  return request({ objects: [{ url: url }]});
	};

	function request(body) {
	  return new Promise(function(resolve) {
	    debug('request', body);
	    var xhr = new XMLHttpRequest();
	    var data = JSON.stringify(body);
	    xhr.open('POST', endpoint + '/api/v1/metadata', true);
	    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	    xhr.send(data);
	    xhr.onload = function() {
	      debug('response', xhr.responseText);
	      resolve(JSON.parse(xhr.responseText)[0]);
	    };
	  });
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	__webpack_require__(16);

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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(11)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./header.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./header.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(10)();
	// imports


	// module
	exports.push([module.id, "", ""]);

	// exports


/***/ }
/******/ ]);