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

	var HeaderView = __webpack_require__(2);
	var Scanner = __webpack_require__(8);
	var TilesView = __webpack_require__(13);
	var GridView = __webpack_require__(44);

	__webpack_require__(64);

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


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	var Emitter = __webpack_require__(3);

	__webpack_require__(4);

	module.exports = Header;

	function Header(options) {
	  Emitter.call(this); // super

	  this.el = document.createElement('header');
	  this.el.className = 'app-header';
	  this.render(options);
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

	Header.prototype.render = function(data) {
	  this.el.innerHTML =
	    '<h1>' + data.title + '</h1>' +
	    '<button class="grid-button icn-grid" hidden></button>' +
	    '<button class="tiles-button icn-stop"></button>';
	};

	Header.prototype.toggleButton = function(grid) {
	  this.els.tilesButton.hidden = !grid;
	  this.els.gridButton.hidden = grid;
	};

	Header.prototype.appendTo = function(parent) {
	  parent.appendChild(this.el);
	  return this;
	};

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(5);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
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
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.app-header {\n  position: relative;\n  height: 50px;\n  color: #999;\n}\n\n.app-header h1 {\n  margin: 0;\n  text-align: center;\n  font-size: 21px;\n  line-height: 50px;\n  font-weight: normal;\n  font-style: italic;\n  letter-spacing: -0.5px;\n}\n\n.app-header button {\n  position: absolute;\n  right: 0;\n  top: 0;\n\n  display: flex;\n  height: 100%;\n  padding: 0 14px;\n  border: 0;\n\n  font-size: 20px;\n  background: none;\n  border-radius: 0;\n  outline: 0;\n  color: #4C92E2;\n}\n\n.app-header button[hidden] {\n  opacity: 0;\n  visibility: hidden;\n}\n", ""]);

	// exports


/***/ },
/* 6 */
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
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Bluetooth = __webpack_require__(9);
	var metadata = __webpack_require__(11);
	var Emitter = __webpack_require__(3);
	var MDNS = __webpack_require__(12);

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
	  metadata.get(item).then(function(data) {
	    this.emit('found', item, data);
	  }.bind(this))
	  .catch(console.error.bind(console));
	};

	Scanner.prototype.onLost = function(item) {
	  this.emit('lost', item);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var eddystone = __webpack_require__(10);
	var Emitter = __webpack_require__(3);

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
	  // this.enable(this.startScan.bind(this));

	  setTimeout(function() {
	    this.emit('found', 'http://twitter.com/wilsonpage');
	    // this.emit('found', 'http://twitter.com/mepartoconmigo');
	    this.emit('found', 'http://taltonmill.co.uk');
	    // this.emit('found', 'https://play.google.com/store/apps/details?id=com.whatsapp');
	    // this.emit('found', 'https://play.google.com/store/apps/details?id=jp.naver.line.android');
	    // this.emit('found', 'https://vimeo.com/152985022');
	    this.emit('found', 'https://www.youtube.com/watch?v=kh29_SERH0Y');
	    this.emit('found', 'https://soundcloud.com/imaginedherbalflows/evolve');
	    this.emit('found', 'https://play.spotify.com/track/2zMNWC0kbjfgjWpieSURja');
	    this.emit('found', 'http://wilsonpage.github.io/magnet-tfl-countdown/?eee');
	    // this.emit('found', 'https://calendar.google.com/calendar/ical/mozilla.com_2d3638353137343333373332%40resource.calendar.google.com/public/basic.ics');
	    // this.emit('found', 'http://www.bbc.co.uk/news/business-35416812');
	    // this.emit('found', 'https://twitter.com/wheresrhys/status/692416923720650754');
	  }.bind(this));

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
/* 10 */
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
/* 11 */
/***/ function(module, exports) {

	
	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[metadata]') : function() {};

	var endpoint = 'http://10.246.27.23:3030'; // endpoint of metadata service

	function Metadata() {
	  this.batch = [];
	}

	Metadata.prototype = {
	  get: function(url) {
	    debug('get');
	    var index = this.batch.length;
	    this.batch.push({ url: url });
	    return this.enqueue()
	      .then(function(response) {
	        debug('response', response);
	        var item = response[index];
	        if (!item) return debug('null response', url);
	        return normalize(item);
	      }).catch(console.error.bind(console));
	  },

	  enqueue: function() {
	    if (this.pending) return this.pending.promise;
	    this.pending = new Deferred();

	    var self = this;
	    setTimeout(function() {
	      request({ objects: self.batch })
	        .then(function(json) {
	          self.pending.resolve(json);
	          delete self.pending;
	          self.batch = [];
	        });
	    }, 200);

	    return this.pending.promise;
	  }
	};

	/**
	 * Exports
	 */

	module.exports = new Metadata();

	/**
	 * Utils
	 */

	function normalize(data) {
	  var normalized = {
	    url: data.url,
	    type: data.type || 'website',
	    title: data.title || data.url,
	    description: data.description,
	    icon: data.icon,
	    embed: data.embed
	  };

	  if (data.og_data) normalizeOg(normalized, data.og_data);
	  if (data.twitter) normalizeTwitter(normalized, data.twitter);
	  if (data.android) normalizeAndroid(normalized, data.android);

	  return normalized;
	}

	function normalizeOg(result, og) {
	  if (og.description) result.description = og.description;
	  if (og.title) result.title = og.title;
	  if (og.image) result.image = og.image;
	  result.data = og;
	}

	function normalizeTwitter(result, twitter) {
	  result.type = 'profile';
	  if (twitter.description) result.description = twitter.bio;
	  if (twitter.avatar.alt) result.title = twitter.avatar.alt;
	  if (twitter.user_id) result.title2 = twitter.user_id;
	  // if (twitter.avatar.src) result.image = twitter.avatar.src;
	  if (twitter.avatar.src) result.icon = twitter.avatar.src;
	  twitter.type = 'twitter';
	  result.data = twitter;
	}

	function normalizeAndroid(result, android) {
	  result.type = 'profile';
	  if (android.icon) result.icon = android.icon;
	  if (android.name) result.title = android.name;
	  android.type = 'android';
	  result.data = android;
	}

	function request(body) {
	  return new Promise(function(resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    var data = JSON.stringify(body);

	    xhr.open('POST', endpoint + '/api/v1/metadata', true);
	    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	    xhr.onerror = reject;
	    xhr.onload = function() {
	      debug('response');
	      resolve(JSON.parse(xhr.responseText));
	    };

	    xhr.send(data);
	    debug('request sent', body);
	  });
	}

	function Deferred() {
	  this.promise = new Promise(function(resolve, reject) {
	    this.resolve = resolve;
	    this.reject = reject;
	  }.bind(this));
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Emitter = __webpack_require__(3);

	var debug = 1 ? console.log.bind(console, '[MDNS]') : function() {};

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
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var registry = {
	  website: __webpack_require__(14),
	  embed: __webpack_require__(66)
	};


	__webpack_require__(42);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 0 ? console.log.bind(console, '[tiles-view]') : function() {};

	/**
	 * Exports
	 */

	module.exports = TilesView;

	function TilesView() {
	  this.el = document.createElement('div');
	  this.el.className = 'tiles hidden';
	  this.tiles = {};
	}

	TilesView.prototype = {
	  add: function(id, data) {
	    debug('add', id, data);
	    if (!data) return;
	    if (this.tiles[id]) return debug('already exists');

	    var Tile = data.embed ? registry.embed : registry.website;
	    var tile = new Tile(data);

	    this.tiles[id] = tile;
	    this.el.appendChild(tile.el);
	  },

	  remove: function(id) {
	    debug('remove', id);
	    var tile = this.tiles[id];
	    if (tile) tile.remove();
	  },

	  toggle: function(value) {
	    if (value) this.el.classList.remove('hidden');
	    else this.el.classList.add('hidden');
	  },

	  appendTo: function(parent) {
	    parent.appendChild(this.el);
	    return this;
	  }
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Tile = __webpack_require__(15);
	__webpack_require__(20);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[website-tile]') : function() {};

	/**
	 * Exports
	 */

	module.exports = WebsiteTile;

	/**
	 * Extends `Emitter`
	 */

	WebsiteTile.prototype = Object.create(Tile.prototype);

	function WebsiteTile(data) {
	  Tile.apply(this, arguments);
	  this.el.className += ' tile-website';
	  debug('initialized', data);
	}

	WebsiteTile.prototype.render = function(data, options) {
	  Tile.prototype.render.apply(this, arguments);
	  var image = (options && options.image) !== false;
	  if (image && data.image) this.renderImage(data.image);

	  var main = el('div', 'tile-website-main', this.els.content);
	  var icon = el('div', 'tile-website-icon', main);
	  var iconInner = el('div', 'inner', icon);
	  var title = el('h3', 'tile-website-title', main);
	  var self = this;

	  title.textContent = data.title;

	  if (data.description) {
	    var desc = el('p', 'tile-website-desc', main);
	    desc.textContent = data.description;
	  }

	  var url = el('p', 'tile-website-url', main);
	  url.textContent = data.url;

	  if (!data.icon) {
	    this.el.classList.add('no-icon');
	    return;
	  }

	  var imageNode = el('img', '', iconInner);
	  imageNode.src = data.icon;
	  imageNode.onload = function(e) {
	    var area = this.naturalWidth * this.naturalHeight;
	    if (area < (80 * 80)) self.el.classList.add('no-icon');
	  };
	};

	WebsiteTile.prototype.renderImage = function(src) {
	  var image = el('div', 'tile-website-image', this.els.content);
	  var inner = el('div', 'inner', image);
	  var node = el('img', '', inner);

	  node.src = src;
	  node.onload = function() {
	    image.classList.add('loaded');
	  };
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


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var fastdom = __webpack_require__(16);
	var Emitter = __webpack_require__(3);
	__webpack_require__(18);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[tile-view]') : function() {};

	/**
	 * Exports
	 */

	module.exports = TileView;

	/**
	 * Extends `Emitter`
	 */

	TileView.prototype = Object.create(Emitter.prototype);

	function TileView(data) {
	  Emitter.call(this);
	  this.el = el('li', 'tile');
	  this.els = {};
	  this.data = data;
	  this.render(data);
	  this.el.addEventListener('click', this.expand.bind(this));
	  this.els.close.addEventListener('click', this.collapse.bind(this));
	  debug('initialized', data);
	}

	TileView.prototype.render = function(data) {
	  this.els.url = el('h4', 'tile-url', this.el);
	  this.els.url.textContent = data.url;
	  this.els.inner = el('div', 'inner', this.el);
	  this.els.content = el('div', 'tile-content', this.els.inner);
	  this.els.footer = el('footer', 'tile-footer', this.els.inner);
	  this.els.close = el('button', 'tile-close-button', this.els.footer);
	  this.els.open = el('a', 'tile-open-button', this.els.footer);
	  this.els.open.href = data.url;
	  this.els.open.textContent = 'Open';
	  this.els.close.textContent = 'Close';
	  this.els.footer.hidden = true;
	};

	TileView.prototype.expand = function() {
	  this.els.footer.hidden = false;
	  this.el.classList.add('expanded');
	};

	TileView.prototype.collapse = function(e) {
	  if (e) e.stopPropagation();
	  this.els.footer.hidden = true;
	  this.el.classList.remove('expanded');
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


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	(function webpackUniversalModuleDefinition(root, factory) {
		if(true)
			module.exports = factory(__webpack_require__(17));
		else if(typeof define === 'function' && define.amd)
			define(["fastdom"], factory);
		else if(typeof exports === 'object')
			exports["sequencer"] = factory(require("fastdom"));
		else
			root["sequencer"] = factory(root["fastdom"]);
	})(this, function(__WEBPACK_EXTERNAL_MODULE_1__) {
	return /******/ (function(modules) { // webpackBootstrap
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


		var fastdom = __webpack_require__(1);

		var debug = 1 ? console.log.bind(console, '[sequencer]') : function() {};
		var symbol = Symbol();

		/**
		 * Intialize a new `Sequencer`
		 *
		 * @constructor
		 * @param {FastDom} fastdom
		 */
		function Sequencer(fastdom) {
		  this.fastdom = fastdom;
		  this.interactions = [];
		  this.animations = [];
		  this.scope = null;
		}

		Sequencer.prototype = {

		  /**
		   * Bind a 'protected' callback to an event.
		   *
		   * Callbacks are protected from (will delay)
		   * .measure(), .mutate(), .animate() tasks
		   * that are scheduled *after* an interaction
		   * has begun.
		   *
		   * An interaction is deemed 'complete' once
		   * the `Promise` returned from the callback
		   * resolves. If a Promise is not returned
		   * the interaction is complete after an
		   * internal debounce timeout is reached.
		   *
		   * Callbacks are run at maximum once a
		   * frame inside a `fastdom.measure()` task.
		   *
		   * @example
		   *
		   * sequencer.on('touchstart', e => {
		   *   return sequencer.animate(element, () => {
		   *     element.classList.add('grow')
		   *   });
		   * })
		   *
		   * sequencer.on('touchend', e => {
		   *   return sequencer.animate(element, () => {
		   *     element.classList.remove('grow')
		   *   });
		   * })
		   *
		   * @public
		   * @param  {HTMLElement} el
		   * @param  {String} type
		   * @param  {Function} task
		   */
		  on: function(el, type, task) {
		    debug('on', el.localName, type);
		    var scoped = this.scopeFn('interaction', task);
		    var data = el[symbol] || (el[symbol] = {
		      callbacks: {},
		      pending: {},
		      interactions: {}
		    });

		    // only one binding per event type
		    if (data.callbacks[type]) throw new Error('already listening');

		    data.callbacks[type] = function(e) {
		      debug('event', type, this.scope);
		      var interaction = this.createInteraction(el, type);
		      var pending = data.pending[type];

		      if (pending) this.fastdom.clear(pending);

		      data.pending[type] = this.fastdom.measure(function() {
		        delete data.pending[type];
		        interaction.reset(scoped());
		      });
		    }.bind(this);

		    // attach the wrapped callback
		    on(el, type, data.callbacks[type]);
		  },

		  /**
		   * Unbind a callback from an event.
		   *
		   * If an interaciton is not 'complete'
		   * unbinding infers completion.
		   *
		   * @public
		   * @param  {HTMLElement} el
		   * @param  {String} type
		   * @param  {Function} task
		   */
		  off: function(el, type, task) {
		    var data = el[symbol];
		    var callback = data.callbacks && data.callbacks[type];
		    if (!callback) return;

		    var interaction = data.interactions[type];
		    interaction.resolve();

		    off(el, type, callback);
		    delete data.callbacks[type];
		  },

		  /**
		   * Create an `Interaction` to represent
		   * a user input and ongoing feedback
		   * that may be triggered in response.
		   *
		   * @param  {HTMLElement} el
		   * @param  {String} type
		   * @return {Interaction}
		   */
		  createInteraction: function(el, type) {
		    var interactions = el[symbol].interactions;
		    var interaction = interactions[type];

		    if (interaction) return interaction;
		    interaction = new Interaction(type);

		    var complete = interaction.complete
		      .then(function() {
		        remove(this.interactions, complete);
		        delete interactions[type];
		      }.bind(this));

		    this.interactions.push(complete);
		    interactions[type] = interaction;

		    debug('created interaction', el.localName, type);
		    return interaction;
		  },

		  /**
		   * Schedule a task that triggers a CSS animation
		   * or transition on an element.
		   *
		   * The returned `Promise` resolves once
		   * the animation/transition has ended.
		   *
		   * Animation tasks are postponed by incomplete:
		   *   - interactions
		   *
		   * IDEA: Perhaps returning the Element would
		   * be a better way to provide the animation
		   * target?
		   *
		   * @example
		   *
		   * sequencer.animate(element, () => {
		   *   return element.classList.add('slide-in');
		   * }).then(...)
		   *
		   * // with optional safety timeout
		   * sequencer.animate(element, 400, () => ...)
		   *
		   * @public
		   * @param  {HTMLElement} el
		   * @param  {Number}      [safety]
		   * @param  {Function}    task
		   * @return {Promise}
		   */
		  animate: function(el, safety, task) {
		    debug('animate (1)');

		    // support optional second argument
		    if (typeof safety == 'function') task = safety, safety = null;

		    return this.after([this.interactions], function() {
		      debug('animate (2)');
		      var promise = this.task('mutate', task.bind(this, el));
		      var result;

		      var complete = promise
		        .then(function(_result) {
		          result = _result;
		          return animationend(el || result, safety);
		        })

		        .then(function() {
		          remove(this.animations, complete);
		          return result;
		        }.bind(this));

		      this.animations.push(complete);
		      return complete;
		    }.bind(this));
		  },

		  task: function(type, fn, ctx) {
		    var scoped = this.scopeFn(this.scope, fn);
		    var task = fastdomTask('mutate', scoped, ctx);
		    return new SequencerPromise(this, task.promise, {
		      wrapper: this.scopeFn.bind(this, this.scope),
		      oncancel: function() { fastdom.clear(task.id); }
		    });
		  },

		  /**
		   * Schedule a task that measures the
		   * size/position of an element.
		   *
		   * Measure tasks are postponed by incomplete:
		   *   - interactions
		   *   - animations
		   *
		   * @example
		   *
		   * sequencer.measure(() => {
		   *   return element.clientWidth;
		   * }).then(result => ...)
		   *
		   * @public
		   * @param  {Function} task
		   * @param  {*}        [ctx]
		   * @return {Promise}
		   */
		  measure: function(task, ctx) {
		    debug('measure (1)');
		    return this.after([this.interactions, this.animations], function() {
		      debug('measure (2)');
		      return this.task('measure', task, ctx);
		    }.bind(this));
		  },

		  /**
		   * Schedule a task that mutates (changes) the DOM.
		   *
		   * Mutation tasks are postponed by incomplete
		   * interactions or animations.
		   *
		   * @example
		   *
		   * sequencer.mutate(() => {
		   *   element.innerHTML = 'foo'
		   * }).then(...)
		   *
		   * @public
		   * @param  {Function} task
		   * @param  {*}        [ctx]
		   * @return {Promise}
		   */
		  mutate: function(task, ctx) {
		    debug('mutate (1)');
		    return this.after([this.interactions, this.animations], function() {
		      debug('mutate (2)');
		      return this.task('mutate', task, ctx);
		    }.bind(this));
		  },

		  /**
		   * Clear a pending task.
		   *
		   * @public
		   * @param  {SequencerPromise} promise
		   */
		  clear: function(promise) {
		    debug('clear');
		    if (promise.cancel) promise.cancel();
		  },

		  /**
		   * 'Scope' a function.
		   *
		   * @private
		   * @param  {Function} fn
		   * @param  {String}   scope
		   * @return {Function}
		   */
		  scopeFn: function(scope, fn) {
		    var self = this;
		    return function() {
		      var previous = self.scope;
		      var result;
		      var error;

		      self.scope = scope;
		      debug('set scope', self.scope);

		      try { result = fn.apply(this, arguments); }
		      catch (e) { error = e; }

		      self.scope = previous;
		      debug('restored scope', self.scope);
		      if (error) throw error;

		      return result;
		    };
		  },

		  /**
		   * Calls the callback once the given
		   * 'blockers' lists have resolved.
		   *
		   * Onces all promises are resolved we wait
		   * one turn of the event loop and check
		   * again, this gives the user chance to
		   * schedule another task via `.then()`.
		   *
		   * For example, when chaining animate() tasks,
		   * we don't want a queued `.mutate()` task
		   * to be run between stages.
		   *
		   * @private
		   * @param  {Array}     blockers
		   * @param  {Function}  done
		   * @param  {String}    [scope]
		   * @return {Promise|*}
		   */
		  after: function(blockers, done, scope) {
		    scope = scope || this.scope;
		    if (scope == 'interaction') return done();
		    debug('waiting till after', blockers);
		    var flattened = [].concat.apply([], blockers);
		    if (!flattened.length) return done();
		    return Promise.all(flattened)
		      .then(function() {
		        return new Promise(function(resolve) { setTimeout(resolve); });
		      })

		      .then(function() {
		        return this.after(blockers, done, scope);
		      }.bind(this));
		  },

		  SequencerPromise: SequencerPromise
		};

		/**
		 * Create a fastdom task wrapped in
		 * a Promise.
		 *
		 * @param  {FastDom}  fastdom
		 * @param  {String}   type - 'measure'|'muatate'
		 * @param  {Function} fn
		 * @return {Promise}
		 */
		function fastdomTask(type, fn, ctx) {
		  var id;
		  var promise = new Promise(function(resolve, reject) {
		    id = fastdom[type](function() {
		      try { resolve(fn()); }
		      catch (e) { reject(e); }
		    }, ctx);
		  });

		  return {
		    id: id,
		    promise: promise
		  };
		}

		/**
		 * Represents an interaction that
		 * can last a period of time.
		 *
		 * TODO: Introduce specific paths for 'scroll'
		 * and 'touchmove' events that listen to
		 * 'scrollend' amd 'touchend' respectively.
		 *
		 * @constructor
		 * @param {Srting} type
		 */
		function Interaction(type) {
		  this.type = type;
		  this.defer = new Deferred();
		  this.complete = this.defer.promise;
		}

		Interaction.prototype = {

		  /**
		   * Define when the interaction should
		   * be deemed 'resolved'.
		   *
		   * @example
		   *
		   * // each call extends the debounce timer
		   * interaction.reset();
		   * interaction.reset();
		   * interaction.reset();
		   *
		   * @example
		   *
		   * // no timer is installed, the interaction
		   * // will resolve once the promise resolves
		   * interaction.reset(promise)
		   *
		   * @private
		   * @param  {Promise} [promise]
		   */
		  reset: function(promise) {
		    debug('reset interaction');
		    var self = this;

		    clearTimeout(this.timeout);

		    // redefine the completed promise
		    this.promise = promise;

		    // if a promise was given then
		    // we use that to determine when
		    // the interaction is complete
		    if (promise && promise.then) {
		      debug('interaction promise');
		      return promise.then(done, done);
		    }

		    function done(result) {
		      if (self.promise !== promise) return;
		      self.resolve(result);
		    }

		    // when no Promise is given we use a
		    // debounce approach to judge completion
		    this.timeout = setTimeout(this.resolve.bind(this), 300);
		  },

		  /**
		   * Mark the interaction 'complete'.
		   *
		   * @param  {*} result
		   */
		  resolve: function(result) {
		    debug('interaction complete');
		    this.defer.resolve(result);
		  }
		};

		var id = 0;

		/**
		 * Wraps a `Promise`, providing additional
		 * functionality and hooks to wrap user
		 * defined callbacks.
		 *
		 * A `SequencerPromise` is a link in a
		 * chain of async tasks to be completed
		 * in series.
		 *
		 * NOTE: Chained syntax is optional and does
		 * not prevent users from using a familiar
		 * Promise syntax.
		 *
		 * @example
		 *
		 * // before: lots of boilerplate
		 * sequencer.mutate(...)
		 *   .then(() => sequencer.measure(...))
		 *   .then(() => sequencer.animate(...))
		 *   .then(() => sequencer.animate(...))
		 *   .then(...)
		 *
		 * // after: clean/terse
		 * sequencer
		 *   .mutate(...)
		 *   .measure(...)
		 *   .animate(...)
		 *   .animate(...)
		 *   .then(...)
		 *
		 * @example
		 *
		 * var li;
		 *
		 * sequencer
		 *   .mutate(() => {
		 *     li = document.createElement('li');
		 *     list.appendChild(li);
		 *     return li;
		 *   })
		 *
		 *   // previous return value can be used
		 *   // as target by omitting first argument
		 *   .animate(li => li.classList.add('grow'))
		 *
		 *   // or pass target as first param
		 *   .animate(li, () => li.classList.add('slide'));
		 *
		 * @constructor
		 * @param {Sequencer} sequencer
		 * @param {Promise} promise
		 * @param {Object} [options]
		 * @param {Function} [options.wrapper]
		 * @param {SequencerPromise} [options.parent]
		 * @param {Function} [options.oncancel]
		 */
		function SequencerPromise(sequencer, promise, options) {
		  options = options || {};
		  this.sequencer = sequencer;
		  this.promise = Promise.resolve(promise);
		  this.oncancel = options.oncancel;
		  this.parent = options.parent;
		  this.wrapper = options.wrapper;
		  this.canceled = false;
		  this.id = ++id;
		  debug('created', this.id);
		}

		SequencerPromise.prototype = {
		  _wrap: function(callback) {
		    if (!callback) return;
		    var self = this;
		    callback = this.wrapper(callback);
		    return function(value) {
		      if (self.canceled) return;
		      var result = callback(value);
		      if (result && result.then) self.sibling = result;
		      return result;
		    };
		  },

		  then: function(onsuccess, onerror) {
		    return this.create(this.promise.then(
		      this._wrap(onsuccess),
		      this._wrap(onerror)
		    ));
		  },

		  create: function(promise) {
		    return this.child = new SequencerPromise(this.sequencer, promise, {
		      parent: this,
		      wrapper: this.wrapper
		    });
		  },

		  catch: function(callback) {
		    return this.create(this.promise.catch(this._wrap(callback)));
		  },

		  cancel: function() {
		    if (this.canceled) return;
		    this.canceled = true;
		    if (this.oncancel) this.oncancel();
		    if (this.parent) this.parent.cancel();
		    if (this.child) this.child.cancel();
		    if (this.sibling) this.sibling.cancel();
		    debug('canceled', this.id);
		  },

		  measure: function(task, ctx) {
		    var sequencer = this.sequencer;
		    return this.create(this.promise.then(
		      sequencer.scopeFn(sequencer.scope, function(result) {
		        return sequencer.measure(function() {
		          return task(result);
		        }, ctx);
		      })));
		  },

		  mutate: function(task, ctx) {
		    var sequencer = this.sequencer;
		    return this.create(this.promise.then(
		      sequencer.scopeFn(sequencer.scope, function(result) {
		        return sequencer.mutate(function() {
		          return task(result);
		        }, ctx);
		      })));
		  },

		  animate: function(el, safety, task) {
		    var sequencer = this.sequencer;

		    // el and safety arguments are both optional
		    if (typeof el == 'number') task = safety, safety = el, el = null;
		    else if (typeof el == 'function') task = el, safety = el = null;

		    return this.create(this.promise.then(
		      sequencer.scopeFn(sequencer.scope, function(result) {
		        return sequencer.animate(el || result, safety, task);
		      })));
		  }
		};

		/**
		 * Exports
		 */

		module.exports = new Sequencer(fastdom);

		/**
		 * Utils
		 */

		function on(el, name, fn) { el.addEventListener(name, fn); }
		function off(el, name, fn) { el.removeEventListener(name, fn); }

		/**
		 * Returns a Promise that resolves
		 * after the first `animationend` or
		 * `transitionend` event fires on
		 * the given Element.
		 *
		 * The are cases when this event cannot
		 * be trusted to fire. Passing a `safety`
		 * timeout ensures the Promise resolves
		 * even if the event never fires.
		 *
		 * @param  {HTMLElement}  el
		 * @param  {Number}  [safety]
		 * @return {Promise}
		 */
		function animationend(el, safety) {
		  debug('animationend', el.localName, el.className);
		  var defer = new Deferred();
		  var timeout;

		  on(el, 'animationend', ended);
		  on(el, 'transitionend', ended);

		  if (safety) timeout = setTimeout(ended, safety);

		  function ended(e) {
		    if (e && e.target !== el) return;
		    debug('animation ended', el.className);
		    off(el, 'animationend', ended);
		    off(el, 'transitionend', ended);
		    clearTimeout(timeout);
		    defer.resolve();
		  }

		  return defer.promise;
		}

		/**
		 * @constructor
		 */
		function Deferred() {
		  this.promise = new Promise(function(resolve, reject) {
		    this.resolve = resolve;
		    this.reject = reject;
		  }.bind(this));
		}

		/**
		 * Remove an item from an Array.
		 *
		 * @param  {Array} array
		 * @param  {*} item
		 * @return {Boolean}
		 */
		function remove(array, item) {
		  var index = array.indexOf(item);
		  return !!~index && !!array.splice(index, 1);
		}


	/***/ },
	/* 1 */
	/***/ function(module, exports) {

		module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

	/***/ }
	/******/ ])
	});
	;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;!(function(win) {

	/**
	 * FastDom
	 *
	 * Eliminates layout thrashing
	 * by batching DOM read/write
	 * interactions.
	 *
	 * @author Wilson Page <wilsonpage@me.com>
	 * @author Kornel Lesinski <kornel.lesinski@ft.com>
	 */

	'use strict';

	/**
	 * Mini logger
	 *
	 * @return {Function}
	 */
	var debug = 0 ? console.log.bind(console, '[fastdom]') : function() {};

	/**
	 * Normalized rAF
	 *
	 * @type {Function}
	 */
	var raf = win.requestAnimationFrame
	  || win.webkitRequestAnimationFrame
	  || win.mozRequestAnimationFrame
	  || win.msRequestAnimationFrame
	  || function(cb) { return setTimeout(cb, 16); };

	/**
	 * Initialize a `FastDom`.
	 *
	 * @constructor
	 */
	function FastDom() {
	  var self = this;
	  self.reads = [];
	  self.writes = [];
	  self.raf = raf.bind(win); // test hook
	  debug('initialized', self);
	}

	FastDom.prototype = {
	  constructor: FastDom,

	  /**
	   * Adds a job to the read batch and
	   * schedules a new frame if need be.
	   *
	   * @param  {Function} fn
	   * @public
	   */
	  measure: function(fn, ctx) {
	    debug('measure');
	    var task = { fn: fn, ctx: ctx };
	    this.reads.push(task);
	    scheduleFlush(this);
	    return task;
	  },

	  /**
	   * Adds a job to the
	   * write batch and schedules
	   * a new frame if need be.
	   *
	   * @param  {Function} fn
	   * @public
	   */
	  mutate: function(fn, ctx) {
	    debug('mutate');
	    var task = { fn: fn, ctx: ctx };
	    this.writes.push(task);
	    scheduleFlush(this);
	    return task;
	  },

	  /**
	   * Clears a scheduled 'read' or 'write' task.
	   *
	   * @param {Object} task
	   * @return {Boolean} success
	   * @public
	   */
	  clear: function(task) {
	    debug('clear', task);
	    return remove(this.reads, task) || remove(this.writes, task);
	  },

	  /**
	   * Extend this FastDom with some
	   * custom functionality.
	   *
	   * Because fastdom must *always* be a
	   * singleton, we're actually extending
	   * the fastdom instance. This means tasks
	   * scheduled by an extension still enter
	   * fastdom's global task queue.
	   *
	   * The 'super' instance can be accessed
	   * from `this.fastdom`.
	   *
	   * @example
	   *
	   * var myFastdom = fastdom.extend({
	   *   initialize: function() {
	   *     // runs on creation
	   *   },
	   *
	   *   // override a method
	   *   measure: function(fn) {
	   *     // do extra stuff ...
	   *
	   *     // then call the original
	   *     return this.fastdom.measure(fn);
	   *   },
	   *
	   *   ...
	   * });
	   *
	   * @param  {Object} props  properties to mixin
	   * @return {FastDom}
	   */
	  extend: function(props) {
	    debug('extend', props);
	    if (typeof props != 'object') throw new Error('expected object');

	    var child = Object.create(this);
	    mixin(child, props);
	    child.fastdom = this;

	    // run optional creation hook
	    if (child.initialize) child.initialize();

	    return child;
	  },

	  // override this with a function
	  // to prevent Errors in console
	  // when tasks throw
	  catch: null
	};

	/**
	 * Schedules a new read/write
	 * batch if one isn't pending.
	 *
	 * @private
	 */
	function scheduleFlush(fastdom) {
	  if (!fastdom.scheduled) {
	    fastdom.scheduled = true;
	    fastdom.raf(flush.bind(null, fastdom));
	    debug('flush scheduled');
	  }
	}

	/**
	 * Runs queued `read` and `write` tasks.
	 *
	 * Errors are caught and thrown by default.
	 * If a `.catch` function has been defined
	 * it is called instead.
	 *
	 * @private
	 */
	function flush(fastdom) {
	  debug('flush');

	  var writes = fastdom.writes;
	  var reads = fastdom.reads;
	  var error;

	  try {
	    debug('flushing reads', reads.length);
	    runTasks(reads);
	    debug('flushing writes', writes.length);
	    runTasks(writes);
	  } catch (e) { error = e; }

	  fastdom.scheduled = false;

	  // If the batch errored we may still have tasks queued
	  if (reads.length || writes.length) scheduleFlush(fastdom);

	  if (error) {
	    debug('task errored', error.message);
	    if (fastdom.catch) fastdom.catch(error);
	    else throw error;
	  }
	}

	/**
	 * We run this inside a try catch
	 * so that if any jobs error, we
	 * are able to recover and continue
	 * to flush the batch until it's empty.
	 *
	 * @private
	 */
	function runTasks(tasks) {
	  debug('run tasks');
	  var task; while (task = tasks.shift()) task.fn.call(task.ctx);
	}

	/**
	 * Remove an item from an Array.
	 *
	 * @param  {Array} array
	 * @param  {*} item
	 * @return {Boolean}
	 */
	function remove(array, item) {
	  var index = array.indexOf(item);
	  return !!~index && !!array.splice(index, 1);
	}

	/**
	 * Mixin own properties of source
	 * object into the target.
	 *
	 * @param  {Object} target
	 * @param  {Object} source
	 */
	function mixin(target, source) {
	  for (var key in source) {
	    if (source.hasOwnProperty(key)) target[key] = source[key];
	  }
	}

	// There should never be more than
	// one instance of `FastDom` in an app
	var exports = win.fastdom = (win.fastdom || new FastDom()); // jshint ignore:line

	// Expose to CJS & AMD
	if (("function")[0] == 'f') !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return exports; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	else if ((typeof module)[0] == 'o') module.exports = exports;

	})(window);


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(19);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./tile.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./tile.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.tile {\n  display: block;\n  margin-bottom: 28px;\n\n  color: inherit;\n  text-decoration: none;\n  list-style: none;\n}\n\n.tile-url {\n  overflow: hidden;\n  margin-bottom: 7px;\n\n  text-align: center;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  font-weight: normal;\n  font-style: italic;\n  color: #bbb;\n}\n\n.tile > .inner {\n  position: relative;\n\n  overflow: hidden;\n  /*border-radius: 3px;*/\n  box-shadow: 0 1px 2px rgba(0,0,0,0.17);\n  background-color: #fff;\n\n  transition: transform 400ms;\n}\n\n.tile-text {\n  display: flex;\n  padding: 21px;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n}\n\n.tile:first-child .tile-text {\n  border: 0;\n}\n\n.tile-text > * {\n  margin: 0 0 14px;\n}\n\n.tile-text > :last-child {\n  margin: 0;\n}\n\n.tile-title {\n  font-size: 21px;\n  font-weight: lighter;\n  text-align: center;\n  padding: 0 6%;\n}\n\n.tile-desc {\n  width: 100%;\n  max-height: calc(1.35em * 5);\n  overflow: hidden;\n\n  text-align: center;\n  line-height: 1.35em;\n  font-size: 12px;\n  word-break: break-word;\n  color: hsl(0, 0%, 60%);\n}\n\n.tile-footer {\n  display: flex;\n  height: 46px;\n  background: hsl(0, 0%, 74%);\n  font-size: 15px;\n  color: #fff;\n}\n\n.tile-footer[hidden] {\n  display: none;;\n}\n\n.tile-footer > a,\n.tile-footer > button {\n  display: flex;\n  flex: 1;\n  padding: 7px;\n  border: 0;\n  background: none;\n  align-items: center;\n  justify-content: center;\n  color: inherit;\n  text-decoration: none;\n}\n\n.tile-footer > *:not(:first-child) {\n  border-left: solid 1px hsl(0, 0%, 82%);\n}\n", ""]);

	// exports


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(21);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./website.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./website.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.tile-website-image {\n  position: relative;\n  padding-bottom: 53.25%;\n  background: #999;\n}\n\n.tile-website-image > .inner {\n  position: absolute;\n  left: 0;\n  top: 0;\n\n  width: 100%;\n  height: 100%;\n\n  opacity: 0;\n  transition: opacity 300ms;\n}\n\n.tile-website-image.loaded > .inner {\n  opacity: 1;\n}\n\n.tile-website-image img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.tile-website-main {\n  position: relative;\n\n  display: flex;\n  box-sizing: border-box;\n  min-height: 114px;\n  padding: 21px;\n  padding-left: 114px;\n\n  flex-direction: column;\n  justify-content: center;\n  word-break: break-all;\n}\n\n.tile-website-main > * {\n  margin-top: 16px;\n}\n\n.tile-website-icon {\n  position: absolute;\n  left: 0;\n  top: 0;\n\n  display: flex;\n  box-sizing: border-box;\n  width: 114px;\n  height: 114px;\n  margin: 0;\n\n  align-items: center;\n  justify-content: center;\n}\n\n.tile-website-icon > .inner {\n  width: 68px;\n  height: 68px;\n  overflow: hidden;\n  border-radius: 4px;\n  font-family: magnet;\n}\n\n.no-icon .tile-website-icon > .inner::before {\n  content: '\\E078';\n  display: block;\n  margin-top: -2px;\n  font-size: 64px;\n  text-align: center;\n  color: #bbb;\n}\n\n.tile-website-icon img {\n  width: 100%;\n}\n\n.no-icon .tile-website-icon img {\n  display: none;\n}\n\n.tile:first-child .tile-website-text {\n  border: 0;\n}\n\n.tile-website-title {\n  font-size: 23px;\n  line-height: 1.19em;\n  word-break: normal;\n  font-weight: normal;\n  margin-top: 0;\n  margin-bottom: -0.19em;\n  color: #000;\n}\n\n.tile-website-desc {\n  width: 100%;\n  max-height: calc(1.35em * 5);\n  overflow: hidden;\n\n  line-height: 1.45em;\n  font-size: 13px;\n  color: hsl(0, 0%, 50%);\n}\n\n.tile-website-url {\n  display: none;\n  font-style: italic;\n  line-height: 1.35em;\n  color: #bbb;\n  color: #4C92E2;\n}\n\n.expanded .tile-website-url {\n  display: block;\n}\n\n.tile-website-footer {\n  display: flex;\n  height: 46px;\n  background: hsl(0, 0%, 74%);\n  font-size: 17px;\n  font-weight: bold;\n  color: #fff;\n}\n\n.tile-website-footer > a {\n  display: flex;\n  flex: 1;\n  padding: 7px;\n  align-items: center;\n  justify-content: center;\n  color: inherit;\n  text-decoration: none;\n}\n\n.tile-website-footer > a:not(:first-child) {\n  border-left: solid 1px hsl(0, 0%, 82%);\n}\n", ""]);

	// exports


/***/ },
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */
/***/ function(module, exports) {

	
	module.exports = function(name, on) {
	 return on ? console.log.bind(console, '[' + name + ']') : function() {};
	};


/***/ },
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(43);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./tiles.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./tiles.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.tiles {\n  position: absolute;\n  left: 0;\n  top: 0;\n\n  box-sizing: border-box;\n  width: 100%;\n  height: 100%;\n  padding: 14px;\n  overflow-y: scroll;\n  overflow-x: hidden;\n\n  /*will-change: transform;*/ /* breaks fullscreen */\n\n  transition:\n    opacity 180ms 130ms,\n    transform 180ms 130ms;\n}\n\n.tiles.hidden {\n  opacity: 0;\n  transform: scale(0.90);\n\n  transition:\n    opacity 180ms,\n    transform 180ms;\n}\n", ""]);

	// exports


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	__webpack_require__(45);

	var registry = {
	  website: __webpack_require__(47),
	  profile: __webpack_require__(53),
	  image: __webpack_require__(59),
	  video: __webpack_require__(60),
	  audio: __webpack_require__(63)
	};

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 0 ? console.log.bind(console, '[grid-view]') : function() {};

	/**
	 * Exports
	 */

	module.exports = GridView;

	function GridView() {
	  this.el = document.createElement('div');
	  this.el.className = 'grid';
	  this.icons = {};
	  this.els = {};
	  this.render();
	}

	GridView.prototype = {
	  render: function() {
	    this.els.inner = document.createElement('div');
	    this.els.inner.className = 'inner';
	    this.el.appendChild(this.els.inner);
	  },

	  add: function(id, data) {
	    debug('add', id, data);

	    if (!data) return;
	    if (this.icons[id]) return debug('already exists');

	    var Icon = registry[data.type] || registry.website;
	    var icon = new Icon(data);

	    this.icons[id] = icon;
	    this.els.inner.appendChild(icon.el);
	  },

	  toggle: function(value) {
	    if (value) this.el.classList.remove('hidden');
	    else this.el.classList.add('hidden');
	  },

	  remove: function(id) {
	    debug('remove', id);
	    var tile = this.tiles[id];
	    if (tile) tile.remove();
	  },

	  appendTo: function(parent) {
	    parent.appendChild(this.el);
	    return this;
	  }
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


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(46);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
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
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.grid {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n\n  margin: 0;\n  width: 100%;\n  height: 100%;\n  overflow-y: scroll;\n  overflow-x: hidden;\n  list-style: none;\n  opacity: 0;\n\n  will-change: transform;\n  animation: grid-zoom-in 240ms 120ms;\n  animation-fill-mode: forwards;\n}\n\n.grid.hidden {\n  animation: grid-zoom-out 160ms;\n  animation-fill-mode: forwards;\n}\n\n.grid > .inner {\n  box-sizing: border-box;\n  flex-flow: row wrap;\n  display: flex;\n  padding: 7px;\n  width: 100%;\n}\n\n@keyframes grid-zoom-in {\n  0% {\n    opacity: 0;\n    transform: scale(1.3);\n  }\n\n  100% {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n@keyframes grid-zoom-out {\n  0% {\n    opacity: 1;\n    transform: scale(1);\n  }\n\n  99% {\n    opacity: 0;\n    transform: scale(1.3);\n  }\n\n  100% {\n    opacity: 0;\n    transform: scale(0.01);\n  }\n}\n", ""]);

	// exports


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Icon = __webpack_require__(48);
	__webpack_require__(51);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[website-icon]') : function() {};

	/**
	 * Exports
	 */

	module.exports = WebsiteIconView;

	/**
	 * Extends `Emitter`
	 */

	WebsiteIconView.prototype = Object.create(Icon.prototype);

	function WebsiteIconView(data) {
	  Icon.apply(this, arguments);
	  this.el.className += ' grid-icon-website';
	}

	WebsiteIconView.prototype.render = function(data) {
	  Icon.prototype.render.apply(this, arguments); // super
	  this.els.title.textContent = data.title || data.url;
	};


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Emitter = __webpack_require__(3);
	__webpack_require__(49);

	/**
	 * Exports
	 */

	module.exports = IconView;

	/**
	 * Extends `Emitter`
	 */

	IconView.prototype = Object.create(Emitter.prototype);

	function IconView(data) {
	  Emitter.call(this);
	  this.el = el('li', 'grid-icon no-icon');
	  this.els = {};
	  this.render(data);
	}

	IconView.prototype.render = function(data) {
	  this.els.inner = el('a', 'inner', this.el);
	  this.els.inner.href = data.url;
	  this.els.image = el('div', 'grid-icon-image', this.els.inner);
	  var img = this.els.imageNode = el('img', '', this.els.image);
	  this.els.title = el('h3', 'grid-icon-title', this.els.inner);
	  this.els.title.textContent = data.title;

	  // child classes free to override
	  if (data.icon) this.els.imageNode.src = data.icon;

	  img.onload = function() {
	    var area = img.naturalWidth * img.naturalHeight;
	    if (area < 80 * 80) return;
	    this.els.imageNode.classList.add('loaded');
	    this.el.classList.remove('no-icon');
	  }.bind(this);
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


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(50);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./icon.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./icon.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n\n.grid-icon {\n  display: flex;\n  flex: 0 0 33%;\n  justify-content: center;\n  transition:\n    opacity 200ms 400ms,\n    transform 200ms 400ms;\n}\n\n.grid-icon:active {\n  transition-delay: 0ms;\n  transform: scale(0.95);\n  opacity: 0.7;\n}\n\n.grid-icon > .inner {\n  flex: 0 1 auto;\n  display: block;\n  width: 100px;\n  padding: 8px;\n\n  color: inherit;\n  text-decoration: none;\n}\n\n.grid-icon-image {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100px;\n  height: 100px;\n  border-radius: 6px;\n  font-family: magnet;\n  font-size: 70px;\n  color: #bbb;\n  overflow: hidden;\n}\n\n.no-icon .grid-icon-image {\n  background: #ddd;\n}\n\n.grid-icon-image > img {\n  max-width: 100%;\n}\n\n.no-icon .grid-icon-image > img {\n  display: none;\n}\n\n.grid-icon-title {\n  margin: 0;\n  overflow: hidden;\n\n  font-size: 13px;\n  font-style: italic;\n  font-weight: normal;\n  text-align: center;\n  line-height: 2.6em;\n\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  color: #555;\n}\n", ""]);

	// exports


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(52);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./website.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./website.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.grid-icon-website {}\n\n.grid-icon-website.no-icon .grid-icon-image::before {\n  content: '\\E078';\n}\n", ""]);

	// exports


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var ProfileTwitter = __webpack_require__(54);
	var ProfileAndroid = __webpack_require__(56);
	var Profile = __webpack_require__(55);

	/**
	 * Exports
	 */

	module.exports = function(data) {
	  if (data.android) return new ProfileAndroid(data);
	  else if (data.twitter) return new ProfileTwitter(data);
	  else return new Profile(data);
	};


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Profile = __webpack_require__(55);

	/**
	 * Logger
	 *
	 * @return {Function}
	 */
	var debug = 1 ? console.log.bind(console, '[icon-profile-twitter]') : function() {};

	/**
	 * Exports
	 */

	module.exports = ProfileTwitter;

	/**
	 * Extends `Emitter`
	 */

	ProfileTwitter.prototype = Object.create(Profile.prototype);

	function ProfileTwitter(data) {
	  Profile.apply(this, arguments);
	  this.el.className += ' icon-profile-twitter';
	}

	ProfileTwitter.prototype.render = function(data) {
	  Profile.prototype.render.apply(this, arguments); // super
	  this.els.imageNode.src = 'images/twitter.png';
	  this.els.title.textContent = '@' + data.twitter.user_id;
	  debug('rendered', data);
	};


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Icon = __webpack_require__(48);

	/**
	 * Exports
	 */

	module.exports = IconProfile;

	/**
	 * Extends `Icon`
	 */

	IconProfile.prototype = Object.create(Icon.prototype);

	function IconProfile(data) {
	  Icon.apply(this, arguments);
	  this.el.className += ' icon-profile';
	}


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Profile = __webpack_require__(55);
	__webpack_require__(57);

	var debug = 1 ? console.log.bind(console, '[icon-android]') : function() {};

	/**
	 * Exports
	 */

	module.exports = ProfileAndroid;

	/**
	 * Extends `Emitter`
	 */

	ProfileAndroid.prototype = Object.create(Profile.prototype);

	function ProfileAndroid(data) {
	  Profile.apply(this, arguments);
	  this.el.className += ' grid-icon-android-app';
	  this.packageId = data.android.package;
	  this.storeUrl = data.url;
	}

	ProfileAndroid.prototype.render = function(data) {
	  Profile.prototype.render.apply(this, arguments); // super

	  if (data.android.icon) {
	    this.els.imageNode.src = data.android.icon;
	    this.el.classList.remove('no-icon');
	  }

	  this.els.title.textContent = data.android.name;
	  this.els.inner.addEventListener('click', this.onClick.bind(this));
	};

	ProfileAndroid.prototype.onClick = function(e) {
	  e.stopPropagation();
	  navigator.startApp.check(
	    this.packageId,
	    this.openApp.bind(this),
	    this.openStore.bind(this)
	  );
	};

	ProfileAndroid.prototype.openApp = function() {
	  debug('open app');
	  navigator.startApp.start(this.packageId);
	};

	ProfileAndroid.prototype.openStore = function() {
	  debug('open store');
	  window.open(this.storeUrl, '_system');
	};


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(58);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./profile-android.css", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./profile-android.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.grid-icon-android-app {}\n\n.grid-icon-android-app .grid-icon-image {\n  background: none;\n}\n", ""]);

	// exports


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Icon = __webpack_require__(48);

	/**
	 * Exports
	 */

	module.exports = VideoIcon;

	/**
	 * Extends `Emitter`
	 */

	VideoIcon.prototype = Object.create(Icon.prototype);

	function VideoIcon(data) {
	  Icon.apply(this, arguments);
	  this.el.className += ' grid-image';
	}


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Icon = __webpack_require__(48);
	__webpack_require__(61);

	/**
	 * Exports
	 */

	module.exports = VideoIcon;

	/**
	 * Extends `Emitter`
	 */

	VideoIcon.prototype = Object.create(Icon.prototype);

	function VideoIcon(data) {
	  Icon.apply(this, arguments);
	  this.el.className += ' grid-icon-video';
	}

	VideoIcon.prototype.render = function(data) {
	  Icon.prototype.render.apply(this, arguments); // super
	};


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(62);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./video.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./video.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "", ""]);

	// exports


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var Icon = __webpack_require__(48);

	/**
	 * Exports
	 */

	module.exports = AudioIcon;

	/**
	 * Extends `Emitter`
	 */

	AudioIcon.prototype = Object.create(Icon.prototype);

	function AudioIcon(data) {
	  Icon.apply(this, arguments);
	  this.el.className += ' grid-icon-audio';
	}


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(65);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
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
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n* {\n  -webkit-tap-highlight-color: rgba(0,0,0,0); /* make transparent link selection, adjust last value opacity 0 to 1.0 */\n  margin: 0;\n  font: inherit;\n}\n\na {\n  text-decoration: none;\n  color: inherit;\n}\n\nhtml {\n  height: 100%;\n  overflow: hidden;\n\n  font-size: 12px;\n  font-family: FiraSans;\n  background: #f2f2f2;\n}\n\nbody {\n  -webkit-touch-callout: none; /* prevent callout to copy image, etc when tap to hold */\n  -webkit-text-size-adjust: none; /* prevent webkit from resizing text to fit */\n  -webkit-user-select: none; /* prevent copy paste, to allow, change 'none' to 'text' */\n\n  height: 100%;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n\n  color: #444;\n  overflow: hidden;\n}\n\n.app {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  overflow: hidden;\n}\n\n.app > .header {}\n\n.app > .content {\n  position: relative;\n  flex: 1;\n}\n", ""]);

	// exports


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	var debug = __webpack_require__(35)('tile-website-embed', 1);
	var fastdom = __webpack_require__(16);
	var SpinnerView = __webpack_require__(72);
	var WebsiteTile = __webpack_require__(14);
	__webpack_require__(70);

	/**
	 * Exports
	 */

	module.exports = WebsiteEmbedTile;

	/**
	 * Extends `Emitter`
	 */

	WebsiteEmbedTile.prototype = Object.create(WebsiteTile.prototype);

	function WebsiteEmbedTile(data) {
	  WebsiteTile.apply(this, arguments);
	  this.el.className += ' tile-embed';
	  debug('initialized', data);
	}

	WebsiteEmbedTile.prototype.render = function(data) {
	  WebsiteTile.prototype.render.call(this, data, { image: false });

	  var embed = data.embed;
	  this.els.frame = el('div', 'tile-embed-frame');
	  this.els.screen = el('div', 'tile-embed-screen', this.els.frame);

	  if (data.image) this.addImage(data.image);
	  else this.addEmbed(embed);

	  this.els.content.insertBefore(this.els.frame, this.els.content.firstChild);
	  debug('rendered');
	};

	WebsiteEmbedTile.prototype.expand = function() {
	  WebsiteTile.prototype.expand.apply(this, arguments);
	  this.addEmbed(this.data.embed)
	    .then(function() {
	      this.hideImage();
	      this.els.screen.hidden = true;
	    }.bind(this));
	};

	WebsiteEmbedTile.prototype.collapse = function() {
	  WebsiteTile.prototype.collapse.apply(this, arguments);

	  if (this.data.image) {
	    this.removeEmbed();
	    this.showImage();
	  }

	  this.els.screen.hidden = false;
	  this.hideLoading();
	};

	WebsiteEmbedTile.prototype.setFrameApect = function() {
	  if (this.aspectSet) return;
	  var embed = this.data.embed;
	  var aspect = (embed.height / embed.width) * 100;
	  this.els.frame.style.paddingBottom = (aspect || 100) + '%';
	  this.el.classList.add('aspect-set');
	  this.aspectSet = true;
	};


	WebsiteEmbedTile.prototype.addImage = function(src) {
	  debug('add image', src);
	  this.setFrameApect();
	  this.els.image = el('div', 'tile-embed-image', this.els.frame);
	  this.els.imageNode = el('img', '', this.els.image);
	  this.els.imageNode.src = src;
	};

	WebsiteEmbedTile.prototype.hideImage = function() {
	  if (!this.els.image) return;
	  this.els.image.hidden = true;
	  debug('image hidden');
	};

	WebsiteEmbedTile.prototype.showImage = function() {
	  if (!this.els.image) return;
	  this.els.image.hidden = false;
	  debug('image shown');
	};

	WebsiteEmbedTile.prototype.addEmbed = function(embed) {
	  return new Promise(function(resolve, reject) {
	    if (this.embedded) return resolve();
	    debug('embedding', embed);

	    this.els.embed = el('div', 'tile-embed-embed');
	    this.els.embed.innerHTML = cleanHtml(embed.html);

	    var iframe = this.els.embed.querySelector('iframe');
	    if (iframe) {
	      this.setFrameApect();
	      this.showLoading();
	      var hasQuery = !!~iframe.src.indexOf('?');
	      iframe.src += (!hasQuery ? '?' : '&') + 'autoplay=1&rel=0&controls=0&showinfo=0&title=0&portrait=0&badge=0&modestbranding=1&byline=0';

	      iframe.onload = function() {
	        debug('embedded', embed);
	        this.el.classList.add('embed-active');
	        this.hideLoading();
	        resolve();
	      }.bind(this);
	    }

	    this.els.frame.appendChild(this.els.embed);
	    this.embedded = true;
	  }.bind(this));
	};

	WebsiteEmbedTile.prototype.removeEmbed = function() {
	  if (!this.embedded) return;
	  debug('remove embed');
	  this.els.embed.remove();
	  delete this.els.embed;
	  this.embedded = false;
	};

	WebsiteEmbedTile.prototype.showLoading = function() {
	  if (this.loading) return;
	  this.loading = true;
	  var spinner = new SpinnerView();

	  // fastdom
	  //   .mutate(function() {
	      this.els.loading = el('div', 'tile-embed-loading');
	      this.els.loading.appendChild(spinner.el);
	      this.els.frame.appendChild(this.els.loading);
	    //   return this.els.loading;
	    // }.bind(this))

	    // .animate(function(loading) {
	      this.els.loading.style.opacity = 1;
	    // }.bind(this));
	};

	WebsiteEmbedTile.prototype.hideLoading = function() {
	  if (!this.loading) return;
	  this.els.loading.remove();
	  this.loading = false;
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

	function cleanHtml(html) {
	  return html.replace(/<\!\[CDATA\[(.+)\]\]>/, '$1');
	}


/***/ },
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(71);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./embed.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./embed.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, "\n.tile-embed-frame  {\n  position: relative;\n}\n\n.aspect-set .tile-embed-embed {\n  position: absolute;\n  left: 0;\n  top: 0;\n\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.tile-embed-embed table {\n  width: 100%;\n}\n\n.tile-embed-embed tr {\n  padding: 0 7px;\n}\n\n.tile-embed-embed td {\n  padding: 21px 14px;\n  border-top: solid 1px #f2f2f2;\n  text-align: center;\n  font-size: 18px;\n}\n\n.tile-embed-embed tr:first-child td {\n  border-top: 0;\n}\n\n.tile-embed-embed > iframe {\n  position: absolute;\n  left: 0;]\n  top: 0;\n\n  display: block;;\n  width: 100.5%;\n  height: 100.5%;\n  background: #000;\n}\n\n.tile-embed-screen {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n\n  width: 100%;\n  height: 100%;\n\n  background: rgba(255,255,255,0.05);\n  transition: opacity 200ms;\n}\n\n.tile-embed-screen[hidden] {\n  opacity: 0;\n  pointer-events: none;\n}\n\n.tile-embed-loading {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 2;\n\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  width: 100%;\n  height: 100%;\n\n  color: rgba(255,255,255,0.6);\n  background: rgba(0,0,0,0.3);\n}\n\n.tile-embed-image {\n  position: absolute;\n  left: 0;\n  top: 0;\n  z-index: 1;\n\n  width: 100%;\n  height: 100%;\n}\n\n.tile-embed-image > img {\n  display: block;\n  width: 100.5%;\n  height: 100.5%;\n  object-fit: cover;\n}\n\n.tile-embed .tile-website-main {\n  display: none;\n  border-top: solid 1px #f2f2f2;\n}\n\n.tile-embed.expanded .tile-website-main {\n  display: block;\n}\n", ""]);

	// exports


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * Dependencies
	 */

	__webpack_require__(73);

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


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(74);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./spinner.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./spinner.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports


	// module
	exports.push([module.id, ".spinner {\n  width: 55px;\n  height: 44px;\n  margin: 0 auto;\n  text-align: center;\n}\n\n.spinner > div {\n  background-color: currentColor;\n  height: 100%;\n  width: 6px;\n  margin: 1px;\n  display: inline-block;\n  will-change: transform;\n\n  -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;\n  animation: sk-stretchdelay 1.2s infinite ease-in-out;\n}\n\n.spinner .rect2 {\n  -webkit-animation-delay: -1.1s;\n  animation-delay: -1.1s;\n}\n\n.spinner .rect3 {\n  -webkit-animation-delay: -1.0s;\n  animation-delay: -1.0s;\n}\n\n.spinner .rect4 {\n  -webkit-animation-delay: -0.9s;\n  animation-delay: -0.9s;\n}\n\n.spinner .rect5 {\n  -webkit-animation-delay: -0.8s;\n  animation-delay: -0.8s;\n}\n\n@-webkit-keyframes sk-stretchdelay {\n  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }\n  20% { -webkit-transform: scaleY(1.0) }\n}\n\n@keyframes sk-stretchdelay {\n  0%, 40%, 100% {\n    transform: scaleY(0.4);\n    -webkit-transform: scaleY(0.4);\n  }\n\n  20% {\n    transform: scaleY(1.0);\n    -webkit-transform: scaleY(1.0);\n  }\n}", ""]);

	// exports


/***/ }
/******/ ]);