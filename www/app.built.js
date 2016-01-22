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
	  window.app = new App();
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Scanner = __webpack_require__(2);

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var Bluetooth = __webpack_require__(3);
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
	  this.emit('found', item);
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
	}

	Bluetooth.prototype.start = function() {
	  this.enable(this.startScan.bind(this));
	  debug('started');
	};

	Bluetooth.prototype.stop = function() {

	};

	Bluetooth.prototype.enable = function(done) {
	  this.ble.enable(done);
	};

	window.buffers = [];

	Bluetooth.prototype.startScan = function() {
	  debug('start scan ...');
	  this.ble.startScan([], function(device) {
	    debug('found', device);
	    var advertising = device.advertising;
	    var decoded = eddystone.decode(new Uint8Array(advertising));
	    this.emit('found', decoded.url);
	  }.bind(this));
	};

	/**
	 * Utils
	 */

	function bytesToString(buffer) {
	  return String.fromCharCode.apply(null, new Uint8Array(buffer));
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	
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
	  result.eddystoneUUI = [data[i++], data[i++]];
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

	// var test1 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 19, 22, 216, 254, 0, 242, 3, 103, 111, 111, 46, 103, 108, 47, 104, 113, 66, 88, 69, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	// var test2 = new Uint8Array([2, 1, 4, 3, 3, 216, 254, 22, 22, 216, 254, 0, 242, 2, 116, 97, 108, 116, 111, 110, 109, 105, 108, 108, 46, 99, 111, 46, 117, 107, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	// exports.decode(test1);


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

	var zeroconf = __webpack_require__(7);
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
/***/ function(module, exports) {

	module.exports = window.ZeroConf;

/***/ }
/******/ ]);