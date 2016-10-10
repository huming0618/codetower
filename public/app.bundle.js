(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
// For more information about browser field, check out the browser field at https://github.com/substack/browserify-handbook#browser-field.

var styleElementsInsertedAtTop = [];

var insertStyleElement = function(styleElement, options) {
    var head = document.head || document.getElementsByTagName('head')[0];
    var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];

    options = options || {};
    options.insertAt = options.insertAt || 'bottom';

    if (options.insertAt === 'top') {
        if (!lastStyleElementInsertedAtTop) {
            head.insertBefore(styleElement, head.firstChild);
        } else if (lastStyleElementInsertedAtTop.nextSibling) {
            head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
        } else {
            head.appendChild(styleElement);
        }
        styleElementsInsertedAtTop.push(styleElement);
    } else if (options.insertAt === 'bottom') {
        head.appendChild(styleElement);
    } else {
        throw new Error('Invalid value for parameter \'insertAt\'. Must be \'top\' or \'bottom\'.');
    }
};

module.exports = {
    // Create a <link> tag with optional data attributes
    createLink: function(href, attributes) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var link = document.createElement('link');

        link.href = href;
        link.rel = 'stylesheet';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            link.setAttribute('data-' + key, value);
        }

        head.appendChild(link);
    },
    // Create a <style> tag with optional data attributes
    createStyle: function(cssText, attributes, extraOptions) {
        extraOptions = extraOptions || {};

        var style = document.createElement('style');
        style.type = 'text/css';

        for (var key in attributes) {
            if ( ! attributes.hasOwnProperty(key)) {
                continue;
            }
            var value = attributes[key];
            style.setAttribute('data-' + key, value);
        }

        if (style.sheet) { // for jsdom and IE9+
            style.innerHTML = cssText;
            style.sheet.cssText = cssText;
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        } else if (style.styleSheet) { // for IE8 and below
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
            style.styleSheet.cssText = cssText;
        } else { // for Chrome, Firefox, and Safari
            style.appendChild(document.createTextNode(cssText));
            insertStyleElement(style, { insertAt: extraOptions.insertAt });
        }
    }
};

},{}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
(function (process){
'use strict';

/*  */

/**
 * Convert a value to a string that is actually rendered.
 */
function _toString (val) {
  return val == null
    ? ''
    : typeof val === 'object'
      ? JSON.stringify(val, null, 2)
      : String(val)
}

/**
 * Convert a input value to a number for persistence.
 * If the conversion fails, return original string.
 */
function toNumber (val) {
  var n = parseFloat(val, 10)
  return (n || n === 0) ? n : val
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null)
  var list = str.split(',')
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()]; }
    : function (val) { return map[val]; }
}

/**
 * Check if a tag is a built-in tag.
 */
var isBuiltInTag = makeMap('slot,component', true)

/**
 * Remove an item from an array
 */
function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

/**
 * Check whether the object has the property.
 */
var hasOwnProperty = Object.prototype.hasOwnProperty
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Check if value is primitive
 */
function isPrimitive (value) {
  return typeof value === 'string' || typeof value === 'number'
}

/**
 * Create a cached version of a pure function.
 */
function cached (fn) {
  var cache = Object.create(null)
  return function cachedFn (str) {
    var hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

/**
 * Camelize a hyphen-delmited string.
 */
var camelizeRE = /-(\w)/g
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
})

/**
 * Capitalize a string.
 */
var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /([^-])([A-Z])/g
var hyphenate = cached(function (str) {
  return str
    .replace(hyphenateRE, '$1-$2')
    .replace(hyphenateRE, '$1-$2')
    .toLowerCase()
})

/**
 * Simple bind, faster than native
 */
function bind (fn, ctx) {
  function boundFn (a) {
    var l = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  // record original fn length
  boundFn._length = fn.length
  return boundFn
}

/**
 * Convert an Array-like object to a real Array.
 */
function toArray (list, start) {
  start = start || 0
  var i = list.length - start
  var ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 */
function extend (to, _from) {
  for (var key in _from) {
    to[key] = _from[key]
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
var toString = Object.prototype.toString
var OBJECT_STRING = '[object Object]'
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

/**
 * Merge an Array of Objects into a single Object.
 */
function toObject (arr) {
  var res = {}
  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
}

/**
 * Perform no operation.
 */
function noop () {}

/**
 * Always return false.
 */
var no = function () { return false; }

/**
 * Generate a static keys string from compiler modules.
 */
function genStaticKeys (modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
function looseEqual (a, b) {
  /* eslint-disable eqeqeq */
  return a == b || (
    isObject(a) && isObject(b)
      ? JSON.stringify(a) === JSON.stringify(b)
      : false
  )
  /* eslint-enable eqeqeq */
}

function looseIndexOf (arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) { return i }
  }
  return -1
}

/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Whether to enable devtools
   */
  devtools: process.env.NODE_ENV !== 'production',

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: null,

  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * List of asset types that a component can own.
   */
  _assetTypes: [
    'component',
    'directive',
    'filter'
  ],

  /**
   * List of lifecycle hooks.
   */
  _lifecycleHooks: [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
  ],

  /**
   * Max circular updates allowed in a scheduler flush cycle.
   */
  _maxUpdateCount: 100,

  /**
   * Server rendering?
   */
  _isServer: process.env.VUE_ENV === 'server'
}

/*  */

/**
 * Check if a string starts with $ or _
 */
function isReserved (str) {
  var c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Define a property.
 */
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * Parse simple path.
 */
var bailRE = /[^\w\.\$]/
function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    var segments = path.split('.')
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]]
      }
      return obj
    }
  }
}

/*  */
/* globals MutationObserver */

// can we use __proto__?
var hasProto = '__proto__' in {}

// Browser environment sniffing
var inBrowser =
  typeof window !== 'undefined' &&
  Object.prototype.toString.call(window) !== '[object Object]'

var UA = inBrowser && window.navigator.userAgent.toLowerCase()
var isIE = UA && /msie|trident/.test(UA)
var isIE9 = UA && UA.indexOf('msie 9.0') > 0
var isEdge = UA && UA.indexOf('edge/') > 0
var isAndroid = UA && UA.indexOf('android') > 0
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)

// detect devtools
var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__

/* istanbul ignore next */
function isNative (Ctor) {
  return /native code/.test(Ctor.toString())
}

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, but MutationObserver is unreliable
 * in iOS UIWebView so we use a setImmediate shim and fallback to setTimeout.
 */
var nextTick = (function () {
  var callbacks = []
  var pending = false
  var timerFunc

  function nextTickHandler () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks.length = 0
    for (var i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve()
    timerFunc = function () {
      p.then(nextTickHandler)
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) { setTimeout(noop) }
    }
  } else if (typeof MutationObserver !== 'undefined') {
    // use MutationObserver where native Promise is not available,
    // e.g. IE11, iOS7, Android 4.4
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = setTimeout
  }

  return function queueNextTick (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (!pending) {
      pending = true
      timerFunc(nextTickHandler, 0)
    }
  }
})()

var _Set
/* istanbul ignore if */
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = (function () {
    function Set () {
      this.set = Object.create(null)
    }
    Set.prototype.has = function has (key) {
      return this.set[key] !== undefined
    };
    Set.prototype.add = function add (key) {
      this.set[key] = 1
    };
    Set.prototype.clear = function clear () {
      this.set = Object.create(null)
    };

    return Set;
  }())
}

/* not type checking this file because flow doesn't play well with Proxy */

var hasProxy;
var proxyHandlers;
var initProxy;
if (process.env.NODE_ENV !== 'production') {
  var allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )

  hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  proxyHandlers = {
    has: function has (target, key) {
      var has = key in target
      var isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
      if (!has && !isAllowed) {
        warn(
          "Property or method \"" + key + "\" is not defined on the instance but " +
          "referenced during render. Make sure to declare reactive data " +
          "properties in the data option.",
          target
        )
      }
      return has || !isAllowed
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      vm._renderProxy = new Proxy(vm, proxyHandlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

/*  */


var uid$2 = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
var Dep = function Dep () {
  this.id = uid$2++
  this.subs = []
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub)
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub)
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this)
  }
};

Dep.prototype.notify = function notify () {
  // stablize the subscriber list first
  var subs = this.subs.slice()
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null
var targetStack = []

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target) }
  Dep.target = _target
}

function popTarget () {
  Dep.target = targetStack.pop()
}

/*  */


var queue = []
var has = {}
var circular = {}
var waiting = false
var flushing = false
var index = 0

/**
 * Reset the scheduler's state.
 */
function resetSchedulerState () {
  queue.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

/**
 * Flush both queues and run the watchers.
 */
function flushSchedulerQueue () {
  flushing = true

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  queue.sort(function (a, b) { return a.id - b.id; })

  // do not cache length because more watchers might be pushed
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    var watcher = queue[index]
    var id = watcher.id
    has[id] = null
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > config._maxUpdateCount) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? ("in watcher with expression \"" + (watcher.expression) + "\"")
              : "in a component render function."
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }

  resetSchedulerState()
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
function queueWatcher (watcher) {
  var id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1
      while (i >= 0 && queue[i].id > watcher.id) {
        i--
      }
      queue.splice(Math.max(i, index) + 1, 0, watcher)
    }
    // queue the flush
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

/*  */

var uid$1 = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
var Watcher = function Watcher (
  vm,
  expOrFn,
  cb,
  options
) {
  if ( options === void 0 ) options = {};

  this.vm = vm
  vm._watchers.push(this)
  // options
  this.deep = !!options.deep
  this.user = !!options.user
  this.lazy = !!options.lazy
  this.sync = !!options.sync
  this.expression = expOrFn.toString()
  this.cb = cb
  this.id = ++uid$1 // uid for batching
  this.active = true
  this.dirty = this.lazy // for lazy watchers
  this.deps = []
  this.newDeps = []
  this.depIds = new _Set()
  this.newDepIds = new _Set()
  // parse expression for getter
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn
  } else {
    this.getter = parsePath(expOrFn)
    if (!this.getter) {
      this.getter = function () {}
      process.env.NODE_ENV !== 'production' && warn(
        "Failed watching path: \"" + expOrFn + "\" " +
        'Watcher only accepts simple dot-delimited paths. ' +
        'For full control, use a function instead.',
        vm
      )
    }
  }
  this.value = this.lazy
    ? undefined
    : this.get()
};

/**
 * Evaluate the getter, and re-collect dependencies.
 */
Watcher.prototype.get = function get () {
  pushTarget(this)
  var value = this.getter.call(this.vm, this.vm)
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value)
  }
  popTarget()
  this.cleanupDeps()
  return value
};

/**
 * Add a dependency to this directive.
 */
Watcher.prototype.addDep = function addDep (dep) {
  var id = dep.id
  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id)
    this.newDeps.push(dep)
    if (!this.depIds.has(id)) {
      dep.addSub(this)
    }
  }
};

/**
 * Clean up for dependency collection.
 */
Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var this$1 = this;

  var i = this.deps.length
  while (i--) {
    var dep = this$1.deps[i]
    if (!this$1.newDepIds.has(dep.id)) {
      dep.removeSub(this$1)
    }
  }
  var tmp = this.depIds
  this.depIds = this.newDepIds
  this.newDepIds = tmp
  this.newDepIds.clear()
  tmp = this.deps
  this.deps = this.newDeps
  this.newDeps = tmp
  this.newDeps.length = 0
};

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
Watcher.prototype.update = function update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
};

/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */
Watcher.prototype.run = function run () {
  if (this.active) {
    var value = this.get()
      if (
        value !== this.value ||
      // Deep watchers and watchers on Object/Arrays should fire even
      // when the value is the same, because the value may
      // have mutated.
      isObject(value) ||
      this.deep
    ) {
      // set new value
      var oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          process.env.NODE_ENV !== 'production' && warn(
            ("Error in watcher \"" + (this.expression) + "\""),
            this.vm
          )
          /* istanbul ignore else */
          if (config.errorHandler) {
            config.errorHandler.call(null, e, this.vm)
          } else {
            throw e
          }
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }
};

/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */
Watcher.prototype.evaluate = function evaluate () {
  this.value = this.get()
  this.dirty = false
};

/**
 * Depend on all deps collected by this watcher.
 */
Watcher.prototype.depend = function depend () {
    var this$1 = this;

  var i = this.deps.length
  while (i--) {
    this$1.deps[i].depend()
  }
};

/**
 * Remove self from all dependencies' subcriber list.
 */
Watcher.prototype.teardown = function teardown () {
    var this$1 = this;

  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed or is performing a v-for
    // re-render (the watcher list is then filtered by v-for).
    if (!this.vm._isBeingDestroyed && !this.vm._vForRemoving) {
      remove(this.vm._watchers, this)
    }
    var i = this.deps.length
    while (i--) {
      this$1.deps[i].removeSub(this$1)
    }
    this.active = false
  }
};

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */
var seenObjects = new _Set()
function traverse (val, seen) {
  var i, keys
  if (!seen) {
    seen = seenObjects
    seen.clear()
  }
  var isA = Array.isArray(val)
  var isO = isObject(val)
  if ((isA || isO) && Object.isExtensible(val)) {
    if (val.__ob__) {
      var depId = val.__ob__.dep.id
      if (seen.has(depId)) {
        return
      } else {
        seen.add(depId)
      }
    }
    if (isA) {
      i = val.length
      while (i--) { traverse(val[i], seen) }
    } else if (isO) {
      keys = Object.keys(val)
      i = keys.length
      while (i--) { traverse(val[keys[i]], seen) }
    }
  }
}

/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]
  def(arrayMethods, method, function mutator () {
    var arguments$1 = arguments;

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)
    while (i--) {
      args[i] = arguments$1[i]
    }
    var result = original.apply(this, args)
    var ob = this.__ob__
    var inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) { ob.observeArray(inserted) }
    // notify change
    ob.dep.notify()
    return result
  })
})

/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
var observerState = {
  shouldConvert: true,
  isSettingProps: false
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
var Observer = function Observer (value) {
  this.value = value
  this.dep = new Dep()
  this.vmCount = 0
  def(value, '__ob__', this)
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment
    augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  } else {
    this.walk(value)
  }
};

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */
Observer.prototype.walk = function walk (obj) {
  var keys = Object.keys(obj)
  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i], obj[keys[i]])
  }
};

/**
 * Observe a list of Array items.
 */
Observer.prototype.observeArray = function observeArray (items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i])
  }
};

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * istanbul ignore next
 */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
function observe (value) {
  if (!isObject(value)) {
    return
  }
  var ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    observerState.shouldConvert &&
    !config._isServer &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer(value)
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
function defineReactive (
  obj,
  key,
  val,
  customSetter
) {
  var dep = new Dep()

  var property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  var getter = property && property.get
  var setter = property && property.set

  var childOb = observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      var value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
        if (Array.isArray(value)) {
          for (var e = void 0, i = 0, l = value.length; i < l; i++) {
            e = value[i]
            e && e.__ob__ && e.__ob__.dep.depend()
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      var value = getter ? getter.call(obj) : val
      if (newVal === value) {
        return
      }
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = observe(newVal)
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
function set (obj, key, val) {
  if (Array.isArray(obj)) {
    obj.splice(key, 1, val)
    return val
  }
  if (hasOwn(obj, key)) {
    obj[key] = val
    return
  }
  var ob = obj.__ob__
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return
  }
  if (!ob) {
    obj[key] = val
    return
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 */
function del (obj, key) {
  var ob = obj.__ob__
  if (obj._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(obj, key)) {
    return
  }
  delete obj[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/*  */

function initState (vm) {
  vm._watchers = []
  initProps(vm)
  initData(vm)
  initComputed(vm)
  initMethods(vm)
  initWatch(vm)
}

function initProps (vm) {
  var props = vm.$options.props
  if (props) {
    var propsData = vm.$options.propsData || {}
    var keys = vm.$options._propKeys = Object.keys(props)
    var isRoot = !vm.$parent
    // root instance props should be converted
    observerState.shouldConvert = isRoot
    var loop = function ( i ) {
      var key = keys[i]
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, validateProp(key, props, propsData, vm), function () {
          if (vm.$parent && !observerState.isSettingProps) {
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            )
          }
        })
      } else {
        defineReactive(vm, key, validateProp(key, props, propsData, vm))
      }
    };

    for (var i = 0; i < keys.length; i++) loop( i );
    observerState.shouldConvert = true
  }
}

function initData (vm) {
  var data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? data.call(vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object.',
      vm
    )
  }
  // proxy data on instance
  var keys = Object.keys(data)
  var props = vm.$options.props
  var i = keys.length
  while (i--) {
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        "The data property \"" + (keys[i]) + "\" is already declared as a prop. " +
        "Use prop default value instead.",
        vm
      )
    } else {
      proxy(vm, keys[i])
    }
  }
  // observe data
  observe(data)
  data.__ob__ && data.__ob__.vmCount++
}

var computedSharedDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function initComputed (vm) {
  var computed = vm.$options.computed
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key]
      if (typeof userDef === 'function') {
        computedSharedDefinition.get = makeComputedGetter(userDef, vm)
        computedSharedDefinition.set = noop
      } else {
        computedSharedDefinition.get = userDef.get
          ? userDef.cache !== false
            ? makeComputedGetter(userDef.get, vm)
            : bind(userDef.get, vm)
          : noop
        computedSharedDefinition.set = userDef.set
          ? bind(userDef.set, vm)
          : noop
      }
      Object.defineProperty(vm, key, computedSharedDefinition)
    }
  }
}

function makeComputedGetter (getter, owner) {
  var watcher = new Watcher(owner, getter, noop, {
    lazy: true
  })
  return function computedGetter () {
    if (watcher.dirty) {
      watcher.evaluate()
    }
    if (Dep.target) {
      watcher.depend()
    }
    return watcher.value
  }
}

function initMethods (vm) {
  var methods = vm.$options.methods
  if (methods) {
    for (var key in methods) {
      if (methods[key] != null) {
        vm[key] = bind(methods[key], vm)
      } else if (process.env.NODE_ENV !== 'production') {
        warn(("Method \"" + key + "\" is undefined in options."), vm)
      }
    }
  }
}

function initWatch (vm) {
  var watch = vm.$options.watch
  if (watch) {
    for (var key in watch) {
      var handler = watch[key]
      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i])
        }
      } else {
        createWatcher(vm, key, handler)
      }
    }
  }
}

function createWatcher (vm, key, handler) {
  var options
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  vm.$watch(key, handler, options)
}

function stateMixin (Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {}
  dataDef.get = function () {
    return this._data
  }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn,
    cb,
    options
  ) {
    var vm = this
    options = options || {}
    options.user = true
    var watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}

function proxy (vm, key) {
  if (!isReserved(key)) {
    Object.defineProperty(vm, key, {
      configurable: true,
      enumerable: true,
      get: function proxyGetter () {
        return vm._data[key]
      },
      set: function proxySetter (val) {
        vm._data[key] = val
      }
    })
  }
}

/*  */

var VNode = function VNode (
  tag,
  data,
  children,
  text,
  elm,
  ns,
  context,
  componentOptions
) {
  this.tag = tag
  this.data = data
  this.children = children
  this.text = text
  this.elm = elm
  this.ns = ns
  this.context = context
  this.key = data && data.key
  this.componentOptions = componentOptions
  this.child = undefined
  this.parent = undefined
  this.raw = false
  this.isStatic = false
  this.isRootInsert = true
  this.isComment = false
  this.isCloned = false
};

var emptyVNode = function () {
  var node = new VNode()
  node.text = ''
  node.isComment = true
  return node
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
function cloneVNode (vnode) {
  var cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.ns,
    vnode.context,
    vnode.componentOptions
  )
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isCloned = true
  return cloned
}

function cloneVNodes (vnodes) {
  var res = new Array(vnodes.length)
  for (var i = 0; i < vnodes.length; i++) {
    res[i] = cloneVNode(vnodes[i])
  }
  return res
}

/*  */

function normalizeChildren (
  children,
  ns,
  nestedIndex
) {
  if (isPrimitive(children)) {
    return [createTextVNode(children)]
  }
  if (Array.isArray(children)) {
    var res = []
    for (var i = 0, l = children.length; i < l; i++) {
      var c = children[i]
      var last = res[res.length - 1]
      //  nested
      if (Array.isArray(c)) {
        res.push.apply(res, normalizeChildren(c, ns, i))
      } else if (isPrimitive(c)) {
        if (last && last.text) {
          last.text += String(c)
        } else if (c !== '') {
          // convert primitive to vnode
          res.push(createTextVNode(c))
        }
      } else if (c instanceof VNode) {
        if (c.text && last && last.text) {
          last.text += c.text
        } else {
          // inherit parent namespace
          if (ns) {
            applyNS(c, ns)
          }
          // default key for nested array children (likely generated by v-for)
          if (c.key == null && nestedIndex != null) {
            c.key = "__vlist_" + nestedIndex + "_" + i + "__"
          }
          res.push(c)
        }
      }
    }
    return res
  }
}

function createTextVNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}

function applyNS (vnode, ns) {
  if (vnode.tag && !vnode.ns) {
    vnode.ns = ns
    if (vnode.children) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        applyNS(vnode.children[i], ns)
      }
    }
  }
}

function getFirstComponentChild (children) {
  return children && children.filter(function (c) { return c && c.componentOptions; })[0]
}

function mergeVNodeHook (def, key, hook) {
  var oldHook = def[key]
  if (oldHook) {
    var injectedHash = def.__injected || (def.__injected = {})
    if (!injectedHash[key]) {
      injectedHash[key] = true
      def[key] = function () {
        oldHook.apply(this, arguments)
        hook.apply(this, arguments)
      }
    }
  } else {
    def[key] = hook
  }
}

function updateListeners (
  on,
  oldOn,
  add,
  remove
) {
  var name, cur, old, fn, event, capture
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    if (!cur) {
      process.env.NODE_ENV !== 'production' && warn(
        ("Handler for event \"" + name + "\" is undefined.")
      )
    } else if (!old) {
      capture = name.charAt(0) === '!'
      event = capture ? name.slice(1) : name
      if (Array.isArray(cur)) {
        add(event, (cur.invoker = arrInvoker(cur)), capture)
      } else {
        if (!cur.invoker) {
          fn = cur
          cur = on[name] = {}
          cur.fn = fn
          cur.invoker = fnInvoker(cur)
        }
        add(event, cur.invoker, capture)
      }
    } else if (cur !== old) {
      if (Array.isArray(old)) {
        old.length = cur.length
        for (var i = 0; i < old.length; i++) { old[i] = cur[i] }
        on[name] = old
      } else {
        old.fn = cur
        on[name] = old
      }
    }
  }
  for (name in oldOn) {
    if (!on[name]) {
      event = name.charAt(0) === '!' ? name.slice(1) : name
      remove(event, oldOn[name].invoker)
    }
  }
}

function arrInvoker (arr) {
  return function (ev) {
    var arguments$1 = arguments;

    var single = arguments.length === 1
    for (var i = 0; i < arr.length; i++) {
      single ? arr[i](ev) : arr[i].apply(null, arguments$1)
    }
  }
}

function fnInvoker (o) {
  return function (ev) {
    var single = arguments.length === 1
    single ? o.fn(ev) : o.fn.apply(null, arguments)
  }
}

/*  */

var activeInstance = null

function initLifecycle (vm) {
  var options = vm.$options

  // locate first non-abstract parent
  var parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

function lifecycleMixin (Vue) {
  Vue.prototype._mount = function (
    el,
    hydrating
  ) {
    var vm = this
    vm.$el = el
    if (!vm.$options.render) {
      vm.$options.render = emptyVNode
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore if */
        if (vm.$options.template) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'option is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          )
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          )
        }
      }
    }
    callHook(vm, 'beforeMount')
    vm._watcher = new Watcher(vm, function () {
      vm._update(vm._render(), hydrating)
    }, noop)
    hydrating = false
    // root instance, call mounted on self
    // mounted is called for child components in its inserted hook
    if (vm.$root === vm) {
      vm._isMounted = true
      callHook(vm, 'mounted')
    }
    return vm
  }

  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }
    var prevEl = vm.$el
    var prevActiveInstance = activeInstance
    activeInstance = vm
    var prevVnode = vm._vnode
    vm._vnode = vnode
    if (!prevVnode) {
      // Vue.prototype.__patch__ is injected in entry points
      // based on the rendering backend used.
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating)
    } else {
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    activeInstance = prevActiveInstance
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    if (vm._isMounted) {
      callHook(vm, 'updated')
    }
  }

  Vue.prototype._updateFromParent = function (
    propsData,
    listeners,
    parentVnode,
    renderChildren
  ) {
    var vm = this
    var hasChildren = !!(vm.$options._renderChildren || renderChildren)
    vm.$options._parentVnode = parentVnode
    vm.$options._renderChildren = renderChildren
    // update props
    if (propsData && vm.$options.props) {
      observerState.shouldConvert = false
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = true
      }
      var propKeys = vm.$options._propKeys || []
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i]
        vm[key] = validateProp(key, vm.$options.props, propsData, vm)
      }
      observerState.shouldConvert = true
      if (process.env.NODE_ENV !== 'production') {
        observerState.isSettingProps = false
      }
    }
    // update listeners
    if (listeners) {
      var oldListeners = vm.$options._parentListeners
      vm.$options._parentListeners = listeners
      vm._updateListeners(listeners, oldListeners)
    }
    // resolve slots + force update if has children
    if (hasChildren) {
      vm.$slots = resolveSlots(renderChildren)
      vm.$forceUpdate()
    }
  }

  Vue.prototype.$forceUpdate = function () {
    var vm = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }

  Vue.prototype.$destroy = function () {
    var vm = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    var parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    var i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
  }
}

function callHook (vm, hook) {
  var handlers = vm.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(vm)
    }
  }
  vm.$emit('hook:' + hook)
}

/*  */

var hooks = { init: init, prepatch: prepatch, insert: insert, destroy: destroy }
var hooksToMerge = Object.keys(hooks)

function createComponent (
  Ctor,
  data,
  context,
  children,
  tag
) {
  if (!Ctor) {
    return
  }

  if (isObject(Ctor)) {
    Ctor = Vue.extend(Ctor)
  }

  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(("Invalid Component definition: " + (String(Ctor))), context)
    }
    return
  }

  // async component
  if (!Ctor.cid) {
    if (Ctor.resolved) {
      Ctor = Ctor.resolved
    } else {
      Ctor = resolveAsyncComponent(Ctor, function () {
        // it's ok to queue this on every render because
        // $forceUpdate is buffered by the scheduler.
        context.$forceUpdate()
      })
      if (!Ctor) {
        // return nothing if this is indeed an async component
        // wait for the callback to trigger parent update.
        return
      }
    }
  }

  data = data || {}

  // extract props
  var propsData = extractProps(data, Ctor)

  // functional component
  if (Ctor.options.functional) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }

  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  var listeners = data.on
  // replace with listeners with .native modifier
  data.on = data.nativeOn

  if (Ctor.options.abstract) {
    // abstract components do not keep anything
    // other than props & listeners
    data = {}
  }

  // merge component management hooks onto the placeholder node
  mergeHooks(data)

  // return a placeholder vnode
  var name = Ctor.options.name || tag
  var vnode = new VNode(
    ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
    data, undefined, undefined, undefined, undefined, context,
    { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children }
  )
  return vnode
}

function createFunctionalComponent (
  Ctor,
  propsData,
  data,
  context,
  children
) {
  var props = {}
  var propOptions = Ctor.options.props
  if (propOptions) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData)
    }
  }
  return Ctor.options.render.call(
    null,
    context.$createElement,
    {
      props: props,
      data: data,
      parent: context,
      children: normalizeChildren(children),
      slots: function () { return resolveSlots(children); }
    }
  )
}

function createComponentInstanceForVnode (
  vnode, // we know it's MountedComponentVNode but flow doesn't
  parent // activeInstance in lifecycle state
) {
  var vnodeComponentOptions = vnode.componentOptions
  var options = {
    _isComponent: true,
    parent: parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children
  }
  // check inline-template render functions
  var inlineTemplate = vnode.data.inlineTemplate
  if (inlineTemplate) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnodeComponentOptions.Ctor(options)
}

function init (vnode, hydrating) {
  if (!vnode.child || vnode.child._isDestroyed) {
    var child = vnode.child = createComponentInstanceForVnode(vnode, activeInstance)
    child.$mount(hydrating ? vnode.elm : undefined, hydrating)
  }
}

function prepatch (
  oldVnode,
  vnode
) {
  var options = vnode.componentOptions
  var child = vnode.child = oldVnode.child
  child._updateFromParent(
    options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
  )
}

function insert (vnode) {
  if (!vnode.child._isMounted) {
    vnode.child._isMounted = true
    callHook(vnode.child, 'mounted')
  }
  if (vnode.data.keepAlive) {
    vnode.child._inactive = false
    callHook(vnode.child, 'activated')
  }
}

function destroy (vnode) {
  if (!vnode.child._isDestroyed) {
    if (!vnode.data.keepAlive) {
      vnode.child.$destroy()
    } else {
      vnode.child._inactive = true
      callHook(vnode.child, 'deactivated')
    }
  }
}

function resolveAsyncComponent (
  factory,
  cb
) {
  if (factory.requested) {
    // pool callbacks
    factory.pendingCallbacks.push(cb)
  } else {
    factory.requested = true
    var cbs = factory.pendingCallbacks = [cb]
    var sync = true

    var resolve = function (res) {
      if (isObject(res)) {
        res = Vue.extend(res)
      }
      // cache resolved
      factory.resolved = res
      // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)
      if (!sync) {
        for (var i = 0, l = cbs.length; i < l; i++) {
          cbs[i](res)
        }
      }
    }

    var reject = function (reason) {
      process.env.NODE_ENV !== 'production' && warn(
        "Failed to resolve async component: " + (String(factory)) +
        (reason ? ("\nReason: " + reason) : '')
      )
    }

    var res = factory(resolve, reject)

    // handle promise
    if (res && typeof res.then === 'function' && !factory.resolved) {
      res.then(resolve, reject)
    }

    sync = false
    // return in case resolved synchronously
    return factory.resolved
  }
}

function extractProps (data, Ctor) {
  // we are only extrating raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props
  if (!propOptions) {
    return
  }
  var res = {}
  var attrs = data.attrs;
  var props = data.props;
  var domProps = data.domProps;
  if (attrs || props || domProps) {
    for (var key in propOptions) {
      var altKey = hyphenate(key)
      checkProp(res, props, key, altKey, true) ||
      checkProp(res, attrs, key, altKey) ||
      checkProp(res, domProps, key, altKey)
    }
  }
  return res
}

function checkProp (
  res,
  hash,
  key,
  altKey,
  preserve
) {
  if (hash) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}

function mergeHooks (data) {
  if (!data.hook) {
    data.hook = {}
  }
  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i]
    var fromParent = data.hook[key]
    var ours = hooks[key]
    data.hook[key] = fromParent ? mergeHook$1(ours, fromParent) : ours
  }
}

function mergeHook$1 (a, b) {
  // since all hooks have at most two args, use fixed args
  // to avoid having to use fn.apply().
  return function (_, __) {
    a(_, __)
    b(_, __)
  }
}

/*  */

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
function createElement (
  tag,
  data,
  children
) {
  if (data && (Array.isArray(data) || typeof data !== 'object')) {
    children = data
    data = undefined
  }
  // make sure to use real instance instead of proxy as context
  return _createElement(this._self, tag, data, children)
}

function _createElement (
  context,
  tag,
  data,
  children
) {
  if (data && data.__ob__) {
    process.env.NODE_ENV !== 'production' && warn(
      "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return emptyVNode()
  }
  if (typeof tag === 'string') {
    var Ctor
    var ns = config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    } else if ((Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      return createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      return new VNode(
        tag, data, normalizeChildren(children, ns),
        undefined, undefined, ns, context
      )
    }
  } else {
    // direct component options / constructor
    return createComponent(tag, data, context, children)
  }
}

/*  */

function initRender (vm) {
  vm.$vnode = null // the placeholder node in parent tree
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null
  vm.$slots = resolveSlots(vm.$options._renderChildren)
  // bind the public createElement fn to this instance
  // so that we get proper render context inside it.
  vm.$createElement = bind(createElement, vm)
  if (vm.$options.el) {
    vm.$mount(vm.$options.el)
  }
}

function renderMixin (Vue) {
  Vue.prototype.$nextTick = function (fn) {
    nextTick(fn, this)
  }

  Vue.prototype._render = function () {
    var vm = this
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    if (vm._isMounted) {
      // clone slot nodes on re-renders
      for (var key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key])
      }
    }

    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    var vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        warn(("Error when rendering " + (formatComponentName(vm)) + ":"))
      }
      /* istanbul ignore else */
      if (config.errorHandler) {
        config.errorHandler.call(null, e, vm)
      } else {
        if (config._isServer) {
          throw e
        } else {
          setTimeout(function () { throw e }, 0)
        }
      }
      // return previous vnode to prevent render error causing blank component
      vnode = vm._vnode
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = emptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }

  // shorthands used in render functions
  Vue.prototype._h = createElement
  // toString for mustaches
  Vue.prototype._s = _toString
  // number conversion
  Vue.prototype._n = toNumber
  // empty vnode
  Vue.prototype._e = emptyVNode
  // loose equal
  Vue.prototype._q = looseEqual
  // loose indexOf
  Vue.prototype._i = looseIndexOf

  // render static tree by index
  Vue.prototype._m = function renderStatic (
    index,
    isInFor
  ) {
    var tree = this._staticTrees[index]
    // if has already-rendered static tree and not inside v-for,
    // we can reuse the same tree by doing a shallow clone.
    if (tree && !isInFor) {
      return Array.isArray(tree)
        ? cloneVNodes(tree)
        : cloneVNode(tree)
    }
    // otherwise, render a fresh tree.
    tree = this._staticTrees[index] = this.$options.staticRenderFns[index].call(this._renderProxy)
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        tree[i].isStatic = true
        tree[i].key = "__static__" + index + "_" + i
      }
    } else {
      tree.isStatic = true
      tree.key = "__static__" + index
    }
    return tree
  }

  // filter resolution helper
  var identity = function (_) { return _; }
  Vue.prototype._f = function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  // render v-for
  Vue.prototype._l = function renderList (
    val,
    render
  ) {
    var ret, i, l, keys, key
    if (Array.isArray(val)) {
      ret = new Array(val.length)
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i)
      }
    } else if (typeof val === 'number') {
      ret = new Array(val)
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i)
      }
    } else if (isObject(val)) {
      keys = Object.keys(val)
      ret = new Array(keys.length)
      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i]
        ret[i] = render(val[key], key, i)
      }
    }
    return ret
  }

  // renderSlot
  Vue.prototype._t = function (
    name,
    fallback
  ) {
    var slotNodes = this.$slots[name]
    // warn duplicate slot usage
    if (slotNodes && process.env.NODE_ENV !== 'production') {
      slotNodes._rendered && warn(
        "Duplicate presence of slot \"" + name + "\" found in the same render tree " +
        "- this will likely cause render errors.",
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }

  // apply v-bind object
  Vue.prototype._b = function bindProps (
    data,
    value,
    asProp
  ) {
    if (value) {
      if (!isObject(value)) {
        process.env.NODE_ENV !== 'production' && warn(
          'v-bind without argument expects an Object or Array value',
          this
        )
      } else {
        if (Array.isArray(value)) {
          value = toObject(value)
        }
        for (var key in value) {
          if (key === 'class' || key === 'style') {
            data[key] = value[key]
          } else {
            var hash = asProp || config.mustUseProp(key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {})
            hash[key] = value[key]
          }
        }
      }
    }
    return data
  }

  // expose v-on keyCodes
  Vue.prototype._k = function getKeyCodes (key) {
    return config.keyCodes[key]
  }
}

function resolveSlots (
  renderChildren
) {
  var slots = {}
  if (!renderChildren) {
    return slots
  }
  var children = normalizeChildren(renderChildren) || []
  var defaultSlot = []
  var name, child
  for (var i = 0, l = children.length; i < l; i++) {
    child = children[i]
    if (child.data && (name = child.data.slot)) {
      delete child.data.slot
      var slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        slot.push(child)
      }
    } else {
      defaultSlot.push(child)
    }
  }
  // ignore single whitespace
  if (defaultSlot.length && !(
    defaultSlot.length === 1 &&
    (defaultSlot[0].text === ' ' || defaultSlot[0].isComment)
  )) {
    slots.default = defaultSlot
  }
  return slots
}

/*  */

function initEvents (vm) {
  vm._events = Object.create(null)
  // init parent attached events
  var listeners = vm.$options._parentListeners
  var on = bind(vm.$on, vm)
  var off = bind(vm.$off, vm)
  vm._updateListeners = function (listeners, oldListeners) {
    updateListeners(listeners, oldListeners || {}, on, off)
  }
  if (listeners) {
    vm._updateListeners(listeners)
  }
}

function eventsMixin (Vue) {
  Vue.prototype.$on = function (event, fn) {
    var vm = this
    ;(vm._events[event] || (vm._events[event] = [])).push(fn)
    return vm
  }

  Vue.prototype.$once = function (event, fn) {
    var vm = this
    function on () {
      vm.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on)
    return vm
  }

  Vue.prototype.$off = function (event, fn) {
    var vm = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // specific event
    var cbs = vm._events[event]
    if (!cbs) {
      return vm
    }
    if (arguments.length === 1) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    var cb
    var i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event) {
    var vm = this
    var cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      var args = toArray(arguments, 1)
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i].apply(vm, args)
      }
    }
    return vm
  }
}

/*  */

var uid = 0

function initMixin (Vue) {
  Vue.prototype._init = function (options) {
    var vm = this
    // a uid
    vm._uid = uid++
    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    callHook(vm, 'beforeCreate')
    initState(vm)
    callHook(vm, 'created')
    initRender(vm)
  }

  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(resolveConstructorOptions(vm))
    // doing this because it's faster than dynamic enumeration.
    opts.parent = options.parent
    opts.propsData = options.propsData
    opts._parentVnode = options._parentVnode
    opts._parentListeners = options._parentListeners
    opts._renderChildren = options._renderChildren
    opts._componentTag = options._componentTag
    if (options.render) {
      opts.render = options.render
      opts.staticRenderFns = options.staticRenderFns
    }
  }

  function resolveConstructorOptions (vm) {
    var Ctor = vm.constructor
    var options = Ctor.options
    if (Ctor.super) {
      var superOptions = Ctor.super.options
      var cachedSuperOptions = Ctor.superOptions
      if (superOptions !== cachedSuperOptions) {
        // super option changed
        Ctor.superOptions = superOptions
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
        if (options.name) {
          options.components[options.name] = Ctor
        }
      }
    }
    return options
  }
}

function Vue (options) {
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

var warn = noop
var formatComponentName

if (process.env.NODE_ENV !== 'production') {
  var hasConsole = typeof console !== 'undefined'

  warn = function (msg, vm) {
    if (hasConsole && (!config.silent)) {
      console.error("[Vue warn]: " + msg + " " + (
        vm ? formatLocation(formatComponentName(vm)) : ''
      ))
    }
  }

  formatComponentName = function (vm) {
    if (vm.$root === vm) {
      return 'root instance'
    }
    var name = vm._isVue
      ? vm.$options.name || vm.$options._componentTag
      : vm.name
    return name ? ("component <" + name + ">") : "anonymous component"
  }

  var formatLocation = function (str) {
    if (str === 'anonymous component') {
      str += " - use the \"name\" option for better debugging messages."
    }
    return ("(found in " + str + ")")
  }
}

/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
var strats = config.optionMergeStrategies

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        "option \"" + key + "\" can only be used during instance " +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }

  strats.name = function (parent, child, vm) {
    if (vm && child) {
      warn(
        'options "name" can only be used as a component definition option, ' +
        'not during instance creation.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to, from) {
  var key, toVal, fromVal
  for (key in from) {
    toVal = to[key]
    fromVal = from[key]
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    } else if (isObject(toVal) && isObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 */
strats.data = function (
  parentVal,
  childVal,
  vm
) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else if (parentVal || childVal) {
    return function mergedInstanceDataFn () {
      // instance merge
      var instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal
      var defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined
      if (instanceData) {
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}

/**
 * Hooks and param attributes are merged as arrays.
 */
function mergeHook (
  parentVal,
  childVal
) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

config._lifecycleHooks.forEach(function (hook) {
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal, childVal) {
  var res = Object.create(parentVal || null)
  return childVal
    ? extend(res, childVal)
    : res
}

config._assetTypes.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal, childVal) {
  /* istanbul ignore if */
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = {}
  extend(ret, parentVal)
  for (var key in childVal) {
    var parent = ret[key]
    var child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */
strats.props =
strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) { return parentVal }
  if (!parentVal) { return childVal }
  var ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
 */
var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Make sure component options get converted to actual
 * constructors.
 */
function normalizeComponents (options) {
  if (options.components) {
    var components = options.components
    var def
    for (var key in components) {
      var lower = key.toLowerCase()
      if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
        process.env.NODE_ENV !== 'production' && warn(
          'Do not use built-in or reserved HTML elements as component ' +
          'id: ' + key
        )
        continue
      }
      def = components[key]
      if (isPlainObject(def)) {
        components[key] = Vue.extend(def)
      }
    }
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options) {
  var props = options.props
  if (!props) { return }
  var res = {}
  var i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  }
  options.props = res
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options) {
  var dirs = options.directives
  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
function mergeOptions (
  parent,
  child,
  vm
) {
  normalizeComponents(child)
  normalizeProps(child)
  normalizeDirectives(child)
  var extendsFrom = child.extends
  if (extendsFrom) {
    parent = typeof extendsFrom === 'function'
      ? mergeOptions(parent, extendsFrom.options, vm)
      : mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      var mixin = child.mixins[i]
      if (mixin.prototype instanceof Vue) {
        mixin = mixin.options
      }
      parent = mergeOptions(parent, mixin, vm)
    }
  }
  var options = {}
  var key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
function resolveAsset (
  options,
  type,
  id,
  warnMissing
) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  var assets = options[type]
  var res = assets[id] ||
    // camelCase ID
    assets[camelize(id)] ||
    // Pascal Case ID
    assets[capitalize(camelize(id))]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}

/*  */

function validateProp (
  key,
  propOptions,
  propsData,
  vm
) {
  var prop = propOptions[key]
  var absent = !hasOwn(propsData, key)
  var value = propsData[key]
  // handle boolean props
  if (getType(prop.type) === 'Boolean') {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (value === '' || value === hyphenate(key)) {
      value = true
    }
  }
  // check default value
  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key)
    // since the default value is a fresh copy,
    // make sure to observe it.
    var prevShouldConvert = observerState.shouldConvert
    observerState.shouldConvert = true
    observe(value)
    observerState.shouldConvert = prevShouldConvert
  }
  if (process.env.NODE_ENV !== 'production') {
    assertProp(prop, key, value, vm, absent)
  }
  return value
}

/**
 * Get the default value of a prop.
 */
function getPropDefaultValue (vm, prop, name) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined
  }
  var def = prop.default
  // warn against non-factory defaults for Object & Array
  if (isObject(def)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Invalid default value for prop "' + name + '": ' +
      'Props with type Object/Array must use a factory function ' +
      'to return the default value.',
      vm
    )
  }
  // call factory function for non-Function types
  return typeof def === 'function' && prop.type !== Function
    ? def.call(vm)
    : def
}

/**
 * Assert whether a prop is valid.
 */
function assertProp (
  prop,
  name,
  value,
  vm,
  absent
) {
  if (prop.required && absent) {
    warn(
      'Missing required prop: "' + name + '"',
      vm
    )
    return
  }
  if (value == null && !prop.required) {
    return
  }
  var type = prop.type
  var valid = !type || type === true
  var expectedTypes = []
  if (type) {
    if (!Array.isArray(type)) {
      type = [type]
    }
    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i])
      expectedTypes.push(assertedType.expectedType)
      valid = assertedType.valid
    }
  }
  if (!valid) {
    warn(
      'Invalid prop: type check failed for prop "' + name + '".' +
      ' Expected ' + expectedTypes.map(capitalize).join(', ') +
      ', got ' + Object.prototype.toString.call(value).slice(8, -1) + '.',
      vm
    )
    return
  }
  var validator = prop.validator
  if (validator) {
    if (!validator(value)) {
      warn(
        'Invalid prop: custom validator check failed for prop "' + name + '".',
        vm
      )
    }
  }
}

/**
 * Assert the type of a value
 */
function assertType (value, type) {
  var valid
  var expectedType = getType(type)
  if (expectedType === 'String') {
    valid = typeof value === (expectedType = 'string')
  } else if (expectedType === 'Number') {
    valid = typeof value === (expectedType = 'number')
  } else if (expectedType === 'Boolean') {
    valid = typeof value === (expectedType = 'boolean')
  } else if (expectedType === 'Function') {
    valid = typeof value === (expectedType = 'function')
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else {
    valid = value instanceof type
  }
  return {
    valid: valid,
    expectedType: expectedType
  }
}

/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */
function getType (fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/)
  return match && match[1]
}



var util = Object.freeze({
	defineReactive: defineReactive,
	_toString: _toString,
	toNumber: toNumber,
	makeMap: makeMap,
	isBuiltInTag: isBuiltInTag,
	remove: remove,
	hasOwn: hasOwn,
	isPrimitive: isPrimitive,
	cached: cached,
	camelize: camelize,
	capitalize: capitalize,
	hyphenate: hyphenate,
	bind: bind,
	toArray: toArray,
	extend: extend,
	isObject: isObject,
	isPlainObject: isPlainObject,
	toObject: toObject,
	noop: noop,
	no: no,
	genStaticKeys: genStaticKeys,
	looseEqual: looseEqual,
	looseIndexOf: looseIndexOf,
	isReserved: isReserved,
	def: def,
	parsePath: parsePath,
	hasProto: hasProto,
	inBrowser: inBrowser,
	UA: UA,
	isIE: isIE,
	isIE9: isIE9,
	isEdge: isEdge,
	isAndroid: isAndroid,
	isIOS: isIOS,
	devtools: devtools,
	nextTick: nextTick,
	get _Set () { return _Set; },
	mergeOptions: mergeOptions,
	resolveAsset: resolveAsset,
	get warn () { return warn; },
	get formatComponentName () { return formatComponentName; },
	validateProp: validateProp
});

/*  */

function initUse (Vue) {
  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    plugin.installed = true
    return this
  }
}

/*  */

function initMixin$1 (Vue) {
  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin)
  }
}

/*  */

function initExtend (Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  var cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    var Super = this
    var isFirstExtend = Super.cid === 0
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor
    }
    var name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characaters and the hyphen.'
        )
        name = null
      }
    }
    var Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super
    // allow further extension
    Sub.extend = Super.extend
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub
    }
    return Sub
  }
}

/*  */

function initAssetRegisters (Vue) {
  /**
   * Create asset registration methods.
   */
  config._assetTypes.forEach(function (type) {
    Vue[type] = function (
      id,
      definition
    ) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (type === 'component' && config.isReservedTag(id)) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            )
          }
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = Vue.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}

var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  created: function created () {
    this.cache = Object.create(null)
  },
  render: function render () {
    var vnode = getFirstComponentChild(this.$slots.default)
    if (vnode && vnode.componentOptions) {
      var opts = vnode.componentOptions
      var key = vnode.key == null
        // same constructor may get registered as different local components
        // so cid alone is not enough (#3269)
        ? opts.Ctor.cid + '::' + opts.tag
        : vnode.key
      if (this.cache[key]) {
        vnode.child = this.cache[key].child
      } else {
        this.cache[key] = vnode
      }
      vnode.data.keepAlive = true
    }
    return vnode
  },
  destroyed: function destroyed () {
    var this$1 = this;

    for (var key in this.cache) {
      var vnode = this$1.cache[key]
      callHook(vnode.child, 'deactivated')
      vnode.child.$destroy()
    }
  }
}

var builtInComponents = {
  KeepAlive: KeepAlive
}

/*  */

function initGlobalAPI (Vue) {
  // config
  var configDef = {}
  configDef.get = function () { return config; }
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = function () {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)
  Vue.util = util
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  config._assetTypes.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null)
  })

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin$1(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}

initGlobalAPI(Vue)

Object.defineProperty(Vue.prototype, '$isServer', {
  get: function () { return config._isServer; }
})

Vue.version = '2.0.0-rc.8'

/*  */

// attributes that should be using props for binding
var mustUseProp = makeMap('value,selected,checked,muted')

var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck')

var isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
)

var isAttr = makeMap(
  'accept,accept-charset,accesskey,action,align,alt,async,autocomplete,' +
  'autofocus,autoplay,autosave,bgcolor,border,buffered,challenge,charset,' +
  'checked,cite,class,code,codebase,color,cols,colspan,content,http-equiv,' +
  'name,contenteditable,contextmenu,controls,coords,data,datetime,default,' +
  'defer,dir,dirname,disabled,download,draggable,dropzone,enctype,method,for,' +
  'form,formaction,headers,<th>,height,hidden,high,href,hreflang,http-equiv,' +
  'icon,id,ismap,itemprop,keytype,kind,label,lang,language,list,loop,low,' +
  'manifest,max,maxlength,media,method,GET,POST,min,multiple,email,file,' +
  'muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,' +
  'preload,radiogroup,readonly,rel,required,reversed,rows,rowspan,sandbox,' +
  'scope,scoped,seamless,selected,shape,size,type,text,password,sizes,span,' +
  'spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,' +
  'target,title,type,usemap,value,width,wrap'
)

var xlinkNS = 'http://www.w3.org/1999/xlink'

var isXlink = function (name) {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
}

var getXlinkProp = function (name) {
  return isXlink(name) ? name.slice(6, name.length) : ''
}

var isFalsyAttrValue = function (val) {
  return val == null || val === false
}

/*  */

function genClassForVnode (vnode) {
  var data = vnode.data
  var parentNode = vnode
  var childNode = vnode
  while (childNode.child) {
    childNode = childNode.child._vnode
    if (childNode.data) {
      data = mergeClassData(childNode.data, data)
    }
  }
  while ((parentNode = parentNode.parent)) {
    if (parentNode.data) {
      data = mergeClassData(data, parentNode.data)
    }
  }
  return genClassFromData(data)
}

function mergeClassData (child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: child.class
      ? [child.class, parent.class]
      : parent.class
  }
}

function genClassFromData (data) {
  var dynamicClass = data.class
  var staticClass = data.staticClass
  if (staticClass || dynamicClass) {
    return concat(staticClass, stringifyClass(dynamicClass))
  }
  /* istanbul ignore next */
  return ''
}

function concat (a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass (value) {
  var res = ''
  if (!value) {
    return res
  }
  if (typeof value === 'string') {
    return value
  }
  if (Array.isArray(value)) {
    var stringified
    for (var i = 0, l = value.length; i < l; i++) {
      if (value[i]) {
        if ((stringified = stringifyClass(value[i]))) {
          res += stringified + ' '
        }
      }
    }
    return res.slice(0, -1)
  }
  if (isObject(value)) {
    for (var key in value) {
      if (value[key]) { res += key + ' ' }
    }
    return res.slice(0, -1)
  }
  /* istanbul ignore next */
  return res
}

/*  */

var namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
}

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template'
)

var isUnaryTag = makeMap(
  'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
  'link,meta,param,source,track,wbr',
  true
)

// Elements that you can, intentionally, leave open
// (and which close themselves)
var canBeLeftOpenTag = makeMap(
  'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source',
  true
)

// HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
var isNonPhrasingTag = makeMap(
  'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
  'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
  'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
  'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
  'title,tr,track',
  true
)

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font,' +
  'font-face,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

var isReservedTag = function (tag) {
  return isHTMLTag(tag) || isSVG(tag)
}

function getTagNamespace (tag) {
  if (isSVG(tag)) {
    return 'svg'
  }
  // basic support for MathML
  // note it doesn't support other MathML elements being component roots
  if (tag === 'math') {
    return 'math'
  }
}

var unknownElementCache = Object.create(null)
function isUnknownElement (tag) {
  /* istanbul ignore if */
  if (!inBrowser) {
    return true
  }
  if (isReservedTag(tag)) {
    return false
  }
  tag = tag.toLowerCase()
  /* istanbul ignore if */
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  var el = document.createElement(tag)
  if (tag.indexOf('-') > -1) {
    // http://stackoverflow.com/a/28210364/1070244
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement ||
      el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

/*  */

/**
 * Query an element selector if it's not an element already.
 */
function query (el) {
  if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + selector
      )
      return document.createElement('div')
    }
  }
  return el
}

/*  */

function createElement$1 (tagName) {
  return document.createElement(tagName)
}

function createElementNS (namespace, tagName) {
  return document.createElementNS(namespaceMap[namespace], tagName)
}

function createTextNode (text) {
  return document.createTextNode(text)
}

function createComment (text) {
  return document.createComment(text)
}

function insertBefore (parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

function removeChild (node, child) {
  node.removeChild(child)
}

function appendChild (node, child) {
  node.appendChild(child)
}

function parentNode (node) {
  return node.parentNode
}

function nextSibling (node) {
  return node.nextSibling
}

function tagName (node) {
  return node.tagName
}

function setTextContent (node, text) {
  node.textContent = text
}

function childNodes (node) {
  return node.childNodes
}

function setAttribute (node, key, val) {
  node.setAttribute(key, val)
}


var nodeOps = Object.freeze({
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  childNodes: childNodes,
  setAttribute: setAttribute
});

/*  */

var ref = {
  create: function create (_, vnode) {
    registerRef(vnode)
  },
  update: function update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy: function destroy (vnode) {
    registerRef(vnode, true)
  }
}

function registerRef (vnode, isRemoval) {
  var key = vnode.data.ref
  if (!key) { return }

  var vm = vnode.context
  var ref = vnode.child || vnode.elm
  var refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) {
      if (Array.isArray(refs[key])) {
        refs[key].push(ref)
      } else {
        refs[key] = [ref]
      }
    } else {
      refs[key] = ref
    }
  }
}

/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *

/*
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyData = {}
var emptyNode = new VNode('', emptyData, [])
var hooks$1 = ['create', 'update', 'postpatch', 'remove', 'destroy']

function isUndef (s) {
  return s == null
}

function isDef (s) {
  return s != null
}

function sameVnode (vnode1, vnode2) {
  return (
    vnode1.key === vnode2.key &&
    vnode1.tag === vnode2.tag &&
    vnode1.isComment === vnode2.isComment &&
    !vnode1.data === !vnode2.data
  )
}

function createKeyToOldIdx (children, beginIdx, endIdx) {
  var i, key
  var map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) { map[key] = i }
  }
  return map
}

function createPatchFunction (backend) {
  var i, j
  var cbs = {}

  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks$1.length; ++i) {
    cbs[hooks$1[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks$1[i]] !== undefined) { cbs[hooks$1[i]].push(modules[j][hooks$1[i]]) }
    }
  }

  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function createRmCb (childElm, listeners) {
    function remove () {
      if (--remove.listeners === 0) {
        removeElement(childElm)
      }
    }
    remove.listeners = listeners
    return remove
  }

  function removeElement (el) {
    var parent = nodeOps.parentNode(el)
    nodeOps.removeChild(parent, el)
  }

  function createElm (vnode, insertedVnodeQueue, nested) {
    var i
    var data = vnode.data
    vnode.isRootInsert = !nested
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode) }
      // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.
      if (isDef(i = vnode.child)) {
        initComponent(vnode, insertedVnodeQueue)
        return vnode.elm
      }
    }
    var children = vnode.children
    var tag = vnode.tag
    if (isDef(tag)) {
      if (process.env.NODE_ENV !== 'production') {
        if (
          !vnode.ns &&
          !(config.ignoredElements && config.ignoredElements.indexOf(tag) > -1) &&
          config.isUnknownElement(tag)
        ) {
          warn(
            'Unknown custom element: <' + tag + '> - did you ' +
            'register the component correctly? For recursive components, ' +
            'make sure to provide the "name" option.',
            vnode.context
          )
        }
      }
      vnode.elm = vnode.ns
        ? nodeOps.createElementNS(vnode.ns, tag)
        : nodeOps.createElement(tag)
      setScope(vnode)
      createChildren(vnode, children, insertedVnodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
    } else if (vnode.isComment) {
      vnode.elm = nodeOps.createComment(vnode.text)
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text)
    }
    return vnode.elm
  }

  function createChildren (vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        nodeOps.appendChild(vnode.elm, createElm(children[i], insertedVnodeQueue, true))
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
    }
  }

  function isPatchable (vnode) {
    while (vnode.child) {
      vnode = vnode.child._vnode
    }
    return isDef(vnode.tag)
  }

  function invokeCreateHooks (vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode)
    }
    i = vnode.data.hook // Reuse variable
    if (isDef(i)) {
      if (i.create) { i.create(emptyNode, vnode) }
      if (i.insert) { insertedVnodeQueue.push(vnode) }
    }
  }

  function initComponent (vnode, insertedVnodeQueue) {
    if (vnode.data.pendingInsert) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert)
    }
    vnode.elm = vnode.child.$el
    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue)
      setScope(vnode)
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode)
      // make sure to invoke the insert hook
      insertedVnodeQueue.push(vnode)
    }
  }

  // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.
  function setScope (vnode) {
    var i
    if (isDef(i = vnode.context) && isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '')
    }
    if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        isDef(i = i.$options._scopeId)) {
      nodeOps.setAttribute(vnode.elm, i, '')
    }
  }

  function addVnodes (parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      nodeOps.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before)
    }
  }

  function invokeDestroyHook (vnode) {
    var i, j
    var data = vnode.data
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode) }
      for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode) }
    }
    if (isDef(i = vnode.child) && !data.keepAlive) {
      invokeDestroyHook(i._vnode)
    }
    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j])
      }
    }
  }

  function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx]
      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch)
          invokeDestroyHook(ch)
        } else { // Text node
          nodeOps.removeChild(parentElm, ch.elm)
        }
      }
    }
  }

  function removeAndInvokeRemoveHook (vnode, rm) {
    if (rm || isDef(vnode.data)) {
      var listeners = cbs.remove.length + 1
      if (!rm) {
        // directly removing
        rm = createRmCb(vnode.elm, listeners)
      } else {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners
      }
      // recursively invoke hooks on child component root node
      if (isDef(i = vnode.child) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm)
      }
      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm)
      }
      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm)
      } else {
        rm()
      }
    } else {
      removeElement(vnode.elm)
    }
  }

  function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0
    var newStartIdx = 0
    var oldEndIdx = oldCh.length - 1
    var oldStartVnode = oldCh[0]
    var oldEndVnode = oldCh[oldEndIdx]
    var newEndIdx = newCh.length - 1
    var newStartVnode = newCh[0]
    var newEndVnode = newCh[newEndIdx]
    var oldKeyToIdx, idxInOld, elmToMove, before

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    var canMove = !removeOnly

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]
      } else {
        if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx) }
        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
        if (isUndef(idxInOld)) { // New element
          nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          elmToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !elmToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          }
          if (elmToMove.tag !== newStartVnode.tag) {
            // same key but different element. treat as new element
            nodeOps.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
            oldCh[idxInOld] = undefined
            canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm)
            newStartVnode = newCh[++newStartIdx]
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    if (oldVnode === vnode) {
      return
    }
    // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.
    if (vnode.isStatic &&
        oldVnode.isStatic &&
        vnode.key === oldVnode.key &&
        vnode.isCloned) {
      vnode.elm = oldVnode.elm
      return
    }
    var i, hook
    var hasData = isDef(i = vnode.data)
    if (hasData && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode)
    }
    var elm = vnode.elm = oldVnode.elm
    var oldCh = oldVnode.children
    var ch = vnode.children
    if (hasData && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode) }
      if (isDef(hook) && isDef(i = hook.update)) { i(oldVnode, vnode) }
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly) }
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, '') }
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (hasData) {
      for (i = 0; i < cbs.postpatch.length; ++i) { cbs.postpatch[i](oldVnode, vnode) }
      if (isDef(hook) && isDef(i = hook.postpatch)) { i(oldVnode, vnode) }
    }
  }

  function invokeInsertHook (vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (initial && vnode.parent) {
      vnode.parent.data.pendingInsert = queue
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i])
      }
    }
  }

  var bailed = false
  function hydrate (elm, vnode, insertedVnodeQueue) {
    if (process.env.NODE_ENV !== 'production') {
      if (!assertNodeMatch(elm, vnode)) {
        return false
      }
    }
    vnode.elm = elm
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */) }
      if (isDef(i = vnode.child)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue)
        return true
      }
    }
    if (isDef(tag)) {
      if (isDef(children)) {
        var childNodes = nodeOps.childNodes(elm)
        // empty element, allow client to pick up and populate children
        if (!childNodes.length) {
          createChildren(vnode, children, insertedVnodeQueue)
        } else {
          var childrenMatch = true
          if (childNodes.length !== children.length) {
            childrenMatch = false
          } else {
            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!hydrate(childNodes[i$1], children[i$1], insertedVnodeQueue)) {
                childrenMatch = false
                break
              }
            }
          }
          if (!childrenMatch) {
            if (process.env.NODE_ENV !== 'production' &&
                typeof console !== 'undefined' &&
                !bailed) {
              bailed = true
              console.warn('Parent: ', elm)
              console.warn('Mismatching childNodes vs. VNodes: ', childNodes, children)
            }
            return false
          }
        }
      }
      if (isDef(data)) {
        invokeCreateHooks(vnode, insertedVnodeQueue)
      }
    }
    return true
  }

  function assertNodeMatch (node, vnode) {
    if (vnode.tag) {
      return (
        vnode.tag.indexOf('vue-component') === 0 ||
        vnode.tag === nodeOps.tagName(node).toLowerCase()
      )
    } else {
      return _toString(vnode.text) === node.data
    }
  }

  return function patch (oldVnode, vnode, hydrating, removeOnly) {
    var elm, parent
    var isInitialPatch = false
    var insertedVnodeQueue = []

    if (!oldVnode) {
      // empty mount, create new root element
      isInitialPatch = true
      createElm(vnode, insertedVnodeQueue)
    } else {
      var isRealElement = isDef(oldVnode.nodeType)
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute('server-rendered')) {
            oldVnode.removeAttribute('server-rendered')
            hydrating = true
          }
          if (hydrating) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true)
              return oldVnode
            } else if (process.env.NODE_ENV !== 'production') {
              warn(
                'The client-side rendered virtual DOM tree is not matching ' +
                'server-rendered content. This is likely caused by incorrect ' +
                'HTML markup, for example nesting block-level elements inside ' +
                '<p>, or missing <tbody>. Bailing hydration and performing ' +
                'full client-side render.'
              )
            }
          }
          // either not server-rendered, or hydration failed.
          // create an empty node and replace it
          oldVnode = emptyNodeAt(oldVnode)
        }
        elm = oldVnode.elm
        parent = nodeOps.parentNode(elm)

        createElm(vnode, insertedVnodeQueue)

        // component root element replaced.
        // update parent placeholder node element.
        if (vnode.parent) {
          vnode.parent.elm = vnode.elm
          if (isPatchable(vnode)) {
            for (var i = 0; i < cbs.create.length; ++i) {
              cbs.create[i](emptyNode, vnode.parent)
            }
          }
        }

        if (parent !== null) {
          nodeOps.insertBefore(parent, vnode.elm, nodeOps.nextSibling(elm))
          removeVnodes(parent, [oldVnode], 0, 0)
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode)
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
    return vnode.elm
  }
}

/*  */

var directives = {
  create: function bindDirectives (oldVnode, vnode) {
    var hasInsert = false
    forEachDirective(oldVnode, vnode, function (def, dir) {
      callHook$1(def, dir, 'bind', vnode, oldVnode)
      if (def.inserted) {
        hasInsert = true
      }
    })
    if (hasInsert) {
      mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
        applyDirectives(oldVnode, vnode, 'inserted')
      })
    }
  },
  update: function updateDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'update')
    // if old vnode has directives but new vnode doesn't
    // we need to teardown the directives on the old one.
    if (oldVnode.data.directives && !vnode.data.directives) {
      applyDirectives(oldVnode, oldVnode, 'unbind')
    }
  },
  postpatch: function postupdateDirectives (oldVnode, vnode) {
    applyDirectives(oldVnode, vnode, 'componentUpdated')
  },
  destroy: function unbindDirectives (vnode) {
    applyDirectives(vnode, vnode, 'unbind')
  }
}

var emptyModifiers = Object.create(null)

function forEachDirective (
  oldVnode,
  vnode,
  fn
) {
  var dirs = vnode.data.directives
  if (dirs) {
    for (var i = 0; i < dirs.length; i++) {
      var dir = dirs[i]
      var def = resolveAsset(vnode.context.$options, 'directives', dir.name, true)
      if (def) {
        var oldDirs = oldVnode && oldVnode.data.directives
        if (oldDirs) {
          dir.oldValue = oldDirs[i].value
        }
        if (!dir.modifiers) {
          dir.modifiers = emptyModifiers
        }
        fn(def, dir)
      }
    }
  }
}

function applyDirectives (
  oldVnode,
  vnode,
  hook
) {
  forEachDirective(oldVnode, vnode, function (def, dir) {
    callHook$1(def, dir, hook, vnode, oldVnode)
  })
}

function callHook$1 (def, dir, hook, vnode, oldVnode) {
  var fn = def && def[hook]
  if (fn) {
    fn(vnode.elm, dir, vnode, oldVnode)
  }
}

var baseModules = [
  ref,
  directives
]

/*  */

function updateAttrs (oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return
  }
  var key, cur, old
  var elm = vnode.elm
  var oldAttrs = oldVnode.data.attrs || {}
  var attrs = vnode.data.attrs || {}
  // clone observed objects, as the user probably wants to mutate it
  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs)
  }

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }
  for (key in oldAttrs) {
    if (attrs[key] == null) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key))
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key)
      }
    }
  }
}

function setAttr (el, key, value) {
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, key)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key))
    } else {
      el.setAttributeNS(xlinkNS, key, value)
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
}

/*  */

function updateClass (oldVnode, vnode) {
  var el = vnode.elm
  var data = vnode.data
  var oldData = oldVnode.data
  if (!data.staticClass && !data.class &&
      (!oldData || (!oldData.staticClass && !oldData.class))) {
    return
  }

  var cls = genClassForVnode(vnode)

  // handle transition classes
  var transitionClass = el._transitionClasses
  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass))
  }

  // set the class
  if (cls !== el._prevClass) {
    el.setAttribute('class', cls)
    el._prevClass = cls
  }
}

var klass = {
  create: updateClass,
  update: updateClass
}

// skip type checking this file because we need to attach private properties
// to elements

function updateDOMListeners (oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return
  }
  var on = vnode.data.on || {}
  var oldOn = oldVnode.data.on || {}
  var add = vnode.elm._v_add || (vnode.elm._v_add = function (event, handler, capture) {
    vnode.elm.addEventListener(event, handler, capture)
  })
  var remove = vnode.elm._v_remove || (vnode.elm._v_remove = function (event, handler) {
    vnode.elm.removeEventListener(event, handler)
  })
  updateListeners(on, oldOn, add, remove)
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
}

/*  */

function updateDOMProps (oldVnode, vnode) {
  if (!oldVnode.data.domProps && !vnode.data.domProps) {
    return
  }
  var key, cur
  var elm = vnode.elm
  var oldProps = oldVnode.data.domProps || {}
  var props = vnode.data.domProps || {}
  // clone observed objects, as the user probably wants to mutate it
  if (props.__ob__) {
    props = vnode.data.domProps = extend({}, props)
  }

  for (key in oldProps) {
    if (props[key] == null) {
      elm[key] = undefined
    }
  }
  for (key in props) {
    // ignore children if the node has textContent or innerHTML,
    // as these will throw away existing DOM nodes and cause removal errors
    // on subsequent patches (#3360)
    if ((key === 'textContent' || key === 'innerHTML') && vnode.children) {
      vnode.children.length = 0
    }
    cur = props[key]
    if (key === 'value') {
      // store value as _value as well since
      // non-string values will be stringified
      elm._value = cur
      // avoid resetting cursor position when value is the same
      var strCur = cur == null ? '' : String(cur)
      if (elm.value !== strCur) {
        elm.value = strCur
      }
    } else {
      elm[key] = cur
    }
  }
}

var domProps = {
  create: updateDOMProps,
  update: updateDOMProps
}

/*  */

var prefixes = ['Webkit', 'Moz', 'ms']

var testEl
var normalize = cached(function (prop) {
  testEl = testEl || document.createElement('div')
  prop = camelize(prop)
  if (prop !== 'filter' && (prop in testEl.style)) {
    return prop
  }
  var upper = prop.charAt(0).toUpperCase() + prop.slice(1)
  for (var i = 0; i < prefixes.length; i++) {
    var prefixed = prefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixed
    }
  }
})

function updateStyle (oldVnode, vnode) {
  if ((!oldVnode.data || !oldVnode.data.style) && !vnode.data.style) {
    return
  }
  var cur, name
  var el = vnode.elm
  var oldStyle = oldVnode.data.style || {}
  var style = vnode.data.style || {}

  // handle string
  if (typeof style === 'string') {
    el.style.cssText = style
    return
  }

  var needClone = style.__ob__

  // handle array syntax
  if (Array.isArray(style)) {
    style = vnode.data.style = toObject(style)
  }

  // clone the style for future updates,
  // in case the user mutates the style object in-place.
  if (needClone) {
    style = vnode.data.style = extend({}, style)
  }

  for (name in oldStyle) {
    if (!style[name]) {
      el.style[normalize(name)] = ''
    }
  }
  for (name in style) {
    cur = style[name]
    if (cur !== oldStyle[name]) {
      // ie9 setting to null has no effect, must use empty string
      el.style[normalize(name)] = cur || ''
    }
  }
}

var style = {
  create: updateStyle,
  update: updateStyle
}

/*  */

/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass (el, cls) {
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.add(c); })
    } else {
      el.classList.add(cls)
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' '
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}

/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function removeClass (el, cls) {
  /* istanbul ignore else */
  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(function (c) { return el.classList.remove(c); })
    } else {
      el.classList.remove(cls)
    }
  } else {
    var cur = ' ' + el.getAttribute('class') + ' '
    var tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    el.setAttribute('class', cur.trim())
  }
}

/*  */

var hasTransition = inBrowser && !isIE9
var TRANSITION = 'transition'
var ANIMATION = 'animation'

// Transition property/event sniffing
var transitionProp = 'transition'
var transitionEndEvent = 'transitionend'
var animationProp = 'animation'
var animationEndEvent = 'animationend'
if (hasTransition) {
  /* istanbul ignore if */
  if (window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined) {
    transitionProp = 'WebkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }
  if (window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined) {
    animationProp = 'WebkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}

var raf = (inBrowser && window.requestAnimationFrame) || setTimeout
function nextFrame (fn) {
  raf(function () {
    raf(fn)
  })
}

function addTransitionClass (el, cls) {
  (el._transitionClasses || (el._transitionClasses = [])).push(cls)
  addClass(el, cls)
}

function removeTransitionClass (el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls)
  }
  removeClass(el, cls)
}

function whenTransitionEnds (
  el,
  expectedType,
  cb
) {
  var ref = getTransitionInfo(el, expectedType);
  var type = ref.type;
  var timeout = ref.timeout;
  var propCount = ref.propCount;
  if (!type) { return cb() }
  var event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  var ended = 0
  var end = function () {
    el.removeEventListener(event, onEnd)
    cb()
  }
  var onEnd = function (e) {
    if (e.target === el) {
      if (++ended >= propCount) {
        end()
      }
    }
  }
  setTimeout(function () {
    if (ended < propCount) {
      end()
    }
  }, timeout + 1)
  el.addEventListener(event, onEnd)
}

var transformRE = /\b(transform|all)(,|$)/

function getTransitionInfo (el, expectedType) {
  var styles = window.getComputedStyle(el)
  var transitioneDelays = styles[transitionProp + 'Delay'].split(', ')
  var transitionDurations = styles[transitionProp + 'Duration'].split(', ')
  var transitionTimeout = getTimeout(transitioneDelays, transitionDurations)
  var animationDelays = styles[animationProp + 'Delay'].split(', ')
  var animationDurations = styles[animationProp + 'Duration'].split(', ')
  var animationTimeout = getTimeout(animationDelays, animationDurations)

  var type
  var timeout = 0
  var propCount = 0
  /* istanbul ignore if */
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0
      ? transitionTimeout > animationTimeout
        ? TRANSITION
        : ANIMATION
      : null
    propCount = type
      ? type === TRANSITION
        ? transitionDurations.length
        : animationDurations.length
      : 0
  }
  var hasTransform =
    type === TRANSITION &&
    transformRE.test(styles[transitionProp + 'Property'])
  return {
    type: type,
    timeout: timeout,
    propCount: propCount,
    hasTransform: hasTransform
  }
}

function getTimeout (delays, durations) {
  return Math.max.apply(null, durations.map(function (d, i) {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs (s) {
  return Number(s.slice(0, -1)) * 1000
}

/*  */

function enter (vnode) {
  var el = vnode.elm

  // call leave callback now
  if (el._leaveCb) {
    el._leaveCb.cancelled = true
    el._leaveCb()
  }

  var data = resolveTransition(vnode.data.transition)
  if (!data) {
    return
  }

  /* istanbul ignore if */
  if (el._enterCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;

  // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.
  var transitionNode = activeInstance.$vnode
  var context = transitionNode && transitionNode.parent
    ? transitionNode.parent.context
    : activeInstance

  var isAppear = !context._isMounted || !vnode.isRootInsert

  if (isAppear && !appear && appear !== '') {
    return
  }

  var startClass = isAppear ? appearClass : enterClass
  var activeClass = isAppear ? appearActiveClass : enterActiveClass
  var beforeEnterHook = isAppear ? (beforeAppear || beforeEnter) : beforeEnter
  var enterHook = isAppear ? (typeof appear === 'function' ? appear : enter) : enter
  var afterEnterHook = isAppear ? (afterAppear || afterEnter) : afterEnter
  var enterCancelledHook = isAppear ? (appearCancelled || enterCancelled) : enterCancelled

  var expectsCSS = css !== false && !isIE9
  var userWantsControl =
    enterHook &&
    // enterHook may be a bound method which exposes
    // the length of original fn as _length
    (enterHook._length || enterHook.length) > 1

  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, activeClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass)
      }
      enterCancelledHook && enterCancelledHook(el)
    } else {
      afterEnterHook && afterEnterHook(el)
    }
    el._enterCb = null
  })

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode.data.hook || (vnode.data.hook = {}), 'insert', function () {
      var parent = el.parentNode
      var pendingNode = parent && parent._pending && parent._pending[vnode.key]
      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb()
      }
      enterHook && enterHook(el, cb)
    })
  }

  // start enter transition
  beforeEnterHook && beforeEnterHook(el)
  if (expectsCSS) {
    addTransitionClass(el, startClass)
    addTransitionClass(el, activeClass)
    nextFrame(function () {
      removeTransitionClass(el, startClass)
      if (!cb.cancelled && !userWantsControl) {
        whenTransitionEnds(el, type, cb)
      }
    })
  }

  if (vnode.data.show) {
    enterHook && enterHook(el, cb)
  }

  if (!expectsCSS && !userWantsControl) {
    cb()
  }
}

function leave (vnode, rm) {
  var el = vnode.elm

  // call enter callback now
  if (el._enterCb) {
    el._enterCb.cancelled = true
    el._enterCb()
  }

  var data = resolveTransition(vnode.data.transition)
  if (!data) {
    return rm()
  }

  /* istanbul ignore if */
  if (el._leaveCb || el.nodeType !== 1) {
    return
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;

  var expectsCSS = css !== false && !isIE9
  var userWantsControl =
    leave &&
    // leave hook may be a bound method which exposes
    // the length of original fn as _length
    (leave._length || leave.length) > 1

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null
    }
    if (expectsCSS) {
      removeTransitionClass(el, leaveActiveClass)
    }
    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass)
      }
      leaveCancelled && leaveCancelled(el)
    } else {
      rm()
      afterLeave && afterLeave(el)
    }
    el._leaveCb = null
  })

  if (delayLeave) {
    delayLeave(performLeave)
  } else {
    performLeave()
  }

  function performLeave () {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return
    }
    // record leaving element
    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode
    }
    beforeLeave && beforeLeave(el)
    if (expectsCSS) {
      addTransitionClass(el, leaveClass)
      addTransitionClass(el, leaveActiveClass)
      nextFrame(function () {
        removeTransitionClass(el, leaveClass)
        if (!cb.cancelled && !userWantsControl) {
          whenTransitionEnds(el, type, cb)
        }
      })
    }
    leave && leave(el, cb)
    if (!expectsCSS && !userWantsControl) {
      cb()
    }
  }
}

function resolveTransition (def) {
  if (!def) {
    return
  }
  /* istanbul ignore else */
  if (typeof def === 'object') {
    var res = {}
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'))
    }
    extend(res, def)
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: (name + "-enter"),
    leaveClass: (name + "-leave"),
    appearClass: (name + "-enter"),
    enterActiveClass: (name + "-enter-active"),
    leaveActiveClass: (name + "-leave-active"),
    appearActiveClass: (name + "-enter-active")
  }
})

function once (fn) {
  var called = false
  return function () {
    if (!called) {
      called = true
      fn()
    }
  }
}

var transition = inBrowser ? {
  create: function create (_, vnode) {
    if (!vnode.data.show) {
      enter(vnode)
    }
  },
  remove: function remove (vnode, rm) {
    /* istanbul ignore else */
    if (!vnode.data.show) {
      leave(vnode, rm)
    } else {
      rm()
    }
  }
} : {}

var platformModules = [
  attrs,
  klass,
  events,
  domProps,
  style,
  transition
]

/*  */

// the directive module should be applied last, after all
// built-in modules have been applied.
var modules = platformModules.concat(baseModules)

var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules })

/**
 * Not type checking this file because flow doesn't like attaching
 * properties to Elements.
 */

var modelableTagRE = /^input|select|textarea|vue-component-[0-9]+(-[0-9a-zA-Z_\-]*)?$/

/* istanbul ignore if */
if (isIE9) {
  // http://www.matts411.com/post/internet-explorer-9-oninput/
  document.addEventListener('selectionchange', function () {
    var el = document.activeElement
    if (el && el.vmodel) {
      trigger(el, 'input')
    }
  })
}

var model = {
  bind: function bind (el, binding, vnode) {
    if (process.env.NODE_ENV !== 'production') {
      if (!modelableTagRE.test(vnode.tag)) {
        warn(
          "v-model is not supported on element type: <" + (vnode.tag) + ">. " +
          'If you are working with contenteditable, it\'s recommended to ' +
          'wrap a library dedicated for that purpose inside a custom component.',
          vnode.context
        )
      }
    }
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      /* istanbul ignore if */
      if (isIE || isEdge) {
        nextTick(function () {
          setSelected(el, binding, vnode.context)
        })
      }
    } else if (vnode.tag === 'textarea' || el.type === 'text') {
      if (!isAndroid) {
        el.addEventListener('compositionstart', onCompositionStart)
        el.addEventListener('compositionend', onCompositionEnd)
      }
      /* istanbul ignore if */
      if (isIE9) {
        el.vmodel = true
      }
    }
  },
  componentUpdated: function componentUpdated (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      // in case the options rendered by v-for have changed,
      // it's possible that the value is out-of-sync with the rendered options.
      // detect such cases and filter out values that no longer has a matchig
      // option in the DOM.
      var needReset = el.multiple
        ? binding.value.some(function (v) { return hasNoMatchingOption(v, el.options); })
        : hasNoMatchingOption(binding.value, el.options)
      if (needReset) {
        trigger(el, 'change')
      }
    }
  }
}

function setSelected (el, binding, vm) {
  var value = binding.value
  var isMultiple = el.multiple
  if (isMultiple && !Array.isArray(value)) {
    process.env.NODE_ENV !== 'production' && warn(
      "<select multiple v-model=\"" + (binding.expression) + "\"> " +
      "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
      vm
    )
    return
  }
  var selected, option
  for (var i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i]
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1
      if (option.selected !== selected) {
        option.selected = selected
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i
        }
        return
      }
    }
  }
  if (!isMultiple) {
    el.selectedIndex = -1
  }
}

function hasNoMatchingOption (value, options) {
  for (var i = 0, l = options.length; i < l; i++) {
    if (looseEqual(getValue(options[i]), value)) {
      return false
    }
  }
  return true
}

function getValue (option) {
  return '_value' in option
    ? option._value
    : option.value
}

function onCompositionStart (e) {
  e.target.composing = true
}

function onCompositionEnd (e) {
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger (el, type) {
  var e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}

/*  */

// recursively search for possible transition defined inside the component root
function locateNode (vnode) {
  return vnode.child && (!vnode.data || !vnode.data.transition)
    ? locateNode(vnode.child._vnode)
    : vnode
}

var show = {
  bind: function bind (el, ref, vnode) {
    var value = ref.value;

    vnode = locateNode(vnode)
    var transition = vnode.data && vnode.data.transition
    if (value && transition && !isIE9) {
      enter(vnode)
    }
    var originalDisplay = el.style.display === 'none' ? '' : el.style.display
    el.style.display = value ? originalDisplay : 'none'
    el.__vOriginalDisplay = originalDisplay
  },
  update: function update (el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;

    /* istanbul ignore if */
    if (value === oldValue) { return }
    vnode = locateNode(vnode)
    var transition = vnode.data && vnode.data.transition
    if (transition && !isIE9) {
      if (value) {
        enter(vnode)
        el.style.display = el.__vOriginalDisplay
      } else {
        leave(vnode, function () {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none'
    }
  }
}

var platformDirectives = {
  model: model,
  show: show
}

/*  */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String
}

// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recrusively retrieve the real component to be rendered
function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData (comp) {
  var data = {}
  var options = comp.$options
  // props
  for (var key in options.propsData) {
    data[key] = comp[key]
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1].fn
  }
  return data
}

function placeholder (h, rawChild) {
  return /\d-keep-alive$/.test(rawChild.tag)
    ? h('keep-alive')
    : null
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render (h) {
    var this$1 = this;

    var children = this.$slots.default
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag; })
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      )
    }

    var mode = this.mode

    // warn invalid mode
    if (process.env.NODE_ENV !== 'production' &&
        mode && mode !== 'in-out' && mode !== 'out-in') {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      )
    }

    var rawChild = children[0]

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild)
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }

    child.key = child.key == null || child.isStatic
      ? ("__v" + (child.tag + this._uid) + "__")
      : child.key
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this)
    var oldRawChild = this._vnode
    var oldChild = getRealChild(oldRawChild)

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true
    }

    if (oldChild && oldChild.data && oldChild.key !== child.key) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data)

      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false
          this$1.$forceUpdate()
        })
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        var delayedLeave
        var performLeave = function () { delayedLeave() }
        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave
        })
      }
    }

    return rawChild
  }
}

/*  */

// Provides transition support for list items.
// supports move transitions using the FLIP technique.

// Because the vdom's children update algorithm is "unstable" - i.e.
// it doesn't guarantee the relative positioning of removed elements,
// we force transition-group to update its children into two passes:
// in the first pass, we remove all nodes that need to be removed,
// triggering their leaving transition; in the second pass, we insert/move
// into the final disired state. This way in the second pass removed
// nodes will remain where they should be.

var props = extend({
  tag: String,
  moveClass: String
}, transitionProps)

delete props.mode

var TransitionGroup = {
  props: props,

  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span'
    var map = Object.create(null)
    var prevChildren = this.prevChildren = this.children
    var rawChildren = this.$slots.default || []
    var children = this.children = []
    var transitionData = extractTransitionData(this)

    for (var i = 0; i < rawChildren.length; i++) {
      var c = rawChildren[i]
      if (c.tag) {
        if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
          children.push(c)
          map[c.key] = c
          ;(c.data || (c.data = {})).transition = transitionData
        } else if (process.env.NODE_ENV !== 'production') {
          var opts = c.componentOptions
          var name = opts
            ? (opts.Ctor.options.name || opts.tag)
            : c.tag
          warn(("<transition-group> children must be keyed: <" + name + ">"))
        }
      }
    }

    if (prevChildren) {
      var kept = []
      var removed = []
      for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
        var c$1 = prevChildren[i$1]
        c$1.data.transition = transitionData
        c$1.data.pos = c$1.elm.getBoundingClientRect()
        if (map[c$1.key]) {
          kept.push(c$1)
        } else {
          removed.push(c$1)
        }
      }
      this.kept = h(tag, null, kept)
      this.removed = removed
    }

    return h(tag, null, children)
  },

  beforeUpdate: function beforeUpdate () {
    // force removing pass
    this.__patch__(
      this._vnode,
      this.kept,
      false, // hydrating
      true // removeOnly (!important, avoids unnecessary moves)
    )
    this._vnode = this.kept
  },

  updated: function updated () {
    var children = this.prevChildren
    var moveClass = this.moveClass || (this.name + '-move')
    if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
      return
    }

    // we divide the work into three loops to avoid mixing DOM reads and writes
    // in each iteration - which helps prevent layout thrashing.
    children.forEach(callPendingCbs)
    children.forEach(recordPosition)
    children.forEach(applyTranslation)

    // force reflow to put everything in position
    var f = document.body.offsetHeight // eslint-disable-line

    children.forEach(function (c) {
      if (c.data.moved) {
        var el = c.elm
        var s = el.style
        addTransitionClass(el, moveClass)
        s.transform = s.WebkitTransform = s.transitionDuration = ''
        el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
          if (!e || /transform$/.test(e.propertyName)) {
            el.removeEventListener(transitionEndEvent, cb)
            el._moveCb = null
            removeTransitionClass(el, moveClass)
          }
        })
      }
    })
  },

  methods: {
    hasMove: function hasMove (el, moveClass) {
      /* istanbul ignore if */
      if (!hasTransition) {
        return false
      }
      if (this._hasMove != null) {
        return this._hasMove
      }
      addTransitionClass(el, moveClass)
      var info = getTransitionInfo(el)
      removeTransitionClass(el, moveClass)
      return (this._hasMove = info.hasTransform)
    }
  }
}

function callPendingCbs (c) {
  /* istanbul ignore if */
  if (c.elm._moveCb) {
    c.elm._moveCb()
  }
  /* istanbul ignore if */
  if (c.elm._enterCb) {
    c.elm._enterCb()
  }
}

function recordPosition (c) {
  c.data.newPos = c.elm.getBoundingClientRect()
}

function applyTranslation (c) {
  var oldPos = c.data.pos
  var newPos = c.data.newPos
  var dx = oldPos.left - newPos.left
  var dy = oldPos.top - newPos.top
  if (dx || dy) {
    c.data.moved = true
    var s = c.elm.style
    s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)"
    s.transitionDuration = '0s'
  }
}

var platformComponents = {
  Transition: Transition,
  TransitionGroup: TransitionGroup
}

/*  */

// install platform specific utils
Vue.config.isUnknownElement = isUnknownElement
Vue.config.isReservedTag = isReservedTag
Vue.config.getTagNamespace = getTagNamespace
Vue.config.mustUseProp = mustUseProp

// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// install platform patch function
Vue.prototype.__patch__ = config._isServer ? noop : patch

// wrap mount
Vue.prototype.$mount = function (
  el,
  hydrating
) {
  el = el && !config._isServer ? query(el) : undefined
  return this._mount(el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
setTimeout(function () {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue)
    } else if (
      process.env.NODE_ENV !== 'production' &&
      inBrowser && /Chrome\/\d+/.test(window.navigator.userAgent)
    ) {
      console.log(
        'Download the Vue Devtools for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      )
    }
  }
}, 0)

module.exports = Vue;
}).call(this,require('_process'))
},{"_process":2}],4:[function(require,module,exports){
var css = "@import url(\"https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic&subset=latin\");\n/*\n * # Semantic UI - 2.2.4\n * https://github.com/Semantic-Org/Semantic-UI\n * http://www.semantic-ui.com/\n *\n * Copyright 2014 Contributors\n * Released under the MIT license\n * http://opensource.org/licenses/MIT\n *\n */\n*,\n:after,\n:before {\n  box-sizing: inherit;\n}\nhtml {\n  box-sizing: border-box;\n  font-family: sans-serif;\n  -ms-text-size-adjust: 100%;\n  -webkit-text-size-adjust: 100%;\n}\ninput[type=text],\ninput[type=email],\ninput[type=search],\ninput[type=password] {\n  -webkit-appearance: none;\n  -moz-appearance: none;\n}\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nnav,\nsection,\nsummary {\n  display: block;\n}\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline;\n}\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n[hidden],\ntemplate {\n  display: none;\n}\na {\n  background: 0 0;\n  color: #4183C4;\n  text-decoration: none;\n}\na:active,\na:hover {\n  outline: 0;\n}\nabbr[title] {\n  border-bottom: 1px dotted;\n}\nb,\noptgroup,\nstrong {\n  font-weight: 700;\n}\ndfn {\n  font-style: italic;\n}\nmark {\n  background: #ff0;\n  color: #000;\n}\nsmall {\n  font-size: 80%;\n}\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\nsup {\n  top: -.5em;\n}\nsub {\n  bottom: -.25em;\n}\nimg {\n  border: 0;\n}\nsvg:not(:root) {\n  overflow: hidden;\n}\nfigure {\n  margin: 1em 40px;\n}\nhr {\n  height: 0;\n}\npre,\ntextarea {\n  overflow: auto;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace,monospace;\n  font-size: 1em;\n}\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  color: inherit;\n  font: inherit;\n  margin: 0;\n}\nbutton {\n  overflow: visible;\n}\nbutton,\nselect {\n  text-transform: none;\n}\nbutton,\nhtml input[type=button],\ninput[type=reset],\ninput[type=submit] {\n  -webkit-appearance: button;\n  cursor: pointer;\n}\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default;\n}\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  border: 0;\n  padding: 0;\n}\ninput {\n  line-height: normal;\n}\ninput[type=checkbox],\ninput[type=radio] {\n  box-sizing: border-box;\n  padding: 0;\n}\ninput[type=number]::-webkit-inner-spin-button,\ninput[type=number]::-webkit-outer-spin-button {\n  height: auto;\n}\ninput[type=search] {\n  -webkit-appearance: textfield;\n}\ninput[type=search]::-webkit-search-cancel-button,\ninput[type=search]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\nfieldset {\n  border: 1px solid silver;\n  margin: 0 2px;\n  padding: .35em .625em .75em;\n}\nlegend {\n  border: 0;\n  padding: 0;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\ntd,\nth {\n  padding: 0;\n}\nbody,\nhtml {\n  height: 100%;\n}\nhtml {\n  font-size: 14px;\n}\nbody {\n  margin: 0;\n  padding: 0;\n  overflow-x: hidden;\n  min-width: 320px;\n  background: #FFF;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 14px;\n  line-height: 1.4285em;\n  color: rgba(0,0,0,.87);\n  font-smoothing: antialiased;\n}\nh1,\nh2,\nh3,\nh4,\nh5 {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  line-height: 1.2857em;\n  margin: calc(2rem - .14285em) 0 1rem;\n  font-weight: 700;\n  padding: 0;\n}\nh1 {\n  min-height: 1rem;\n  font-size: 2rem;\n}\nh2 {\n  font-size: 1.714rem;\n}\nh3 {\n  font-size: 1.28rem;\n}\nh4 {\n  font-size: 1.071rem;\n}\nh5 {\n  font-size: 1rem;\n}\nh1:first-child,\nh2:first-child,\nh3:first-child,\nh4:first-child,\nh5:first-child,\np:first-child {\n  margin-top: 0;\n}\nh1:last-child,\nh2:last-child,\nh3:last-child,\nh4:last-child,\nh5:last-child,\np:last-child {\n  margin-bottom: 0;\n}\np {\n  margin: 0 0 1em;\n  line-height: 1.4285em;\n}\na:hover {\n  color: #1e70bf;\n  text-decoration: none;\n}\n::-webkit-selection {\n  background-color: #CCE2FF;\n  color: rgba(0,0,0,.87);\n}\n::-moz-selection {\n  background-color: #CCE2FF;\n  color: rgba(0,0,0,.87);\n}\n::selection {\n  background-color: #CCE2FF;\n  color: rgba(0,0,0,.87);\n}\ninput::-webkit-selection,\ntextarea::-webkit-selection {\n  background-color: rgba(100,100,100,.4);\n  color: rgba(0,0,0,.87);\n}\ninput::-moz-selection,\ntextarea::-moz-selection {\n  background-color: rgba(100,100,100,.4);\n  color: rgba(0,0,0,.87);\n}\ninput::selection,\ntextarea::selection {\n  background-color: rgba(100,100,100,.4);\n  color: rgba(0,0,0,.87);\n}\n.ui.button {\n  cursor: pointer;\n  display: inline-block;\n  min-height: 1em;\n  outline: 0;\n  border: none;\n  vertical-align: baseline;\n  background: #E0E1E2;\n  color: rgba(0,0,0,.6);\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  margin: 0 .25em 0 0;\n  padding: .78571429em 1.5em;\n  text-transform: none;\n  text-shadow: none;\n  font-weight: 700;\n  line-height: 1em;\n  font-style: normal;\n  text-align: center;\n  text-decoration: none;\n  border-radius: .28571429rem;\n  box-shadow: 0 0 0 1px transparent inset,0 0 0 0 rgba(34,36,38,.15) inset;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease;\n  transition: opacity .1s ease,background-color .1s ease,color .1s ease,box-shadow .1s ease,background .1s ease;\n  will-change: '';\n  -webkit-tap-highlight-color: transparent;\n}\n.ui.button:hover {\n  background-color: #CACBCD;\n  background-image: none;\n  box-shadow: 0 0 0 1px transparent inset,0 0 0 0 rgba(34,36,38,.15) inset;\n  color: rgba(0,0,0,.8);\n}\n.ui.button:hover .icon {\n  opacity: .85;\n}\n.ui.button:focus {\n  background-color: #CACBCD;\n  color: rgba(0,0,0,.8);\n  background-image: ''!important;\n  box-shadow: ''!important;\n}\n.ui.button:focus .icon {\n  opacity: .85;\n}\n.ui.active.button:active,\n.ui.button:active {\n  background-color: #BABBBC;\n  background-image: '';\n  color: rgba(0,0,0,.9);\n  box-shadow: 0 0 0 1px transparent inset,none;\n}\n.ui.active.button {\n  background-color: #C0C1C2;\n  background-image: none;\n  box-shadow: 0 0 0 1px transparent inset;\n  color: rgba(0,0,0,.95);\n}\n.ui.active.button:hover {\n  background-color: #C0C1C2;\n  background-image: none;\n  color: rgba(0,0,0,.95);\n}\n.ui.active.button:active {\n  background-color: #C0C1C2;\n  background-image: none;\n}\n.ui.loading.loading.loading.loading.loading.loading.button {\n  position: relative;\n  cursor: default;\n  text-shadow: none!important;\n  color: transparent!important;\n  opacity: 1;\n  pointer-events: auto;\n  -webkit-transition: all 0s linear,opacity .1s ease;\n  transition: all 0s linear,opacity .1s ease;\n}\n.ui.loading.button:before {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.15);\n}\n.ui.loading.button:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  -webkit-animation: button-spin .6s linear;\n  animation: button-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #FFF transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n}\n.ui.labeled.icon.loading.button .icon {\n  background-color: transparent;\n  box-shadow: none;\n}\n@-webkit-keyframes button-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes button-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n.ui.basic.loading.button:not(.inverted):before {\n  border-color: rgba(0,0,0,.1);\n}\n.ui.basic.loading.button:not(.inverted):after {\n  border-top-color: #767676;\n}\n.ui.button:disabled,\n.ui.buttons .disabled.button,\n.ui.disabled.active.button,\n.ui.disabled.button,\n.ui.disabled.button:hover {\n  cursor: default;\n  opacity: .45!important;\n  background-image: none!important;\n  box-shadow: none!important;\n  pointer-events: none!important;\n}\n.ui.basic.buttons .ui.disabled.button {\n  border-color: rgba(34,36,38,.5);\n}\n.ui.animated.button {\n  position: relative;\n  overflow: hidden;\n  padding-right: 0!important;\n  vertical-align: middle;\n  z-index: 1;\n}\n.ui.animated.button .content {\n  will-change: transform,opacity;\n}\n.ui.animated.button .visible.content {\n  position: relative;\n  margin-right: 1.5em;\n  left: auto;\n  right: 0;\n}\n.ui.animated.button .hidden.content {\n  position: absolute;\n  width: 100%;\n  top: 50%;\n  left: auto;\n  right: -100%;\n  margin-top: -.5em;\n}\n.ui.animated.button .hidden.content,\n.ui.animated.button .visible.content {\n  -webkit-transition: right .3s ease 0s;\n  transition: right .3s ease 0s;\n}\n.ui.animated.button:focus .visible.content,\n.ui.animated.button:hover .visible.content {\n  left: auto;\n  right: 200%;\n}\n.ui.animated.button:focus .hidden.content,\n.ui.animated.button:hover .hidden.content {\n  left: auto;\n  right: 0;\n}\n.ui.vertical.animated.button .hidden.content,\n.ui.vertical.animated.button .visible.content {\n  -webkit-transition: top .3s ease,-webkit-transform .3s ease;\n  transition: top .3s ease,-webkit-transform .3s ease;\n  transition: top .3s ease,transform .3s ease;\n  transition: top .3s ease,transform .3s ease,-webkit-transform .3s ease;\n}\n.ui.vertical.animated.button .visible.content {\n  -webkit-transform: translateY(0);\n  -ms-transform: translateY(0);\n  transform: translateY(0);\n  right: auto;\n}\n.ui.vertical.animated.button .hidden.content {\n  top: -50%;\n  left: 0;\n  right: auto;\n}\n.ui.vertical.animated.button:focus .visible.content,\n.ui.vertical.animated.button:hover .visible.content {\n  -webkit-transform: translateY(200%);\n  -ms-transform: translateY(200%);\n  transform: translateY(200%);\n  right: auto;\n}\n.ui.vertical.animated.button:focus .hidden.content,\n.ui.vertical.animated.button:hover .hidden.content {\n  top: 50%;\n  right: auto;\n}\n.ui.fade.animated.button .hidden.content,\n.ui.fade.animated.button .visible.content {\n  -webkit-transition: opacity .3s ease,-webkit-transform .3s ease;\n  transition: opacity .3s ease,-webkit-transform .3s ease;\n  transition: opacity .3s ease,transform .3s ease;\n  transition: opacity .3s ease,transform .3s ease,-webkit-transform .3s ease;\n}\n.ui.fade.animated.button .visible.content {\n  left: auto;\n  right: auto;\n  opacity: 1;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n}\n.ui.fade.animated.button .hidden.content {\n  opacity: 0;\n  left: 0;\n  right: auto;\n  -webkit-transform: scale(1.5);\n  -ms-transform: scale(1.5);\n  transform: scale(1.5);\n}\n.ui.fade.animated.button:focus .visible.content,\n.ui.fade.animated.button:hover .visible.content {\n  left: auto;\n  right: auto;\n  opacity: 0;\n  -webkit-transform: scale(.75);\n  -ms-transform: scale(.75);\n  transform: scale(.75);\n}\n.ui.fade.animated.button:focus .hidden.content,\n.ui.fade.animated.button:hover .hidden.content {\n  left: 0;\n  right: auto;\n  opacity: 1;\n  -webkit-transform: scale(1);\n  -ms-transform: scale(1);\n  transform: scale(1);\n}\n.ui.inverted.button {\n  box-shadow: 0 0 0 2px #FFF inset!important;\n  background: 0 0;\n  color: #FFF;\n  text-shadow: none!important;\n}\n.ui.inverted.buttons .button {\n  margin: 0 0 0 -2px;\n}\n.ui.inverted.buttons .button:first-child {\n  margin-left: 0;\n}\n.ui.inverted.vertical.buttons .button {\n  margin: 0 0 -2px;\n}\n.ui.inverted.vertical.buttons .button:first-child {\n  margin-top: 0;\n}\n.ui.inverted.button.active,\n.ui.inverted.button:focus,\n.ui.inverted.button:hover {\n  background: #FFF;\n  box-shadow: 0 0 0 2px #FFF inset!important;\n  color: rgba(0,0,0,.8);\n}\n.ui.inverted.button.active:focus {\n  background: #DCDDDE;\n  box-shadow: 0 0 0 2px #DCDDDE inset!important;\n  color: rgba(0,0,0,.8);\n}\n.ui.labeled.button:not(.icon) {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  background: 0 0!important;\n  padding: 0!important;\n  border: none!important;\n  box-shadow: none!important;\n}\n.ui.labeled.button>.button {\n  margin: 0;\n}\n.ui.labeled.button>.label {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n  margin: 0 0 0 -1px!important;\n  padding: '';\n  font-size: 1em;\n  border-color: rgba(34,36,38,.15);\n}\n.ui.labeled.button>.tag.label:before {\n  width: 1.85em;\n  height: 1.85em;\n}\n.ui.labeled.button:not([class*=\"left labeled\"])>.button {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.labeled.button:not([class*=\"left labeled\"])>.label,\n.ui[class*=\"left labeled\"].button>.button {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.ui[class*=\"left labeled\"].button>.label {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.facebook.button {\n  background-color: #3B5998;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.facebook.button:hover {\n  background-color: #304d8a;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.facebook.button:active {\n  background-color: #2d4373;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.twitter.button {\n  background-color: #55ACEE;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.twitter.button:hover {\n  background-color: #35a2f4;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.twitter.button:active {\n  background-color: #2795e9;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.google.plus.button {\n  background-color: #DD4B39;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.google.plus.button:hover {\n  background-color: #e0321c;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.google.plus.button:active {\n  background-color: #c23321;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.linkedin.button {\n  background-color: #1F88BE;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.linkedin.button:hover {\n  background-color: #147baf;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.linkedin.button:active {\n  background-color: #186992;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.youtube.button {\n  background-color: #CC181E;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.youtube.button:hover {\n  background-color: #bd0d13;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.youtube.button:active {\n  background-color: #9e1317;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.instagram.button {\n  background-color: #49769C;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.instagram.button:hover {\n  background-color: #3d698e;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.instagram.button:active {\n  background-color: #395c79;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.pinterest.button {\n  background-color: #BD081C;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.pinterest.button:hover {\n  background-color: #ac0013;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.pinterest.button:active {\n  background-color: #8c0615;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.vk.button {\n  background-color: #4D7198;\n  color: #FFF;\n  background-image: none;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.vk.button:hover {\n  background-color: #41648a;\n  color: #FFF;\n}\n.ui.vk.button:active {\n  background-color: #3c5876;\n  color: #FFF;\n}\n.ui.button>.icon:not(.button) {\n  height: .85714286em;\n  opacity: .8;\n  margin: 0 .42857143em 0 -.21428571em;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n  vertical-align: '';\n  color: '';\n}\n.ui.button:not(.icon)>.icon:not(.button):not(.dropdown) {\n  margin: 0 .42857143em 0 -.21428571em;\n}\n.ui.button:not(.icon)>.right.icon:not(.button):not(.dropdown) {\n  margin: 0 -.21428571em 0 .42857143em;\n}\n.ui[class*=\"left floated\"].button,\n.ui[class*=\"left floated\"].buttons {\n  float: left;\n  margin-left: 0;\n  margin-right: .25em;\n}\n.ui[class*=\"right floated\"].button,\n.ui[class*=\"right floated\"].buttons {\n  float: right;\n  margin-right: 0;\n  margin-left: .25em;\n}\n.ui.compact.button,\n.ui.compact.buttons .button {\n  padding: .58928571em 1.125em;\n}\n.ui.compact.icon.button,\n.ui.compact.icon.buttons .button {\n  padding: .58928571em;\n}\n.ui.compact.labeled.icon.button,\n.ui.compact.labeled.icon.buttons .button {\n  padding: .58928571em 3.69642857em;\n}\n.ui.mini.button,\n.ui.mini.buttons .button,\n.ui.mini.buttons .or {\n  font-size: .78571429rem;\n}\n.ui.tiny.button,\n.ui.tiny.buttons .button,\n.ui.tiny.buttons .or {\n  font-size: .85714286rem;\n}\n.ui.small.button,\n.ui.small.buttons .button,\n.ui.small.buttons .or {\n  font-size: .92857143rem;\n}\n.ui.button,\n.ui.buttons .button,\n.ui.buttons .or {\n  font-size: 1rem;\n}\n.ui.large.button,\n.ui.large.buttons .button,\n.ui.large.buttons .or {\n  font-size: 1.14285714rem;\n}\n.ui.big.button,\n.ui.big.buttons .button,\n.ui.big.buttons .or {\n  font-size: 1.28571429rem;\n}\n.ui.huge.button,\n.ui.huge.buttons .button,\n.ui.huge.buttons .or {\n  font-size: 1.42857143rem;\n}\n.ui.massive.button,\n.ui.massive.buttons .button,\n.ui.massive.buttons .or {\n  font-size: 1.71428571rem;\n}\n.ui.icon.button,\n.ui.icon.buttons .button {\n  padding: .78571429em;\n}\n.ui.icon.button>.icon,\n.ui.icon.buttons .button>.icon {\n  opacity: .9;\n  margin: 0;\n  vertical-align: top;\n}\n.ui.basic.button,\n.ui.basic.buttons .button {\n  background: 0 0!important;\n  color: rgba(0,0,0,.6)!important;\n  font-weight: 400;\n  border-radius: .28571429rem;\n  text-transform: none;\n  text-shadow: none!important;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset;\n}\n.ui.basic.buttons {\n  box-shadow: none;\n  border: 1px solid rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n}\n.ui.basic.button:focus,\n.ui.basic.button:hover,\n.ui.basic.buttons .button:focus,\n.ui.basic.buttons .button:hover {\n  background: #FFF!important;\n  color: rgba(0,0,0,.8)!important;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.35) inset,0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.basic.button:active,\n.ui.basic.buttons .button:active {\n  background: #F8F8F8!important;\n  color: rgba(0,0,0,.9)!important;\n  box-shadow: 0 0 0 1px rgba(0,0,0,.15) inset,0 1px 4px 0 rgba(34,36,38,.15) inset;\n}\n.ui.basic.active.button,\n.ui.basic.buttons .active.button {\n  background: rgba(0,0,0,.05)!important;\n  box-shadow: ''!important;\n  color: rgba(0,0,0,.95);\n}\n.ui.basic.active.button:hover,\n.ui.basic.buttons .active.button:hover {\n  background-color: rgba(0,0,0,.05);\n}\n.ui.basic.buttons .button:hover {\n  box-shadow: 0 0 0 1px rgba(34,36,38,.35) inset,0 0 0 0 rgba(34,36,38,.15) inset inset;\n}\n.ui.basic.buttons .button:active {\n  box-shadow: 0 0 0 1px rgba(0,0,0,.15) inset,0 1px 4px 0 rgba(34,36,38,.15) inset inset;\n}\n.ui.basic.buttons .active.button {\n  box-shadow: rgba(34,36,38,.35) inset;\n}\n.ui.basic.inverted.button,\n.ui.basic.inverted.buttons .button {\n  background-color: transparent!important;\n  color: #F9FAFB!important;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n}\n.ui.basic.inverted.button:focus,\n.ui.basic.inverted.button:hover,\n.ui.basic.inverted.buttons .button:focus,\n.ui.basic.inverted.buttons .button:hover {\n  color: #FFF!important;\n  box-shadow: 0 0 0 2px #fff inset!important;\n}\n.ui.basic.inverted.button:active,\n.ui.basic.inverted.buttons .button:active {\n  background-color: rgba(255,255,255,.08)!important;\n  color: #FFF!important;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.9) inset!important;\n}\n.ui.basic.inverted.active.button,\n.ui.basic.inverted.buttons .active.button {\n  background-color: rgba(255,255,255,.08);\n  color: #FFF;\n  text-shadow: none;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.7) inset;\n}\n.ui.basic.inverted.active.button:hover,\n.ui.basic.inverted.buttons .active.button:hover {\n  background-color: rgba(255,255,255,.15);\n  box-shadow: 0 0 0 2px #fff inset!important;\n}\n.ui.basic.buttons .button {\n  border-radius: 0;\n  border-left: 1px solid rgba(34,36,38,.15);\n  box-shadow: none;\n}\n.ui.basic.vertical.buttons .button {\n  border-left: none;\n  border-left-width: 0;\n  border-top: 1px solid rgba(34,36,38,.15);\n}\n.ui.basic.vertical.buttons .button:first-child {\n  border-top-width: 0;\n}\n.ui.labeled.icon.button,\n.ui.labeled.icon.buttons .button {\n  position: relative;\n  padding-left: 4.07142857em!important;\n  padding-right: 1.5em!important;\n}\n.ui.labeled.icon.button>.icon,\n.ui.labeled.icon.buttons>.button>.icon {\n  position: absolute;\n  height: 100%;\n  line-height: 1;\n  border-radius: 0;\n  border-top-left-radius: inherit;\n  border-bottom-left-radius: inherit;\n  text-align: center;\n  margin: 0;\n  width: 2.57142857em;\n  background-color: rgba(0,0,0,.05);\n  color: '';\n  box-shadow: -1px 0 0 0 transparent inset;\n  top: 0;\n  left: 0;\n}\n.ui[class*=\"right labeled\"].icon.button {\n  padding-right: 4.07142857em!important;\n  padding-left: 1.5em!important;\n}\n.ui[class*=\"right labeled\"].icon.button>.icon {\n  left: auto;\n  right: 0;\n  border-radius: 0;\n  border-top-right-radius: inherit;\n  border-bottom-right-radius: inherit;\n  box-shadow: 1px 0 0 0 transparent inset;\n}\n.ui.labeled.icon.button>.icon:after,\n.ui.labeled.icon.button>.icon:before,\n.ui.labeled.icon.buttons>.button>.icon:after,\n.ui.labeled.icon.buttons>.button>.icon:before {\n  display: block;\n  position: absolute;\n  width: 100%;\n  top: 50%;\n  text-align: center;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n.ui.labeled.icon.buttons .button>.icon {\n  border-radius: 0;\n}\n.ui.labeled.icon.buttons .button:first-child>.icon {\n  border-top-left-radius: .28571429rem;\n  border-bottom-left-radius: .28571429rem;\n}\n.ui.labeled.icon.buttons .button:last-child>.icon {\n  border-top-right-radius: .28571429rem;\n  border-bottom-right-radius: .28571429rem;\n}\n.ui.vertical.labeled.icon.buttons .button:first-child>.icon {\n  border-radius: .28571429rem 0 0;\n}\n.ui.vertical.labeled.icon.buttons .button:last-child>.icon {\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui.fluid[class*=\"left labeled\"].icon.button,\n.ui.fluid[class*=\"right labeled\"].icon.button {\n  padding-left: 1.5em!important;\n  padding-right: 1.5em!important;\n}\n.ui.button.toggle.active,\n.ui.buttons .button.toggle.active,\n.ui.toggle.buttons .active.button {\n  background-color: #21BA45!important;\n  box-shadow: none!important;\n  text-shadow: none;\n  color: #FFF!important;\n}\n.ui.button.toggle.active:hover {\n  background-color: #16ab39!important;\n  text-shadow: none;\n  color: #FFF!important;\n}\n.ui.circular.button {\n  border-radius: 10em;\n}\n.ui.circular.button>.icon {\n  width: 1em;\n  vertical-align: baseline;\n}\n.ui.buttons .or {\n  position: relative;\n  width: .3em;\n  height: 2.57142857em;\n  z-index: 3;\n}\n.ui.buttons .or:before {\n  position: absolute;\n  text-align: center;\n  border-radius: 500rem;\n  content: 'or';\n  top: 50%;\n  left: 50%;\n  background-color: #FFF;\n  text-shadow: none;\n  margin-top: -.89285714em;\n  margin-left: -.89285714em;\n  width: 1.78571429em;\n  height: 1.78571429em;\n  line-height: 1.78571429em;\n  color: rgba(0,0,0,.4);\n  font-style: normal;\n  font-weight: 700;\n  box-shadow: 0 0 0 1px transparent inset;\n}\n.ui.buttons .or[data-text]:before {\n  content: attr(data-text);\n}\n.ui.fluid.buttons .or {\n  width: 0!important;\n}\n.ui.fluid.buttons .or:after {\n  display: none;\n}\n.ui.attached.button {\n  position: relative;\n  display: block;\n  margin: 0;\n  border-radius: 0;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.15)!important;\n}\n.ui.attached.top.button {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.attached.bottom.button {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.left.attached.button {\n  display: inline-block;\n  border-left: none;\n  text-align: right;\n  padding-right: .75em;\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui.right.attached.button {\n  display: inline-block;\n  text-align: left;\n  padding-left: .75em;\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui.attached.buttons {\n  position: relative;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  border-radius: 0;\n  width: auto!important;\n  z-index: 2;\n  margin-left: -1px;\n  margin-right: -1px;\n}\n.ui.attached.buttons .button {\n  margin: 0;\n}\n.ui.attached.buttons .button:first-child,\n.ui.attached.buttons .button:last-child {\n  border-radius: 0;\n}\n.ui[class*=\"top attached\"].buttons {\n  margin-bottom: -1px;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui[class*=\"top attached\"].buttons .button:first-child {\n  border-radius: .28571429rem 0 0;\n}\n.ui[class*=\"top attached\"].buttons .button:last-child {\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui[class*=\"bottom attached\"].buttons {\n  margin-top: -1px;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui[class*=\"bottom attached\"].buttons .button:first-child {\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui[class*=\"bottom attached\"].buttons .button:last-child {\n  border-radius: 0 0 .28571429rem;\n}\n.ui[class*=\"left attached\"].buttons {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  margin-right: 0;\n  margin-left: -1px;\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui[class*=\"left attached\"].buttons .button:first-child {\n  margin-left: -1px;\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui[class*=\"left attached\"].buttons .button:last-child {\n  margin-left: -1px;\n  border-radius: 0 0 .28571429rem;\n}\n.ui[class*=\"right attached\"].buttons {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  margin-left: 0;\n  margin-right: -1px;\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui[class*=\"right attached\"].buttons .button:first-child {\n  margin-left: -1px;\n  border-radius: .28571429rem 0 0;\n}\n.ui[class*=\"right attached\"].buttons .button:last-child {\n  margin-left: -1px;\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui.fluid.button,\n.ui.fluid.buttons {\n  width: 100%;\n}\n.ui.fluid.button {\n  display: block;\n}\n.ui.two.buttons {\n  width: 100%;\n}\n.ui.two.buttons>.button {\n  width: 50%;\n}\n.ui.three.buttons {\n  width: 100%;\n}\n.ui.three.buttons>.button {\n  width: 33.333%;\n}\n.ui.four.buttons {\n  width: 100%;\n}\n.ui.four.buttons>.button {\n  width: 25%;\n}\n.ui.five.buttons {\n  width: 100%;\n}\n.ui.five.buttons>.button {\n  width: 20%;\n}\n.ui.six.buttons {\n  width: 100%;\n}\n.ui.six.buttons>.button {\n  width: 16.666%;\n}\n.ui.seven.buttons {\n  width: 100%;\n}\n.ui.seven.buttons>.button {\n  width: 14.285%;\n}\n.ui.eight.buttons {\n  width: 100%;\n}\n.ui.eight.buttons>.button {\n  width: 12.5%;\n}\n.ui.nine.buttons {\n  width: 100%;\n}\n.ui.nine.buttons>.button {\n  width: 11.11%;\n}\n.ui.ten.buttons {\n  width: 100%;\n}\n.ui.ten.buttons>.button {\n  width: 10%;\n}\n.ui.eleven.buttons {\n  width: 100%;\n}\n.ui.eleven.buttons>.button {\n  width: 9.09%;\n}\n.ui.twelve.buttons {\n  width: 100%;\n}\n.ui.twelve.buttons>.button {\n  width: 8.3333%;\n}\n.ui.fluid.vertical.buttons,\n.ui.fluid.vertical.buttons>.button {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  width: auto;\n}\n.ui.two.vertical.buttons>.button {\n  height: 50%;\n}\n.ui.three.vertical.buttons>.button {\n  height: 33.333%;\n}\n.ui.four.vertical.buttons>.button {\n  height: 25%;\n}\n.ui.five.vertical.buttons>.button {\n  height: 20%;\n}\n.ui.six.vertical.buttons>.button {\n  height: 16.666%;\n}\n.ui.seven.vertical.buttons>.button {\n  height: 14.285%;\n}\n.ui.eight.vertical.buttons>.button {\n  height: 12.5%;\n}\n.ui.nine.vertical.buttons>.button {\n  height: 11.11%;\n}\n.ui.ten.vertical.buttons>.button {\n  height: 10%;\n}\n.ui.eleven.vertical.buttons>.button {\n  height: 9.09%;\n}\n.ui.twelve.vertical.buttons>.button {\n  height: 8.3333%;\n}\n.ui.black.button,\n.ui.black.buttons .button {\n  background-color: #1B1C1D;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.black.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.black.button:hover,\n.ui.black.buttons .button:hover {\n  background-color: #27292a;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.black.button:focus,\n.ui.black.buttons .button:focus {\n  background-color: #2f3032;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.black.button:active,\n.ui.black.buttons .button:active {\n  background-color: #343637;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.black.active.button,\n.ui.black.button .active.button:active,\n.ui.black.buttons .active.button,\n.ui.black.buttons .active.button:active {\n  background-color: #0f0f10;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.black.button,\n.ui.basic.black.buttons .button {\n  box-shadow: 0 0 0 1px #1B1C1D inset!important;\n  color: #1B1C1D!important;\n}\n.ui.basic.black.button:hover,\n.ui.basic.black.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #27292a inset!important;\n  color: #27292a!important;\n}\n.ui.basic.black.button:focus,\n.ui.basic.black.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #2f3032 inset!important;\n  color: #27292a!important;\n}\n.ui.basic.black.active.button,\n.ui.basic.black.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #0f0f10 inset!important;\n  color: #343637!important;\n}\n.ui.basic.black.button:active,\n.ui.basic.black.buttons .button:active {\n  box-shadow: 0 0 0 1px #343637 inset!important;\n  color: #343637!important;\n}\n.ui.buttons:not(.vertical)>.basic.black.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.black.button,\n.ui.inverted.black.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #D4D4D5 inset!important;\n  color: #FFF;\n}\n.ui.inverted.black.button.active,\n.ui.inverted.black.button:active,\n.ui.inverted.black.button:focus,\n.ui.inverted.black.button:hover,\n.ui.inverted.black.buttons .button.active,\n.ui.inverted.black.buttons .button:active,\n.ui.inverted.black.buttons .button:focus,\n.ui.inverted.black.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.black.active.button,\n.ui.inverted.black.button:active,\n.ui.inverted.black.button:focus,\n.ui.inverted.black.button:hover,\n.ui.inverted.black.buttons .active.button,\n.ui.inverted.black.buttons .button:active,\n.ui.inverted.black.buttons .button:focus,\n.ui.inverted.black.buttons .button:hover {\n  background-color: #000;\n}\n.ui.inverted.black.basic.button,\n.ui.inverted.black.basic.buttons .button,\n.ui.inverted.black.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.black.basic.button:hover,\n.ui.inverted.black.basic.buttons .button:hover,\n.ui.inverted.black.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #000 inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.black.basic.button:focus,\n.ui.inverted.black.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #000 inset!important;\n  color: #545454!important;\n}\n.ui.inverted.black.basic.active.button,\n.ui.inverted.black.basic.button:active,\n.ui.inverted.black.basic.buttons .active.button,\n.ui.inverted.black.basic.buttons .button:active,\n.ui.inverted.black.buttons .basic.active.button,\n.ui.inverted.black.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #000 inset!important;\n  color: #FFF!important;\n}\n.ui.grey.button,\n.ui.grey.buttons .button {\n  background-color: #767676;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.grey.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.grey.button:hover,\n.ui.grey.buttons .button:hover {\n  background-color: #838383;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.grey.button:focus,\n.ui.grey.buttons .button:focus {\n  background-color: #8a8a8a;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.grey.button:active,\n.ui.grey.buttons .button:active {\n  background-color: #909090;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.grey.active.button,\n.ui.grey.button .active.button:active,\n.ui.grey.buttons .active.button,\n.ui.grey.buttons .active.button:active {\n  background-color: #696969;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.grey.button,\n.ui.basic.grey.buttons .button {\n  box-shadow: 0 0 0 1px #767676 inset!important;\n  color: #767676!important;\n}\n.ui.basic.grey.button:hover,\n.ui.basic.grey.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #838383 inset!important;\n  color: #838383!important;\n}\n.ui.basic.grey.button:focus,\n.ui.basic.grey.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #8a8a8a inset!important;\n  color: #838383!important;\n}\n.ui.basic.grey.active.button,\n.ui.basic.grey.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #696969 inset!important;\n  color: #909090!important;\n}\n.ui.basic.grey.button:active,\n.ui.basic.grey.buttons .button:active {\n  box-shadow: 0 0 0 1px #909090 inset!important;\n  color: #909090!important;\n}\n.ui.buttons:not(.vertical)>.basic.grey.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.grey.button,\n.ui.inverted.grey.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #D4D4D5 inset!important;\n  color: #FFF;\n}\n.ui.inverted.grey.button.active,\n.ui.inverted.grey.button:active,\n.ui.inverted.grey.button:focus,\n.ui.inverted.grey.button:hover,\n.ui.inverted.grey.buttons .button.active,\n.ui.inverted.grey.buttons .button:active,\n.ui.inverted.grey.buttons .button:focus,\n.ui.inverted.grey.buttons .button:hover {\n  box-shadow: none!important;\n  color: rgba(0,0,0,.6);\n}\n.ui.inverted.grey.button:hover,\n.ui.inverted.grey.buttons .button:hover {\n  background-color: #cfd0d2;\n}\n.ui.inverted.grey.button:focus,\n.ui.inverted.grey.buttons .button:focus {\n  background-color: #c7c9cb;\n}\n.ui.inverted.grey.active.button,\n.ui.inverted.grey.buttons .active.button {\n  background-color: #cfd0d2;\n}\n.ui.inverted.grey.button:active,\n.ui.inverted.grey.buttons .button:active {\n  background-color: #c2c4c5;\n}\n.ui.inverted.grey.basic.button,\n.ui.inverted.grey.basic.buttons .button,\n.ui.inverted.grey.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.grey.basic.button:hover,\n.ui.inverted.grey.basic.buttons .button:hover,\n.ui.inverted.grey.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #cfd0d2 inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.grey.basic.button:focus,\n.ui.inverted.grey.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #c7c9cb inset!important;\n  color: #DCDDDE!important;\n}\n.ui.inverted.grey.basic.active.button,\n.ui.inverted.grey.basic.buttons .active.button,\n.ui.inverted.grey.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #cfd0d2 inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.grey.basic.button:active,\n.ui.inverted.grey.basic.buttons .button:active,\n.ui.inverted.grey.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #c2c4c5 inset!important;\n  color: #FFF!important;\n}\n.ui.brown.button,\n.ui.brown.buttons .button {\n  background-color: #A5673F;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.brown.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.brown.button:hover,\n.ui.brown.buttons .button:hover {\n  background-color: #975b33;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.brown.button:focus,\n.ui.brown.buttons .button:focus {\n  background-color: #90532b;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.brown.button:active,\n.ui.brown.buttons .button:active {\n  background-color: #805031;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.brown.active.button,\n.ui.brown.button .active.button:active,\n.ui.brown.buttons .active.button,\n.ui.brown.buttons .active.button:active {\n  background-color: #995a31;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.brown.button,\n.ui.basic.brown.buttons .button {\n  box-shadow: 0 0 0 1px #A5673F inset!important;\n  color: #A5673F!important;\n}\n.ui.basic.brown.button:hover,\n.ui.basic.brown.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #975b33 inset!important;\n  color: #975b33!important;\n}\n.ui.basic.brown.button:focus,\n.ui.basic.brown.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #90532b inset!important;\n  color: #975b33!important;\n}\n.ui.basic.brown.active.button,\n.ui.basic.brown.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #995a31 inset!important;\n  color: #805031!important;\n}\n.ui.basic.brown.button:active,\n.ui.basic.brown.buttons .button:active {\n  box-shadow: 0 0 0 1px #805031 inset!important;\n  color: #805031!important;\n}\n.ui.buttons:not(.vertical)>.basic.brown.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.brown.button,\n.ui.inverted.brown.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #D67C1C inset!important;\n  color: #D67C1C;\n}\n.ui.inverted.brown.button.active,\n.ui.inverted.brown.button:active,\n.ui.inverted.brown.button:focus,\n.ui.inverted.brown.button:hover,\n.ui.inverted.brown.buttons .button.active,\n.ui.inverted.brown.buttons .button:active,\n.ui.inverted.brown.buttons .button:focus,\n.ui.inverted.brown.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.brown.button:hover,\n.ui.inverted.brown.buttons .button:hover {\n  background-color: #c86f11;\n}\n.ui.inverted.brown.button:focus,\n.ui.inverted.brown.buttons .button:focus {\n  background-color: #c16808;\n}\n.ui.inverted.brown.active.button,\n.ui.inverted.brown.buttons .active.button {\n  background-color: #cc6f0d;\n}\n.ui.inverted.brown.button:active,\n.ui.inverted.brown.buttons .button:active {\n  background-color: #a96216;\n}\n.ui.inverted.brown.basic.button,\n.ui.inverted.brown.basic.buttons .button,\n.ui.inverted.brown.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.brown.basic.button:hover,\n.ui.inverted.brown.basic.buttons .button:hover,\n.ui.inverted.brown.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #c86f11 inset!important;\n  color: #D67C1C!important;\n}\n.ui.inverted.brown.basic.button:focus,\n.ui.inverted.brown.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #c16808 inset!important;\n  color: #D67C1C!important;\n}\n.ui.inverted.brown.basic.active.button,\n.ui.inverted.brown.basic.buttons .active.button,\n.ui.inverted.brown.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #cc6f0d inset!important;\n  color: #D67C1C!important;\n}\n.ui.inverted.brown.basic.button:active,\n.ui.inverted.brown.basic.buttons .button:active,\n.ui.inverted.brown.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #a96216 inset!important;\n  color: #D67C1C!important;\n}\n.ui.blue.button,\n.ui.blue.buttons .button {\n  background-color: #2185D0;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.blue.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.blue.button:hover,\n.ui.blue.buttons .button:hover {\n  background-color: #1678c2;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.blue.button:focus,\n.ui.blue.buttons .button:focus {\n  background-color: #0d71bb;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.blue.button:active,\n.ui.blue.buttons .button:active {\n  background-color: #1a69a4;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.blue.active.button,\n.ui.blue.button .active.button:active,\n.ui.blue.buttons .active.button,\n.ui.blue.buttons .active.button:active {\n  background-color: #1279c6;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.blue.button,\n.ui.basic.blue.buttons .button {\n  box-shadow: 0 0 0 1px #2185D0 inset!important;\n  color: #2185D0!important;\n}\n.ui.basic.blue.button:hover,\n.ui.basic.blue.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #1678c2 inset!important;\n  color: #1678c2!important;\n}\n.ui.basic.blue.button:focus,\n.ui.basic.blue.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #0d71bb inset!important;\n  color: #1678c2!important;\n}\n.ui.basic.blue.active.button,\n.ui.basic.blue.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #1279c6 inset!important;\n  color: #1a69a4!important;\n}\n.ui.basic.blue.button:active,\n.ui.basic.blue.buttons .button:active {\n  box-shadow: 0 0 0 1px #1a69a4 inset!important;\n  color: #1a69a4!important;\n}\n.ui.buttons:not(.vertical)>.basic.blue.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.blue.button,\n.ui.inverted.blue.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #54C8FF inset!important;\n  color: #54C8FF;\n}\n.ui.inverted.blue.button.active,\n.ui.inverted.blue.button:active,\n.ui.inverted.blue.button:focus,\n.ui.inverted.blue.button:hover,\n.ui.inverted.blue.buttons .button.active,\n.ui.inverted.blue.buttons .button:active,\n.ui.inverted.blue.buttons .button:focus,\n.ui.inverted.blue.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.blue.button:hover,\n.ui.inverted.blue.buttons .button:hover {\n  background-color: #3ac0ff;\n}\n.ui.inverted.blue.button:focus,\n.ui.inverted.blue.buttons .button:focus {\n  background-color: #2bbbff;\n}\n.ui.inverted.blue.active.button,\n.ui.inverted.blue.buttons .active.button {\n  background-color: #3ac0ff;\n}\n.ui.inverted.blue.button:active,\n.ui.inverted.blue.buttons .button:active {\n  background-color: #21b8ff;\n}\n.ui.inverted.blue.basic.button,\n.ui.inverted.blue.basic.buttons .button,\n.ui.inverted.blue.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.blue.basic.button:hover,\n.ui.inverted.blue.basic.buttons .button:hover,\n.ui.inverted.blue.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #3ac0ff inset!important;\n  color: #54C8FF!important;\n}\n.ui.inverted.blue.basic.button:focus,\n.ui.inverted.blue.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #2bbbff inset!important;\n  color: #54C8FF!important;\n}\n.ui.inverted.blue.basic.active.button,\n.ui.inverted.blue.basic.buttons .active.button,\n.ui.inverted.blue.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #3ac0ff inset!important;\n  color: #54C8FF!important;\n}\n.ui.inverted.blue.basic.button:active,\n.ui.inverted.blue.basic.buttons .button:active,\n.ui.inverted.blue.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #21b8ff inset!important;\n  color: #54C8FF!important;\n}\n.ui.green.button,\n.ui.green.buttons .button {\n  background-color: #21BA45;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.green.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.green.button:hover,\n.ui.green.buttons .button:hover {\n  background-color: #16ab39;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.green.button:focus,\n.ui.green.buttons .button:focus {\n  background-color: #0ea432;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.green.button:active,\n.ui.green.buttons .button:active {\n  background-color: #198f35;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.green.active.button,\n.ui.green.button .active.button:active,\n.ui.green.buttons .active.button,\n.ui.green.buttons .active.button:active {\n  background-color: #13ae38;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.green.button,\n.ui.basic.green.buttons .button {\n  box-shadow: 0 0 0 1px #21BA45 inset!important;\n  color: #21BA45!important;\n}\n.ui.basic.green.button:hover,\n.ui.basic.green.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #16ab39 inset!important;\n  color: #16ab39!important;\n}\n.ui.basic.green.button:focus,\n.ui.basic.green.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #0ea432 inset!important;\n  color: #16ab39!important;\n}\n.ui.basic.green.active.button,\n.ui.basic.green.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #13ae38 inset!important;\n  color: #198f35!important;\n}\n.ui.basic.green.button:active,\n.ui.basic.green.buttons .button:active {\n  box-shadow: 0 0 0 1px #198f35 inset!important;\n  color: #198f35!important;\n}\n.ui.buttons:not(.vertical)>.basic.green.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.green.button,\n.ui.inverted.green.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #2ECC40 inset!important;\n  color: #2ECC40;\n}\n.ui.inverted.green.button.active,\n.ui.inverted.green.button:active,\n.ui.inverted.green.button:focus,\n.ui.inverted.green.button:hover,\n.ui.inverted.green.buttons .button.active,\n.ui.inverted.green.buttons .button:active,\n.ui.inverted.green.buttons .button:focus,\n.ui.inverted.green.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.green.button:hover,\n.ui.inverted.green.buttons .button:hover {\n  background-color: #22be34;\n}\n.ui.inverted.green.button:focus,\n.ui.inverted.green.buttons .button:focus {\n  background-color: #19b82b;\n}\n.ui.inverted.green.active.button,\n.ui.inverted.green.buttons .active.button {\n  background-color: #1fc231;\n}\n.ui.inverted.green.button:active,\n.ui.inverted.green.buttons .button:active {\n  background-color: #25a233;\n}\n.ui.inverted.green.basic.button,\n.ui.inverted.green.basic.buttons .button,\n.ui.inverted.green.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.green.basic.button:hover,\n.ui.inverted.green.basic.buttons .button:hover,\n.ui.inverted.green.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #22be34 inset!important;\n  color: #2ECC40!important;\n}\n.ui.inverted.green.basic.button:focus,\n.ui.inverted.green.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #19b82b inset!important;\n  color: #2ECC40!important;\n}\n.ui.inverted.green.basic.active.button,\n.ui.inverted.green.basic.buttons .active.button,\n.ui.inverted.green.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #1fc231 inset!important;\n  color: #2ECC40!important;\n}\n.ui.inverted.green.basic.button:active,\n.ui.inverted.green.basic.buttons .button:active,\n.ui.inverted.green.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #25a233 inset!important;\n  color: #2ECC40!important;\n}\n.ui.orange.button,\n.ui.orange.buttons .button {\n  background-color: #F2711C;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.orange.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.orange.button:hover,\n.ui.orange.buttons .button:hover {\n  background-color: #f26202;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.orange.button:focus,\n.ui.orange.buttons .button:focus {\n  background-color: #e55b00;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.orange.button:active,\n.ui.orange.buttons .button:active {\n  background-color: #cf590c;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.orange.active.button,\n.ui.orange.button .active.button:active,\n.ui.orange.buttons .active.button,\n.ui.orange.buttons .active.button:active {\n  background-color: #f56100;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.orange.button,\n.ui.basic.orange.buttons .button {\n  box-shadow: 0 0 0 1px #F2711C inset!important;\n  color: #F2711C!important;\n}\n.ui.basic.orange.button:hover,\n.ui.basic.orange.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #f26202 inset!important;\n  color: #f26202!important;\n}\n.ui.basic.orange.button:focus,\n.ui.basic.orange.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #e55b00 inset!important;\n  color: #f26202!important;\n}\n.ui.basic.orange.active.button,\n.ui.basic.orange.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #f56100 inset!important;\n  color: #cf590c!important;\n}\n.ui.basic.orange.button:active,\n.ui.basic.orange.buttons .button:active {\n  box-shadow: 0 0 0 1px #cf590c inset!important;\n  color: #cf590c!important;\n}\n.ui.buttons:not(.vertical)>.basic.orange.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.orange.button,\n.ui.inverted.orange.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #FF851B inset!important;\n  color: #FF851B;\n}\n.ui.inverted.orange.button.active,\n.ui.inverted.orange.button:active,\n.ui.inverted.orange.button:focus,\n.ui.inverted.orange.button:hover,\n.ui.inverted.orange.buttons .button.active,\n.ui.inverted.orange.buttons .button:active,\n.ui.inverted.orange.buttons .button:focus,\n.ui.inverted.orange.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.orange.button:hover,\n.ui.inverted.orange.buttons .button:hover {\n  background-color: #ff7701;\n}\n.ui.inverted.orange.button:focus,\n.ui.inverted.orange.buttons .button:focus {\n  background-color: #f17000;\n}\n.ui.inverted.orange.active.button,\n.ui.inverted.orange.buttons .active.button {\n  background-color: #ff7701;\n}\n.ui.inverted.orange.button:active,\n.ui.inverted.orange.buttons .button:active {\n  background-color: #e76b00;\n}\n.ui.inverted.orange.basic.button,\n.ui.inverted.orange.basic.buttons .button,\n.ui.inverted.orange.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.orange.basic.button:hover,\n.ui.inverted.orange.basic.buttons .button:hover,\n.ui.inverted.orange.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #ff7701 inset!important;\n  color: #FF851B!important;\n}\n.ui.inverted.orange.basic.button:focus,\n.ui.inverted.orange.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #f17000 inset!important;\n  color: #FF851B!important;\n}\n.ui.inverted.orange.basic.active.button,\n.ui.inverted.orange.basic.buttons .active.button,\n.ui.inverted.orange.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #ff7701 inset!important;\n  color: #FF851B!important;\n}\n.ui.inverted.orange.basic.button:active,\n.ui.inverted.orange.basic.buttons .button:active,\n.ui.inverted.orange.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #e76b00 inset!important;\n  color: #FF851B!important;\n}\n.ui.pink.button,\n.ui.pink.buttons .button {\n  background-color: #E03997;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.pink.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.pink.button:hover,\n.ui.pink.buttons .button:hover {\n  background-color: #e61a8d;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.pink.button:focus,\n.ui.pink.buttons .button:focus {\n  background-color: #e10f85;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.pink.button:active,\n.ui.pink.buttons .button:active {\n  background-color: #c71f7e;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.pink.active.button,\n.ui.pink.button .active.button:active,\n.ui.pink.buttons .active.button,\n.ui.pink.buttons .active.button:active {\n  background-color: #ea158d;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.pink.button,\n.ui.basic.pink.buttons .button {\n  box-shadow: 0 0 0 1px #E03997 inset!important;\n  color: #E03997!important;\n}\n.ui.basic.pink.button:hover,\n.ui.basic.pink.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #e61a8d inset!important;\n  color: #e61a8d!important;\n}\n.ui.basic.pink.button:focus,\n.ui.basic.pink.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #e10f85 inset!important;\n  color: #e61a8d!important;\n}\n.ui.basic.pink.active.button,\n.ui.basic.pink.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #ea158d inset!important;\n  color: #c71f7e!important;\n}\n.ui.basic.pink.button:active,\n.ui.basic.pink.buttons .button:active {\n  box-shadow: 0 0 0 1px #c71f7e inset!important;\n  color: #c71f7e!important;\n}\n.ui.buttons:not(.vertical)>.basic.pink.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.pink.button,\n.ui.inverted.pink.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #FF8EDF inset!important;\n  color: #FF8EDF;\n}\n.ui.inverted.pink.button.active,\n.ui.inverted.pink.button:active,\n.ui.inverted.pink.button:focus,\n.ui.inverted.pink.button:hover,\n.ui.inverted.pink.buttons .button.active,\n.ui.inverted.pink.buttons .button:active,\n.ui.inverted.pink.buttons .button:focus,\n.ui.inverted.pink.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.pink.button:hover,\n.ui.inverted.pink.buttons .button:hover {\n  background-color: #ff74d8;\n}\n.ui.inverted.pink.button:focus,\n.ui.inverted.pink.buttons .button:focus {\n  background-color: #ff65d3;\n}\n.ui.inverted.pink.active.button,\n.ui.inverted.pink.buttons .active.button {\n  background-color: #ff74d8;\n}\n.ui.inverted.pink.button:active,\n.ui.inverted.pink.buttons .button:active {\n  background-color: #ff5bd1;\n}\n.ui.inverted.pink.basic.button,\n.ui.inverted.pink.basic.buttons .button,\n.ui.inverted.pink.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.pink.basic.button:hover,\n.ui.inverted.pink.basic.buttons .button:hover,\n.ui.inverted.pink.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #ff74d8 inset!important;\n  color: #FF8EDF!important;\n}\n.ui.inverted.pink.basic.button:focus,\n.ui.inverted.pink.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #ff65d3 inset!important;\n  color: #FF8EDF!important;\n}\n.ui.inverted.pink.basic.active.button,\n.ui.inverted.pink.basic.buttons .active.button,\n.ui.inverted.pink.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #ff74d8 inset!important;\n  color: #FF8EDF!important;\n}\n.ui.inverted.pink.basic.button:active,\n.ui.inverted.pink.basic.buttons .button:active,\n.ui.inverted.pink.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #ff5bd1 inset!important;\n  color: #FF8EDF!important;\n}\n.ui.violet.button,\n.ui.violet.buttons .button {\n  background-color: #6435C9;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.violet.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.violet.button:hover,\n.ui.violet.buttons .button:hover {\n  background-color: #5829bb;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.violet.button:focus,\n.ui.violet.buttons .button:focus {\n  background-color: #4f20b5;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.violet.button:active,\n.ui.violet.buttons .button:active {\n  background-color: #502aa1;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.violet.active.button,\n.ui.violet.button .active.button:active,\n.ui.violet.buttons .active.button,\n.ui.violet.buttons .active.button:active {\n  background-color: #5626bf;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.violet.button,\n.ui.basic.violet.buttons .button {\n  box-shadow: 0 0 0 1px #6435C9 inset!important;\n  color: #6435C9!important;\n}\n.ui.basic.violet.button:hover,\n.ui.basic.violet.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #5829bb inset!important;\n  color: #5829bb!important;\n}\n.ui.basic.violet.button:focus,\n.ui.basic.violet.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #4f20b5 inset!important;\n  color: #5829bb!important;\n}\n.ui.basic.violet.active.button,\n.ui.basic.violet.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #5626bf inset!important;\n  color: #502aa1!important;\n}\n.ui.basic.violet.button:active,\n.ui.basic.violet.buttons .button:active {\n  box-shadow: 0 0 0 1px #502aa1 inset!important;\n  color: #502aa1!important;\n}\n.ui.buttons:not(.vertical)>.basic.violet.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.violet.button,\n.ui.inverted.violet.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #A291FB inset!important;\n  color: #A291FB;\n}\n.ui.inverted.violet.button.active,\n.ui.inverted.violet.button:active,\n.ui.inverted.violet.button:focus,\n.ui.inverted.violet.button:hover,\n.ui.inverted.violet.buttons .button.active,\n.ui.inverted.violet.buttons .button:active,\n.ui.inverted.violet.buttons .button:focus,\n.ui.inverted.violet.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.violet.button:hover,\n.ui.inverted.violet.buttons .button:hover {\n  background-color: #8a73ff;\n}\n.ui.inverted.violet.button:focus,\n.ui.inverted.violet.buttons .button:focus {\n  background-color: #7d64ff;\n}\n.ui.inverted.violet.active.button,\n.ui.inverted.violet.buttons .active.button {\n  background-color: #8a73ff;\n}\n.ui.inverted.violet.button:active,\n.ui.inverted.violet.buttons .button:active {\n  background-color: #7860f9;\n}\n.ui.inverted.violet.basic.button,\n.ui.inverted.violet.basic.buttons .button,\n.ui.inverted.violet.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.violet.basic.button:hover,\n.ui.inverted.violet.basic.buttons .button:hover,\n.ui.inverted.violet.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #8a73ff inset!important;\n  color: #A291FB!important;\n}\n.ui.inverted.violet.basic.button:focus,\n.ui.inverted.violet.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #7d64ff inset!important;\n  color: #A291FB!important;\n}\n.ui.inverted.violet.basic.active.button,\n.ui.inverted.violet.basic.buttons .active.button,\n.ui.inverted.violet.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #8a73ff inset!important;\n  color: #A291FB!important;\n}\n.ui.inverted.violet.basic.button:active,\n.ui.inverted.violet.basic.buttons .button:active,\n.ui.inverted.violet.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #7860f9 inset!important;\n  color: #A291FB!important;\n}\n.ui.purple.button,\n.ui.purple.buttons .button {\n  background-color: #A333C8;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.purple.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.purple.button:hover,\n.ui.purple.buttons .button:hover {\n  background-color: #9627ba;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.purple.button:focus,\n.ui.purple.buttons .button:focus {\n  background-color: #8f1eb4;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.purple.button:active,\n.ui.purple.buttons .button:active {\n  background-color: #82299f;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.purple.active.button,\n.ui.purple.button .active.button:active,\n.ui.purple.buttons .active.button,\n.ui.purple.buttons .active.button:active {\n  background-color: #9724be;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.purple.button,\n.ui.basic.purple.buttons .button {\n  box-shadow: 0 0 0 1px #A333C8 inset!important;\n  color: #A333C8!important;\n}\n.ui.basic.purple.button:hover,\n.ui.basic.purple.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #9627ba inset!important;\n  color: #9627ba!important;\n}\n.ui.basic.purple.button:focus,\n.ui.basic.purple.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #8f1eb4 inset!important;\n  color: #9627ba!important;\n}\n.ui.basic.purple.active.button,\n.ui.basic.purple.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #9724be inset!important;\n  color: #82299f!important;\n}\n.ui.basic.purple.button:active,\n.ui.basic.purple.buttons .button:active {\n  box-shadow: 0 0 0 1px #82299f inset!important;\n  color: #82299f!important;\n}\n.ui.buttons:not(.vertical)>.basic.purple.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.purple.button,\n.ui.inverted.purple.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #DC73FF inset!important;\n  color: #DC73FF;\n}\n.ui.inverted.purple.button.active,\n.ui.inverted.purple.button:active,\n.ui.inverted.purple.button:focus,\n.ui.inverted.purple.button:hover,\n.ui.inverted.purple.buttons .button.active,\n.ui.inverted.purple.buttons .button:active,\n.ui.inverted.purple.buttons .button:focus,\n.ui.inverted.purple.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.purple.button:hover,\n.ui.inverted.purple.buttons .button:hover {\n  background-color: #d65aff;\n}\n.ui.inverted.purple.button:focus,\n.ui.inverted.purple.buttons .button:focus {\n  background-color: #d24aff;\n}\n.ui.inverted.purple.active.button,\n.ui.inverted.purple.buttons .active.button {\n  background-color: #d65aff;\n}\n.ui.inverted.purple.button:active,\n.ui.inverted.purple.buttons .button:active {\n  background-color: #cf40ff;\n}\n.ui.inverted.purple.basic.button,\n.ui.inverted.purple.basic.buttons .button,\n.ui.inverted.purple.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.purple.basic.button:hover,\n.ui.inverted.purple.basic.buttons .button:hover,\n.ui.inverted.purple.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #d65aff inset!important;\n  color: #DC73FF!important;\n}\n.ui.inverted.purple.basic.button:focus,\n.ui.inverted.purple.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #d24aff inset!important;\n  color: #DC73FF!important;\n}\n.ui.inverted.purple.basic.active.button,\n.ui.inverted.purple.basic.buttons .active.button,\n.ui.inverted.purple.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #d65aff inset!important;\n  color: #DC73FF!important;\n}\n.ui.inverted.purple.basic.button:active,\n.ui.inverted.purple.basic.buttons .button:active,\n.ui.inverted.purple.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #cf40ff inset!important;\n  color: #DC73FF!important;\n}\n.ui.red.button,\n.ui.red.buttons .button {\n  background-color: #DB2828;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.red.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.red.button:hover,\n.ui.red.buttons .button:hover {\n  background-color: #d01919;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.red.button:focus,\n.ui.red.buttons .button:focus {\n  background-color: #ca1010;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.red.button:active,\n.ui.red.buttons .button:active {\n  background-color: #b21e1e;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.red.active.button,\n.ui.red.button .active.button:active,\n.ui.red.buttons .active.button,\n.ui.red.buttons .active.button:active {\n  background-color: #d41515;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.red.button,\n.ui.basic.red.buttons .button {\n  box-shadow: 0 0 0 1px #DB2828 inset!important;\n  color: #DB2828!important;\n}\n.ui.basic.red.button:hover,\n.ui.basic.red.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #d01919 inset!important;\n  color: #d01919!important;\n}\n.ui.basic.red.button:focus,\n.ui.basic.red.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #ca1010 inset!important;\n  color: #d01919!important;\n}\n.ui.basic.red.active.button,\n.ui.basic.red.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #d41515 inset!important;\n  color: #b21e1e!important;\n}\n.ui.basic.red.button:active,\n.ui.basic.red.buttons .button:active {\n  box-shadow: 0 0 0 1px #b21e1e inset!important;\n  color: #b21e1e!important;\n}\n.ui.buttons:not(.vertical)>.basic.red.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.red.button,\n.ui.inverted.red.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #FF695E inset!important;\n  color: #FF695E;\n}\n.ui.inverted.red.button.active,\n.ui.inverted.red.button:active,\n.ui.inverted.red.button:focus,\n.ui.inverted.red.button:hover,\n.ui.inverted.red.buttons .button.active,\n.ui.inverted.red.buttons .button:active,\n.ui.inverted.red.buttons .button:focus,\n.ui.inverted.red.buttons .button:hover {\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.inverted.red.button:hover,\n.ui.inverted.red.buttons .button:hover {\n  background-color: #ff5144;\n}\n.ui.inverted.red.button:focus,\n.ui.inverted.red.buttons .button:focus {\n  background-color: #ff4335;\n}\n.ui.inverted.red.active.button,\n.ui.inverted.red.buttons .active.button {\n  background-color: #ff5144;\n}\n.ui.inverted.red.button:active,\n.ui.inverted.red.buttons .button:active {\n  background-color: #ff392b;\n}\n.ui.inverted.red.basic.button,\n.ui.inverted.red.basic.buttons .button,\n.ui.inverted.red.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.red.basic.button:hover,\n.ui.inverted.red.basic.buttons .button:hover,\n.ui.inverted.red.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #ff5144 inset!important;\n  color: #FF695E!important;\n}\n.ui.inverted.red.basic.button:focus,\n.ui.inverted.red.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #ff4335 inset!important;\n  color: #FF695E!important;\n}\n.ui.inverted.red.basic.active.button,\n.ui.inverted.red.basic.buttons .active.button,\n.ui.inverted.red.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #ff5144 inset!important;\n  color: #FF695E!important;\n}\n.ui.inverted.red.basic.button:active,\n.ui.inverted.red.basic.buttons .button:active,\n.ui.inverted.red.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #ff392b inset!important;\n  color: #FF695E!important;\n}\n.ui.teal.button,\n.ui.teal.buttons .button {\n  background-color: #00B5AD;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.teal.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.teal.button:hover,\n.ui.teal.buttons .button:hover {\n  background-color: #009c95;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.teal.button:focus,\n.ui.teal.buttons .button:focus {\n  background-color: #008c86;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.teal.button:active,\n.ui.teal.buttons .button:active {\n  background-color: #00827c;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.teal.active.button,\n.ui.teal.button .active.button:active,\n.ui.teal.buttons .active.button,\n.ui.teal.buttons .active.button:active {\n  background-color: #009c95;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.teal.button,\n.ui.basic.teal.buttons .button {\n  box-shadow: 0 0 0 1px #00B5AD inset!important;\n  color: #00B5AD!important;\n}\n.ui.basic.teal.button:hover,\n.ui.basic.teal.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #009c95 inset!important;\n  color: #009c95!important;\n}\n.ui.basic.teal.button:focus,\n.ui.basic.teal.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #008c86 inset!important;\n  color: #009c95!important;\n}\n.ui.basic.teal.active.button,\n.ui.basic.teal.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #009c95 inset!important;\n  color: #00827c!important;\n}\n.ui.basic.teal.button:active,\n.ui.basic.teal.buttons .button:active {\n  box-shadow: 0 0 0 1px #00827c inset!important;\n  color: #00827c!important;\n}\n.ui.buttons:not(.vertical)>.basic.teal.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.teal.button,\n.ui.inverted.teal.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #6DFFFF inset!important;\n  color: #6DFFFF;\n}\n.ui.inverted.teal.button.active,\n.ui.inverted.teal.button:active,\n.ui.inverted.teal.button:focus,\n.ui.inverted.teal.button:hover,\n.ui.inverted.teal.buttons .button.active,\n.ui.inverted.teal.buttons .button:active,\n.ui.inverted.teal.buttons .button:focus,\n.ui.inverted.teal.buttons .button:hover {\n  box-shadow: none!important;\n  color: rgba(0,0,0,.6);\n}\n.ui.inverted.teal.button:hover,\n.ui.inverted.teal.buttons .button:hover {\n  background-color: #54ffff;\n}\n.ui.inverted.teal.button:focus,\n.ui.inverted.teal.buttons .button:focus {\n  background-color: #4ff;\n}\n.ui.inverted.teal.active.button,\n.ui.inverted.teal.buttons .active.button {\n  background-color: #54ffff;\n}\n.ui.inverted.teal.button:active,\n.ui.inverted.teal.buttons .button:active {\n  background-color: #3affff;\n}\n.ui.inverted.teal.basic.button,\n.ui.inverted.teal.basic.buttons .button,\n.ui.inverted.teal.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.teal.basic.button:hover,\n.ui.inverted.teal.basic.buttons .button:hover,\n.ui.inverted.teal.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #54ffff inset!important;\n  color: #6DFFFF!important;\n}\n.ui.inverted.teal.basic.button:focus,\n.ui.inverted.teal.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #4ff inset!important;\n  color: #6DFFFF!important;\n}\n.ui.inverted.teal.basic.active.button,\n.ui.inverted.teal.basic.buttons .active.button,\n.ui.inverted.teal.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #54ffff inset!important;\n  color: #6DFFFF!important;\n}\n.ui.inverted.teal.basic.button:active,\n.ui.inverted.teal.basic.buttons .button:active,\n.ui.inverted.teal.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #3affff inset!important;\n  color: #6DFFFF!important;\n}\n.ui.olive.button,\n.ui.olive.buttons .button {\n  background-color: #B5CC18;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.olive.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.olive.button:hover,\n.ui.olive.buttons .button:hover {\n  background-color: #a7bd0d;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.olive.button:focus,\n.ui.olive.buttons .button:focus {\n  background-color: #a0b605;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.olive.button:active,\n.ui.olive.buttons .button:active {\n  background-color: #8d9e13;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.olive.active.button,\n.ui.olive.button .active.button:active,\n.ui.olive.buttons .active.button,\n.ui.olive.buttons .active.button:active {\n  background-color: #aac109;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.olive.button,\n.ui.basic.olive.buttons .button {\n  box-shadow: 0 0 0 1px #B5CC18 inset!important;\n  color: #B5CC18!important;\n}\n.ui.basic.olive.button:hover,\n.ui.basic.olive.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #a7bd0d inset!important;\n  color: #a7bd0d!important;\n}\n.ui.basic.olive.button:focus,\n.ui.basic.olive.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #a0b605 inset!important;\n  color: #a7bd0d!important;\n}\n.ui.basic.olive.active.button,\n.ui.basic.olive.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #aac109 inset!important;\n  color: #8d9e13!important;\n}\n.ui.basic.olive.button:active,\n.ui.basic.olive.buttons .button:active {\n  box-shadow: 0 0 0 1px #8d9e13 inset!important;\n  color: #8d9e13!important;\n}\n.ui.buttons:not(.vertical)>.basic.olive.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.olive.button,\n.ui.inverted.olive.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #D9E778 inset!important;\n  color: #D9E778;\n}\n.ui.inverted.olive.button.active,\n.ui.inverted.olive.button:active,\n.ui.inverted.olive.button:focus,\n.ui.inverted.olive.button:hover,\n.ui.inverted.olive.buttons .button.active,\n.ui.inverted.olive.buttons .button:active,\n.ui.inverted.olive.buttons .button:focus,\n.ui.inverted.olive.buttons .button:hover {\n  box-shadow: none!important;\n  color: rgba(0,0,0,.6);\n}\n.ui.inverted.olive.button:hover,\n.ui.inverted.olive.buttons .button:hover {\n  background-color: #d8ea5c;\n}\n.ui.inverted.olive.button:focus,\n.ui.inverted.olive.buttons .button:focus {\n  background-color: #daef47;\n}\n.ui.inverted.olive.active.button,\n.ui.inverted.olive.buttons .active.button {\n  background-color: #daed59;\n}\n.ui.inverted.olive.button:active,\n.ui.inverted.olive.buttons .button:active {\n  background-color: #cddf4d;\n}\n.ui.inverted.olive.basic.button,\n.ui.inverted.olive.basic.buttons .button,\n.ui.inverted.olive.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.olive.basic.button:hover,\n.ui.inverted.olive.basic.buttons .button:hover,\n.ui.inverted.olive.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #d8ea5c inset!important;\n  color: #D9E778!important;\n}\n.ui.inverted.olive.basic.button:focus,\n.ui.inverted.olive.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #daef47 inset!important;\n  color: #D9E778!important;\n}\n.ui.inverted.olive.basic.active.button,\n.ui.inverted.olive.basic.buttons .active.button,\n.ui.inverted.olive.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #daed59 inset!important;\n  color: #D9E778!important;\n}\n.ui.inverted.olive.basic.button:active,\n.ui.inverted.olive.basic.buttons .button:active,\n.ui.inverted.olive.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #cddf4d inset!important;\n  color: #D9E778!important;\n}\n.ui.yellow.button,\n.ui.yellow.buttons .button {\n  background-color: #FBBD08;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.yellow.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.yellow.button:hover,\n.ui.yellow.buttons .button:hover {\n  background-color: #eaae00;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.yellow.button:focus,\n.ui.yellow.buttons .button:focus {\n  background-color: #daa300;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.yellow.button:active,\n.ui.yellow.buttons .button:active {\n  background-color: #cd9903;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.yellow.active.button,\n.ui.yellow.button .active.button:active,\n.ui.yellow.buttons .active.button,\n.ui.yellow.buttons .active.button:active {\n  background-color: #eaae00;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.yellow.button,\n.ui.basic.yellow.buttons .button {\n  box-shadow: 0 0 0 1px #FBBD08 inset!important;\n  color: #FBBD08!important;\n}\n.ui.basic.yellow.button:hover,\n.ui.basic.yellow.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #eaae00 inset!important;\n  color: #eaae00!important;\n}\n.ui.basic.yellow.button:focus,\n.ui.basic.yellow.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #daa300 inset!important;\n  color: #eaae00!important;\n}\n.ui.basic.yellow.active.button,\n.ui.basic.yellow.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #eaae00 inset!important;\n  color: #cd9903!important;\n}\n.ui.basic.yellow.button:active,\n.ui.basic.yellow.buttons .button:active {\n  box-shadow: 0 0 0 1px #cd9903 inset!important;\n  color: #cd9903!important;\n}\n.ui.buttons:not(.vertical)>.basic.yellow.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.inverted.yellow.button,\n.ui.inverted.yellow.buttons .button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px #FFE21F inset!important;\n  color: #FFE21F;\n}\n.ui.inverted.yellow.button.active,\n.ui.inverted.yellow.button:active,\n.ui.inverted.yellow.button:focus,\n.ui.inverted.yellow.button:hover,\n.ui.inverted.yellow.buttons .button.active,\n.ui.inverted.yellow.buttons .button:active,\n.ui.inverted.yellow.buttons .button:focus,\n.ui.inverted.yellow.buttons .button:hover {\n  box-shadow: none!important;\n  color: rgba(0,0,0,.6);\n}\n.ui.inverted.yellow.button:hover,\n.ui.inverted.yellow.buttons .button:hover {\n  background-color: #ffdf05;\n}\n.ui.inverted.yellow.button:focus,\n.ui.inverted.yellow.buttons .button:focus {\n  background-color: #f5d500;\n}\n.ui.inverted.yellow.active.button,\n.ui.inverted.yellow.buttons .active.button {\n  background-color: #ffdf05;\n}\n.ui.inverted.yellow.button:active,\n.ui.inverted.yellow.buttons .button:active {\n  background-color: #ebcd00;\n}\n.ui.inverted.yellow.basic.button,\n.ui.inverted.yellow.basic.buttons .button,\n.ui.inverted.yellow.buttons .basic.button {\n  background-color: transparent;\n  box-shadow: 0 0 0 2px rgba(255,255,255,.5) inset!important;\n  color: #FFF!important;\n}\n.ui.inverted.yellow.basic.button:hover,\n.ui.inverted.yellow.basic.buttons .button:hover,\n.ui.inverted.yellow.buttons .basic.button:hover {\n  box-shadow: 0 0 0 2px #ffdf05 inset!important;\n  color: #FFE21F!important;\n}\n.ui.inverted.yellow.basic.button:focus,\n.ui.inverted.yellow.basic.buttons .button:focus {\n  box-shadow: 0 0 0 2px #f5d500 inset!important;\n  color: #FFE21F!important;\n}\n.ui.inverted.yellow.basic.active.button,\n.ui.inverted.yellow.basic.buttons .active.button,\n.ui.inverted.yellow.buttons .basic.active.button {\n  box-shadow: 0 0 0 2px #ffdf05 inset!important;\n  color: #FFE21F!important;\n}\n.ui.inverted.yellow.basic.button:active,\n.ui.inverted.yellow.basic.buttons .button:active,\n.ui.inverted.yellow.buttons .basic.button:active {\n  box-shadow: 0 0 0 2px #ebcd00 inset!important;\n  color: #FFE21F!important;\n}\n.ui.primary.button,\n.ui.primary.buttons .button {\n  background-color: #2185D0;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.primary.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.primary.button:hover,\n.ui.primary.buttons .button:hover {\n  background-color: #1678c2;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.primary.button:focus,\n.ui.primary.buttons .button:focus {\n  background-color: #0d71bb;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.primary.button:active,\n.ui.primary.buttons .button:active {\n  background-color: #1a69a4;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.primary.active.button,\n.ui.primary.button .active.button:active,\n.ui.primary.buttons .active.button,\n.ui.primary.buttons .active.button:active {\n  background-color: #1279c6;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.primary.button,\n.ui.basic.primary.buttons .button {\n  box-shadow: 0 0 0 1px #2185D0 inset!important;\n  color: #2185D0!important;\n}\n.ui.basic.primary.button:hover,\n.ui.basic.primary.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #1678c2 inset!important;\n  color: #1678c2!important;\n}\n.ui.basic.primary.button:focus,\n.ui.basic.primary.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #0d71bb inset!important;\n  color: #1678c2!important;\n}\n.ui.basic.primary.active.button,\n.ui.basic.primary.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #1279c6 inset!important;\n  color: #1a69a4!important;\n}\n.ui.basic.primary.button:active,\n.ui.basic.primary.buttons .button:active {\n  box-shadow: 0 0 0 1px #1a69a4 inset!important;\n  color: #1a69a4!important;\n}\n.ui.secondary.button,\n.ui.secondary.buttons .button {\n  background-color: #1B1C1D;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.secondary.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.secondary.button:hover,\n.ui.secondary.buttons .button:hover {\n  background-color: #27292a;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.secondary.button:focus,\n.ui.secondary.buttons .button:focus {\n  background-color: #2e3032;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.secondary.button:active,\n.ui.secondary.buttons .button:active {\n  background-color: #343637;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.secondary.active.button,\n.ui.secondary.button .active.button:active,\n.ui.secondary.buttons .active.button,\n.ui.secondary.buttons .active.button:active {\n  background-color: #27292a;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.secondary.button,\n.ui.basic.secondary.buttons .button {\n  box-shadow: 0 0 0 1px #1B1C1D inset!important;\n  color: #1B1C1D!important;\n}\n.ui.basic.secondary.button:hover,\n.ui.basic.secondary.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #27292a inset!important;\n  color: #27292a!important;\n}\n.ui.basic.secondary.button:focus,\n.ui.basic.secondary.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #2e3032 inset!important;\n  color: #27292a!important;\n}\n.ui.basic.secondary.active.button,\n.ui.basic.secondary.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #27292a inset!important;\n  color: #343637!important;\n}\n.ui.basic.secondary.button:active,\n.ui.basic.secondary.buttons .button:active {\n  box-shadow: 0 0 0 1px #343637 inset!important;\n  color: #343637!important;\n}\n.ui.positive.button,\n.ui.positive.buttons .button {\n  background-color: #21BA45;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.positive.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.positive.button:hover,\n.ui.positive.buttons .button:hover {\n  background-color: #16ab39;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.positive.button:focus,\n.ui.positive.buttons .button:focus {\n  background-color: #0ea432;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.positive.button:active,\n.ui.positive.buttons .button:active {\n  background-color: #198f35;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.positive.active.button,\n.ui.positive.button .active.button:active,\n.ui.positive.buttons .active.button,\n.ui.positive.buttons .active.button:active {\n  background-color: #13ae38;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.positive.button,\n.ui.basic.positive.buttons .button {\n  box-shadow: 0 0 0 1px #21BA45 inset!important;\n  color: #21BA45!important;\n}\n.ui.basic.positive.button:hover,\n.ui.basic.positive.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #16ab39 inset!important;\n  color: #16ab39!important;\n}\n.ui.basic.positive.button:focus,\n.ui.basic.positive.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #0ea432 inset!important;\n  color: #16ab39!important;\n}\n.ui.basic.positive.active.button,\n.ui.basic.positive.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #13ae38 inset!important;\n  color: #198f35!important;\n}\n.ui.basic.positive.button:active,\n.ui.basic.positive.buttons .button:active {\n  box-shadow: 0 0 0 1px #198f35 inset!important;\n  color: #198f35!important;\n}\n.ui.negative.button,\n.ui.negative.buttons .button {\n  background-color: #DB2828;\n  color: #FFF;\n  text-shadow: none;\n  background-image: none;\n}\n.ui.negative.button {\n  box-shadow: 0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.negative.button:hover,\n.ui.negative.buttons .button:hover {\n  background-color: #d01919;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.negative.button:focus,\n.ui.negative.buttons .button:focus {\n  background-color: #ca1010;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.negative.button:active,\n.ui.negative.buttons .button:active {\n  background-color: #b21e1e;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.negative.active.button,\n.ui.negative.button .active.button:active,\n.ui.negative.buttons .active.button,\n.ui.negative.buttons .active.button:active {\n  background-color: #d41515;\n  color: #FFF;\n  text-shadow: none;\n}\n.ui.basic.negative.button,\n.ui.basic.negative.buttons .button {\n  box-shadow: 0 0 0 1px #DB2828 inset!important;\n  color: #DB2828!important;\n}\n.ui.basic.negative.button:hover,\n.ui.basic.negative.buttons .button:hover {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #d01919 inset!important;\n  color: #d01919!important;\n}\n.ui.basic.negative.button:focus,\n.ui.basic.negative.buttons .button:focus {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #ca1010 inset!important;\n  color: #d01919!important;\n}\n.ui.basic.negative.active.button,\n.ui.basic.negative.buttons .active.button {\n  background: 0 0!important;\n  box-shadow: 0 0 0 1px #d41515 inset!important;\n  color: #b21e1e!important;\n}\n.ui.basic.negative.button:active,\n.ui.basic.negative.buttons .button:active {\n  box-shadow: 0 0 0 1px #b21e1e inset!important;\n  color: #b21e1e!important;\n}\n.ui.buttons:not(.vertical)>.basic.primary.button:not(:first-child) {\n  margin-left: -1px;\n}\n.ui.buttons {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  font-size: 0;\n  vertical-align: baseline;\n  margin: 0 .25em 0 0;\n}\n.ui.buttons:not(.basic):not(.inverted) {\n  box-shadow: none;\n}\n.ui.buttons:after {\n  content: \".\";\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.ui.buttons .button {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  border-radius: 0;\n  margin: 0;\n}\n.ui.buttons:not(.basic):not(.inverted)>.button,\n.ui.buttons>.ui.button:not(.basic):not(.inverted) {\n  box-shadow: 0 0 0 1px transparent inset,0 0 0 0 rgba(34,36,38,.15) inset;\n}\n.ui.buttons .button:first-child {\n  border-left: none;\n  margin-left: 0;\n  border-top-left-radius: .28571429rem;\n  border-bottom-left-radius: .28571429rem;\n}\n.ui.buttons .button:last-child {\n  border-top-right-radius: .28571429rem;\n  border-bottom-right-radius: .28571429rem;\n}\n.ui.vertical.buttons {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n}\n.ui.vertical.buttons .button {\n  display: block;\n  float: none;\n  width: 100%;\n  margin: 0;\n  box-shadow: none;\n  border-radius: 0;\n}\n.ui.vertical.buttons .button:first-child {\n  border-top-left-radius: .28571429rem;\n  border-top-right-radius: .28571429rem;\n}\n.ui.vertical.buttons .button:last-child {\n  margin-bottom: 0;\n  border-bottom-left-radius: .28571429rem;\n  border-bottom-right-radius: .28571429rem;\n}\n.ui.vertical.buttons .button:only-child {\n  border-radius: .28571429rem;\n}\n.ui.container {\n  display: block;\n  max-width: 100%!important;\n}\n@media only screen and (max-width:767px) {\n  .ui.container {\n    width: auto!important;\n    margin-left: 1em!important;\n    margin-right: 1em!important;\n  }\n\n  .ui.grid.container,\n  .ui.relaxed.grid.container,\n  .ui.very.relaxed.grid.container {\n    width: auto!important;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.container {\n    width: 723px;\n    margin-left: auto!important;\n    margin-right: auto!important;\n  }\n\n  .ui.grid.container {\n    width: calc(723px + 2rem)!important;\n  }\n\n  .ui.relaxed.grid.container {\n    width: calc(723px + 3rem)!important;\n  }\n\n  .ui.very.relaxed.grid.container {\n    width: calc(723px + 5rem)!important;\n  }\n}\n@media only screen and (min-width:992px) and (max-width:1199px) {\n  .ui.container {\n    width: 933px;\n    margin-left: auto!important;\n    margin-right: auto!important;\n  }\n\n  .ui.grid.container {\n    width: calc(933px + 2rem)!important;\n  }\n\n  .ui.relaxed.grid.container {\n    width: calc(933px + 3rem)!important;\n  }\n\n  .ui.very.relaxed.grid.container {\n    width: calc(933px + 5rem)!important;\n  }\n}\n@media only screen and (min-width:1200px) {\n  .ui.container {\n    width: 1127px;\n    margin-left: auto!important;\n    margin-right: auto!important;\n  }\n\n  .ui.grid.container {\n    width: calc(1127px + 2rem)!important;\n  }\n\n  .ui.relaxed.grid.container {\n    width: calc(1127px + 3rem)!important;\n  }\n\n  .ui.very.relaxed.grid.container {\n    width: calc(1127px + 5rem)!important;\n  }\n}\n.ui.text.container {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  max-width: 700px!important;\n  line-height: 1.5;\n  font-size: 1.14285714rem;\n}\n.ui.fluid.container {\n  width: 100%;\n}\n.ui[class*=\"left aligned\"].container {\n  text-align: left;\n}\n.ui[class*=\"center aligned\"].container {\n  text-align: center;\n}\n.ui[class*=\"right aligned\"].container {\n  text-align: right;\n}\n.ui.justified.container {\n  text-align: justify;\n  -webkit-hyphens: auto;\n  -moz-hyphens: auto;\n  -ms-hyphens: auto;\n  hyphens: auto;\n}\n.ui.divider {\n  margin: 1rem 0;\n  line-height: 1;\n  height: 0;\n  font-weight: 700;\n  text-transform: uppercase;\n  letter-spacing: .05em;\n  color: rgba(0,0,0,.85);\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-tap-highlight-color: transparent;\n  font-size: 1rem;\n}\n.ui.divider:not(.vertical):not(.horizontal) {\n  border-top: 1px solid rgba(34,36,38,.15);\n  border-bottom: 1px solid rgba(255,255,255,.1);\n}\n.ui.grid>.column+.divider,\n.ui.grid>.row>.column+.divider {\n  left: auto;\n}\n.ui.horizontal.divider {\n  display: table;\n  white-space: nowrap;\n  height: auto;\n  margin: '';\n  line-height: 1;\n  text-align: center;\n}\n.ui.horizontal.divider:after,\n.ui.horizontal.divider:before {\n  content: '';\n  display: table-cell;\n  position: relative;\n  top: 50%;\n  width: 50%;\n  background-repeat: no-repeat;\n  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAACCAYAAACuTHuKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OThBRDY4OUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OThBRDY4QUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5OEFENjg3Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5OEFENjg4Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VU513gAAADVJREFUeNrs0DENACAQBDBIWLGBJQby/mUcJn5sJXQmOQMAAAAAAJqt+2prAAAAAACg2xdgANk6BEVuJgyMAAAAAElFTkSuQmCC);\n}\n.ui.horizontal.divider:before {\n  background-position: right 1em top 50%;\n}\n.ui.horizontal.divider:after {\n  background-position: left 1em top 50%;\n}\n.ui.vertical.divider {\n  position: absolute;\n  z-index: 2;\n  top: 50%;\n  left: 50%;\n  margin: 0;\n  padding: 0;\n  width: auto;\n  height: 50%;\n  line-height: 0;\n  text-align: center;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n}\n.ui.vertical.divider:after,\n.ui.vertical.divider:before {\n  position: absolute;\n  left: 50%;\n  content: '';\n  z-index: 3;\n  border-left: 1px solid rgba(34,36,38,.15);\n  border-right: 1px solid rgba(255,255,255,.1);\n  width: 0;\n  height: calc(100% - 1rem);\n}\n.ui.vertical.divider:before {\n  top: -100%;\n}\n.ui.vertical.divider:after {\n  top: auto;\n  bottom: 0;\n}\n@media only screen and (max-width:767px) {\n  .ui.grid .stackable.row .ui.vertical.divider,\n  .ui.stackable.grid .ui.vertical.divider {\n    display: table;\n    white-space: nowrap;\n    height: auto;\n    margin: '';\n    overflow: hidden;\n    line-height: 1;\n    text-align: center;\n    position: static;\n    top: 0;\n    left: 0;\n    -webkit-transform: none;\n    -ms-transform: none;\n    transform: none;\n  }\n\n  .ui.grid .stackable.row .ui.vertical.divider:after,\n  .ui.grid .stackable.row .ui.vertical.divider:before,\n  .ui.stackable.grid .ui.vertical.divider:after,\n  .ui.stackable.grid .ui.vertical.divider:before {\n    left: 0;\n    border-left: none;\n    border-right: none;\n    content: '';\n    display: table-cell;\n    position: relative;\n    top: 50%;\n    width: 50%;\n    background-repeat: no-repeat;\n    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABaAAAAACCAYAAACuTHuKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OThBRDY4OUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OThBRDY4QUNDMTYxMUU0OUE3NUVGOEJDMzMzMjE2NyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU5OEFENjg3Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU5OEFENjg4Q0MxNjExRTQ5QTc1RUY4QkMzMzMyMTY3Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+VU513gAAADVJREFUeNrs0DENACAQBDBIWLGBJQby/mUcJn5sJXQmOQMAAAAAAJqt+2prAAAAAACg2xdgANk6BEVuJgyMAAAAAElFTkSuQmCC);\n  }\n\n  .ui.grid .stackable.row .ui.vertical.divider:before,\n  .ui.stackable.grid .ui.vertical.divider:before {\n    background-position: right 1em top 50%;\n  }\n\n  .ui.grid .stackable.row .ui.vertical.divider:after,\n  .ui.stackable.grid .ui.vertical.divider:after {\n    background-position: left 1em top 50%;\n  }\n}\n.ui.divider>.icon {\n  margin: 0;\n  font-size: 1rem;\n  height: 1em;\n  vertical-align: middle;\n}\n.ui.hidden.divider {\n  border-color: transparent!important;\n}\n.ui.hidden.divider:after,\n.ui.hidden.divider:before {\n  display: none;\n}\n.ui.divider.inverted,\n.ui.horizontal.inverted.divider,\n.ui.vertical.inverted.divider {\n  color: #FFF;\n}\n.ui.divider.inverted,\n.ui.divider.inverted:after,\n.ui.divider.inverted:before {\n  border-top-color: rgba(34,36,38,.15)!important;\n  border-left-color: rgba(34,36,38,.15)!important;\n  border-bottom-color: rgba(255,255,255,.15)!important;\n  border-right-color: rgba(255,255,255,.15)!important;\n}\n.ui.fitted.divider {\n  margin: 0;\n}\n.ui.clearing.divider {\n  clear: both;\n}\n.ui.section.divider {\n  margin-top: 2rem;\n  margin-bottom: 2rem;\n}\ni.flag:not(.icon) {\n  display: inline-block;\n  width: 16px;\n  height: 11px;\n  line-height: 11px;\n  vertical-align: baseline;\n  margin: 0 .5em 0 0;\n  text-decoration: inherit;\n  speak: none;\n  font-smoothing: antialiased;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\ni.flag:not(.icon):before {\n  display: inline-block;\n  content: '';\n  background: url(node_modules/semantic-ui-css/themes/default/assets/images/flags.png) -108px -1976px no-repeat;\n  width: 16px;\n  height: 11px;\n}\ni.flag.ad:before,\ni.flag.andorra:before {\n  background-position: 0 0;\n}\ni.flag.ae:before,\ni.flag.uae:before,\ni.flag.united.arab.emirates:before {\n  background-position: 0 -26px;\n}\ni.flag.af:before,\ni.flag.afghanistan:before {\n  background-position: 0 -52px;\n}\ni.flag.ag:before,\ni.flag.antigua:before {\n  background-position: 0 -78px;\n}\ni.flag.ai:before,\ni.flag.anguilla:before {\n  background-position: 0 -104px;\n}\ni.flag.al:before,\ni.flag.albania:before {\n  background-position: 0 -130px;\n}\ni.flag.am:before,\ni.flag.armenia:before {\n  background-position: 0 -156px;\n}\ni.flag.an:before,\ni.flag.netherlands.antilles:before {\n  background-position: 0 -182px;\n}\ni.flag.angola:before,\ni.flag.ao:before {\n  background-position: 0 -208px;\n}\ni.flag.ar:before,\ni.flag.argentina:before {\n  background-position: 0 -234px;\n}\ni.flag.american.samoa:before,\ni.flag.as:before {\n  background-position: 0 -260px;\n}\ni.flag.at:before,\ni.flag.austria:before {\n  background-position: 0 -286px;\n}\ni.flag.au:before,\ni.flag.australia:before {\n  background-position: 0 -312px;\n}\ni.flag.aruba:before,\ni.flag.aw:before {\n  background-position: 0 -338px;\n}\ni.flag.aland.islands:before,\ni.flag.ax:before {\n  background-position: 0 -364px;\n}\ni.flag.az:before,\ni.flag.azerbaijan:before {\n  background-position: 0 -390px;\n}\ni.flag.ba:before,\ni.flag.bosnia:before {\n  background-position: 0 -416px;\n}\ni.flag.barbados:before,\ni.flag.bb:before {\n  background-position: 0 -442px;\n}\ni.flag.bangladesh:before,\ni.flag.bd:before {\n  background-position: 0 -468px;\n}\ni.flag.be:before,\ni.flag.belgium:before {\n  background-position: 0 -494px;\n}\ni.flag.bf:before,\ni.flag.burkina.faso:before {\n  background-position: 0 -520px;\n}\ni.flag.bg:before,\ni.flag.bulgaria:before {\n  background-position: 0 -546px;\n}\ni.flag.bahrain:before,\ni.flag.bh:before {\n  background-position: 0 -572px;\n}\ni.flag.bi:before,\ni.flag.burundi:before {\n  background-position: 0 -598px;\n}\ni.flag.benin:before,\ni.flag.bj:before {\n  background-position: 0 -624px;\n}\ni.flag.bermuda:before,\ni.flag.bm:before {\n  background-position: 0 -650px;\n}\ni.flag.bn:before,\ni.flag.brunei:before {\n  background-position: 0 -676px;\n}\ni.flag.bo:before,\ni.flag.bolivia:before {\n  background-position: 0 -702px;\n}\ni.flag.br:before,\ni.flag.brazil:before {\n  background-position: 0 -728px;\n}\ni.flag.bahamas:before,\ni.flag.bs:before {\n  background-position: 0 -754px;\n}\ni.flag.bhutan:before,\ni.flag.bt:before {\n  background-position: 0 -780px;\n}\ni.flag.bouvet.island:before,\ni.flag.bv:before {\n  background-position: 0 -806px;\n}\ni.flag.botswana:before,\ni.flag.bw:before {\n  background-position: 0 -832px;\n}\ni.flag.belarus:before,\ni.flag.by:before {\n  background-position: 0 -858px;\n}\ni.flag.belize:before,\ni.flag.bz:before {\n  background-position: 0 -884px;\n}\ni.flag.ca:before,\ni.flag.canada:before {\n  background-position: 0 -910px;\n}\ni.flag.cc:before,\ni.flag.cocos.islands:before {\n  background-position: 0 -962px;\n}\ni.flag.cd:before,\ni.flag.congo:before {\n  background-position: 0 -988px;\n}\ni.flag.central.african.republic:before,\ni.flag.cf:before {\n  background-position: 0 -1014px;\n}\ni.flag.cg:before,\ni.flag.congo.brazzaville:before {\n  background-position: 0 -1040px;\n}\ni.flag.ch:before,\ni.flag.switzerland:before {\n  background-position: 0 -1066px;\n}\ni.flag.ci:before,\ni.flag.cote.divoire:before {\n  background-position: 0 -1092px;\n}\ni.flag.ck:before,\ni.flag.cook.islands:before {\n  background-position: 0 -1118px;\n}\ni.flag.chile:before,\ni.flag.cl:before {\n  background-position: 0 -1144px;\n}\ni.flag.cameroon:before,\ni.flag.cm:before {\n  background-position: 0 -1170px;\n}\ni.flag.china:before,\ni.flag.cn:before {\n  background-position: 0 -1196px;\n}\ni.flag.co:before,\ni.flag.colombia:before {\n  background-position: 0 -1222px;\n}\ni.flag.costa.rica:before,\ni.flag.cr:before {\n  background-position: 0 -1248px;\n}\ni.flag.cs:before,\ni.flag.serbia:before {\n  background-position: 0 -1274px;\n}\ni.flag.cu:before,\ni.flag.cuba:before {\n  background-position: 0 -1300px;\n}\ni.flag.cape.verde:before,\ni.flag.cv:before {\n  background-position: 0 -1326px;\n}\ni.flag.christmas.island:before,\ni.flag.cx:before {\n  background-position: 0 -1352px;\n}\ni.flag.cy:before,\ni.flag.cyprus:before {\n  background-position: 0 -1378px;\n}\ni.flag.cz:before,\ni.flag.czech.republic:before {\n  background-position: 0 -1404px;\n}\ni.flag.de:before,\ni.flag.germany:before {\n  background-position: 0 -1430px;\n}\ni.flag.dj:before,\ni.flag.djibouti:before {\n  background-position: 0 -1456px;\n}\ni.flag.denmark:before,\ni.flag.dk:before {\n  background-position: 0 -1482px;\n}\ni.flag.dm:before,\ni.flag.dominica:before {\n  background-position: 0 -1508px;\n}\ni.flag.do:before,\ni.flag.dominican.republic:before {\n  background-position: 0 -1534px;\n}\ni.flag.algeria:before,\ni.flag.dz:before {\n  background-position: 0 -1560px;\n}\ni.flag.ec:before,\ni.flag.ecuador:before {\n  background-position: 0 -1586px;\n}\ni.flag.ee:before,\ni.flag.estonia:before {\n  background-position: 0 -1612px;\n}\ni.flag.eg:before,\ni.flag.egypt:before {\n  background-position: 0 -1638px;\n}\ni.flag.eh:before,\ni.flag.western.sahara:before {\n  background-position: 0 -1664px;\n}\ni.flag.er:before,\ni.flag.eritrea:before {\n  background-position: 0 -1716px;\n}\ni.flag.es:before,\ni.flag.spain:before {\n  background-position: 0 -1742px;\n}\ni.flag.et:before,\ni.flag.ethiopia:before {\n  background-position: 0 -1768px;\n}\ni.flag.eu:before,\ni.flag.european.union:before {\n  background-position: 0 -1794px;\n}\ni.flag.fi:before,\ni.flag.finland:before {\n  background-position: 0 -1846px;\n}\ni.flag.fiji:before,\ni.flag.fj:before {\n  background-position: 0 -1872px;\n}\ni.flag.falkland.islands:before,\ni.flag.fk:before {\n  background-position: 0 -1898px;\n}\ni.flag.fm:before,\ni.flag.micronesia:before {\n  background-position: 0 -1924px;\n}\ni.flag.faroe.islands:before,\ni.flag.fo:before {\n  background-position: 0 -1950px;\n}\ni.flag.fr:before,\ni.flag.france:before {\n  background-position: 0 -1976px;\n}\ni.flag.ga:before,\ni.flag.gabon:before {\n  background-position: -36px 0;\n}\ni.flag.gb:before,\ni.flag.united.kingdom:before {\n  background-position: -36px -26px;\n}\ni.flag.gd:before,\ni.flag.grenada:before {\n  background-position: -36px -52px;\n}\ni.flag.ge:before,\ni.flag.georgia:before {\n  background-position: -36px -78px;\n}\ni.flag.french.guiana:before,\ni.flag.gf:before {\n  background-position: -36px -104px;\n}\ni.flag.gh:before,\ni.flag.ghana:before {\n  background-position: -36px -130px;\n}\ni.flag.gi:before,\ni.flag.gibraltar:before {\n  background-position: -36px -156px;\n}\ni.flag.gl:before,\ni.flag.greenland:before {\n  background-position: -36px -182px;\n}\ni.flag.gambia:before,\ni.flag.gm:before {\n  background-position: -36px -208px;\n}\ni.flag.gn:before,\ni.flag.guinea:before {\n  background-position: -36px -234px;\n}\ni.flag.gp:before,\ni.flag.guadeloupe:before {\n  background-position: -36px -260px;\n}\ni.flag.equatorial.guinea:before,\ni.flag.gq:before {\n  background-position: -36px -286px;\n}\ni.flag.gr:before,\ni.flag.greece:before {\n  background-position: -36px -312px;\n}\ni.flag.gs:before,\ni.flag.sandwich.islands:before {\n  background-position: -36px -338px;\n}\ni.flag.gt:before,\ni.flag.guatemala:before {\n  background-position: -36px -364px;\n}\ni.flag.gu:before,\ni.flag.guam:before {\n  background-position: -36px -390px;\n}\ni.flag.guinea-bissau:before,\ni.flag.gw:before {\n  background-position: -36px -416px;\n}\ni.flag.guyana:before,\ni.flag.gy:before {\n  background-position: -36px -442px;\n}\ni.flag.hk:before,\ni.flag.hong.kong:before {\n  background-position: -36px -468px;\n}\ni.flag.heard.island:before,\ni.flag.hm:before {\n  background-position: -36px -494px;\n}\ni.flag.hn:before,\ni.flag.honduras:before {\n  background-position: -36px -520px;\n}\ni.flag.croatia:before,\ni.flag.hr:before {\n  background-position: -36px -546px;\n}\ni.flag.haiti:before,\ni.flag.ht:before {\n  background-position: -36px -572px;\n}\ni.flag.hu:before,\ni.flag.hungary:before {\n  background-position: -36px -598px;\n}\ni.flag.id:before,\ni.flag.indonesia:before {\n  background-position: -36px -624px;\n}\ni.flag.ie:before,\ni.flag.ireland:before {\n  background-position: -36px -650px;\n}\ni.flag.il:before,\ni.flag.israel:before {\n  background-position: -36px -676px;\n}\ni.flag.in:before,\ni.flag.india:before {\n  background-position: -36px -702px;\n}\ni.flag.indian.ocean.territory:before,\ni.flag.io:before {\n  background-position: -36px -728px;\n}\ni.flag.iq:before,\ni.flag.iraq:before {\n  background-position: -36px -754px;\n}\ni.flag.ir:before,\ni.flag.iran:before {\n  background-position: -36px -780px;\n}\ni.flag.iceland:before,\ni.flag.is:before {\n  background-position: -36px -806px;\n}\ni.flag.it:before,\ni.flag.italy:before {\n  background-position: -36px -832px;\n}\ni.flag.jamaica:before,\ni.flag.jm:before {\n  background-position: -36px -858px;\n}\ni.flag.jo:before,\ni.flag.jordan:before {\n  background-position: -36px -884px;\n}\ni.flag.japan:before,\ni.flag.jp:before {\n  background-position: -36px -910px;\n}\ni.flag.ke:before,\ni.flag.kenya:before {\n  background-position: -36px -936px;\n}\ni.flag.kg:before,\ni.flag.kyrgyzstan:before {\n  background-position: -36px -962px;\n}\ni.flag.cambodia:before,\ni.flag.kh:before {\n  background-position: -36px -988px;\n}\ni.flag.ki:before,\ni.flag.kiribati:before {\n  background-position: -36px -1014px;\n}\ni.flag.comoros:before,\ni.flag.km:before {\n  background-position: -36px -1040px;\n}\ni.flag.kn:before,\ni.flag.saint.kitts.and.nevis:before {\n  background-position: -36px -1066px;\n}\ni.flag.kp:before,\ni.flag.north.korea:before {\n  background-position: -36px -1092px;\n}\ni.flag.kr:before,\ni.flag.south.korea:before {\n  background-position: -36px -1118px;\n}\ni.flag.kuwait:before,\ni.flag.kw:before {\n  background-position: -36px -1144px;\n}\ni.flag.cayman.islands:before,\ni.flag.ky:before {\n  background-position: -36px -1170px;\n}\ni.flag.kazakhstan:before,\ni.flag.kz:before {\n  background-position: -36px -1196px;\n}\ni.flag.la:before,\ni.flag.laos:before {\n  background-position: -36px -1222px;\n}\ni.flag.lb:before,\ni.flag.lebanon:before {\n  background-position: -36px -1248px;\n}\ni.flag.lc:before,\ni.flag.saint.lucia:before {\n  background-position: -36px -1274px;\n}\ni.flag.li:before,\ni.flag.liechtenstein:before {\n  background-position: -36px -1300px;\n}\ni.flag.lk:before,\ni.flag.sri.lanka:before {\n  background-position: -36px -1326px;\n}\ni.flag.liberia:before,\ni.flag.lr:before {\n  background-position: -36px -1352px;\n}\ni.flag.lesotho:before,\ni.flag.ls:before {\n  background-position: -36px -1378px;\n}\ni.flag.lithuania:before,\ni.flag.lt:before {\n  background-position: -36px -1404px;\n}\ni.flag.lu:before,\ni.flag.luxembourg:before {\n  background-position: -36px -1430px;\n}\ni.flag.latvia:before,\ni.flag.lv:before {\n  background-position: -36px -1456px;\n}\ni.flag.libya:before,\ni.flag.ly:before {\n  background-position: -36px -1482px;\n}\ni.flag.ma:before,\ni.flag.morocco:before {\n  background-position: -36px -1508px;\n}\ni.flag.mc:before,\ni.flag.monaco:before {\n  background-position: -36px -1534px;\n}\ni.flag.md:before,\ni.flag.moldova:before {\n  background-position: -36px -1560px;\n}\ni.flag.me:before,\ni.flag.montenegro:before {\n  background-position: -36px -1586px;\n}\ni.flag.madagascar:before,\ni.flag.mg:before {\n  background-position: -36px -1613px;\n}\ni.flag.marshall.islands:before,\ni.flag.mh:before {\n  background-position: -36px -1639px;\n}\ni.flag.macedonia:before,\ni.flag.mk:before {\n  background-position: -36px -1665px;\n}\ni.flag.mali:before,\ni.flag.ml:before {\n  background-position: -36px -1691px;\n}\ni.flag.burma:before,\ni.flag.mm:before,\ni.flag.myanmar:before {\n  background-position: -36px -1717px;\n}\ni.flag.mn:before,\ni.flag.mongolia:before {\n  background-position: -36px -1743px;\n}\ni.flag.macau:before,\ni.flag.mo:before {\n  background-position: -36px -1769px;\n}\ni.flag.mp:before,\ni.flag.northern.mariana.islands:before {\n  background-position: -36px -1795px;\n}\ni.flag.martinique:before,\ni.flag.mq:before {\n  background-position: -36px -1821px;\n}\ni.flag.mauritania:before,\ni.flag.mr:before {\n  background-position: -36px -1847px;\n}\ni.flag.montserrat:before,\ni.flag.ms:before {\n  background-position: -36px -1873px;\n}\ni.flag.malta:before,\ni.flag.mt:before {\n  background-position: -36px -1899px;\n}\ni.flag.mauritius:before,\ni.flag.mu:before {\n  background-position: -36px -1925px;\n}\ni.flag.maldives:before,\ni.flag.mv:before {\n  background-position: -36px -1951px;\n}\ni.flag.malawi:before,\ni.flag.mw:before {\n  background-position: -36px -1977px;\n}\ni.flag.mexico:before,\ni.flag.mx:before {\n  background-position: -72px 0;\n}\ni.flag.malaysia:before,\ni.flag.my:before {\n  background-position: -72px -26px;\n}\ni.flag.mozambique:before,\ni.flag.mz:before {\n  background-position: -72px -52px;\n}\ni.flag.na:before,\ni.flag.namibia:before {\n  background-position: -72px -78px;\n}\ni.flag.nc:before,\ni.flag.new.caledonia:before {\n  background-position: -72px -104px;\n}\ni.flag.ne:before,\ni.flag.niger:before {\n  background-position: -72px -130px;\n}\ni.flag.nf:before,\ni.flag.norfolk.island:before {\n  background-position: -72px -156px;\n}\ni.flag.ng:before,\ni.flag.nigeria:before {\n  background-position: -72px -182px;\n}\ni.flag.ni:before,\ni.flag.nicaragua:before {\n  background-position: -72px -208px;\n}\ni.flag.netherlands:before,\ni.flag.nl:before {\n  background-position: -72px -234px;\n}\ni.flag.no:before,\ni.flag.norway:before {\n  background-position: -72px -260px;\n}\ni.flag.nepal:before,\ni.flag.np:before {\n  background-position: -72px -286px;\n}\ni.flag.nauru:before,\ni.flag.nr:before {\n  background-position: -72px -312px;\n}\ni.flag.niue:before,\ni.flag.nu:before {\n  background-position: -72px -338px;\n}\ni.flag.new.zealand:before,\ni.flag.nz:before {\n  background-position: -72px -364px;\n}\ni.flag.om:before,\ni.flag.oman:before {\n  background-position: -72px -390px;\n}\ni.flag.pa:before,\ni.flag.panama:before {\n  background-position: -72px -416px;\n}\ni.flag.pe:before,\ni.flag.peru:before {\n  background-position: -72px -442px;\n}\ni.flag.french.polynesia:before,\ni.flag.pf:before {\n  background-position: -72px -468px;\n}\ni.flag.new.guinea:before,\ni.flag.pg:before {\n  background-position: -72px -494px;\n}\ni.flag.ph:before,\ni.flag.philippines:before {\n  background-position: -72px -520px;\n}\ni.flag.pakistan:before,\ni.flag.pk:before {\n  background-position: -72px -546px;\n}\ni.flag.pl:before,\ni.flag.poland:before {\n  background-position: -72px -572px;\n}\ni.flag.pm:before,\ni.flag.saint.pierre:before {\n  background-position: -72px -598px;\n}\ni.flag.pitcairn.islands:before,\ni.flag.pn:before {\n  background-position: -72px -624px;\n}\ni.flag.pr:before,\ni.flag.puerto.rico:before {\n  background-position: -72px -650px;\n}\ni.flag.palestine:before,\ni.flag.ps:before {\n  background-position: -72px -676px;\n}\ni.flag.portugal:before,\ni.flag.pt:before {\n  background-position: -72px -702px;\n}\ni.flag.palau:before,\ni.flag.pw:before {\n  background-position: -72px -728px;\n}\ni.flag.paraguay:before,\ni.flag.py:before {\n  background-position: -72px -754px;\n}\ni.flag.qa:before,\ni.flag.qatar:before {\n  background-position: -72px -780px;\n}\ni.flag.re:before,\ni.flag.reunion:before {\n  background-position: -72px -806px;\n}\ni.flag.ro:before,\ni.flag.romania:before {\n  background-position: -72px -832px;\n}\ni.flag.rs:before,\ni.flag.serbia:before {\n  background-position: -72px -858px;\n}\ni.flag.ru:before,\ni.flag.russia:before {\n  background-position: -72px -884px;\n}\ni.flag.rw:before,\ni.flag.rwanda:before {\n  background-position: -72px -910px;\n}\ni.flag.sa:before,\ni.flag.saudi.arabia:before {\n  background-position: -72px -936px;\n}\ni.flag.sb:before,\ni.flag.solomon.islands:before {\n  background-position: -72px -962px;\n}\ni.flag.sc:before,\ni.flag.seychelles:before {\n  background-position: -72px -988px;\n}\ni.flag.gb.sct:before,\ni.flag.scotland:before {\n  background-position: -72px -1014px;\n}\ni.flag.sd:before,\ni.flag.sudan:before {\n  background-position: -72px -1040px;\n}\ni.flag.se:before,\ni.flag.sweden:before {\n  background-position: -72px -1066px;\n}\ni.flag.sg:before,\ni.flag.singapore:before {\n  background-position: -72px -1092px;\n}\ni.flag.saint.helena:before,\ni.flag.sh:before {\n  background-position: -72px -1118px;\n}\ni.flag.si:before,\ni.flag.slovenia:before {\n  background-position: -72px -1144px;\n}\ni.flag.jan.mayen:before,\ni.flag.sj:before,\ni.flag.svalbard:before {\n  background-position: -72px -1170px;\n}\ni.flag.sk:before,\ni.flag.slovakia:before {\n  background-position: -72px -1196px;\n}\ni.flag.sierra.leone:before,\ni.flag.sl:before {\n  background-position: -72px -1222px;\n}\ni.flag.san.marino:before,\ni.flag.sm:before {\n  background-position: -72px -1248px;\n}\ni.flag.senegal:before,\ni.flag.sn:before {\n  background-position: -72px -1274px;\n}\ni.flag.so:before,\ni.flag.somalia:before {\n  background-position: -72px -1300px;\n}\ni.flag.sr:before,\ni.flag.suriname:before {\n  background-position: -72px -1326px;\n}\ni.flag.sao.tome:before,\ni.flag.st:before {\n  background-position: -72px -1352px;\n}\ni.flag.el.salvador:before,\ni.flag.sv:before {\n  background-position: -72px -1378px;\n}\ni.flag.sy:before,\ni.flag.syria:before {\n  background-position: -72px -1404px;\n}\ni.flag.swaziland:before,\ni.flag.sz:before {\n  background-position: -72px -1430px;\n}\ni.flag.caicos.islands:before,\ni.flag.tc:before {\n  background-position: -72px -1456px;\n}\ni.flag.chad:before,\ni.flag.td:before {\n  background-position: -72px -1482px;\n}\ni.flag.french.territories:before,\ni.flag.tf:before {\n  background-position: -72px -1508px;\n}\ni.flag.tg:before,\ni.flag.togo:before {\n  background-position: -72px -1534px;\n}\ni.flag.th:before,\ni.flag.thailand:before {\n  background-position: -72px -1560px;\n}\ni.flag.tajikistan:before,\ni.flag.tj:before {\n  background-position: -72px -1586px;\n}\ni.flag.tk:before,\ni.flag.tokelau:before {\n  background-position: -72px -1612px;\n}\ni.flag.timorleste:before,\ni.flag.tl:before {\n  background-position: -72px -1638px;\n}\ni.flag.tm:before,\ni.flag.turkmenistan:before {\n  background-position: -72px -1664px;\n}\ni.flag.tn:before,\ni.flag.tunisia:before {\n  background-position: -72px -1690px;\n}\ni.flag.to:before,\ni.flag.tonga:before {\n  background-position: -72px -1716px;\n}\ni.flag.tr:before,\ni.flag.turkey:before {\n  background-position: -72px -1742px;\n}\ni.flag.trinidad:before,\ni.flag.tt:before {\n  background-position: -72px -1768px;\n}\ni.flag.tuvalu:before,\ni.flag.tv:before {\n  background-position: -72px -1794px;\n}\ni.flag.taiwan:before,\ni.flag.tw:before {\n  background-position: -72px -1820px;\n}\ni.flag.tanzania:before,\ni.flag.tz:before {\n  background-position: -72px -1846px;\n}\ni.flag.ua:before,\ni.flag.ukraine:before {\n  background-position: -72px -1872px;\n}\ni.flag.ug:before,\ni.flag.uganda:before {\n  background-position: -72px -1898px;\n}\ni.flag.um:before,\ni.flag.us.minor.islands:before {\n  background-position: -72px -1924px;\n}\ni.flag.america:before,\ni.flag.united.states:before,\ni.flag.us:before {\n  background-position: -72px -1950px;\n}\ni.flag.uruguay:before,\ni.flag.uy:before {\n  background-position: -72px -1976px;\n}\ni.flag.uz:before,\ni.flag.uzbekistan:before {\n  background-position: -108px 0;\n}\ni.flag.va:before,\ni.flag.vatican.city:before {\n  background-position: -108px -26px;\n}\ni.flag.saint.vincent:before,\ni.flag.vc:before {\n  background-position: -108px -52px;\n}\ni.flag.ve:before,\ni.flag.venezuela:before {\n  background-position: -108px -78px;\n}\ni.flag.british.virgin.islands:before,\ni.flag.vg:before {\n  background-position: -108px -104px;\n}\ni.flag.us.virgin.islands:before,\ni.flag.vi:before {\n  background-position: -108px -130px;\n}\ni.flag.vietnam:before,\ni.flag.vn:before {\n  background-position: -108px -156px;\n}\ni.flag.vanuatu:before,\ni.flag.vu:before {\n  background-position: -108px -182px;\n}\ni.flag.gb.wls:before,\ni.flag.wales:before {\n  background-position: -108px -208px;\n}\ni.flag.wallis.and.futuna:before,\ni.flag.wf:before {\n  background-position: -108px -234px;\n}\ni.flag.samoa:before,\ni.flag.ws:before {\n  background-position: -108px -260px;\n}\ni.flag.ye:before,\ni.flag.yemen:before {\n  background-position: -108px -286px;\n}\ni.flag.mayotte:before,\ni.flag.yt:before {\n  background-position: -108px -312px;\n}\ni.flag.south.africa:before,\ni.flag.za:before {\n  background-position: -108px -338px;\n}\ni.flag.zambia:before,\ni.flag.zm:before {\n  background-position: -108px -364px;\n}\ni.flag.zimbabwe:before,\ni.flag.zw:before {\n  background-position: -108px -390px;\n}\n.ui.header {\n  border: none;\n  margin: calc(2rem - .14285em) 0 1rem;\n  padding: 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 700;\n  line-height: 1.2857em;\n  text-transform: none;\n  color: rgba(0,0,0,.87);\n}\n.ui.header:first-child {\n  margin-top: -.14285em;\n}\n.ui.header:last-child {\n  margin-bottom: 0;\n}\n.ui.header .sub.header {\n  display: block;\n  font-weight: 400;\n  padding: 0;\n  margin: 0;\n  line-height: 1.2em;\n  color: rgba(0,0,0,.6);\n}\n.ui.header>.icon {\n  display: table-cell;\n  opacity: 1;\n  font-size: 1.5em;\n  padding-top: .14285em;\n  vertical-align: middle;\n}\n.ui.header .icon:only-child {\n  display: inline-block;\n  padding: 0;\n  margin-right: .75rem;\n}\n.ui.header>.image,\n.ui.header>img {\n  display: inline-block;\n  margin-top: .14285em;\n  width: 2.5em;\n  height: auto;\n  vertical-align: middle;\n}\n.ui.header>.image:only-child,\n.ui.header>img:only-child {\n  margin-right: .75rem;\n}\n.ui.header .content {\n  display: inline-block;\n  vertical-align: top;\n}\n.ui.header>.image+.content,\n.ui.header>img+.content {\n  padding-left: .75rem;\n  vertical-align: middle;\n}\n.ui.header>.icon+.content {\n  padding-left: .75rem;\n  display: table-cell;\n  vertical-align: middle;\n}\n.ui.header .ui.label {\n  font-size: '';\n  margin-left: .5rem;\n  vertical-align: middle;\n}\n.ui.header+p {\n  margin-top: 0;\n}\nh1.ui.header {\n  font-size: 2rem;\n}\nh2.ui.header {\n  font-size: 1.714rem;\n}\nh3.ui.header {\n  font-size: 1.28rem;\n}\nh4.ui.header {\n  font-size: 1.071rem;\n}\nh5.ui.header {\n  font-size: 1rem;\n}\nh1.ui.header .sub.header,\nh2.ui.header .sub.header {\n  font-size: 1.14285714rem;\n}\nh3.ui.header .sub.header,\nh4.ui.header .sub.header {\n  font-size: 1rem;\n}\nh5.ui.header .sub.header {\n  font-size: .92857143rem;\n}\n.ui.huge.header {\n  min-height: 1em;\n  font-size: 2em;\n}\n.ui.large.header {\n  font-size: 1.714em;\n}\n.ui.medium.header {\n  font-size: 1.28em;\n}\n.ui.small.header {\n  font-size: 1.071em;\n}\n.ui.tiny.header {\n  font-size: 1em;\n}\n.ui.huge.header .sub.header,\n.ui.large.header .sub.header {\n  font-size: 1.14285714rem;\n}\n.ui.header .sub.header,\n.ui.small.header .sub.header {\n  font-size: 1rem;\n}\n.ui.tiny.header .sub.header {\n  font-size: .92857143rem;\n}\n.ui.small.sub.header {\n  font-size: .78571429em;\n}\n.ui.sub.header {\n  padding: 0;\n  margin-bottom: .14285714rem;\n  font-weight: 700;\n  text-transform: uppercase;\n  color: '';\n  font-size: .85714286em;\n}\n.ui.large.sub.header {\n  font-size: .92857143em;\n}\n.ui.huge.sub.header {\n  font-size: 1em;\n}\n.ui.icon.header {\n  display: inline-block;\n  text-align: center;\n  margin: 2rem 0 1rem;\n}\n.ui.icon.header:after {\n  content: '';\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.ui.icon.header:first-child {\n  margin-top: 0;\n}\n.ui.icon.header .icon {\n  float: none;\n  display: block;\n  width: auto;\n  height: auto;\n  line-height: 1;\n  padding: 0;\n  font-size: 3em;\n  margin: 0 auto .5rem;\n  opacity: 1;\n}\n.ui.icon.header .content {\n  display: block;\n  padding: 0;\n}\n.ui.icon.header .circular.icon,\n.ui.icon.header .square.icon {\n  font-size: 2em;\n}\n.ui.block.icon.header .icon {\n  margin-bottom: 0;\n}\n.ui.icon.header.aligned {\n  margin-left: auto;\n  margin-right: auto;\n  display: block;\n}\n.ui.disabled.header {\n  opacity: .45;\n}\n.ui.inverted.header {\n  color: #FFF;\n}\n.ui.inverted.header .sub.header {\n  color: rgba(255,255,255,.8);\n}\n.ui.inverted.attached.header {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) #545454;\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) #545454;\n  box-shadow: none;\n  border-color: transparent;\n}\n.ui.inverted.block.header {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) #545454;\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) #545454;\n  box-shadow: none;\n  border-bottom: none;\n}\n.ui.red.header {\n  color: #DB2828!important;\n}\na.ui.red.header:hover {\n  color: #d01919!important;\n}\n.ui.red.dividing.header {\n  border-bottom: 2px solid #DB2828;\n}\n.ui.inverted.red.header {\n  color: #FF695E!important;\n}\na.ui.inverted.red.header:hover {\n  color: #ff5144!important;\n}\n.ui.orange.header {\n  color: #F2711C!important;\n}\na.ui.orange.header:hover {\n  color: #f26202!important;\n}\n.ui.orange.dividing.header {\n  border-bottom: 2px solid #F2711C;\n}\n.ui.inverted.orange.header {\n  color: #FF851B!important;\n}\na.ui.inverted.orange.header:hover {\n  color: #ff7701!important;\n}\n.ui.olive.header {\n  color: #B5CC18!important;\n}\na.ui.olive.header:hover {\n  color: #a7bd0d!important;\n}\n.ui.olive.dividing.header {\n  border-bottom: 2px solid #B5CC18;\n}\n.ui.inverted.olive.header {\n  color: #D9E778!important;\n}\na.ui.inverted.olive.header:hover {\n  color: #d8ea5c!important;\n}\n.ui.yellow.header {\n  color: #FBBD08!important;\n}\na.ui.yellow.header:hover {\n  color: #eaae00!important;\n}\n.ui.yellow.dividing.header {\n  border-bottom: 2px solid #FBBD08;\n}\n.ui.inverted.yellow.header {\n  color: #FFE21F!important;\n}\na.ui.inverted.yellow.header:hover {\n  color: #ffdf05!important;\n}\n.ui.green.header {\n  color: #21BA45!important;\n}\na.ui.green.header:hover {\n  color: #16ab39!important;\n}\n.ui.green.dividing.header {\n  border-bottom: 2px solid #21BA45;\n}\n.ui.inverted.green.header {\n  color: #2ECC40!important;\n}\na.ui.inverted.green.header:hover {\n  color: #22be34!important;\n}\n.ui.teal.header {\n  color: #00B5AD!important;\n}\na.ui.teal.header:hover {\n  color: #009c95!important;\n}\n.ui.teal.dividing.header {\n  border-bottom: 2px solid #00B5AD;\n}\n.ui.inverted.teal.header {\n  color: #6DFFFF!important;\n}\na.ui.inverted.teal.header:hover {\n  color: #54ffff!important;\n}\n.ui.blue.header {\n  color: #2185D0!important;\n}\na.ui.blue.header:hover {\n  color: #1678c2!important;\n}\n.ui.blue.dividing.header {\n  border-bottom: 2px solid #2185D0;\n}\n.ui.inverted.blue.header {\n  color: #54C8FF!important;\n}\na.ui.inverted.blue.header:hover {\n  color: #3ac0ff!important;\n}\n.ui.violet.header {\n  color: #6435C9!important;\n}\na.ui.violet.header:hover {\n  color: #5829bb!important;\n}\n.ui.violet.dividing.header {\n  border-bottom: 2px solid #6435C9;\n}\n.ui.inverted.violet.header {\n  color: #A291FB!important;\n}\na.ui.inverted.violet.header:hover {\n  color: #8a73ff!important;\n}\n.ui.purple.header {\n  color: #A333C8!important;\n}\na.ui.purple.header:hover {\n  color: #9627ba!important;\n}\n.ui.purple.dividing.header {\n  border-bottom: 2px solid #A333C8;\n}\n.ui.inverted.purple.header {\n  color: #DC73FF!important;\n}\na.ui.inverted.purple.header:hover {\n  color: #d65aff!important;\n}\n.ui.pink.header {\n  color: #E03997!important;\n}\na.ui.pink.header:hover {\n  color: #e61a8d!important;\n}\n.ui.pink.dividing.header {\n  border-bottom: 2px solid #E03997;\n}\n.ui.inverted.pink.header {\n  color: #FF8EDF!important;\n}\na.ui.inverted.pink.header:hover {\n  color: #ff74d8!important;\n}\n.ui.brown.header {\n  color: #A5673F!important;\n}\na.ui.brown.header:hover {\n  color: #975b33!important;\n}\n.ui.brown.dividing.header {\n  border-bottom: 2px solid #A5673F;\n}\n.ui.inverted.brown.header {\n  color: #D67C1C!important;\n}\na.ui.inverted.brown.header:hover {\n  color: #c86f11!important;\n}\n.ui.grey.header {\n  color: #767676!important;\n}\na.ui.grey.header:hover {\n  color: #838383!important;\n}\n.ui.grey.dividing.header {\n  border-bottom: 2px solid #767676;\n}\n.ui.inverted.grey.header {\n  color: #DCDDDE!important;\n}\na.ui.inverted.grey.header:hover {\n  color: #cfd0d2!important;\n}\n.ui.left.aligned.header {\n  text-align: left;\n}\n.ui.right.aligned.header {\n  text-align: right;\n}\n.ui.center.aligned.header,\n.ui.centered.header {\n  text-align: center;\n}\n.ui.justified.header {\n  text-align: justify;\n}\n.ui.justified.header:after {\n  display: inline-block;\n  content: '';\n  width: 100%;\n}\n.ui.floated.header,\n.ui[class*=\"left floated\"].header {\n  float: left;\n  margin-top: 0;\n  margin-right: .5em;\n}\n.ui[class*=\"right floated\"].header {\n  float: right;\n  margin-top: 0;\n  margin-left: .5em;\n}\n.ui.fitted.header {\n  padding: 0;\n}\n.ui.dividing.header {\n  padding-bottom: .21428571rem;\n  border-bottom: 1px solid rgba(34,36,38,.15);\n}\n.ui.dividing.header .sub.header {\n  padding-bottom: .21428571rem;\n}\n.ui.dividing.header .icon {\n  margin-bottom: 0;\n}\n.ui.inverted.dividing.header {\n  border-bottom-color: rgba(255,255,255,.1);\n}\n.ui.block.header {\n  background: #F3F4F5;\n  padding: .78571429rem 1rem;\n  box-shadow: none;\n  border: 1px solid #D4D4D5;\n  border-radius: .28571429rem;\n}\n.ui.tiny.block.header {\n  font-size: .85714286rem;\n}\n.ui.small.block.header {\n  font-size: .92857143rem;\n}\n.ui.block.header:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {\n  font-size: 1rem;\n}\n.ui.large.block.header {\n  font-size: 1.14285714rem;\n}\n.ui.huge.block.header {\n  font-size: 1.42857143rem;\n}\n.ui.attached.header {\n  background: #FFF;\n  padding: .78571429rem 1rem;\n  margin-left: -1px;\n  margin-right: -1px;\n  box-shadow: none;\n  border: 1px solid #D4D4D5;\n}\n.ui.attached.block.header {\n  background: #F3F4F5;\n}\n.ui.attached:not(.top):not(.bottom).header {\n  margin-top: 0;\n  margin-bottom: 0;\n  border-top: none;\n  border-radius: 0;\n}\n.ui.top.attached.header {\n  margin-bottom: 0;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.bottom.attached.header {\n  margin-top: 0;\n  border-top: none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.tiny.attached.header {\n  font-size: .85714286em;\n}\n.ui.small.attached.header {\n  font-size: .92857143em;\n}\n.ui.attached.header:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {\n  font-size: 1em;\n}\n.ui.large.attached.header {\n  font-size: 1.14285714em;\n}\n.ui.huge.attached.header {\n  font-size: 1.42857143em;\n}\n.ui.header:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6) {\n  font-size: 1.28em;\n}\n@font-face {\n  font-family: Icons;\n  src: url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.eot);\n  src: url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.eot?#iefix) format('embedded-opentype'),url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.woff2) format('woff2'),url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.woff) format('woff'),url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.ttf) format('truetype'),url(node_modules/semantic-ui-css/themes/default/assets/fonts/icons.svg#icons) format('svg');\n  font-style: normal;\n  font-weight: 400;\n  font-variant: normal;\n  text-decoration: inherit;\n  text-transform: none;\n}\ni.icon {\n  display: inline-block;\n  opacity: 1;\n  margin: 0 .25rem 0 0;\n  width: 1.18em;\n  height: 1em;\n  font-family: Icons;\n  font-style: normal;\n  font-weight: 400;\n  text-decoration: inherit;\n  text-align: center;\n  speak: none;\n  font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  -webkit-font-smoothing: antialiased;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\ni.icon:before {\n  background: 0 0!important;\n}\ni.icon.loading {\n  height: 1em;\n  line-height: 1;\n  -webkit-animation: icon-loading 2s linear infinite;\n  animation: icon-loading 2s linear infinite;\n}\n@-webkit-keyframes icon-loading {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes icon-loading {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\ni.emphasized.icon,\ni.icon.active,\ni.icon.hover {\n  opacity: 1!important;\n}\ni.disabled.icon {\n  opacity: .45!important;\n}\ni.fitted.icon {\n  width: auto;\n  margin: 0;\n}\ni.link.icon,\ni.link.icons {\n  cursor: pointer;\n  opacity: .8;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\ni.link.icon:hover,\ni.link.icons:hover {\n  opacity: 1!important;\n}\ni.circular.icon {\n  border-radius: 500em!important;\n  line-height: 1!important;\n  padding: .5em!important;\n  box-shadow: 0 0 0 .1em rgba(0,0,0,.1) inset;\n  width: 2em!important;\n  height: 2em!important;\n}\ni.circular.inverted.icon {\n  border: none;\n  box-shadow: none;\n}\ni.flipped.icon,\ni.horizontally.flipped.icon {\n  -webkit-transform: scale(-1,1);\n  -ms-transform: scale(-1,1);\n  transform: scale(-1,1);\n}\ni.vertically.flipped.icon {\n  -webkit-transform: scale(1,-1);\n  -ms-transform: scale(1,-1);\n  transform: scale(1,-1);\n}\ni.clockwise.rotated.icon,\ni.right.rotated.icon,\ni.rotated.icon {\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\ni.counterclockwise.rotated.icon,\ni.left.rotated.icon {\n  -webkit-transform: rotate(-90deg);\n  -ms-transform: rotate(-90deg);\n  transform: rotate(-90deg);\n}\ni.bordered.icon {\n  line-height: 1;\n  vertical-align: baseline;\n  width: 2em;\n  height: 2em;\n  padding: .5em .41em!important;\n  box-shadow: 0 0 0 .1em rgba(0,0,0,.1) inset;\n}\ni.bordered.inverted.icon {\n  border: none;\n  box-shadow: none;\n}\ni.inverted.bordered.icon,\ni.inverted.circular.icon {\n  background-color: #1B1C1D!important;\n  color: #FFF!important;\n}\ni.inverted.icon {\n  color: #FFF;\n}\ni.red.icon {\n  color: #DB2828!important;\n}\ni.inverted.red.icon {\n  color: #FF695E!important;\n}\ni.inverted.bordered.red.icon,\ni.inverted.circular.red.icon {\n  background-color: #DB2828!important;\n  color: #FFF!important;\n}\ni.orange.icon {\n  color: #F2711C!important;\n}\ni.inverted.orange.icon {\n  color: #FF851B!important;\n}\ni.inverted.bordered.orange.icon,\ni.inverted.circular.orange.icon {\n  background-color: #F2711C!important;\n  color: #FFF!important;\n}\ni.yellow.icon {\n  color: #FBBD08!important;\n}\ni.inverted.yellow.icon {\n  color: #FFE21F!important;\n}\ni.inverted.bordered.yellow.icon,\ni.inverted.circular.yellow.icon {\n  background-color: #FBBD08!important;\n  color: #FFF!important;\n}\ni.olive.icon {\n  color: #B5CC18!important;\n}\ni.inverted.olive.icon {\n  color: #D9E778!important;\n}\ni.inverted.bordered.olive.icon,\ni.inverted.circular.olive.icon {\n  background-color: #B5CC18!important;\n  color: #FFF!important;\n}\ni.green.icon {\n  color: #21BA45!important;\n}\ni.inverted.green.icon {\n  color: #2ECC40!important;\n}\ni.inverted.bordered.green.icon,\ni.inverted.circular.green.icon {\n  background-color: #21BA45!important;\n  color: #FFF!important;\n}\ni.teal.icon {\n  color: #00B5AD!important;\n}\ni.inverted.teal.icon {\n  color: #6DFFFF!important;\n}\ni.inverted.bordered.teal.icon,\ni.inverted.circular.teal.icon {\n  background-color: #00B5AD!important;\n  color: #FFF!important;\n}\ni.blue.icon {\n  color: #2185D0!important;\n}\ni.inverted.blue.icon {\n  color: #54C8FF!important;\n}\ni.inverted.bordered.blue.icon,\ni.inverted.circular.blue.icon {\n  background-color: #2185D0!important;\n  color: #FFF!important;\n}\ni.violet.icon {\n  color: #6435C9!important;\n}\ni.inverted.violet.icon {\n  color: #A291FB!important;\n}\ni.inverted.bordered.violet.icon,\ni.inverted.circular.violet.icon {\n  background-color: #6435C9!important;\n  color: #FFF!important;\n}\ni.purple.icon {\n  color: #A333C8!important;\n}\ni.inverted.purple.icon {\n  color: #DC73FF!important;\n}\ni.inverted.bordered.purple.icon,\ni.inverted.circular.purple.icon {\n  background-color: #A333C8!important;\n  color: #FFF!important;\n}\ni.pink.icon {\n  color: #E03997!important;\n}\ni.inverted.pink.icon {\n  color: #FF8EDF!important;\n}\ni.inverted.bordered.pink.icon,\ni.inverted.circular.pink.icon {\n  background-color: #E03997!important;\n  color: #FFF!important;\n}\ni.brown.icon {\n  color: #A5673F!important;\n}\ni.inverted.brown.icon {\n  color: #D67C1C!important;\n}\ni.inverted.bordered.brown.icon,\ni.inverted.circular.brown.icon {\n  background-color: #A5673F!important;\n  color: #FFF!important;\n}\ni.grey.icon {\n  color: #767676!important;\n}\ni.inverted.grey.icon {\n  color: #DCDDDE!important;\n}\ni.inverted.bordered.grey.icon,\ni.inverted.circular.grey.icon {\n  background-color: #767676!important;\n  color: #FFF!important;\n}\ni.black.icon {\n  color: #1B1C1D!important;\n}\ni.inverted.black.icon {\n  color: #545454!important;\n}\ni.inverted.bordered.black.icon,\ni.inverted.circular.black.icon {\n  background-color: #1B1C1D!important;\n  color: #FFF!important;\n}\ni.mini.icon,\ni.mini.icons {\n  line-height: 1;\n  font-size: .4em;\n}\ni.tiny.icon,\ni.tiny.icons {\n  line-height: 1;\n  font-size: .5em;\n}\ni.small.icon,\ni.small.icons {\n  line-height: 1;\n  font-size: .75em;\n}\ni.icon,\ni.icons {\n  font-size: 1em;\n}\ni.large.icon,\ni.large.icons {\n  line-height: 1;\n  vertical-align: middle;\n  font-size: 1.5em;\n}\ni.big.icon,\ni.big.icons {\n  line-height: 1;\n  vertical-align: middle;\n  font-size: 2em;\n}\ni.huge.icon,\ni.huge.icons {\n  line-height: 1;\n  vertical-align: middle;\n  font-size: 4em;\n}\ni.massive.icon,\ni.massive.icons {\n  line-height: 1;\n  vertical-align: middle;\n  font-size: 8em;\n}\ni.icons {\n  display: inline-block;\n  position: relative;\n  line-height: 1;\n}\ni.icons .icon {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n  -ms-transform: translateX(-50%) translateY(-50%);\n  transform: translateX(-50%) translateY(-50%);\n  margin: 0;\n}\ni.icons .icon:first-child {\n  position: static;\n  width: auto;\n  height: auto;\n  vertical-align: top;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  margin-right: .25rem;\n}\ni.icons .corner.icon {\n  top: auto;\n  left: auto;\n  right: 0;\n  bottom: 0;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  font-size: .45em;\n  text-shadow: -1px -1px 0 #FFF,1px -1px 0 #FFF,-1px 1px 0 #FFF,1px 1px 0 #FFF;\n}\ni.icons .inverted.corner.icon {\n  text-shadow: -1px -1px 0 #1B1C1D,1px -1px 0 #1B1C1D,-1px 1px 0 #1B1C1D,1px 1px 0 #1B1C1D;\n}\ni.icon.search:before {\n  content: \"\\f002\";\n}\ni.icon.mail.outline:before {\n  content: \"\\f003\";\n}\ni.icon.signal:before {\n  content: \"\\f012\";\n}\ni.icon.setting:before {\n  content: \"\\f013\";\n}\ni.icon.home:before {\n  content: \"\\f015\";\n}\ni.icon.inbox:before {\n  content: \"\\f01c\";\n}\ni.icon.browser:before {\n  content: \"\\f022\";\n}\ni.icon.tag:before {\n  content: \"\\f02b\";\n}\ni.icon.tags:before {\n  content: \"\\f02c\";\n}\ni.icon.image:before {\n  content: \"\\f03e\";\n}\ni.icon.calendar:before {\n  content: \"\\f073\";\n}\ni.icon.comment:before {\n  content: \"\\f075\";\n}\ni.icon.shop:before {\n  content: \"\\f07a\";\n}\ni.icon.privacy:before {\n  content: \"\\f084\";\n}\ni.icon.settings:before {\n  content: \"\\f085\";\n}\ni.icon.comments:before {\n  content: \"\\f086\";\n}\ni.icon.external:before {\n  content: \"\\f08e\";\n}\ni.icon.trophy:before {\n  content: \"\\f091\";\n}\ni.icon.payment:before {\n  content: \"\\f09d\";\n}\ni.icon.feed:before {\n  content: \"\\f09e\";\n}\ni.icon.alarm.outline:before {\n  content: \"\\f0a2\";\n}\ni.icon.tasks:before {\n  content: \"\\f0ae\";\n}\ni.icon.cloud:before {\n  content: \"\\f0c2\";\n}\ni.icon.lab:before {\n  content: \"\\f0c3\";\n}\ni.icon.mail:before {\n  content: \"\\f0e0\";\n}\ni.icon.dashboard:before {\n  content: \"\\f0e4\";\n}\ni.icon.comment.outline:before {\n  content: \"\\f0e5\";\n}\ni.icon.comments.outline:before {\n  content: \"\\f0e6\";\n}\ni.icon.sitemap:before {\n  content: \"\\f0e8\";\n}\ni.icon.idea:before {\n  content: \"\\f0eb\";\n}\ni.icon.alarm:before {\n  content: \"\\f0f3\";\n}\ni.icon.terminal:before {\n  content: \"\\f120\";\n}\ni.icon.code:before {\n  content: \"\\f121\";\n}\ni.icon.protect:before {\n  content: \"\\f132\";\n}\ni.icon.calendar.outline:before {\n  content: \"\\f133\";\n}\ni.icon.ticket:before {\n  content: \"\\f145\";\n}\ni.icon.external.square:before {\n  content: \"\\f14c\";\n}\ni.icon.bug:before {\n  content: \"\\f188\";\n}\ni.icon.mail.square:before {\n  content: \"\\f199\";\n}\ni.icon.history:before {\n  content: \"\\f1da\";\n}\ni.icon.options:before {\n  content: \"\\f1de\";\n}\ni.icon.text.telephone:before {\n  content: \"\\f1e4\";\n}\ni.icon.find:before {\n  content: \"\\f1e5\";\n}\ni.icon.wifi:before {\n  content: \"\\f1eb\";\n}\ni.icon.alarm.mute:before {\n  content: \"\\f1f6\";\n}\ni.icon.alarm.mute.outline:before {\n  content: \"\\f1f7\";\n}\ni.icon.copyright:before {\n  content: \"\\f1f9\";\n}\ni.icon.at:before {\n  content: \"\\f1fa\";\n}\ni.icon.eyedropper:before {\n  content: \"\\f1fb\";\n}\ni.icon.paint.brush:before {\n  content: \"\\f1fc\";\n}\ni.icon.heartbeat:before {\n  content: \"\\f21e\";\n}\ni.icon.mouse.pointer:before {\n  content: \"\\f245\";\n}\ni.icon.hourglass.empty:before {\n  content: \"\\f250\";\n}\ni.icon.hourglass.start:before {\n  content: \"\\f251\";\n}\ni.icon.hourglass.half:before {\n  content: \"\\f252\";\n}\ni.icon.hourglass.end:before {\n  content: \"\\f253\";\n}\ni.icon.hourglass.full:before {\n  content: \"\\f254\";\n}\ni.icon.hand.pointer:before {\n  content: \"\\f25a\";\n}\ni.icon.trademark:before {\n  content: \"\\f25c\";\n}\ni.icon.registered:before {\n  content: \"\\f25d\";\n}\ni.icon.creative.commons:before {\n  content: \"\\f25e\";\n}\ni.icon.add.to.calendar:before {\n  content: \"\\f271\";\n}\ni.icon.remove.from.calendar:before {\n  content: \"\\f272\";\n}\ni.icon.delete.calendar:before {\n  content: \"\\f273\";\n}\ni.icon.checked.calendar:before {\n  content: \"\\f274\";\n}\ni.icon.industry:before {\n  content: \"\\f275\";\n}\ni.icon.shopping.bag:before {\n  content: \"\\f290\";\n}\ni.icon.shopping.basket:before {\n  content: \"\\f291\";\n}\ni.icon.hashtag:before {\n  content: \"\\f292\";\n}\ni.icon.percent:before {\n  content: \"\\f295\";\n}\ni.icon.wait:before {\n  content: \"\\f017\";\n}\ni.icon.download:before {\n  content: \"\\f019\";\n}\ni.icon.repeat:before {\n  content: \"\\f01e\";\n}\ni.icon.refresh:before {\n  content: \"\\f021\";\n}\ni.icon.lock:before {\n  content: \"\\f023\";\n}\ni.icon.bookmark:before {\n  content: \"\\f02e\";\n}\ni.icon.print:before {\n  content: \"\\f02f\";\n}\ni.icon.write:before {\n  content: \"\\f040\";\n}\ni.icon.adjust:before {\n  content: \"\\f042\";\n}\ni.icon.theme:before {\n  content: \"\\f043\";\n}\ni.icon.edit:before {\n  content: \"\\f044\";\n}\ni.icon.external.share:before {\n  content: \"\\f045\";\n}\ni.icon.ban:before {\n  content: \"\\f05e\";\n}\ni.icon.mail.forward:before,\ni.icon.share:before {\n  content: \"\\f064\";\n}\ni.icon.expand:before {\n  content: \"\\f065\";\n}\ni.icon.compress:before {\n  content: \"\\f066\";\n}\ni.icon.unhide:before {\n  content: \"\\f06e\";\n}\ni.icon.hide:before {\n  content: \"\\f070\";\n}\ni.icon.random:before {\n  content: \"\\f074\";\n}\ni.icon.retweet:before {\n  content: \"\\f079\";\n}\ni.icon.sign.out:before {\n  content: \"\\f08b\";\n}\ni.icon.pin:before {\n  content: \"\\f08d\";\n}\ni.icon.sign.in:before {\n  content: \"\\f090\";\n}\ni.icon.upload:before {\n  content: \"\\f093\";\n}\ni.icon.call:before {\n  content: \"\\f095\";\n}\ni.icon.remove.bookmark:before {\n  content: \"\\f097\";\n}\ni.icon.call.square:before {\n  content: \"\\f098\";\n}\ni.icon.unlock:before {\n  content: \"\\f09c\";\n}\ni.icon.configure:before {\n  content: \"\\f0ad\";\n}\ni.icon.filter:before {\n  content: \"\\f0b0\";\n}\ni.icon.wizard:before {\n  content: \"\\f0d0\";\n}\ni.icon.undo:before {\n  content: \"\\f0e2\";\n}\ni.icon.exchange:before {\n  content: \"\\f0ec\";\n}\ni.icon.cloud.download:before {\n  content: \"\\f0ed\";\n}\ni.icon.cloud.upload:before {\n  content: \"\\f0ee\";\n}\ni.icon.reply:before {\n  content: \"\\f112\";\n}\ni.icon.reply.all:before {\n  content: \"\\f122\";\n}\ni.icon.erase:before {\n  content: \"\\f12d\";\n}\ni.icon.unlock.alternate:before {\n  content: \"\\f13e\";\n}\ni.icon.write.square:before {\n  content: \"\\f14b\";\n}\ni.icon.share.square:before {\n  content: \"\\f14d\";\n}\ni.icon.archive:before {\n  content: \"\\f187\";\n}\ni.icon.translate:before {\n  content: \"\\f1ab\";\n}\ni.icon.recycle:before {\n  content: \"\\f1b8\";\n}\ni.icon.send:before {\n  content: \"\\f1d8\";\n}\ni.icon.send.outline:before {\n  content: \"\\f1d9\";\n}\ni.icon.share.alternate:before {\n  content: \"\\f1e0\";\n}\ni.icon.share.alternate.square:before {\n  content: \"\\f1e1\";\n}\ni.icon.add.to.cart:before {\n  content: \"\\f217\";\n}\ni.icon.in.cart:before {\n  content: \"\\f218\";\n}\ni.icon.add.user:before {\n  content: \"\\f234\";\n}\ni.icon.remove.user:before {\n  content: \"\\f235\";\n}\ni.icon.object.group:before {\n  content: \"\\f247\";\n}\ni.icon.object.ungroup:before {\n  content: \"\\f248\";\n}\ni.icon.clone:before {\n  content: \"\\f24d\";\n}\ni.icon.talk:before {\n  content: \"\\f27a\";\n}\ni.icon.talk.outline:before {\n  content: \"\\f27b\";\n}\ni.icon.help.circle:before {\n  content: \"\\f059\";\n}\ni.icon.info.circle:before {\n  content: \"\\f05a\";\n}\ni.icon.warning.circle:before {\n  content: \"\\f06a\";\n}\ni.icon.warning.sign:before {\n  content: \"\\f071\";\n}\ni.icon.announcement:before {\n  content: \"\\f0a1\";\n}\ni.icon.help:before {\n  content: \"\\f128\";\n}\ni.icon.info:before {\n  content: \"\\f129\";\n}\ni.icon.warning:before {\n  content: \"\\f12a\";\n}\ni.icon.birthday:before {\n  content: \"\\f1fd\";\n}\ni.icon.help.circle.outline:before {\n  content: \"\\f29c\";\n}\ni.icon.user:before {\n  content: \"\\f007\";\n}\ni.icon.users:before {\n  content: \"\\f0c0\";\n}\ni.icon.doctor:before {\n  content: \"\\f0f0\";\n}\ni.icon.handicap:before {\n  content: \"\\f193\";\n}\ni.icon.student:before {\n  content: \"\\f19d\";\n}\ni.icon.child:before {\n  content: \"\\f1ae\";\n}\ni.icon.spy:before {\n  content: \"\\f21b\";\n}\ni.icon.female:before {\n  content: \"\\f182\";\n}\ni.icon.male:before {\n  content: \"\\f183\";\n}\ni.icon.woman:before {\n  content: \"\\f221\";\n}\ni.icon.man:before {\n  content: \"\\f222\";\n}\ni.icon.non.binary.transgender:before {\n  content: \"\\f223\";\n}\ni.icon.intergender:before {\n  content: \"\\f224\";\n}\ni.icon.transgender:before {\n  content: \"\\f225\";\n}\ni.icon.lesbian:before {\n  content: \"\\f226\";\n}\ni.icon.gay:before {\n  content: \"\\f227\";\n}\ni.icon.heterosexual:before {\n  content: \"\\f228\";\n}\ni.icon.other.gender:before {\n  content: \"\\f229\";\n}\ni.icon.other.gender.vertical:before {\n  content: \"\\f22a\";\n}\ni.icon.other.gender.horizontal:before {\n  content: \"\\f22b\";\n}\ni.icon.neuter:before {\n  content: \"\\f22c\";\n}\ni.icon.genderless:before {\n  content: \"\\f22d\";\n}\ni.icon.universal.access:before {\n  content: \"\\f29a\";\n}\ni.icon.wheelchair:before {\n  content: \"\\f29b\";\n}\ni.icon.blind:before {\n  content: \"\\f29d\";\n}\ni.icon.audio.description:before {\n  content: \"\\f29e\";\n}\ni.icon.volume.control.phone:before {\n  content: \"\\f2a0\";\n}\ni.icon.braille:before {\n  content: \"\\f2a1\";\n}\ni.icon.asl:before {\n  content: \"\\f2a3\";\n}\ni.icon.assistive.listening.systems:before {\n  content: \"\\f2a2\";\n}\ni.icon.deafness:before {\n  content: \"\\f2a4\";\n}\ni.icon.sign.language:before {\n  content: \"\\f2a7\";\n}\ni.icon.low.vision:before {\n  content: \"\\f2a8\";\n}\ni.icon.block.layout:before {\n  content: \"\\f009\";\n}\ni.icon.grid.layout:before {\n  content: \"\\f00a\";\n}\ni.icon.list.layout:before {\n  content: \"\\f00b\";\n}\ni.icon.zoom:before {\n  content: \"\\f00e\";\n}\ni.icon.zoom.out:before {\n  content: \"\\f010\";\n}\ni.icon.resize.vertical:before {\n  content: \"\\f07d\";\n}\ni.icon.resize.horizontal:before {\n  content: \"\\f07e\";\n}\ni.icon.maximize:before {\n  content: \"\\f0b2\";\n}\ni.icon.crop:before {\n  content: \"\\f125\";\n}\ni.icon.cocktail:before {\n  content: \"\\f000\";\n}\ni.icon.road:before {\n  content: \"\\f018\";\n}\ni.icon.flag:before {\n  content: \"\\f024\";\n}\ni.icon.book:before {\n  content: \"\\f02d\";\n}\ni.icon.gift:before {\n  content: \"\\f06b\";\n}\ni.icon.leaf:before {\n  content: \"\\f06c\";\n}\ni.icon.fire:before {\n  content: \"\\f06d\";\n}\ni.icon.plane:before {\n  content: \"\\f072\";\n}\ni.icon.magnet:before {\n  content: \"\\f076\";\n}\ni.icon.lemon:before {\n  content: \"\\f094\";\n}\ni.icon.world:before {\n  content: \"\\f0ac\";\n}\ni.icon.travel:before {\n  content: \"\\f0b1\";\n}\ni.icon.shipping:before {\n  content: \"\\f0d1\";\n}\ni.icon.money:before {\n  content: \"\\f0d6\";\n}\ni.icon.legal:before {\n  content: \"\\f0e3\";\n}\ni.icon.lightning:before {\n  content: \"\\f0e7\";\n}\ni.icon.umbrella:before {\n  content: \"\\f0e9\";\n}\ni.icon.treatment:before {\n  content: \"\\f0f1\";\n}\ni.icon.suitcase:before {\n  content: \"\\f0f2\";\n}\ni.icon.bar:before {\n  content: \"\\f0fc\";\n}\ni.icon.flag.outline:before {\n  content: \"\\f11d\";\n}\ni.icon.flag.checkered:before {\n  content: \"\\f11e\";\n}\ni.icon.puzzle:before {\n  content: \"\\f12e\";\n}\ni.icon.fire.extinguisher:before {\n  content: \"\\f134\";\n}\ni.icon.rocket:before {\n  content: \"\\f135\";\n}\ni.icon.anchor:before {\n  content: \"\\f13d\";\n}\ni.icon.bullseye:before {\n  content: \"\\f140\";\n}\ni.icon.sun:before {\n  content: \"\\f185\";\n}\ni.icon.moon:before {\n  content: \"\\f186\";\n}\ni.icon.fax:before {\n  content: \"\\f1ac\";\n}\ni.icon.life.ring:before {\n  content: \"\\f1cd\";\n}\ni.icon.bomb:before {\n  content: \"\\f1e2\";\n}\ni.icon.soccer:before {\n  content: \"\\f1e3\";\n}\ni.icon.calculator:before {\n  content: \"\\f1ec\";\n}\ni.icon.diamond:before {\n  content: \"\\f219\";\n}\ni.icon.sticky.note:before {\n  content: \"\\f249\";\n}\ni.icon.sticky.note.outline:before {\n  content: \"\\f24a\";\n}\ni.icon.law:before {\n  content: \"\\f24e\";\n}\ni.icon.hand.peace:before {\n  content: \"\\f25b\";\n}\ni.icon.hand.rock:before {\n  content: \"\\f255\";\n}\ni.icon.hand.paper:before {\n  content: \"\\f256\";\n}\ni.icon.hand.scissors:before {\n  content: \"\\f257\";\n}\ni.icon.hand.lizard:before {\n  content: \"\\f258\";\n}\ni.icon.hand.spock:before {\n  content: \"\\f259\";\n}\ni.icon.tv:before {\n  content: \"\\f26c\";\n}\ni.icon.crosshairs:before {\n  content: \"\\f05b\";\n}\ni.icon.asterisk:before {\n  content: \"\\f069\";\n}\ni.icon.square.outline:before {\n  content: \"\\f096\";\n}\ni.icon.certificate:before {\n  content: \"\\f0a3\";\n}\ni.icon.square:before {\n  content: \"\\f0c8\";\n}\ni.icon.quote.left:before {\n  content: \"\\f10d\";\n}\ni.icon.quote.right:before {\n  content: \"\\f10e\";\n}\ni.icon.spinner:before {\n  content: \"\\f110\";\n}\ni.icon.circle:before {\n  content: \"\\f111\";\n}\ni.icon.ellipsis.horizontal:before {\n  content: \"\\f141\";\n}\ni.icon.ellipsis.vertical:before {\n  content: \"\\f142\";\n}\ni.icon.cube:before {\n  content: \"\\f1b2\";\n}\ni.icon.cubes:before {\n  content: \"\\f1b3\";\n}\ni.icon.circle.notched:before {\n  content: \"\\f1ce\";\n}\ni.icon.circle.thin:before {\n  content: \"\\f1db\";\n}\ni.icon.checkmark:before {\n  content: \"\\f00c\";\n}\ni.icon.remove:before {\n  content: \"\\f00d\";\n}\ni.icon.checkmark.box:before {\n  content: \"\\f046\";\n}\ni.icon.move:before {\n  content: \"\\f047\";\n}\ni.icon.add.circle:before {\n  content: \"\\f055\";\n}\ni.icon.minus.circle:before {\n  content: \"\\f056\";\n}\ni.icon.remove.circle:before {\n  content: \"\\f057\";\n}\ni.icon.check.circle:before {\n  content: \"\\f058\";\n}\ni.icon.remove.circle.outline:before {\n  content: \"\\f05c\";\n}\ni.icon.check.circle.outline:before {\n  content: \"\\f05d\";\n}\ni.icon.plus:before {\n  content: \"\\f067\";\n}\ni.icon.minus:before {\n  content: \"\\f068\";\n}\ni.icon.add.square:before {\n  content: \"\\f0fe\";\n}\ni.icon.radio:before {\n  content: \"\\f10c\";\n}\ni.icon.minus.square:before {\n  content: \"\\f146\";\n}\ni.icon.minus.square.outline:before {\n  content: \"\\f147\";\n}\ni.icon.check.square:before {\n  content: \"\\f14a\";\n}\ni.icon.selected.radio:before {\n  content: \"\\f192\";\n}\ni.icon.plus.square.outline:before {\n  content: \"\\f196\";\n}\ni.icon.toggle.off:before {\n  content: \"\\f204\";\n}\ni.icon.toggle.on:before {\n  content: \"\\f205\";\n}\ni.icon.film:before {\n  content: \"\\f008\";\n}\ni.icon.sound:before {\n  content: \"\\f025\";\n}\ni.icon.photo:before {\n  content: \"\\f030\";\n}\ni.icon.bar.chart:before {\n  content: \"\\f080\";\n}\ni.icon.camera.retro:before {\n  content: \"\\f083\";\n}\ni.icon.newspaper:before {\n  content: \"\\f1ea\";\n}\ni.icon.area.chart:before {\n  content: \"\\f1fe\";\n}\ni.icon.pie.chart:before {\n  content: \"\\f200\";\n}\ni.icon.line.chart:before {\n  content: \"\\f201\";\n}\ni.icon.arrow.circle.outline.down:before {\n  content: \"\\f01a\";\n}\ni.icon.arrow.circle.outline.up:before {\n  content: \"\\f01b\";\n}\ni.icon.chevron.left:before {\n  content: \"\\f053\";\n}\ni.icon.chevron.right:before {\n  content: \"\\f054\";\n}\ni.icon.arrow.left:before {\n  content: \"\\f060\";\n}\ni.icon.arrow.right:before {\n  content: \"\\f061\";\n}\ni.icon.arrow.up:before {\n  content: \"\\f062\";\n}\ni.icon.arrow.down:before {\n  content: \"\\f063\";\n}\ni.icon.chevron.up:before {\n  content: \"\\f077\";\n}\ni.icon.chevron.down:before {\n  content: \"\\f078\";\n}\ni.icon.pointing.right:before {\n  content: \"\\f0a4\";\n}\ni.icon.pointing.left:before {\n  content: \"\\f0a5\";\n}\ni.icon.pointing.up:before {\n  content: \"\\f0a6\";\n}\ni.icon.pointing.down:before {\n  content: \"\\f0a7\";\n}\ni.icon.arrow.circle.left:before {\n  content: \"\\f0a8\";\n}\ni.icon.arrow.circle.right:before {\n  content: \"\\f0a9\";\n}\ni.icon.arrow.circle.up:before {\n  content: \"\\f0aa\";\n}\ni.icon.arrow.circle.down:before {\n  content: \"\\f0ab\";\n}\ni.icon.caret.down:before {\n  content: \"\\f0d7\";\n}\ni.icon.caret.up:before {\n  content: \"\\f0d8\";\n}\ni.icon.caret.left:before {\n  content: \"\\f0d9\";\n}\ni.icon.caret.right:before {\n  content: \"\\f0da\";\n}\ni.icon.angle.double.left:before {\n  content: \"\\f100\";\n}\ni.icon.angle.double.right:before {\n  content: \"\\f101\";\n}\ni.icon.angle.double.up:before {\n  content: \"\\f102\";\n}\ni.icon.angle.double.down:before {\n  content: \"\\f103\";\n}\ni.icon.angle.left:before {\n  content: \"\\f104\";\n}\ni.icon.angle.right:before {\n  content: \"\\f105\";\n}\ni.icon.angle.up:before {\n  content: \"\\f106\";\n}\ni.icon.angle.down:before {\n  content: \"\\f107\";\n}\ni.icon.chevron.circle.left:before {\n  content: \"\\f137\";\n}\ni.icon.chevron.circle.right:before {\n  content: \"\\f138\";\n}\ni.icon.chevron.circle.up:before {\n  content: \"\\f139\";\n}\ni.icon.chevron.circle.down:before {\n  content: \"\\f13a\";\n}\ni.icon.toggle.down:before {\n  content: \"\\f150\";\n}\ni.icon.toggle.up:before {\n  content: \"\\f151\";\n}\ni.icon.toggle.right:before {\n  content: \"\\f152\";\n}\ni.icon.long.arrow.down:before {\n  content: \"\\f175\";\n}\ni.icon.long.arrow.up:before {\n  content: \"\\f176\";\n}\ni.icon.long.arrow.left:before {\n  content: \"\\f177\";\n}\ni.icon.long.arrow.right:before {\n  content: \"\\f178\";\n}\ni.icon.arrow.circle.outline.right:before {\n  content: \"\\f18e\";\n}\ni.icon.arrow.circle.outline.left:before {\n  content: \"\\f190\";\n}\ni.icon.toggle.left:before {\n  content: \"\\f191\";\n}\ni.icon.tablet:before {\n  content: \"\\f10a\";\n}\ni.icon.mobile:before {\n  content: \"\\f10b\";\n}\ni.icon.battery.full:before {\n  content: \"\\f240\";\n}\ni.icon.battery.high:before {\n  content: \"\\f241\";\n}\ni.icon.battery.medium:before {\n  content: \"\\f242\";\n}\ni.icon.battery.low:before {\n  content: \"\\f243\";\n}\ni.icon.battery.empty:before {\n  content: \"\\f244\";\n}\ni.icon.power:before {\n  content: \"\\f011\";\n}\ni.icon.trash.outline:before {\n  content: \"\\f014\";\n}\ni.icon.disk.outline:before {\n  content: \"\\f0a0\";\n}\ni.icon.desktop:before {\n  content: \"\\f108\";\n}\ni.icon.laptop:before {\n  content: \"\\f109\";\n}\ni.icon.game:before {\n  content: \"\\f11b\";\n}\ni.icon.keyboard:before {\n  content: \"\\f11c\";\n}\ni.icon.plug:before {\n  content: \"\\f1e6\";\n}\ni.icon.trash:before {\n  content: \"\\f1f8\";\n}\ni.icon.file.outline:before {\n  content: \"\\f016\";\n}\ni.icon.folder:before {\n  content: \"\\f07b\";\n}\ni.icon.folder.open:before {\n  content: \"\\f07c\";\n}\ni.icon.file.text.outline:before {\n  content: \"\\f0f6\";\n}\ni.icon.folder.outline:before {\n  content: \"\\f114\";\n}\ni.icon.folder.open.outline:before {\n  content: \"\\f115\";\n}\ni.icon.level.up:before {\n  content: \"\\f148\";\n}\ni.icon.level.down:before {\n  content: \"\\f149\";\n}\ni.icon.file:before {\n  content: \"\\f15b\";\n}\ni.icon.file.text:before {\n  content: \"\\f15c\";\n}\ni.icon.file.pdf.outline:before {\n  content: \"\\f1c1\";\n}\ni.icon.file.word.outline:before {\n  content: \"\\f1c2\";\n}\ni.icon.file.excel.outline:before {\n  content: \"\\f1c3\";\n}\ni.icon.file.powerpoint.outline:before {\n  content: \"\\f1c4\";\n}\ni.icon.file.image.outline:before {\n  content: \"\\f1c5\";\n}\ni.icon.file.archive.outline:before {\n  content: \"\\f1c6\";\n}\ni.icon.file.audio.outline:before {\n  content: \"\\f1c7\";\n}\ni.icon.file.video.outline:before {\n  content: \"\\f1c8\";\n}\ni.icon.file.code.outline:before {\n  content: \"\\f1c9\";\n}\ni.icon.qrcode:before {\n  content: \"\\f029\";\n}\ni.icon.barcode:before {\n  content: \"\\f02a\";\n}\ni.icon.rss:before {\n  content: \"\\f09e\";\n}\ni.icon.fork:before {\n  content: \"\\f126\";\n}\ni.icon.html5:before {\n  content: \"\\f13b\";\n}\ni.icon.css3:before {\n  content: \"\\f13c\";\n}\ni.icon.rss.square:before {\n  content: \"\\f143\";\n}\ni.icon.openid:before {\n  content: \"\\f19b\";\n}\ni.icon.database:before {\n  content: \"\\f1c0\";\n}\ni.icon.server:before {\n  content: \"\\f233\";\n}\ni.icon.usb:before {\n  content: \"\\f287\";\n}\ni.icon.bluetooth:before {\n  content: \"\\f293\";\n}\ni.icon.bluetooth.alternative:before {\n  content: \"\\f294\";\n}\ni.icon.heart:before {\n  content: \"\\f004\";\n}\ni.icon.star:before {\n  content: \"\\f005\";\n}\ni.icon.empty.star:before {\n  content: \"\\f006\";\n}\ni.icon.thumbs.outline.up:before {\n  content: \"\\f087\";\n}\ni.icon.thumbs.outline.down:before {\n  content: \"\\f088\";\n}\ni.icon.star.half:before {\n  content: \"\\f089\";\n}\ni.icon.empty.heart:before {\n  content: \"\\f08a\";\n}\ni.icon.smile:before {\n  content: \"\\f118\";\n}\ni.icon.frown:before {\n  content: \"\\f119\";\n}\ni.icon.meh:before {\n  content: \"\\f11a\";\n}\ni.icon.star.half.empty:before {\n  content: \"\\f123\";\n}\ni.icon.thumbs.up:before {\n  content: \"\\f164\";\n}\ni.icon.thumbs.down:before {\n  content: \"\\f165\";\n}\ni.icon.music:before {\n  content: \"\\f001\";\n}\ni.icon.video.play.outline:before {\n  content: \"\\f01d\";\n}\ni.icon.volume.off:before {\n  content: \"\\f026\";\n}\ni.icon.volume.down:before {\n  content: \"\\f027\";\n}\ni.icon.volume.up:before {\n  content: \"\\f028\";\n}\ni.icon.record:before {\n  content: \"\\f03d\";\n}\ni.icon.step.backward:before {\n  content: \"\\f048\";\n}\ni.icon.fast.backward:before {\n  content: \"\\f049\";\n}\ni.icon.backward:before {\n  content: \"\\f04a\";\n}\ni.icon.play:before {\n  content: \"\\f04b\";\n}\ni.icon.pause:before {\n  content: \"\\f04c\";\n}\ni.icon.stop:before {\n  content: \"\\f04d\";\n}\ni.icon.forward:before {\n  content: \"\\f04e\";\n}\ni.icon.fast.forward:before {\n  content: \"\\f050\";\n}\ni.icon.step.forward:before {\n  content: \"\\f051\";\n}\ni.icon.eject:before {\n  content: \"\\f052\";\n}\ni.icon.unmute:before {\n  content: \"\\f130\";\n}\ni.icon.mute:before {\n  content: \"\\f131\";\n}\ni.icon.video.play:before {\n  content: \"\\f144\";\n}\ni.icon.closed.captioning:before {\n  content: \"\\f20a\";\n}\ni.icon.pause.circle:before {\n  content: \"\\f28b\";\n}\ni.icon.pause.circle.outline:before {\n  content: \"\\f28c\";\n}\ni.icon.stop.circle:before {\n  content: \"\\f28d\";\n}\ni.icon.stop.circle.outline:before {\n  content: \"\\f28e\";\n}\ni.icon.marker:before {\n  content: \"\\f041\";\n}\ni.icon.coffee:before {\n  content: \"\\f0f4\";\n}\ni.icon.food:before {\n  content: \"\\f0f5\";\n}\ni.icon.building.outline:before {\n  content: \"\\f0f7\";\n}\ni.icon.hospital:before {\n  content: \"\\f0f8\";\n}\ni.icon.emergency:before {\n  content: \"\\f0f9\";\n}\ni.icon.first.aid:before {\n  content: \"\\f0fa\";\n}\ni.icon.military:before {\n  content: \"\\f0fb\";\n}\ni.icon.h:before {\n  content: \"\\f0fd\";\n}\ni.icon.location.arrow:before {\n  content: \"\\f124\";\n}\ni.icon.compass:before {\n  content: \"\\f14e\";\n}\ni.icon.space.shuttle:before {\n  content: \"\\f197\";\n}\ni.icon.university:before {\n  content: \"\\f19c\";\n}\ni.icon.building:before {\n  content: \"\\f1ad\";\n}\ni.icon.paw:before {\n  content: \"\\f1b0\";\n}\ni.icon.spoon:before {\n  content: \"\\f1b1\";\n}\ni.icon.car:before {\n  content: \"\\f1b9\";\n}\ni.icon.taxi:before {\n  content: \"\\f1ba\";\n}\ni.icon.tree:before {\n  content: \"\\f1bb\";\n}\ni.icon.bicycle:before {\n  content: \"\\f206\";\n}\ni.icon.bus:before {\n  content: \"\\f207\";\n}\ni.icon.ship:before {\n  content: \"\\f21a\";\n}\ni.icon.motorcycle:before {\n  content: \"\\f21c\";\n}\ni.icon.street.view:before {\n  content: \"\\f21d\";\n}\ni.icon.hotel:before {\n  content: \"\\f236\";\n}\ni.icon.train:before {\n  content: \"\\f238\";\n}\ni.icon.subway:before {\n  content: \"\\f239\";\n}\ni.icon.map.pin:before {\n  content: \"\\f276\";\n}\ni.icon.map.signs:before {\n  content: \"\\f277\";\n}\ni.icon.map.outline:before {\n  content: \"\\f278\";\n}\ni.icon.map:before {\n  content: \"\\f279\";\n}\ni.icon.table:before {\n  content: \"\\f0ce\";\n}\ni.icon.columns:before {\n  content: \"\\f0db\";\n}\ni.icon.sort:before {\n  content: \"\\f0dc\";\n}\ni.icon.sort.descending:before {\n  content: \"\\f0dd\";\n}\ni.icon.sort.ascending:before {\n  content: \"\\f0de\";\n}\ni.icon.sort.alphabet.ascending:before {\n  content: \"\\f15d\";\n}\ni.icon.sort.alphabet.descending:before {\n  content: \"\\f15e\";\n}\ni.icon.sort.content.ascending:before {\n  content: \"\\f160\";\n}\ni.icon.sort.content.descending:before {\n  content: \"\\f161\";\n}\ni.icon.sort.numeric.ascending:before {\n  content: \"\\f162\";\n}\ni.icon.sort.numeric.descending:before {\n  content: \"\\f163\";\n}\ni.icon.font:before {\n  content: \"\\f031\";\n}\ni.icon.bold:before {\n  content: \"\\f032\";\n}\ni.icon.italic:before {\n  content: \"\\f033\";\n}\ni.icon.text.height:before {\n  content: \"\\f034\";\n}\ni.icon.text.width:before {\n  content: \"\\f035\";\n}\ni.icon.align.left:before {\n  content: \"\\f036\";\n}\ni.icon.align.center:before {\n  content: \"\\f037\";\n}\ni.icon.align.right:before {\n  content: \"\\f038\";\n}\ni.icon.align.justify:before {\n  content: \"\\f039\";\n}\ni.icon.list:before {\n  content: \"\\f03a\";\n}\ni.icon.outdent:before {\n  content: \"\\f03b\";\n}\ni.icon.indent:before {\n  content: \"\\f03c\";\n}\ni.icon.cut:before {\n  content: \"\\f0c4\";\n}\ni.icon.copy:before {\n  content: \"\\f0c5\";\n}\ni.icon.attach:before {\n  content: \"\\f0c6\";\n}\ni.icon.save:before {\n  content: \"\\f0c7\";\n}\ni.icon.content:before {\n  content: \"\\f0c9\";\n}\ni.icon.unordered.list:before {\n  content: \"\\f0ca\";\n}\ni.icon.ordered.list:before {\n  content: \"\\f0cb\";\n}\ni.icon.strikethrough:before {\n  content: \"\\f0cc\";\n}\ni.icon.underline:before {\n  content: \"\\f0cd\";\n}\ni.icon.paste:before {\n  content: \"\\f0ea\";\n}\ni.icon.unlinkify:before {\n  content: \"\\f127\";\n}\ni.icon.superscript:before {\n  content: \"\\f12b\";\n}\ni.icon.subscript:before {\n  content: \"\\f12c\";\n}\ni.icon.header:before {\n  content: \"\\f1dc\";\n}\ni.icon.paragraph:before {\n  content: \"\\f1dd\";\n}\ni.icon.text.cursor:before {\n  content: \"\\f246\";\n}\ni.icon.euro:before {\n  content: \"\\f153\";\n}\ni.icon.pound:before {\n  content: \"\\f154\";\n}\ni.icon.dollar:before {\n  content: \"\\f155\";\n}\ni.icon.rupee:before {\n  content: \"\\f156\";\n}\ni.icon.yen:before {\n  content: \"\\f157\";\n}\ni.icon.ruble:before {\n  content: \"\\f158\";\n}\ni.icon.won:before {\n  content: \"\\f159\";\n}\ni.icon.bitcoin:before {\n  content: \"\\f15a\";\n}\ni.icon.lira:before {\n  content: \"\\f195\";\n}\ni.icon.shekel:before {\n  content: \"\\f20b\";\n}\ni.icon.paypal:before {\n  content: \"\\f1ed\";\n}\ni.icon.google.wallet:before {\n  content: \"\\f1ee\";\n}\ni.icon.visa:before {\n  content: \"\\f1f0\";\n}\ni.icon.mastercard:before {\n  content: \"\\f1f1\";\n}\ni.icon.discover:before {\n  content: \"\\f1f2\";\n}\ni.icon.american.express:before {\n  content: \"\\f1f3\";\n}\ni.icon.paypal.card:before {\n  content: \"\\f1f4\";\n}\ni.icon.stripe:before {\n  content: \"\\f1f5\";\n}\ni.icon.japan.credit.bureau:before {\n  content: \"\\f24b\";\n}\ni.icon.diners.club:before {\n  content: \"\\f24c\";\n}\ni.icon.credit.card.alternative:before {\n  content: \"\\f283\";\n}\ni.icon.twitter.square:before {\n  content: \"\\f081\";\n}\ni.icon.facebook.square:before {\n  content: \"\\f082\";\n}\ni.icon.linkedin.square:before {\n  content: \"\\f08c\";\n}\ni.icon.github.square:before {\n  content: \"\\f092\";\n}\ni.icon.twitter:before {\n  content: \"\\f099\";\n}\ni.icon.facebook.f:before {\n  content: \"\\f09a\";\n}\ni.icon.github:before {\n  content: \"\\f09b\";\n}\ni.icon.pinterest.square:before {\n  content: \"\\f0d3\";\n}\ni.icon.google.plus.square:before {\n  content: \"\\f0d4\";\n}\ni.icon.google.plus:before {\n  content: \"\\f0d5\";\n}\ni.icon.linkedin:before {\n  content: \"\\f0e1\";\n}\ni.icon.github.alternate:before {\n  content: \"\\f113\";\n}\ni.icon.maxcdn:before {\n  content: \"\\f136\";\n}\ni.icon.youtube.square:before {\n  content: \"\\f166\";\n}\ni.icon.youtube:before {\n  content: \"\\f167\";\n}\ni.icon.xing:before {\n  content: \"\\f168\";\n}\ni.icon.xing.square:before {\n  content: \"\\f169\";\n}\ni.icon.youtube.play:before {\n  content: \"\\f16a\";\n}\ni.icon.dropbox:before {\n  content: \"\\f16b\";\n}\ni.icon.stack.overflow:before {\n  content: \"\\f16c\";\n}\ni.icon.instagram:before {\n  content: \"\\f16d\";\n}\ni.icon.flickr:before {\n  content: \"\\f16e\";\n}\ni.icon.adn:before {\n  content: \"\\f170\";\n}\ni.icon.bitbucket:before {\n  content: \"\\f171\";\n}\ni.icon.bitbucket.square:before {\n  content: \"\\f172\";\n}\ni.icon.tumblr:before {\n  content: \"\\f173\";\n}\ni.icon.tumblr.square:before {\n  content: \"\\f174\";\n}\ni.icon.apple:before {\n  content: \"\\f179\";\n}\ni.icon.windows:before {\n  content: \"\\f17a\";\n}\ni.icon.android:before {\n  content: \"\\f17b\";\n}\ni.icon.linux:before {\n  content: \"\\f17c\";\n}\ni.icon.dribble:before {\n  content: \"\\f17d\";\n}\ni.icon.skype:before {\n  content: \"\\f17e\";\n}\ni.icon.foursquare:before {\n  content: \"\\f180\";\n}\ni.icon.trello:before {\n  content: \"\\f181\";\n}\ni.icon.gittip:before {\n  content: \"\\f184\";\n}\ni.icon.vk:before {\n  content: \"\\f189\";\n}\ni.icon.weibo:before {\n  content: \"\\f18a\";\n}\ni.icon.renren:before {\n  content: \"\\f18b\";\n}\ni.icon.pagelines:before {\n  content: \"\\f18c\";\n}\ni.icon.stack.exchange:before {\n  content: \"\\f18d\";\n}\ni.icon.vimeo.square:before {\n  content: \"\\f194\";\n}\ni.icon.slack:before {\n  content: \"\\f198\";\n}\ni.icon.wordpress:before {\n  content: \"\\f19a\";\n}\ni.icon.yahoo:before {\n  content: \"\\f19e\";\n}\ni.icon.google:before {\n  content: \"\\f1a0\";\n}\ni.icon.reddit:before {\n  content: \"\\f1a1\";\n}\ni.icon.reddit.square:before {\n  content: \"\\f1a2\";\n}\ni.icon.stumbleupon.circle:before {\n  content: \"\\f1a3\";\n}\ni.icon.stumbleupon:before {\n  content: \"\\f1a4\";\n}\ni.icon.delicious:before {\n  content: \"\\f1a5\";\n}\ni.icon.digg:before {\n  content: \"\\f1a6\";\n}\ni.icon.pied.piper:before {\n  content: \"\\f1a7\";\n}\ni.icon.pied.piper.alternate:before {\n  content: \"\\f1a8\";\n}\ni.icon.drupal:before {\n  content: \"\\f1a9\";\n}\ni.icon.joomla:before {\n  content: \"\\f1aa\";\n}\ni.icon.behance:before {\n  content: \"\\f1b4\";\n}\ni.icon.behance.square:before {\n  content: \"\\f1b5\";\n}\ni.icon.steam:before {\n  content: \"\\f1b6\";\n}\ni.icon.steam.square:before {\n  content: \"\\f1b7\";\n}\ni.icon.spotify:before {\n  content: \"\\f1bc\";\n}\ni.icon.deviantart:before {\n  content: \"\\f1bd\";\n}\ni.icon.soundcloud:before {\n  content: \"\\f1be\";\n}\ni.icon.vine:before {\n  content: \"\\f1ca\";\n}\ni.icon.codepen:before {\n  content: \"\\f1cb\";\n}\ni.icon.jsfiddle:before {\n  content: \"\\f1cc\";\n}\ni.icon.rebel:before {\n  content: \"\\f1d0\";\n}\ni.icon.empire:before {\n  content: \"\\f1d1\";\n}\ni.icon.git.square:before {\n  content: \"\\f1d2\";\n}\ni.icon.git:before {\n  content: \"\\f1d3\";\n}\ni.icon.hacker.news:before {\n  content: \"\\f1d4\";\n}\ni.icon.tencent.weibo:before {\n  content: \"\\f1d5\";\n}\ni.icon.qq:before {\n  content: \"\\f1d6\";\n}\ni.icon.wechat:before {\n  content: \"\\f1d7\";\n}\ni.icon.slideshare:before {\n  content: \"\\f1e7\";\n}\ni.icon.twitch:before {\n  content: \"\\f1e8\";\n}\ni.icon.yelp:before {\n  content: \"\\f1e9\";\n}\ni.icon.lastfm:before {\n  content: \"\\f202\";\n}\ni.icon.lastfm.square:before {\n  content: \"\\f203\";\n}\ni.icon.ioxhost:before {\n  content: \"\\f208\";\n}\ni.icon.angellist:before {\n  content: \"\\f209\";\n}\ni.icon.meanpath:before {\n  content: \"\\f20c\";\n}\ni.icon.buysellads:before {\n  content: \"\\f20d\";\n}\ni.icon.connectdevelop:before {\n  content: \"\\f20e\";\n}\ni.icon.dashcube:before {\n  content: \"\\f210\";\n}\ni.icon.forumbee:before {\n  content: \"\\f211\";\n}\ni.icon.leanpub:before {\n  content: \"\\f212\";\n}\ni.icon.sellsy:before {\n  content: \"\\f213\";\n}\ni.icon.shirtsinbulk:before {\n  content: \"\\f214\";\n}\ni.icon.simplybuilt:before {\n  content: \"\\f215\";\n}\ni.icon.skyatlas:before {\n  content: \"\\f216\";\n}\ni.icon.facebook:before {\n  content: \"\\f230\";\n}\ni.icon.pinterest:before {\n  content: \"\\f231\";\n}\ni.icon.whatsapp:before {\n  content: \"\\f232\";\n}\ni.icon.viacoin:before {\n  content: \"\\f237\";\n}\ni.icon.medium:before {\n  content: \"\\f23a\";\n}\ni.icon.y.combinator:before {\n  content: \"\\f23b\";\n}\ni.icon.optinmonster:before {\n  content: \"\\f23c\";\n}\ni.icon.opencart:before {\n  content: \"\\f23d\";\n}\ni.icon.expeditedssl:before {\n  content: \"\\f23e\";\n}\ni.icon.gg:before {\n  content: \"\\f260\";\n}\ni.icon.gg.circle:before {\n  content: \"\\f261\";\n}\ni.icon.tripadvisor:before {\n  content: \"\\f262\";\n}\ni.icon.odnoklassniki:before {\n  content: \"\\f263\";\n}\ni.icon.odnoklassniki.square:before {\n  content: \"\\f264\";\n}\ni.icon.pocket:before {\n  content: \"\\f265\";\n}\ni.icon.wikipedia:before {\n  content: \"\\f266\";\n}\ni.icon.safari:before {\n  content: \"\\f267\";\n}\ni.icon.chrome:before {\n  content: \"\\f268\";\n}\ni.icon.firefox:before {\n  content: \"\\f269\";\n}\ni.icon.opera:before {\n  content: \"\\f26a\";\n}\ni.icon.internet.explorer:before {\n  content: \"\\f26b\";\n}\ni.icon.contao:before {\n  content: \"\\f26d\";\n}\ni.icon.\\35 00px:before {\n  content: \"\\f26e\";\n}\ni.icon.amazon:before {\n  content: \"\\f270\";\n}\ni.icon.houzz:before {\n  content: \"\\f27c\";\n}\ni.icon.vimeo:before {\n  content: \"\\f27d\";\n}\ni.icon.black.tie:before {\n  content: \"\\f27e\";\n}\ni.icon.fonticons:before {\n  content: \"\\f280\";\n}\ni.icon.reddit.alien:before {\n  content: \"\\f281\";\n}\ni.icon.microsoft.edge:before {\n  content: \"\\f282\";\n}\ni.icon.codiepie:before {\n  content: \"\\f284\";\n}\ni.icon.modx:before {\n  content: \"\\f285\";\n}\ni.icon.fort.awesome:before {\n  content: \"\\f286\";\n}\ni.icon.product.hunt:before {\n  content: \"\\f288\";\n}\ni.icon.mixcloud:before {\n  content: \"\\f289\";\n}\ni.icon.scribd:before {\n  content: \"\\f28a\";\n}\ni.icon.gitlab:before {\n  content: \"\\f296\";\n}\ni.icon.wpbeginner:before {\n  content: \"\\f297\";\n}\ni.icon.wpforms:before {\n  content: \"\\f298\";\n}\ni.icon.envira.gallery:before {\n  content: \"\\f299\";\n}\ni.icon.glide:before {\n  content: \"\\f2a5\";\n}\ni.icon.glide.g:before {\n  content: \"\\f2a6\";\n}\ni.icon.viadeo:before {\n  content: \"\\f2a9\";\n}\ni.icon.viadeo.square:before {\n  content: \"\\f2aa\";\n}\ni.icon.snapchat:before {\n  content: \"\\f2ab\";\n}\ni.icon.snapchat.ghost:before {\n  content: \"\\f2ac\";\n}\ni.icon.snapchat.square:before {\n  content: \"\\f2ad\";\n}\ni.icon.pied.piper.hat:before {\n  content: \"\\f2ae\";\n}\ni.icon.first.order:before {\n  content: \"\\f2b0\";\n}\ni.icon.yoast:before {\n  content: \"\\f2b1\";\n}\ni.icon.themeisle:before {\n  content: \"\\f2b2\";\n}\ni.icon.google.plus.circle:before {\n  content: \"\\f2b3\";\n}\ni.icon.font.awesome:before {\n  content: \"\\f2b4\";\n}\ni.icon.like:before {\n  content: \"\\f004\";\n}\ni.icon.favorite:before {\n  content: \"\\f005\";\n}\ni.icon.video:before {\n  content: \"\\f008\";\n}\ni.icon.check:before {\n  content: \"\\f00c\";\n}\ni.icon.cancel:before,\ni.icon.close:before,\ni.icon.delete:before,\ni.icon.x:before {\n  content: \"\\f00d\";\n}\ni.icon.magnify:before,\ni.icon.zoom.in:before {\n  content: \"\\f00e\";\n}\ni.icon.shutdown:before {\n  content: \"\\f011\";\n}\ni.icon.clock:before,\ni.icon.time:before {\n  content: \"\\f017\";\n}\ni.icon.play.circle.outline:before {\n  content: \"\\f01d\";\n}\ni.icon.headphone:before {\n  content: \"\\f025\";\n}\ni.icon.camera:before {\n  content: \"\\f030\";\n}\ni.icon.video.camera:before {\n  content: \"\\f03d\";\n}\ni.icon.picture:before {\n  content: \"\\f03e\";\n}\ni.icon.compose:before,\ni.icon.pencil:before {\n  content: \"\\f040\";\n}\ni.icon.point:before {\n  content: \"\\f041\";\n}\ni.icon.tint:before {\n  content: \"\\f043\";\n}\ni.icon.signup:before {\n  content: \"\\f044\";\n}\ni.icon.plus.circle:before {\n  content: \"\\f055\";\n}\ni.icon.question.circle:before {\n  content: \"\\f059\";\n}\ni.icon.dont:before {\n  content: \"\\f05e\";\n}\ni.icon.minimize:before {\n  content: \"\\f066\";\n}\ni.icon.add:before {\n  content: \"\\f067\";\n}\ni.icon.attention:before,\ni.icon.exclamation.circle:before {\n  content: \"\\f06a\";\n}\ni.icon.eye:before {\n  content: \"\\f06e\";\n}\ni.icon.exclamation.triangle:before {\n  content: \"\\f071\";\n}\ni.icon.shuffle:before {\n  content: \"\\f074\";\n}\ni.icon.chat:before {\n  content: \"\\f075\";\n}\ni.icon.cart:before,\ni.icon.shopping.cart:before {\n  content: \"\\f07a\";\n}\ni.icon.bar.graph:before {\n  content: \"\\f080\";\n}\ni.icon.key:before {\n  content: \"\\f084\";\n}\ni.icon.cogs:before {\n  content: \"\\f085\";\n}\ni.icon.discussions:before {\n  content: \"\\f086\";\n}\ni.icon.like.outline:before {\n  content: \"\\f087\";\n}\ni.icon.dislike.outline:before {\n  content: \"\\f088\";\n}\ni.icon.heart.outline:before {\n  content: \"\\f08a\";\n}\ni.icon.log.out:before {\n  content: \"\\f08b\";\n}\ni.icon.thumb.tack:before {\n  content: \"\\f08d\";\n}\ni.icon.winner:before {\n  content: \"\\f091\";\n}\ni.icon.phone:before {\n  content: \"\\f095\";\n}\ni.icon.bookmark.outline:before {\n  content: \"\\f097\";\n}\ni.icon.phone.square:before {\n  content: \"\\f098\";\n}\ni.icon.credit.card:before {\n  content: \"\\f09d\";\n}\ni.icon.hdd.outline:before {\n  content: \"\\f0a0\";\n}\ni.icon.bullhorn:before {\n  content: \"\\f0a1\";\n}\ni.icon.bell.outline:before {\n  content: \"\\f0a2\";\n}\ni.icon.hand.outline.right:before {\n  content: \"\\f0a4\";\n}\ni.icon.hand.outline.left:before {\n  content: \"\\f0a5\";\n}\ni.icon.hand.outline.up:before {\n  content: \"\\f0a6\";\n}\ni.icon.hand.outline.down:before {\n  content: \"\\f0a7\";\n}\ni.icon.globe:before {\n  content: \"\\f0ac\";\n}\ni.icon.wrench:before {\n  content: \"\\f0ad\";\n}\ni.icon.briefcase:before {\n  content: \"\\f0b1\";\n}\ni.icon.group:before {\n  content: \"\\f0c0\";\n}\ni.icon.chain:before,\ni.icon.linkify:before {\n  content: \"\\f0c1\";\n}\ni.icon.flask:before {\n  content: \"\\f0c3\";\n}\ni.icon.bars:before,\ni.icon.sidebar:before {\n  content: \"\\f0c9\";\n}\ni.icon.list.ul:before {\n  content: \"\\f0ca\";\n}\ni.icon.list.ol:before,\ni.icon.numbered.list:before {\n  content: \"\\f0cb\";\n}\ni.icon.magic:before {\n  content: \"\\f0d0\";\n}\ni.icon.truck:before {\n  content: \"\\f0d1\";\n}\ni.icon.currency:before {\n  content: \"\\f0d6\";\n}\ni.icon.dropdown:before,\ni.icon.triangle.down:before {\n  content: \"\\f0d7\";\n}\ni.icon.triangle.up:before {\n  content: \"\\f0d8\";\n}\ni.icon.triangle.left:before {\n  content: \"\\f0d9\";\n}\ni.icon.triangle.right:before {\n  content: \"\\f0da\";\n}\ni.icon.envelope:before {\n  content: \"\\f0e0\";\n}\ni.icon.conversation:before {\n  content: \"\\f0e6\";\n}\ni.icon.rain:before {\n  content: \"\\f0e9\";\n}\ni.icon.clipboard:before {\n  content: \"\\f0ea\";\n}\ni.icon.lightbulb:before {\n  content: \"\\f0eb\";\n}\ni.icon.bell:before {\n  content: \"\\f0f3\";\n}\ni.icon.ambulance:before {\n  content: \"\\f0f9\";\n}\ni.icon.medkit:before {\n  content: \"\\f0fa\";\n}\ni.icon.fighter.jet:before {\n  content: \"\\f0fb\";\n}\ni.icon.beer:before {\n  content: \"\\f0fc\";\n}\ni.icon.plus.square:before {\n  content: \"\\f0fe\";\n}\ni.icon.computer:before {\n  content: \"\\f108\";\n}\ni.icon.gamepad:before {\n  content: \"\\f11b\";\n}\ni.icon.star.half.full:before {\n  content: \"\\f123\";\n}\ni.icon.broken.chain:before {\n  content: \"\\f127\";\n}\ni.icon.question:before {\n  content: \"\\f128\";\n}\ni.icon.exclamation:before {\n  content: \"\\f12a\";\n}\ni.icon.eraser:before {\n  content: \"\\f12d\";\n}\ni.icon.microphone:before {\n  content: \"\\f130\";\n}\ni.icon.microphone.slash:before {\n  content: \"\\f131\";\n}\ni.icon.shield:before {\n  content: \"\\f132\";\n}\ni.icon.target:before {\n  content: \"\\f140\";\n}\ni.icon.play.circle:before {\n  content: \"\\f144\";\n}\ni.icon.pencil.square:before {\n  content: \"\\f14b\";\n}\ni.icon.eur:before {\n  content: \"\\f153\";\n}\ni.icon.gbp:before {\n  content: \"\\f154\";\n}\ni.icon.usd:before {\n  content: \"\\f155\";\n}\ni.icon.inr:before {\n  content: \"\\f156\";\n}\ni.icon.cny:before,\ni.icon.jpy:before,\ni.icon.rmb:before {\n  content: \"\\f157\";\n}\ni.icon.rouble:before,\ni.icon.rub:before {\n  content: \"\\f158\";\n}\ni.icon.krw:before {\n  content: \"\\f159\";\n}\ni.icon.btc:before {\n  content: \"\\f15a\";\n}\ni.icon.gratipay:before {\n  content: \"\\f184\";\n}\ni.icon.zip:before {\n  content: \"\\f187\";\n}\ni.icon.dot.circle.outline:before {\n  content: \"\\f192\";\n}\ni.icon.try:before {\n  content: \"\\f195\";\n}\ni.icon.graduation:before {\n  content: \"\\f19d\";\n}\ni.icon.circle.outline:before {\n  content: \"\\f1db\";\n}\ni.icon.sliders:before {\n  content: \"\\f1de\";\n}\ni.icon.weixin:before {\n  content: \"\\f1d7\";\n}\ni.icon.teletype:before,\ni.icon.tty:before {\n  content: \"\\f1e4\";\n}\ni.icon.binoculars:before {\n  content: \"\\f1e5\";\n}\ni.icon.power.cord:before {\n  content: \"\\f1e6\";\n}\ni.icon.wi-fi:before {\n  content: \"\\f1eb\";\n}\ni.icon.visa.card:before {\n  content: \"\\f1f0\";\n}\ni.icon.mastercard.card:before {\n  content: \"\\f1f1\";\n}\ni.icon.discover.card:before {\n  content: \"\\f1f2\";\n}\ni.icon.american.express.card:before,\ni.icon.amex:before {\n  content: \"\\f1f3\";\n}\ni.icon.stripe.card:before {\n  content: \"\\f1f5\";\n}\ni.icon.bell.slash:before {\n  content: \"\\f1f6\";\n}\ni.icon.bell.slash.outline:before {\n  content: \"\\f1f7\";\n}\ni.icon.area.graph:before {\n  content: \"\\f1fe\";\n}\ni.icon.pie.graph:before {\n  content: \"\\f200\";\n}\ni.icon.line.graph:before {\n  content: \"\\f201\";\n}\ni.icon.cc:before {\n  content: \"\\f20a\";\n}\ni.icon.ils:before,\ni.icon.sheqel:before {\n  content: \"\\f20b\";\n}\ni.icon.plus.cart:before {\n  content: \"\\f217\";\n}\ni.icon.arrow.down.cart:before {\n  content: \"\\f218\";\n}\ni.icon.detective:before {\n  content: \"\\f21b\";\n}\ni.icon.venus:before {\n  content: \"\\f221\";\n}\ni.icon.mars:before {\n  content: \"\\f222\";\n}\ni.icon.mercury:before {\n  content: \"\\f223\";\n}\ni.icon.intersex:before {\n  content: \"\\f224\";\n}\ni.icon.female.homosexual:before,\ni.icon.venus.double:before {\n  content: \"\\f226\";\n}\ni.icon.male.homosexual:before,\ni.icon.mars.double:before {\n  content: \"\\f227\";\n}\ni.icon.venus.mars:before {\n  content: \"\\f228\";\n}\ni.icon.mars.alternate:before,\ni.icon.mars.stroke:before {\n  content: \"\\f229\";\n}\ni.icon.mars.stroke.vertical:before,\ni.icon.mars.vertical:before {\n  content: \"\\f22a\";\n}\ni.icon.mars.horizontal:before,\ni.icon.mars.stroke.horizontal:before {\n  content: \"\\f22b\";\n}\ni.icon.asexual:before {\n  content: \"\\f22d\";\n}\ni.icon.facebook.official:before {\n  content: \"\\f230\";\n}\ni.icon.user.plus:before {\n  content: \"\\f234\";\n}\ni.icon.user.cancel:before,\ni.icon.user.close:before,\ni.icon.user.delete:before,\ni.icon.user.times:before,\ni.icon.user.x:before {\n  content: \"\\f235\";\n}\ni.icon.bed:before {\n  content: \"\\f236\";\n}\ni.icon.yc:before,\ni.icon.ycombinator:before {\n  content: \"\\f23b\";\n}\ni.icon.battery.four:before {\n  content: \"\\f240\";\n}\ni.icon.battery.three.quarters:before,\ni.icon.battery.three:before {\n  content: \"\\f241\";\n}\ni.icon.battery.half:before,\ni.icon.battery.two:before {\n  content: \"\\f242\";\n}\ni.icon.battery.one:before,\ni.icon.battery.quarter:before {\n  content: \"\\f243\";\n}\ni.icon.battery.zero:before {\n  content: \"\\f244\";\n}\ni.icon.i.cursor:before {\n  content: \"\\f246\";\n}\ni.icon.japan.credit.bureau.card:before,\ni.icon.jcb:before {\n  content: \"\\f24b\";\n}\ni.icon.diners.club.card:before {\n  content: \"\\f24c\";\n}\ni.icon.balance:before {\n  content: \"\\f24e\";\n}\ni.icon.hourglass.outline:before,\ni.icon.hourglass.zero:before {\n  content: \"\\f250\";\n}\ni.icon.hourglass.one:before {\n  content: \"\\f251\";\n}\ni.icon.hourglass.two:before {\n  content: \"\\f252\";\n}\ni.icon.hourglass.three:before {\n  content: \"\\f253\";\n}\ni.icon.hourglass.four:before {\n  content: \"\\f254\";\n}\ni.icon.grab:before {\n  content: \"\\f255\";\n}\ni.icon.hand.victory:before {\n  content: \"\\f25b\";\n}\ni.icon.tm:before {\n  content: \"\\f25c\";\n}\ni.icon.r.circle:before {\n  content: \"\\f25d\";\n}\ni.icon.television:before {\n  content: \"\\f26c\";\n}\ni.icon.five.hundred.pixels:before {\n  content: \"\\f26e\";\n}\ni.icon.calendar.plus:before {\n  content: \"\\f271\";\n}\ni.icon.calendar.minus:before {\n  content: \"\\f272\";\n}\ni.icon.calendar.times:before {\n  content: \"\\f273\";\n}\ni.icon.calendar.check:before {\n  content: \"\\f274\";\n}\ni.icon.factory:before {\n  content: \"\\f275\";\n}\ni.icon.commenting:before {\n  content: \"\\f27a\";\n}\ni.icon.commenting.outline:before {\n  content: \"\\f27b\";\n}\ni.icon.edge:before,\ni.icon.ms.edge:before {\n  content: \"\\f282\";\n}\ni.icon.wordpress.beginner:before {\n  content: \"\\f297\";\n}\ni.icon.wordpress.forms:before {\n  content: \"\\f298\";\n}\ni.icon.envira:before {\n  content: \"\\f299\";\n}\ni.icon.question.circle.outline:before {\n  content: \"\\f29c\";\n}\ni.icon.ald:before,\ni.icon.als:before,\ni.icon.assistive.listening.devices:before {\n  content: \"\\f2a2\";\n}\ni.icon.asl.interpreting:before {\n  content: \"\\f2a3\";\n}\ni.icon.deaf:before {\n  content: \"\\f2a4\";\n}\ni.icon.american.sign.language.interpreting:before {\n  content: \"\\f2a3\";\n}\ni.icon.hard.of.hearing:before {\n  content: \"\\f2a4\";\n}\ni.icon.signing:before {\n  content: \"\\f2a7\";\n}\ni.icon.new.pied.piper:before {\n  content: \"\\f2ae\";\n}\ni.icon.theme.isle:before {\n  content: \"\\f2b2\";\n}\ni.icon.google.plus.official:before {\n  content: \"\\f2b3\";\n}\ni.icon.fa:before {\n  content: \"\\f2b4\";\n}\n.ui.image {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n  max-width: 100%;\n  background-color: transparent;\n}\nimg.ui.image {\n  display: block;\n}\n.ui.image img,\n.ui.image svg {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n.ui.hidden.image,\n.ui.hidden.images {\n  display: none;\n}\n.ui.hidden.transition.image,\n.ui.hidden.transition.images {\n  display: block;\n  visibility: hidden;\n}\n.ui.disabled.image,\n.ui.disabled.images {\n  cursor: default;\n  opacity: .45;\n}\n.ui.inline.image,\n.ui.inline.image img,\n.ui.inline.image svg {\n  display: inline-block;\n}\n.ui.top.aligned.image,\n.ui.top.aligned.image img,\n.ui.top.aligned.image svg,\n.ui.top.aligned.images .image {\n  display: inline-block;\n  vertical-align: top;\n}\n.ui.middle.aligned.image,\n.ui.middle.aligned.image img,\n.ui.middle.aligned.image svg,\n.ui.middle.aligned.images .image {\n  display: inline-block;\n  vertical-align: middle;\n}\n.ui.bottom.aligned.image,\n.ui.bottom.aligned.image img,\n.ui.bottom.aligned.image svg,\n.ui.bottom.aligned.images .image {\n  display: inline-block;\n  vertical-align: bottom;\n}\n.ui.rounded.image,\n.ui.rounded.image>*,\n.ui.rounded.images .image,\n.ui.rounded.images .image>* {\n  border-radius: .3125em;\n}\n.ui.bordered.image img,\n.ui.bordered.image svg,\n.ui.bordered.images .image,\n.ui.bordered.images img,\n.ui.bordered.images svg,\nimg.ui.bordered.image {\n  border: 1px solid rgba(0,0,0,.1);\n}\n.ui.circular.image,\n.ui.circular.images {\n  overflow: hidden;\n}\n.ui.circular.image,\n.ui.circular.image>*,\n.ui.circular.images .image,\n.ui.circular.images .image>* {\n  border-radius: 500rem;\n}\n.ui.fluid.image,\n.ui.fluid.image img,\n.ui.fluid.image svg,\n.ui.fluid.images,\n.ui.fluid.images img,\n.ui.fluid.images svg {\n  display: block;\n  width: 100%;\n  height: auto;\n}\n.ui.avatar.image,\n.ui.avatar.image img,\n.ui.avatar.image svg,\n.ui.avatar.images .image,\n.ui.avatar.images img,\n.ui.avatar.images svg {\n  margin-right: .25em;\n  display: inline-block;\n  width: 2em;\n  height: 2em;\n  border-radius: 500rem;\n}\n.ui.spaced.image {\n  display: inline-block!important;\n  margin-left: .5em;\n  margin-right: .5em;\n}\n.ui[class*=\"left spaced\"].image {\n  margin-left: .5em;\n  margin-right: 0;\n}\n.ui[class*=\"right spaced\"].image {\n  margin-left: 0;\n  margin-right: .5em;\n}\n.ui.floated.image,\n.ui.floated.images {\n  float: left;\n  margin-right: 1em;\n  margin-bottom: 1em;\n}\n.ui.right.floated.image,\n.ui.right.floated.images {\n  float: right;\n  margin-right: 0;\n  margin-bottom: 1em;\n  margin-left: 1em;\n}\n.ui.floated.image:last-child,\n.ui.floated.images:last-child {\n  margin-bottom: 0;\n}\n.ui.centered.image,\n.ui.centered.images {\n  margin-left: auto;\n  margin-right: auto;\n}\n.ui.mini.image,\n.ui.mini.images .image,\n.ui.mini.images img,\n.ui.mini.images svg {\n  width: 35px;\n  height: auto;\n  font-size: .78571429rem;\n}\n.ui.tiny.image,\n.ui.tiny.images .image,\n.ui.tiny.images img,\n.ui.tiny.images svg {\n  width: 80px;\n  height: auto;\n  font-size: .85714286rem;\n}\n.ui.small.image,\n.ui.small.images .image,\n.ui.small.images img,\n.ui.small.images svg {\n  width: 150px;\n  height: auto;\n  font-size: .92857143rem;\n}\n.ui.medium.image,\n.ui.medium.images .image,\n.ui.medium.images img,\n.ui.medium.images svg {\n  width: 300px;\n  height: auto;\n  font-size: 1rem;\n}\n.ui.large.image,\n.ui.large.images .image,\n.ui.large.images img,\n.ui.large.images svg {\n  width: 450px;\n  height: auto;\n  font-size: 1.14285714rem;\n}\n.ui.big.image,\n.ui.big.images .image,\n.ui.big.images img,\n.ui.big.images svg {\n  width: 600px;\n  height: auto;\n  font-size: 1.28571429rem;\n}\n.ui.huge.image,\n.ui.huge.images .image,\n.ui.huge.images img,\n.ui.huge.images svg {\n  width: 800px;\n  height: auto;\n  font-size: 1.42857143rem;\n}\n.ui.massive.image,\n.ui.massive.images .image,\n.ui.massive.images img,\n.ui.massive.images svg {\n  width: 960px;\n  height: auto;\n  font-size: 1.71428571rem;\n}\n.ui.images {\n  font-size: 0;\n  margin: 0 -.25rem;\n}\n.ui.images .image,\n.ui.images img,\n.ui.images svg {\n  display: inline-block;\n  margin: 0 .25rem .5rem;\n}\n.ui.input {\n  position: relative;\n  font-weight: 400;\n  font-style: normal;\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  color: rgba(0,0,0,.87);\n}\n.ui.input input {\n  margin: 0;\n  max-width: 100%;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  outline: 0;\n  -webkit-tap-highlight-color: rgba(255,255,255,0);\n  text-align: left;\n  line-height: 1.2142em;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  padding: .67861429em 1em;\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  color: rgba(0,0,0,.87);\n  border-radius: .28571429rem;\n  -webkit-transition: box-shadow .1s ease,border-color .1s ease;\n  transition: box-shadow .1s ease,border-color .1s ease;\n  box-shadow: none;\n}\n.ui.input input::-webkit-input-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.input input::-moz-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.input input:-ms-input-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.disabled.input,\n.ui.input input[disabled] {\n  opacity: .45;\n}\n.ui.disabled.input input,\n.ui.input input[disabled] {\n  pointer-events: none;\n}\n.ui.input input:active,\n.ui.input.down input {\n  border-color: rgba(0,0,0,.3);\n  background: #FAFAFA;\n  color: rgba(0,0,0,.87);\n  box-shadow: none;\n}\n.ui.loading.loading.input>i.icon:before {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.1);\n}\n.ui.loading.loading.input>i.icon:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  -webkit-animation: button-spin .6s linear;\n  animation: button-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n}\n.ui.input input:focus,\n.ui.input.focus input {\n  border-color: #85B7D9;\n  background: #FFF;\n  color: rgba(0,0,0,.8);\n  box-shadow: none;\n}\n.ui.input input:focus::-webkit-input-placeholder,\n.ui.input.focus input::-webkit-input-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.input input:focus::-moz-placeholder,\n.ui.input.focus input::-moz-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.input input:focus:-ms-input-placeholder,\n.ui.input.focus input:-ms-input-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.input.error input {\n  background-color: #FFF6F6;\n  border-color: #E0B4B4;\n  color: #9F3A38;\n  box-shadow: none;\n}\n.ui.input.error input::-webkit-input-placeholder {\n  color: #e7bdbc;\n}\n.ui.input.error input::-moz-placeholder {\n  color: #e7bdbc;\n}\n.ui.input.error input:-ms-input-placeholder {\n  color: #e7bdbc!important;\n}\n.ui.input.error input:focus::-webkit-input-placeholder {\n  color: #da9796;\n}\n.ui.input.error input:focus::-moz-placeholder {\n  color: #da9796;\n}\n.ui.input.error input:focus:-ms-input-placeholder {\n  color: #da9796!important;\n}\n.ui.transparent.input input {\n  border-color: transparent!important;\n  background-color: transparent!important;\n  padding: 0!important;\n  box-shadow: none!important;\n}\n.ui.transparent.icon.input>i.icon {\n  width: 1.1em;\n}\n.ui.transparent.icon.input>input {\n  padding-left: 0!important;\n  padding-right: 2em!important;\n}\n.ui.transparent[class*=\"left icon\"].input>input {\n  padding-left: 2em!important;\n  padding-right: 0!important;\n}\n.ui.transparent.inverted.input {\n  color: #FFF;\n}\n.ui.transparent.inverted.input input {\n  color: inherit;\n}\n.ui.transparent.inverted.input input::-webkit-input-placeholder {\n  color: rgba(255,255,255,.5);\n}\n.ui.transparent.inverted.input input::-moz-placeholder {\n  color: rgba(255,255,255,.5);\n}\n.ui.transparent.inverted.input input:-ms-input-placeholder {\n  color: rgba(255,255,255,.5);\n}\n.ui.icon.input>i.icon {\n  cursor: default;\n  position: absolute;\n  line-height: 1;\n  text-align: center;\n  top: 0;\n  right: 0;\n  margin: 0;\n  height: 100%;\n  width: 2.67142857em;\n  opacity: .5;\n  border-radius: 0 .28571429rem .28571429rem 0;\n  -webkit-transition: opacity .3s ease;\n  transition: opacity .3s ease;\n}\n.ui.icon.input>i.icon:not(.link) {\n  pointer-events: none;\n}\n.ui.icon.input input {\n  padding-right: 2.67142857em!important;\n}\n.ui.icon.input>i.icon:after,\n.ui.icon.input>i.icon:before {\n  left: 0;\n  position: absolute;\n  text-align: center;\n  top: 50%;\n  width: 100%;\n  margin-top: -.5em;\n}\n.ui.icon.input>i.link.icon {\n  cursor: pointer;\n}\n.ui.icon.input>i.circular.icon {\n  top: .35em;\n  right: .5em;\n}\n.ui[class*=\"left icon\"].input>i.icon {\n  right: auto;\n  left: 1px;\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui[class*=\"left icon\"].input>i.circular.icon {\n  right: auto;\n  left: .5em;\n}\n.ui[class*=\"left icon\"].input>input {\n  padding-left: 2.67142857em!important;\n  padding-right: 1em!important;\n}\n.ui.icon.input>input:focus~i.icon {\n  opacity: 1;\n}\n.ui.labeled.input>.label {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  margin: 0;\n  font-size: 1em;\n}\n.ui.labeled.input>.label:not(.corner) {\n  padding-top: .78571429em;\n  padding-bottom: .78571429em;\n}\n.ui.labeled.input:not([class*=\"corner labeled\"]) .label:first-child {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.labeled.input:not([class*=\"corner labeled\"]) .label:first-child+input {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n  border-left-color: transparent;\n}\n.ui.labeled.input:not([class*=\"corner labeled\"]) .label:first-child+input:focus {\n  border-left-color: #85B7D9;\n}\n.ui[class*=\"right labeled\"].input input {\n  border-top-right-radius: 0!important;\n  border-bottom-right-radius: 0!important;\n  border-right-color: transparent!important;\n}\n.ui[class*=\"right labeled\"].input input+.label {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.ui[class*=\"right labeled\"].input input:focus {\n  border-right-color: #85B7D9!important;\n}\n.ui.labeled.input .corner.label {\n  top: 1px;\n  right: 1px;\n  font-size: .64285714em;\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui[class*=\"corner labeled\"]:not([class*=\"left corner labeled\"]).labeled.input input {\n  padding-right: 2.5em!important;\n}\n.ui[class*=\"corner labeled\"].icon.input:not([class*=\"left corner labeled\"])>input {\n  padding-right: 3.25em!important;\n}\n.ui[class*=\"corner labeled\"].icon.input:not([class*=\"left corner labeled\"])>.icon {\n  margin-right: 1.25em;\n}\n.ui[class*=\"left corner labeled\"].labeled.input input {\n  padding-left: 2.5em!important;\n}\n.ui[class*=\"left corner labeled\"].icon.input>input {\n  padding-left: 3.25em!important;\n}\n.ui[class*=\"left corner labeled\"].icon.input>.icon {\n  margin-left: 1.25em;\n}\n.ui.input>.ui.corner.label {\n  top: 1px;\n  right: 1px;\n}\n.ui.input>.ui.left.corner.label {\n  right: auto;\n  left: 1px;\n}\n.ui.action.input>.button,\n.ui.action.input>.buttons {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n}\n.ui.action.input>.button,\n.ui.action.input>.buttons>.button {\n  padding-top: .78571429em;\n  padding-bottom: .78571429em;\n  margin: 0;\n}\n.ui.action.input:not([class*=\"left action\"])>input {\n  border-top-right-radius: 0!important;\n  border-bottom-right-radius: 0!important;\n  border-right-color: transparent!important;\n}\n.ui.action.input:not([class*=\"left action\"])>.button:not(:first-child),\n.ui.action.input:not([class*=\"left action\"])>.buttons:not(:first-child)>.button,\n.ui.action.input:not([class*=\"left action\"])>.dropdown:not(:first-child) {\n  border-radius: 0;\n}\n.ui.action.input:not([class*=\"left action\"])>.button:last-child,\n.ui.action.input:not([class*=\"left action\"])>.buttons:last-child>.button,\n.ui.action.input:not([class*=\"left action\"])>.dropdown:last-child {\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui.action.input:not([class*=\"left action\"]) input:focus {\n  border-right-color: #85B7D9!important;\n}\n.ui[class*=\"left action\"].input>input {\n  border-top-left-radius: 0!important;\n  border-bottom-left-radius: 0!important;\n  border-left-color: transparent!important;\n}\n.ui[class*=\"left action\"].input>.button,\n.ui[class*=\"left action\"].input>.buttons>.button,\n.ui[class*=\"left action\"].input>.dropdown {\n  border-radius: 0;\n}\n.ui[class*=\"left action\"].input>.button:first-child,\n.ui[class*=\"left action\"].input>.buttons:first-child>.button,\n.ui[class*=\"left action\"].input>.dropdown:first-child {\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui[class*=\"left action\"].input>input:focus {\n  border-left-color: #85B7D9!important;\n}\n.ui.inverted.input input {\n  border: none;\n}\n.ui.fluid.input {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.fluid.input>input {\n  width: 0!important;\n}\n.ui.mini.input {\n  font-size: .78571429em;\n}\n.ui.small.input {\n  font-size: .92857143em;\n}\n.ui.input {\n  font-size: 1em;\n}\n.ui.large.input {\n  font-size: 1.14285714em;\n}\n.ui.big.input {\n  font-size: 1.28571429em;\n}\n.ui.huge.input {\n  font-size: 1.42857143em;\n}\n.ui.massive.input {\n  font-size: 1.71428571em;\n}\n.ui.label {\n  display: inline-block;\n  line-height: 1;\n  vertical-align: baseline;\n  margin: 0 .14285714em;\n  background-color: #E8E8E8;\n  background-image: none;\n  padding: .5833em .833em;\n  color: rgba(0,0,0,.6);\n  text-transform: none;\n  font-weight: 700;\n  border: 0 solid transparent;\n  border-radius: .28571429rem;\n  -webkit-transition: background .1s ease;\n  transition: background .1s ease;\n}\n.ui.label:first-child {\n  margin-left: 0;\n}\n.ui.label:last-child {\n  margin-right: 0;\n}\na.ui.label {\n  cursor: pointer;\n}\n.ui.label>a {\n  cursor: pointer;\n  color: inherit;\n  opacity: .5;\n  -webkit-transition: .1s opacity ease;\n  transition: .1s opacity ease;\n}\n.ui.label>a:hover {\n  opacity: 1;\n}\n.ui.label>img {\n  width: auto!important;\n  vertical-align: middle;\n  height: 2.1666em!important;\n}\n.ui.label>.icon {\n  width: auto;\n  margin: 0 .75em 0 0;\n}\n.ui.label>.detail {\n  display: inline-block;\n  vertical-align: top;\n  font-weight: 700;\n  margin-left: 1em;\n  opacity: .8;\n}\n.ui.label>.detail .icon {\n  margin: 0 .25em 0 0;\n}\n.ui.label>.close.icon,\n.ui.label>.delete.icon {\n  cursor: pointer;\n  margin-right: 0;\n  margin-left: .5em;\n  font-size: .92857143em;\n  opacity: .5;\n  -webkit-transition: background .1s ease;\n  transition: background .1s ease;\n}\n.ui.label>.delete.icon:hover {\n  opacity: 1;\n}\n.ui.labels>.label {\n  margin: 0 .5em .5em 0;\n}\n.ui.header>.ui.label {\n  margin-top: -.29165em;\n}\n.ui.attached.segment>.ui.top.left.attached.label,\n.ui.bottom.attached.segment>.ui.top.left.attached.label {\n  border-top-left-radius: 0;\n}\n.ui.attached.segment>.ui.top.right.attached.label,\n.ui.bottom.attached.segment>.ui.top.right.attached.label {\n  border-top-right-radius: 0;\n}\n.ui.top.attached.segment>.ui.bottom.left.attached.label {\n  border-bottom-left-radius: 0;\n}\n.ui.top.attached.segment>.ui.bottom.right.attached.label {\n  border-bottom-right-radius: 0;\n}\n.ui.top.attached.label+[class*=\"right floated\"]+*,\n.ui.top.attached.label:first-child+:not(.attached) {\n  margin-top: 2rem!important;\n}\n.ui.bottom.attached.label:first-child~:last-child:not(.attached) {\n  margin-top: 0;\n  margin-bottom: 2rem!important;\n}\n.ui.image.label {\n  width: auto!important;\n  margin-top: 0;\n  margin-bottom: 0;\n  max-width: 9999px;\n  vertical-align: baseline;\n  text-transform: none;\n  background: #E8E8E8;\n  padding: .5833em .833em .5833em .5em;\n  border-radius: .28571429rem;\n  box-shadow: none;\n}\n.ui.image.label img {\n  display: inline-block;\n  vertical-align: top;\n  height: 2.1666em;\n  margin: -.5833em .5em -.5833em -.5em;\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui.image.label .detail {\n  background: rgba(0,0,0,.1);\n  margin: -.5833em -.833em -.5833em .5em;\n  padding: .5833em .833em;\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui.tag.label,\n.ui.tag.labels .label {\n  margin-left: 1em;\n  position: relative;\n  padding-left: 1.5em;\n  padding-right: 1.5em;\n  border-radius: 0 .28571429rem .28571429rem 0;\n  -webkit-transition: none;\n  transition: none;\n}\n.ui.tag.label:before,\n.ui.tag.labels .label:before {\n  position: absolute;\n  -webkit-transform: translateY(-50%) translateX(50%) rotate(-45deg);\n  -ms-transform: translateY(-50%) translateX(50%) rotate(-45deg);\n  transform: translateY(-50%) translateX(50%) rotate(-45deg);\n  top: 50%;\n  right: 100%;\n  content: '';\n  background-color: inherit;\n  background-image: none;\n  width: 1.56em;\n  height: 1.56em;\n  -webkit-transition: none;\n  transition: none;\n}\n.ui.tag.label:after,\n.ui.tag.labels .label:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: -.25em;\n  margin-top: -.25em;\n  background-color: #FFF!important;\n  width: .5em;\n  height: .5em;\n  box-shadow: 0 -1px 1px 0 rgba(0,0,0,.3);\n  border-radius: 500rem;\n}\n.ui.corner.label {\n  position: absolute;\n  top: 0;\n  right: 0;\n  margin: 0;\n  padding: 0;\n  text-align: center;\n  border-color: #E8E8E8;\n  width: 4em;\n  height: 4em;\n  z-index: 1;\n  -webkit-transition: border-color .1s ease;\n  transition: border-color .1s ease;\n  background-color: transparent!important;\n}\n.ui.corner.label:after {\n  position: absolute;\n  content: \"\";\n  right: 0;\n  top: 0;\n  z-index: -1;\n  width: 0;\n  height: 0;\n  background-color: transparent!important;\n  border-top: 0 solid transparent;\n  border-right: 4em solid transparent;\n  border-bottom: 4em solid transparent;\n  border-left: 0 solid transparent;\n  border-right-color: inherit;\n  -webkit-transition: border-color .1s ease;\n  transition: border-color .1s ease;\n}\n.ui.corner.label .icon {\n  cursor: default;\n  position: relative;\n  top: .64285714em;\n  left: .78571429em;\n  font-size: 1.14285714em;\n  margin: 0;\n}\n.ui.left.corner.label,\n.ui.left.corner.label:after {\n  right: auto;\n  left: 0;\n}\n.ui.left.corner.label:after {\n  border-top: 4em solid transparent;\n  border-right: 4em solid transparent;\n  border-bottom: 0 solid transparent;\n  border-left: 0 solid transparent;\n  border-top-color: inherit;\n}\n.ui.left.corner.label .icon {\n  left: -.78571429em;\n}\n.ui.segment>.ui.corner.label {\n  top: -1px;\n  right: -1px;\n}\n.ui.segment>.ui.left.corner.label {\n  right: auto;\n  left: -1px;\n}\n.ui.ribbon.label {\n  position: relative;\n  margin: 0;\n  min-width: -webkit-max-content;\n  min-width: -moz-max-content;\n  min-width: max-content;\n  border-radius: 0 .28571429rem .28571429rem 0;\n  border-color: rgba(0,0,0,.15);\n}\n.ui.ribbon.label:after {\n  position: absolute;\n  content: '';\n  top: 100%;\n  left: 0;\n  background-color: transparent!important;\n  border-style: solid;\n  border-width: 0 1.2em 1.2em 0;\n  border-color: transparent;\n  border-right-color: inherit;\n  width: 0;\n  height: 0;\n}\n.ui.ribbon.label {\n  left: calc(-1rem - 1.2em);\n  margin-right: -1.2em;\n  padding-left: calc(1rem + 1.2em);\n  padding-right: 1.2em;\n}\n.ui[class*=\"right ribbon\"].label {\n  left: calc(100% + 1rem + 1.2em);\n  padding-left: 1.2em;\n  padding-right: calc(1rem + 1.2em);\n  text-align: left;\n  -webkit-transform: translateX(-100%);\n  -ms-transform: translateX(-100%);\n  transform: translateX(-100%);\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui[class*=\"right ribbon\"].label:after {\n  left: auto;\n  right: 0;\n  border-style: solid;\n  border-width: 1.2em 1.2em 0 0;\n  border-color: transparent;\n  border-top-color: inherit;\n}\n.ui.card .image>.ribbon.label,\n.ui.image>.ribbon.label {\n  position: absolute;\n  top: 1rem;\n}\n.ui.card .image>.ui.ribbon.label,\n.ui.image>.ui.ribbon.label {\n  left: calc(.05rem - 1.2em);\n}\n.ui.card .image>.ui[class*=\"right ribbon\"].label,\n.ui.image>.ui[class*=\"right ribbon\"].label {\n  left: calc(100% + -.05rem + 1.2em);\n  padding-left: .833em;\n}\n.ui.table td>.ui.ribbon.label {\n  left: calc(-.78571429em - 1.2em);\n}\n.ui.table td>.ui[class*=\"right ribbon\"].label {\n  left: calc(100% + .78571429em + 1.2em);\n  padding-left: .833em;\n}\n.ui.attached.label,\n.ui[class*=\"top attached\"].label {\n  width: 100%;\n  position: absolute;\n  margin: 0;\n  top: 0;\n  left: 0;\n  padding: .75em 1em;\n  border-radius: .21428571rem .21428571rem 0 0;\n}\n.ui[class*=\"bottom attached\"].label {\n  top: auto;\n  bottom: 0;\n  border-radius: 0 0 .21428571rem .21428571rem;\n}\n.ui[class*=\"top left attached\"].label {\n  width: auto;\n  margin-top: 0!important;\n  border-radius: .21428571rem 0 .28571429rem;\n}\n.ui[class*=\"top right attached\"].label {\n  width: auto;\n  left: auto;\n  right: 0;\n  border-radius: 0 .21428571rem 0 .28571429rem;\n}\n.ui[class*=\"bottom left attached\"].label {\n  width: auto;\n  top: auto;\n  bottom: 0;\n  border-radius: 0 .28571429rem 0 .21428571rem;\n}\n.ui[class*=\"bottom right attached\"].label {\n  top: auto;\n  bottom: 0;\n  left: auto;\n  right: 0;\n  width: auto;\n  border-radius: .28571429rem 0 .21428571rem;\n}\n.ui.label.disabled {\n  opacity: .5;\n}\na.ui.label:hover,\na.ui.labels .label:hover {\n  background-color: #E0E0E0;\n  border-color: #E0E0E0;\n  background-image: none;\n  color: rgba(0,0,0,.8);\n}\n.ui.labels a.label:hover:before,\na.ui.label:hover:before {\n  color: rgba(0,0,0,.8);\n}\n.ui.active.label {\n  background-color: #D0D0D0;\n  border-color: #D0D0D0;\n  background-image: none;\n  color: rgba(0,0,0,.95);\n}\n.ui.active.label:before {\n  background-color: #D0D0D0;\n  background-image: none;\n  color: rgba(0,0,0,.95);\n}\na.ui.active.label:hover,\na.ui.labels .active.label:hover {\n  background-color: #C8C8C8;\n  border-color: #C8C8C8;\n  background-image: none;\n  color: rgba(0,0,0,.95);\n}\n.ui.labels a.active.label:ActiveHover:before,\na.ui.active.label:ActiveHover:before {\n  background-color: #C8C8C8;\n  background-image: none;\n  color: rgba(0,0,0,.95);\n}\n.ui.label.visible:not(.dropdown),\n.ui.labels.visible .label {\n  display: inline-block!important;\n}\n.ui.label.hidden,\n.ui.labels.hidden .label {\n  display: none!important;\n}\n.ui.red.label,\n.ui.red.labels .label {\n  background-color: #DB2828!important;\n  border-color: #DB2828!important;\n  color: #FFF!important;\n}\n.ui.red.labels .label:hover,\na.ui.red.label:hover {\n  background-color: #d01919!important;\n  border-color: #d01919!important;\n  color: #FFF!important;\n}\n.ui.red.corner.label,\n.ui.red.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.red.ribbon.label {\n  border-color: #b21e1e!important;\n}\n.ui.basic.red.label {\n  background-color: #FFF!important;\n  color: #DB2828!important;\n  border-color: #DB2828!important;\n}\n.ui.basic.red.labels a.label:hover,\na.ui.basic.red.label:hover {\n  background-color: #FFF!important;\n  color: #d01919!important;\n  border-color: #d01919!important;\n}\n.ui.orange.label,\n.ui.orange.labels .label {\n  background-color: #F2711C!important;\n  border-color: #F2711C!important;\n  color: #FFF!important;\n}\n.ui.orange.labels .label:hover,\na.ui.orange.label:hover {\n  background-color: #f26202!important;\n  border-color: #f26202!important;\n  color: #FFF!important;\n}\n.ui.orange.corner.label,\n.ui.orange.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.orange.ribbon.label {\n  border-color: #cf590c!important;\n}\n.ui.basic.orange.label {\n  background-color: #FFF!important;\n  color: #F2711C!important;\n  border-color: #F2711C!important;\n}\n.ui.basic.orange.labels a.label:hover,\na.ui.basic.orange.label:hover {\n  background-color: #FFF!important;\n  color: #f26202!important;\n  border-color: #f26202!important;\n}\n.ui.yellow.label,\n.ui.yellow.labels .label {\n  background-color: #FBBD08!important;\n  border-color: #FBBD08!important;\n  color: #FFF!important;\n}\n.ui.yellow.labels .label:hover,\na.ui.yellow.label:hover {\n  background-color: #eaae00!important;\n  border-color: #eaae00!important;\n  color: #FFF!important;\n}\n.ui.yellow.corner.label,\n.ui.yellow.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.yellow.ribbon.label {\n  border-color: #cd9903!important;\n}\n.ui.basic.yellow.label {\n  background-color: #FFF!important;\n  color: #FBBD08!important;\n  border-color: #FBBD08!important;\n}\n.ui.basic.yellow.labels a.label:hover,\na.ui.basic.yellow.label:hover {\n  background-color: #FFF!important;\n  color: #eaae00!important;\n  border-color: #eaae00!important;\n}\n.ui.olive.label,\n.ui.olive.labels .label {\n  background-color: #B5CC18!important;\n  border-color: #B5CC18!important;\n  color: #FFF!important;\n}\n.ui.olive.labels .label:hover,\na.ui.olive.label:hover {\n  background-color: #a7bd0d!important;\n  border-color: #a7bd0d!important;\n  color: #FFF!important;\n}\n.ui.olive.corner.label,\n.ui.olive.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.olive.ribbon.label {\n  border-color: #198f35!important;\n}\n.ui.basic.olive.label {\n  background-color: #FFF!important;\n  color: #B5CC18!important;\n  border-color: #B5CC18!important;\n}\n.ui.basic.olive.labels a.label:hover,\na.ui.basic.olive.label:hover {\n  background-color: #FFF!important;\n  color: #a7bd0d!important;\n  border-color: #a7bd0d!important;\n}\n.ui.green.label,\n.ui.green.labels .label {\n  background-color: #21BA45!important;\n  border-color: #21BA45!important;\n  color: #FFF!important;\n}\n.ui.green.labels .label:hover,\na.ui.green.label:hover {\n  background-color: #16ab39!important;\n  border-color: #16ab39!important;\n  color: #FFF!important;\n}\n.ui.green.corner.label,\n.ui.green.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.green.ribbon.label {\n  border-color: #198f35!important;\n}\n.ui.basic.green.label {\n  background-color: #FFF!important;\n  color: #21BA45!important;\n  border-color: #21BA45!important;\n}\n.ui.basic.green.labels a.label:hover,\na.ui.basic.green.label:hover {\n  background-color: #FFF!important;\n  color: #16ab39!important;\n  border-color: #16ab39!important;\n}\n.ui.teal.label,\n.ui.teal.labels .label {\n  background-color: #00B5AD!important;\n  border-color: #00B5AD!important;\n  color: #FFF!important;\n}\n.ui.teal.labels .label:hover,\na.ui.teal.label:hover {\n  background-color: #009c95!important;\n  border-color: #009c95!important;\n  color: #FFF!important;\n}\n.ui.teal.corner.label,\n.ui.teal.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.teal.ribbon.label {\n  border-color: #00827c!important;\n}\n.ui.basic.teal.label {\n  background-color: #FFF!important;\n  color: #00B5AD!important;\n  border-color: #00B5AD!important;\n}\n.ui.basic.teal.labels a.label:hover,\na.ui.basic.teal.label:hover {\n  background-color: #FFF!important;\n  color: #009c95!important;\n  border-color: #009c95!important;\n}\n.ui.blue.label,\n.ui.blue.labels .label {\n  background-color: #2185D0!important;\n  border-color: #2185D0!important;\n  color: #FFF!important;\n}\n.ui.blue.labels .label:hover,\na.ui.blue.label:hover {\n  background-color: #1678c2!important;\n  border-color: #1678c2!important;\n  color: #FFF!important;\n}\n.ui.blue.corner.label,\n.ui.blue.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.blue.ribbon.label {\n  border-color: #1a69a4!important;\n}\n.ui.basic.blue.label {\n  background-color: #FFF!important;\n  color: #2185D0!important;\n  border-color: #2185D0!important;\n}\n.ui.basic.blue.labels a.label:hover,\na.ui.basic.blue.label:hover {\n  background-color: #FFF!important;\n  color: #1678c2!important;\n  border-color: #1678c2!important;\n}\n.ui.violet.label,\n.ui.violet.labels .label {\n  background-color: #6435C9!important;\n  border-color: #6435C9!important;\n  color: #FFF!important;\n}\n.ui.violet.labels .label:hover,\na.ui.violet.label:hover {\n  background-color: #5829bb!important;\n  border-color: #5829bb!important;\n  color: #FFF!important;\n}\n.ui.violet.corner.label,\n.ui.violet.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.violet.ribbon.label {\n  border-color: #502aa1!important;\n}\n.ui.basic.violet.label {\n  background-color: #FFF!important;\n  color: #6435C9!important;\n  border-color: #6435C9!important;\n}\n.ui.basic.violet.labels a.label:hover,\na.ui.basic.violet.label:hover {\n  background-color: #FFF!important;\n  color: #5829bb!important;\n  border-color: #5829bb!important;\n}\n.ui.purple.label,\n.ui.purple.labels .label {\n  background-color: #A333C8!important;\n  border-color: #A333C8!important;\n  color: #FFF!important;\n}\n.ui.purple.labels .label:hover,\na.ui.purple.label:hover {\n  background-color: #9627ba!important;\n  border-color: #9627ba!important;\n  color: #FFF!important;\n}\n.ui.purple.corner.label,\n.ui.purple.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.purple.ribbon.label {\n  border-color: #82299f!important;\n}\n.ui.basic.purple.label {\n  background-color: #FFF!important;\n  color: #A333C8!important;\n  border-color: #A333C8!important;\n}\n.ui.basic.purple.labels a.label:hover,\na.ui.basic.purple.label:hover {\n  background-color: #FFF!important;\n  color: #9627ba!important;\n  border-color: #9627ba!important;\n}\n.ui.pink.label,\n.ui.pink.labels .label {\n  background-color: #E03997!important;\n  border-color: #E03997!important;\n  color: #FFF!important;\n}\n.ui.pink.labels .label:hover,\na.ui.pink.label:hover {\n  background-color: #e61a8d!important;\n  border-color: #e61a8d!important;\n  color: #FFF!important;\n}\n.ui.pink.corner.label,\n.ui.pink.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.pink.ribbon.label {\n  border-color: #c71f7e!important;\n}\n.ui.basic.pink.label {\n  background-color: #FFF!important;\n  color: #E03997!important;\n  border-color: #E03997!important;\n}\n.ui.basic.pink.labels a.label:hover,\na.ui.basic.pink.label:hover {\n  background-color: #FFF!important;\n  color: #e61a8d!important;\n  border-color: #e61a8d!important;\n}\n.ui.brown.label,\n.ui.brown.labels .label {\n  background-color: #A5673F!important;\n  border-color: #A5673F!important;\n  color: #FFF!important;\n}\n.ui.brown.labels .label:hover,\na.ui.brown.label:hover {\n  background-color: #975b33!important;\n  border-color: #975b33!important;\n  color: #FFF!important;\n}\n.ui.brown.corner.label,\n.ui.brown.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.brown.ribbon.label {\n  border-color: #805031!important;\n}\n.ui.basic.brown.label {\n  background-color: #FFF!important;\n  color: #A5673F!important;\n  border-color: #A5673F!important;\n}\n.ui.basic.brown.labels a.label:hover,\na.ui.basic.brown.label:hover {\n  background-color: #FFF!important;\n  color: #975b33!important;\n  border-color: #975b33!important;\n}\n.ui.grey.label,\n.ui.grey.labels .label {\n  background-color: #767676!important;\n  border-color: #767676!important;\n  color: #FFF!important;\n}\n.ui.grey.labels .label:hover,\na.ui.grey.label:hover {\n  background-color: #838383!important;\n  border-color: #838383!important;\n  color: #FFF!important;\n}\n.ui.grey.corner.label,\n.ui.grey.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.grey.ribbon.label {\n  border-color: #805031!important;\n}\n.ui.basic.grey.label {\n  background-color: #FFF!important;\n  color: #767676!important;\n  border-color: #767676!important;\n}\n.ui.basic.grey.labels a.label:hover,\na.ui.basic.grey.label:hover {\n  background-color: #FFF!important;\n  color: #838383!important;\n  border-color: #838383!important;\n}\n.ui.black.label,\n.ui.black.labels .label {\n  background-color: #1B1C1D!important;\n  border-color: #1B1C1D!important;\n  color: #FFF!important;\n}\n.ui.black.labels .label:hover,\na.ui.black.label:hover {\n  background-color: #27292a!important;\n  border-color: #27292a!important;\n  color: #FFF!important;\n}\n.ui.black.corner.label,\n.ui.black.corner.label:hover {\n  background-color: transparent!important;\n}\n.ui.black.ribbon.label {\n  border-color: #805031!important;\n}\n.ui.basic.black.label {\n  background-color: #FFF!important;\n  color: #1B1C1D!important;\n  border-color: #1B1C1D!important;\n}\n.ui.basic.black.labels a.label:hover,\na.ui.basic.black.label:hover {\n  background-color: #FFF!important;\n  color: #27292a!important;\n  border-color: #27292a!important;\n}\n.ui.basic.label {\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  color: rgba(0,0,0,.87);\n  box-shadow: none;\n}\na.ui.basic.label:hover {\n  text-decoration: none;\n  background: #FFF;\n  color: #1e70bf;\n  box-shadow: 1px solid rgba(34,36,38,.15);\n  box-shadow: none;\n}\n.ui.basic.pointing.label:before {\n  border-color: inherit;\n}\n.ui.fluid.labels>.label,\n.ui.label.fluid {\n  width: 100%;\n  box-sizing: border-box;\n}\n.ui.inverted.label,\n.ui.inverted.labels .label {\n  color: rgba(255,255,255,.9)!important;\n}\n.ui.horizontal.label,\n.ui.horizontal.labels .label {\n  margin: 0 .5em 0 0;\n  padding: .4em .833em;\n  min-width: 3em;\n  text-align: center;\n}\n.ui.circular.label,\n.ui.circular.labels .label {\n  min-width: 2em;\n  min-height: 2em;\n  padding: .5em!important;\n  line-height: 1em;\n  text-align: center;\n  border-radius: 500rem;\n}\n.ui.empty.circular.label,\n.ui.empty.circular.labels .label {\n  min-width: 0;\n  min-height: 0;\n  overflow: hidden;\n  width: .5em;\n  height: .5em;\n  vertical-align: baseline;\n}\n.ui.pointing.label {\n  position: relative;\n}\n.ui.attached.pointing.label {\n  position: absolute;\n}\n.ui.pointing.label:before {\n  background-color: inherit;\n  border-style: solid;\n  border-color: inherit;\n  position: absolute;\n  content: '';\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n  background-image: none;\n  z-index: 2;\n  width: .6666em;\n  height: .6666em;\n  -webkit-transition: background .1s ease;\n  transition: background .1s ease;\n}\n.ui.pointing.label,\n.ui[class*=\"pointing above\"].label {\n  margin-top: 1em;\n}\n.ui.pointing.label:before,\n.ui[class*=\"pointing above\"].label:before {\n  border-width: 1px 0 0 1px;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  top: 0;\n  left: 50%;\n}\n.ui[class*=\"bottom pointing\"].label,\n.ui[class*=\"pointing below\"].label {\n  margin-top: 0;\n  margin-bottom: 1em;\n}\n.ui[class*=\"bottom pointing\"].label:before,\n.ui[class*=\"pointing below\"].label:before {\n  border-width: 0 1px 1px 0;\n  right: auto;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  top: 100%;\n  left: 50%;\n}\n.ui[class*=\"left pointing\"].label {\n  margin-top: 0;\n  margin-left: .6666em;\n}\n.ui[class*=\"left pointing\"].label:before {\n  border-width: 0 0 1px 1px;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  bottom: auto;\n  right: auto;\n  top: 50%;\n  left: 0;\n}\n.ui[class*=\"right pointing\"].label {\n  margin-top: 0;\n  margin-right: .6666em;\n}\n.ui[class*=\"right pointing\"].label:before {\n  border-width: 1px 1px 0 0;\n  -webkit-transform: translateX(50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(50%) translateY(-50%) rotate(45deg);\n  transform: translateX(50%) translateY(-50%) rotate(45deg);\n  top: 50%;\n  right: 0;\n  bottom: auto;\n  left: auto;\n}\n.ui.basic.pointing.label:before,\n.ui.basic[class*=\"pointing above\"].label:before {\n  margin-top: -1px;\n}\n.ui.basic[class*=\"bottom pointing\"].label:before,\n.ui.basic[class*=\"pointing below\"].label:before {\n  bottom: auto;\n  top: 100%;\n  margin-top: 1px;\n}\n.ui.basic[class*=\"left pointing\"].label:before {\n  top: 50%;\n  left: -1px;\n}\n.ui.basic[class*=\"right pointing\"].label:before {\n  top: 50%;\n  right: -1px;\n}\n.ui.floating.label {\n  position: absolute;\n  z-index: 100;\n  top: -1em;\n  left: 100%;\n  margin: 0 0 0 -1.5em!important;\n}\n.ui.mini.label,\n.ui.mini.labels .label {\n  font-size: .64285714rem;\n}\n.ui.tiny.label,\n.ui.tiny.labels .label {\n  font-size: .71428571rem;\n}\n.ui.small.label,\n.ui.small.labels .label {\n  font-size: .78571429rem;\n}\n.ui.label,\n.ui.labels .label {\n  font-size: .85714286rem;\n}\n.ui.large.label,\n.ui.large.labels .label {\n  font-size: 1rem;\n}\n.ui.big.label,\n.ui.big.labels .label {\n  font-size: 1.28571429rem;\n}\n.ui.huge.label,\n.ui.huge.labels .label {\n  font-size: 1.42857143rem;\n}\n.ui.massive.label,\n.ui.massive.labels .label {\n  font-size: 1.71428571rem;\n}\n.ui.list,\nol.ui.list,\nul.ui.list {\n  list-style-type: none;\n  margin: 1em 0;\n  padding: 0;\n}\n.ui.list:first-child,\nol.ui.list:first-child,\nul.ui.list:first-child {\n  margin-top: 0;\n  padding-top: 0;\n}\n.ui.list:last-child,\nol.ui.list:last-child,\nul.ui.list:last-child {\n  margin-bottom: 0;\n  padding-bottom: 0;\n}\n.ui.list .list>.item,\n.ui.list>.item,\nol.ui.list li,\nul.ui.list li {\n  display: list-item;\n  table-layout: fixed;\n  list-style-type: none;\n  list-style-position: outside;\n  padding: .21428571em 0;\n  line-height: 1.14285714em;\n}\n.ui.list>.item:after,\n.ui.list>.list>.item,\nol.ui.list>li:first-child:after,\nul.ui.list>li:first-child:after {\n  content: '';\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.ui.list .list>.item:first-child,\n.ui.list>.item:first-child,\nol.ui.list li:first-child,\nul.ui.list li:first-child {\n  padding-top: 0;\n}\n.ui.list .list>.item:last-child,\n.ui.list>.item:last-child,\nol.ui.list li:last-child,\nul.ui.list li:last-child {\n  padding-bottom: 0;\n}\n.ui.list .list,\nol.ui.list ol,\nul.ui.list ul {\n  clear: both;\n  margin: 0;\n  padding: .75em 0 .25em .5em;\n}\n.ui.list .list>.item,\nol.ui.list ol li,\nul.ui.list ul li {\n  padding: .14285714em 0;\n  line-height: inherit;\n}\n.ui.list .list>.item>i.icon,\n.ui.list>.item>i.icon {\n  display: table-cell;\n  margin: 0;\n  padding-top: .07142857em;\n  padding-right: .28571429em;\n  vertical-align: top;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.list .list>.item>i.icon:only-child,\n.ui.list>.item>i.icon:only-child {\n  display: inline-block;\n  vertical-align: top;\n}\n.ui.list .list>.item>.image,\n.ui.list>.item>.image {\n  display: table-cell;\n  background-color: transparent;\n  margin: 0;\n  vertical-align: top;\n}\n.ui.list .list>.item>.image:not(:only-child):not(img),\n.ui.list>.item>.image:not(:only-child):not(img) {\n  padding-right: .5em;\n}\n.ui.list .list>.item>.image img,\n.ui.list>.item>.image img {\n  vertical-align: top;\n}\n.ui.list .list>.item>.image:only-child,\n.ui.list .list>.item>img.image,\n.ui.list>.item>.image:only-child,\n.ui.list>.item>img.image {\n  display: inline-block;\n}\n.ui.list .list>.item>.content,\n.ui.list>.item>.content {\n  line-height: 1.14285714em;\n}\n.ui.list .list>.item>.icon+.content,\n.ui.list .list>.item>.image+.content,\n.ui.list>.item>.icon+.content,\n.ui.list>.item>.image+.content {\n  display: table-cell;\n  padding: 0 0 0 .5em;\n  vertical-align: top;\n}\n.ui.list .list>.item>img.image+.content,\n.ui.list>.item>img.image+.content {\n  display: inline-block;\n}\n.ui.list .list>.item>.content>.list,\n.ui.list>.item>.content>.list {\n  margin-left: 0;\n  padding-left: 0;\n}\n.ui.list .list>.item .header,\n.ui.list>.item .header {\n  display: block;\n  margin: 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 700;\n  color: rgba(0,0,0,.87);\n}\n.ui.list .list>.item .description,\n.ui.list>.item .description {\n  display: block;\n  color: rgba(0,0,0,.7);\n}\n.ui.list .list>.item a,\n.ui.list>.item a {\n  cursor: pointer;\n}\n.ui.list .list>a.item,\n.ui.list>a.item {\n  cursor: pointer;\n  color: #4183C4;\n}\n.ui.list .list>a.item:hover,\n.ui.list>a.item:hover {\n  color: #1e70bf;\n}\n.ui.list .list>a.item i.icon,\n.ui.list>a.item i.icon {\n  color: rgba(0,0,0,.4);\n}\n.ui.list .list>.item a.header,\n.ui.list>.item a.header {\n  cursor: pointer;\n  color: #4183C4!important;\n}\n.ui.list .list>.item a.header:hover,\n.ui.list>.item a.header:hover {\n  color: #1e70bf!important;\n}\n.ui[class*=\"left floated\"].list {\n  float: left;\n}\n.ui[class*=\"right floated\"].list {\n  float: right;\n}\n.ui.list .list>.item [class*=\"left floated\"],\n.ui.list>.item [class*=\"left floated\"] {\n  float: left;\n  margin: 0 1em 0 0;\n}\n.ui.list .list>.item [class*=\"right floated\"],\n.ui.list>.item [class*=\"right floated\"] {\n  float: right;\n  margin: 0 0 0 1em;\n}\n.ui.menu .ui.list .list>.item,\n.ui.menu .ui.list>.item {\n  display: list-item;\n  table-layout: fixed;\n  background-color: transparent;\n  list-style-type: none;\n  list-style-position: outside;\n  padding: .21428571em 0;\n  line-height: 1.14285714em;\n}\n.ui.menu .ui.list .list>.item:before,\n.ui.menu .ui.list>.item:before {\n  border: none;\n  background: 0 0;\n}\n.ui.menu .ui.list .list>.item:first-child,\n.ui.menu .ui.list>.item:first-child {\n  padding-top: 0;\n}\n.ui.menu .ui.list .list>.item:last-child,\n.ui.menu .ui.list>.item:last-child {\n  padding-bottom: 0;\n}\n.ui.horizontal.list {\n  display: inline-block;\n  font-size: 0;\n}\n.ui.horizontal.list>.item {\n  display: inline-block;\n  margin-left: 1em;\n  font-size: 1rem;\n}\n.ui.horizontal.list:not(.celled)>.item:first-child {\n  margin-left: 0!important;\n  padding-left: 0!important;\n}\n.ui.horizontal.list .list {\n  padding-left: 0;\n  padding-bottom: 0;\n}\n.ui.horizontal.list .list>.item>.content,\n.ui.horizontal.list .list>.item>.icon,\n.ui.horizontal.list .list>.item>.image,\n.ui.horizontal.list>.item>.content,\n.ui.horizontal.list>.item>.icon,\n.ui.horizontal.list>.item>.image {\n  vertical-align: middle;\n}\n.ui.horizontal.list>.item:first-child,\n.ui.horizontal.list>.item:last-child {\n  padding-top: .21428571em;\n  padding-bottom: .21428571em;\n}\n.ui.horizontal.list>.item>i.icon {\n  margin: 0;\n  padding: 0 .25em 0 0;\n}\n.ui.horizontal.list>.item>.icon,\n.ui.horizontal.list>.item>.icon+.content {\n  float: none;\n  display: inline-block;\n}\n.ui.list .list>.disabled.item,\n.ui.list>.disabled.item {\n  pointer-events: none;\n  color: rgba(40,40,40,.3)!important;\n}\n.ui.inverted.list .list>.disabled.item,\n.ui.inverted.list>.disabled.item {\n  color: rgba(225,225,225,.3)!important;\n}\n.ui.list .list>a.item:hover .icon,\n.ui.list>a.item:hover .icon {\n  color: rgba(0,0,0,.87);\n}\n.ui.inverted.list .list>a.item>.icon,\n.ui.inverted.list>a.item>.icon {\n  color: rgba(255,255,255,.7);\n}\n.ui.inverted.list .list>.item .header,\n.ui.inverted.list>.item .header {\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.list .list>.item .description,\n.ui.inverted.list>.item .description {\n  color: rgba(255,255,255,.7);\n}\n.ui.inverted.list .list>a.item,\n.ui.inverted.list>a.item {\n  cursor: pointer;\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.list .list>a.item:hover,\n.ui.inverted.list>a.item:hover {\n  color: #1e70bf;\n}\n.ui.inverted.list .item a:not(.ui) {\n  color: rgba(255,255,255,.9)!important;\n}\n.ui.inverted.list .item a:not(.ui):hover {\n  color: #1e70bf!important;\n}\n.ui.list [class*=\"top aligned\"],\n.ui.list[class*=\"top aligned\"] .content,\n.ui.list[class*=\"top aligned\"] .image {\n  vertical-align: top!important;\n}\n.ui.list [class*=\"middle aligned\"],\n.ui.list[class*=\"middle aligned\"] .content,\n.ui.list[class*=\"middle aligned\"] .image {\n  vertical-align: middle!important;\n}\n.ui.list [class*=\"bottom aligned\"],\n.ui.list[class*=\"bottom aligned\"] .content,\n.ui.list[class*=\"bottom aligned\"] .image {\n  vertical-align: bottom!important;\n}\n.ui.link.list .item,\n.ui.link.list .item a:not(.ui),\n.ui.link.list a.item {\n  color: rgba(0,0,0,.4);\n  -webkit-transition: .1s color ease;\n  transition: .1s color ease;\n}\n.ui.link.list .item a:not(.ui):hover,\n.ui.link.list a.item:hover {\n  color: rgba(0,0,0,.8);\n}\n.ui.link.list .item a:not(.ui):active,\n.ui.link.list a.item:active {\n  color: rgba(0,0,0,.9);\n}\n.ui.link.list .active.item,\n.ui.link.list .active.item a:not(.ui) {\n  color: rgba(0,0,0,.95);\n}\n.ui.inverted.link.list .item,\n.ui.inverted.link.list .item a:not(.ui),\n.ui.inverted.link.list a.item {\n  color: rgba(255,255,255,.5);\n}\n.ui.inverted.link.list .active.item a:not(.ui),\n.ui.inverted.link.list .item a:not(.ui):active,\n.ui.inverted.link.list .item a:not(.ui):hover,\n.ui.inverted.link.list a.active.item,\n.ui.inverted.link.list a.item:active,\n.ui.inverted.link.list a.item:hover {\n  color: #fff;\n}\n.ui.selection.list .list>.item,\n.ui.selection.list>.item {\n  cursor: pointer;\n  background: 0 0;\n  padding: .5em;\n  margin: 0;\n  color: rgba(0,0,0,.4);\n  border-radius: .5em;\n  -webkit-transition: .1s color ease,.1s padding-left ease,.1s background-color ease;\n  transition: .1s color ease,.1s padding-left ease,.1s background-color ease;\n}\n.ui.selection.list .list>.item:last-child,\n.ui.selection.list>.item:last-child {\n  margin-bottom: 0;\n}\n.ui.selection.list.list>.item:hover,\n.ui.selection.list>.item:hover {\n  background: rgba(0,0,0,.03);\n  color: rgba(0,0,0,.8);\n}\n.ui.selection.list .list>.item:active,\n.ui.selection.list>.item:active {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.9);\n}\n.ui.selection.list .list>.item.active,\n.ui.selection.list>.item.active {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.inverted.selection.list>.item {\n  background: 0 0;\n  color: rgba(255,255,255,.5);\n}\n.ui.inverted.selection.list>.item:hover {\n  background: rgba(255,255,255,.02);\n  color: #fff;\n}\n.ui.inverted.selection.list>.item.active,\n.ui.inverted.selection.list>.item:active {\n  background: rgba(255,255,255,.08);\n  color: #fff;\n}\n.ui.celled.selection.list .list>.item,\n.ui.celled.selection.list>.item,\n.ui.divided.selection.list .list>.item,\n.ui.divided.selection.list>.item {\n  border-radius: 0;\n}\n.ui.animated.list>.item {\n  -webkit-transition: .25s color ease .1s,.25s padding-left ease .1s,.25s background-color ease .1s;\n  transition: .25s color ease .1s,.25s padding-left ease .1s,.25s background-color ease .1s;\n}\n.ui.animated.list:not(.horizontal)>.item:hover {\n  padding-left: 1em;\n}\n.ui.fitted.list:not(.selection) .list>.item,\n.ui.fitted.list:not(.selection)>.item {\n  padding-left: 0;\n  padding-right: 0;\n}\n.ui.fitted.selection.list .list>.item,\n.ui.fitted.selection.list>.item {\n  margin-left: -.5em;\n  margin-right: -.5em;\n}\n.ui.bulleted.list,\nul.ui.list {\n  margin-left: 1.25rem;\n}\n.ui.bulleted.list .list>.item,\n.ui.bulleted.list>.item,\nul.ui.list li {\n  position: relative;\n}\n.ui.bulleted.list .list>.item:before,\n.ui.bulleted.list>.item:before,\nul.ui.list li:before {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  pointer-events: none;\n  position: absolute;\n  top: auto;\n  left: auto;\n  font-weight: 400;\n  margin-left: -1.25rem;\n  content: '•';\n  opacity: 1;\n  color: inherit;\n  vertical-align: top;\n}\n.ui.bulleted.list .list>a.item:before,\n.ui.bulleted.list>a.item:before,\nul.ui.list li:before {\n  color: rgba(0,0,0,.87);\n}\n.ui.bulleted.list .list,\nul.ui.list ul {\n  padding-left: 1.25rem;\n}\n.ui.horizontal.bulleted.list,\nul.ui.horizontal.bulleted.list {\n  margin-left: 0;\n}\n.ui.horizontal.bulleted.list>.item,\nul.ui.horizontal.bulleted.list li {\n  margin-left: 1.75rem;\n}\n.ui.horizontal.bulleted.list>.item:first-child,\nul.ui.horizontal.bulleted.list li:first-child {\n  margin-left: 0;\n}\n.ui.horizontal.bulleted.list>.item::before,\nul.ui.horizontal.bulleted.list li::before {\n  color: rgba(0,0,0,.87);\n}\n.ui.horizontal.bulleted.list>.item:first-child::before,\nul.ui.horizontal.bulleted.list li:first-child::before {\n  display: none;\n}\n.ui.ordered.list,\n.ui.ordered.list .list,\nol.ui.list,\nol.ui.list ol {\n  counter-reset: ordered;\n  margin-left: 1.25rem;\n  list-style-type: none;\n}\n.ui.ordered.list .list>.item,\n.ui.ordered.list>.item,\nol.ui.list li {\n  list-style-type: none;\n  position: relative;\n}\n.ui.ordered.list .list>.item:before,\n.ui.ordered.list>.item:before,\nol.ui.list li:before {\n  position: absolute;\n  top: auto;\n  left: auto;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  pointer-events: none;\n  margin-left: -1.25rem;\n  counter-increment: ordered;\n  content: counters(ordered,\".\") \" \";\n  text-align: right;\n  color: rgba(0,0,0,.87);\n  vertical-align: middle;\n  opacity: .8;\n}\n.ui.ordered.inverted.list .list>.item:before,\n.ui.ordered.inverted.list>.item:before,\nol.ui.inverted.list li:before {\n  color: rgba(255,255,255,.7);\n}\n.ui.ordered.list>.item[data-value],\n.ui.ordered.list>.list>.item[data-value] {\n  content: attr(data-value);\n}\nol.ui.list li[value]:before {\n  content: attr(value);\n}\n.ui.ordered.list .list,\nol.ui.list ol {\n  margin-left: 1em;\n}\n.ui.ordered.list .list>.item:before,\nol.ui.list ol li:before {\n  margin-left: -2em;\n}\n.ui.ordered.horizontal.list,\nol.ui.horizontal.list {\n  margin-left: 0;\n}\n.ui.ordered.horizontal.list .list>.item:before,\n.ui.ordered.horizontal.list>.item:before,\nol.ui.horizontal.list li:before {\n  position: static;\n  margin: 0 .5em 0 0;\n}\n.ui.divided.list>.item {\n  border-top: 1px solid rgba(34,36,38,.15);\n}\n.ui.divided.list .item .list>.item,\n.ui.divided.list .list>.item,\n.ui.divided.list .list>.item:first-child,\n.ui.divided.list>.item:first-child {\n  border-top: none;\n}\n.ui.divided.list:not(.horizontal) .list>.item:first-child {\n  border-top-width: 1px;\n}\n.ui.divided.bulleted.list .list,\n.ui.divided.bulleted.list:not(.horizontal) {\n  margin-left: 0;\n  padding-left: 0;\n}\n.ui.divided.bulleted.list>.item:not(.horizontal) {\n  padding-left: 1.25rem;\n}\n.ui.divided.ordered.list {\n  margin-left: 0;\n}\n.ui.divided.ordered.list .list>.item,\n.ui.divided.ordered.list>.item {\n  padding-left: 1.25rem;\n}\n.ui.divided.ordered.list .item .list {\n  margin-left: 0;\n  margin-right: 0;\n  padding-bottom: .21428571em;\n}\n.ui.divided.ordered.list .item .list>.item {\n  padding-left: 1em;\n}\n.ui.divided.selection.list .list>.item,\n.ui.divided.selection.list>.item {\n  margin: 0;\n  border-radius: 0;\n}\n.ui.divided.horizontal.list {\n  margin-left: 0;\n}\n.ui.divided.horizontal.list>.item:not(:first-child) {\n  padding-left: .5em;\n}\n.ui.divided.horizontal.list>.item:not(:last-child) {\n  padding-right: .5em;\n}\n.ui.divided.horizontal.list>.item {\n  border-top: none;\n  border-left: 1px solid rgba(34,36,38,.15);\n  margin: 0;\n  line-height: .6;\n}\n.ui.horizontal.divided.list>.item:first-child {\n  border-left: none;\n}\n.ui.divided.inverted.horizontal.list>.item,\n.ui.divided.inverted.list>.item,\n.ui.divided.inverted.list>.list {\n  border-color: rgba(255,255,255,.1);\n}\n.ui.celled.list>.item,\n.ui.celled.list>.list {\n  border-top: 1px solid rgba(34,36,38,.15);\n  padding-left: .5em;\n  padding-right: .5em;\n}\n.ui.celled.list>.item:last-child {\n  border-bottom: 1px solid rgba(34,36,38,.15);\n}\n.ui.celled.list>.item:first-child,\n.ui.celled.list>.item:last-child {\n  padding-top: .21428571em;\n  padding-bottom: .21428571em;\n}\n.ui.celled.list .item .list>.item {\n  border-width: 0;\n}\n.ui.celled.list .list>.item:first-child {\n  border-top-width: 0;\n}\n.ui.celled.bulleted.list {\n  margin-left: 0;\n}\n.ui.celled.bulleted.list .list>.item,\n.ui.celled.bulleted.list>.item {\n  padding-left: 1.25rem;\n}\n.ui.celled.bulleted.list .item .list {\n  margin-left: -1.25rem;\n  margin-right: -1.25rem;\n  padding-bottom: .21428571em;\n}\n.ui.celled.ordered.list {\n  margin-left: 0;\n}\n.ui.celled.ordered.list .list>.item,\n.ui.celled.ordered.list>.item {\n  padding-left: 1.25rem;\n}\n.ui.celled.ordered.list .item .list {\n  margin-left: 0;\n  margin-right: 0;\n  padding-bottom: .21428571em;\n}\n.ui.celled.ordered.list .list>.item {\n  padding-left: 1em;\n}\n.ui.horizontal.celled.list {\n  margin-left: 0;\n}\n.ui.horizontal.celled.list .list>.item,\n.ui.horizontal.celled.list>.item {\n  border-top: none;\n  border-left: 1px solid rgba(34,36,38,.15);\n  margin: 0;\n  padding-left: .5em;\n  padding-right: .5em;\n  line-height: .6;\n}\n.ui.horizontal.celled.list .list>.item:last-child,\n.ui.horizontal.celled.list>.item:last-child {\n  border-bottom: none;\n  border-right: 1px solid rgba(34,36,38,.15);\n}\n.ui.celled.inverted.horizontal.list .list>.item,\n.ui.celled.inverted.horizontal.list>.item,\n.ui.celled.inverted.list>.item,\n.ui.celled.inverted.list>.list {\n  border-color: 1px solid rgba(255,255,255,.1);\n}\n.ui.relaxed.list:not(.horizontal)>.item:not(:first-child) {\n  padding-top: .42857143em;\n}\n.ui.relaxed.list:not(.horizontal)>.item:not(:last-child) {\n  padding-bottom: .42857143em;\n}\n.ui.horizontal.relaxed.list .list>.item:not(:first-child),\n.ui.horizontal.relaxed.list>.item:not(:first-child) {\n  padding-left: 1rem;\n}\n.ui.horizontal.relaxed.list .list>.item:not(:last-child),\n.ui.horizontal.relaxed.list>.item:not(:last-child) {\n  padding-right: 1rem;\n}\n.ui[class*=\"very relaxed\"].list:not(.horizontal)>.item:not(:first-child) {\n  padding-top: .85714286em;\n}\n.ui[class*=\"very relaxed\"].list:not(.horizontal)>.item:not(:last-child) {\n  padding-bottom: .85714286em;\n}\n.ui.horizontal[class*=\"very relaxed\"].list .list>.item:not(:first-child),\n.ui.horizontal[class*=\"very relaxed\"].list>.item:not(:first-child) {\n  padding-left: 1.5rem;\n}\n.ui.horizontal[class*=\"very relaxed\"].list .list>.item:not(:last-child),\n.ui.horizontal[class*=\"very relaxed\"].list>.item:not(:last-child) {\n  padding-right: 1.5rem;\n}\n.ui.mini.list {\n  font-size: .78571429em;\n}\n.ui.tiny.list {\n  font-size: .85714286em;\n}\n.ui.small.list {\n  font-size: .92857143em;\n}\n.ui.list {\n  font-size: 1em;\n}\n.ui.large.list {\n  font-size: 1.14285714em;\n}\n.ui.big.list {\n  font-size: 1.28571429em;\n}\n.ui.huge.list {\n  font-size: 1.42857143em;\n}\n.ui.massive.list {\n  font-size: 1.71428571em;\n}\n.ui.mini.horizontal.list .list>.item,\n.ui.mini.horizontal.list>.item {\n  font-size: .78571429rem;\n}\n.ui.tiny.horizontal.list .list>.item,\n.ui.tiny.horizontal.list>.item {\n  font-size: .85714286rem;\n}\n.ui.small.horizontal.list .list>.item,\n.ui.small.horizontal.list>.item {\n  font-size: .92857143rem;\n}\n.ui.horizontal.list .list>.item,\n.ui.horizontal.list>.item {\n  font-size: 1rem;\n}\n.ui.large.horizontal.list .list>.item,\n.ui.large.horizontal.list>.item {\n  font-size: 1.14285714rem;\n}\n.ui.big.horizontal.list .list>.item,\n.ui.big.horizontal.list>.item {\n  font-size: 1.28571429rem;\n}\n.ui.huge.horizontal.list .list>.item,\n.ui.huge.horizontal.list>.item {\n  font-size: 1.42857143rem;\n}\n.ui.massive.horizontal.list .list>.item,\n.ui.massive.horizontal.list>.item {\n  font-size: 1.71428571rem;\n}\n.ui.loader {\n  display: none;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  margin: 0;\n  text-align: center;\n  z-index: 1000;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n  -ms-transform: translateX(-50%) translateY(-50%);\n  transform: translateX(-50%) translateY(-50%);\n}\n.ui.loader:before {\n  position: absolute;\n  content: '';\n  top: 0;\n  left: 50%;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.1);\n}\n.ui.loader:after {\n  position: absolute;\n  content: '';\n  top: 0;\n  left: 50%;\n  -webkit-animation: loader .6s linear;\n  animation: loader .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n}\n@-webkit-keyframes loader {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes loader {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n.ui.mini.loader:after,\n.ui.mini.loader:before {\n  width: 1rem;\n  height: 1rem;\n  margin: 0 0 0 -.5rem;\n}\n.ui.tiny.loader:after,\n.ui.tiny.loader:before {\n  width: 1.14285714rem;\n  height: 1.14285714rem;\n  margin: 0 0 0 -.57142857rem;\n}\n.ui.small.loader:after,\n.ui.small.loader:before {\n  width: 1.71428571rem;\n  height: 1.71428571rem;\n  margin: 0 0 0 -.85714286rem;\n}\n.ui.loader:after,\n.ui.loader:before {\n  width: 2.28571429rem;\n  height: 2.28571429rem;\n  margin: 0 0 0 -1.14285714rem;\n}\n.ui.large.loader:after,\n.ui.large.loader:before {\n  width: 3.42857143rem;\n  height: 3.42857143rem;\n  margin: 0 0 0 -1.71428571rem;\n}\n.ui.big.loader:after,\n.ui.big.loader:before {\n  width: 3.71428571rem;\n  height: 3.71428571rem;\n  margin: 0 0 0 -1.85714286rem;\n}\n.ui.huge.loader:after,\n.ui.huge.loader:before {\n  width: 4.14285714rem;\n  height: 4.14285714rem;\n  margin: 0 0 0 -2.07142857rem;\n}\n.ui.massive.loader:after,\n.ui.massive.loader:before {\n  width: 4.57142857rem;\n  height: 4.57142857rem;\n  margin: 0 0 0 -2.28571429rem;\n}\n.ui.dimmer .loader {\n  display: block;\n}\n.ui.dimmer .ui.loader {\n  color: rgba(255,255,255,.9);\n}\n.ui.dimmer .ui.loader:before {\n  border-color: rgba(255,255,255,.15);\n}\n.ui.dimmer .ui.loader:after {\n  border-color: #FFF transparent transparent;\n}\n.ui.inverted.dimmer .ui.loader {\n  color: rgba(0,0,0,.87);\n}\n.ui.inverted.dimmer .ui.loader:before {\n  border-color: rgba(0,0,0,.1);\n}\n.ui.inverted.dimmer .ui.loader:after {\n  border-color: #767676 transparent transparent;\n}\n.ui.text.loader {\n  width: auto!important;\n  height: auto!important;\n  text-align: center;\n  font-style: normal;\n}\n.ui.indeterminate.loader:after {\n  -webkit-animation-direction: reverse;\n  animation-direction: reverse;\n  -webkit-animation-duration: 1.2s;\n  animation-duration: 1.2s;\n}\n.ui.loader.active,\n.ui.loader.visible {\n  display: block;\n}\n.ui.loader.disabled,\n.ui.loader.hidden {\n  display: none;\n}\n.ui.inverted.dimmer .ui.mini.loader,\n.ui.mini.loader {\n  width: 1rem;\n  height: 1rem;\n  font-size: .78571429em;\n}\n.ui.inverted.dimmer .ui.tiny.loader,\n.ui.tiny.loader {\n  width: 1.14285714rem;\n  height: 1.14285714rem;\n  font-size: .85714286em;\n}\n.ui.inverted.dimmer .ui.small.loader,\n.ui.small.loader {\n  width: 1.71428571rem;\n  height: 1.71428571rem;\n  font-size: .92857143em;\n}\n.ui.inverted.dimmer .ui.loader,\n.ui.loader {\n  width: 2.28571429rem;\n  height: 2.28571429rem;\n  font-size: 1em;\n}\n.ui.inverted.dimmer .ui.large.loader,\n.ui.large.loader {\n  width: 3.42857143rem;\n  height: 3.42857143rem;\n  font-size: 1.14285714em;\n}\n.ui.big.loader,\n.ui.inverted.dimmer .ui.big.loader {\n  width: 3.71428571rem;\n  height: 3.71428571rem;\n  font-size: 1.28571429em;\n}\n.ui.huge.loader,\n.ui.inverted.dimmer .ui.huge.loader {\n  width: 4.14285714rem;\n  height: 4.14285714rem;\n  font-size: 1.42857143em;\n}\n.ui.inverted.dimmer .ui.massive.loader,\n.ui.massive.loader {\n  width: 4.57142857rem;\n  height: 4.57142857rem;\n  font-size: 1.71428571em;\n}\n.ui.mini.text.loader {\n  min-width: 1rem;\n  padding-top: 1.78571429rem;\n}\n.ui.tiny.text.loader {\n  min-width: 1.14285714rem;\n  padding-top: 1.92857143rem;\n}\n.ui.small.text.loader {\n  min-width: 1.71428571rem;\n  padding-top: 2.5rem;\n}\n.ui.text.loader {\n  min-width: 2.28571429rem;\n  padding-top: 3.07142857rem;\n}\n.ui.large.text.loader {\n  min-width: 3.42857143rem;\n  padding-top: 4.21428571rem;\n}\n.ui.big.text.loader {\n  min-width: 3.71428571rem;\n  padding-top: 4.5rem;\n}\n.ui.huge.text.loader {\n  min-width: 4.14285714rem;\n  padding-top: 4.92857143rem;\n}\n.ui.massive.text.loader {\n  min-width: 4.57142857rem;\n  padding-top: 5.35714286rem;\n}\n.ui.inverted.loader {\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.loader:before {\n  border-color: rgba(255,255,255,.15);\n}\n.ui.inverted.loader:after {\n  border-top-color: #FFF;\n}\n.ui.inline.loader {\n  position: relative;\n  vertical-align: middle;\n  margin: 0;\n  left: 0;\n  top: 0;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n}\n.ui.inline.loader.active,\n.ui.inline.loader.visible {\n  display: inline-block;\n}\n.ui.centered.inline.loader.active,\n.ui.centered.inline.loader.visible {\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n.ui.rail {\n  position: absolute;\n  top: 0;\n  width: 300px;\n  height: 100%;\n}\n.ui.left.rail {\n  left: auto;\n  right: 100%;\n  padding: 0 2rem 0 0;\n  margin: 0 2rem 0 0;\n}\n.ui.right.rail {\n  left: 100%;\n  right: auto;\n  padding: 0 0 0 2rem;\n  margin: 0 0 0 2rem;\n}\n.ui.left.internal.rail {\n  left: 0;\n  right: auto;\n  padding: 0 0 0 2rem;\n  margin: 0 0 0 2rem;\n}\n.ui.right.internal.rail {\n  left: auto;\n  right: 0;\n  padding: 0 2rem 0 0;\n  margin: 0 2rem 0 0;\n}\n.ui.dividing.rail {\n  width: 302.5px;\n}\n.ui.left.dividing.rail {\n  padding: 0 2.5rem 0 0;\n  margin: 0 2.5rem 0 0;\n  border-right: 1px solid rgba(34,36,38,.15);\n}\n.ui.right.dividing.rail {\n  border-left: 1px solid rgba(34,36,38,.15);\n  padding: 0 0 0 2.5rem;\n  margin: 0 0 0 2.5rem;\n}\n.ui.close.rail {\n  width: calc(300px + 1em);\n}\n.ui.close.left.rail {\n  padding: 0 1em 0 0;\n  margin: 0 1em 0 0;\n}\n.ui.close.right.rail {\n  padding: 0 0 0 1em;\n  margin: 0 0 0 1em;\n}\n.ui.very.close.rail {\n  width: calc(300px + .5em);\n}\n.ui.very.close.left.rail {\n  padding: 0 .5em 0 0;\n  margin: 0 .5em 0 0;\n}\n.ui.very.close.right.rail {\n  padding: 0 0 0 .5em;\n  margin: 0 0 0 .5em;\n}\n.ui.attached.left.rail,\n.ui.attached.right.rail {\n  padding: 0;\n  margin: 0;\n}\n.ui.mini.rail {\n  font-size: .78571429rem;\n}\n.ui.tiny.rail {\n  font-size: .85714286rem;\n}\n.ui.small.rail {\n  font-size: .92857143rem;\n}\n.ui.rail {\n  font-size: 1rem;\n}\n.ui.large.rail {\n  font-size: 1.14285714rem;\n}\n.ui.big.rail {\n  font-size: 1.28571429rem;\n}\n.ui.huge.rail {\n  font-size: 1.42857143rem;\n}\n.ui.massive.rail {\n  font-size: 1.71428571rem;\n}\n.ui.reveal {\n  display: inherit;\n  position: relative!important;\n  font-size: 0!important;\n}\n.ui.reveal>.visible.content {\n  position: absolute!important;\n  top: 0!important;\n  left: 0!important;\n  z-index: 3!important;\n  -webkit-transition: all .5s ease .1s;\n  transition: all .5s ease .1s;\n}\n.ui.reveal>.hidden.content {\n  position: relative!important;\n  z-index: 2!important;\n}\n.ui.active.reveal .visible.content,\n.ui.reveal:hover .visible.content {\n  z-index: 4!important;\n}\n.ui.slide.reveal {\n  position: relative!important;\n  overflow: hidden!important;\n  white-space: nowrap;\n}\n.ui.slide.reveal>.content {\n  display: block;\n  width: 100%;\n  float: left;\n  margin: 0;\n  -webkit-transition: -webkit-transform .5s ease .1s;\n  transition: -webkit-transform .5s ease .1s;\n  transition: transform .5s ease .1s;\n  transition: transform .5s ease .1s,-webkit-transform .5s ease .1s;\n}\n.ui.slide.reveal>.visible.content {\n  position: relative!important;\n}\n.ui.slide.reveal>.hidden.content {\n  position: absolute!important;\n  left: 0!important;\n  width: 100%!important;\n  -webkit-transform: translateX(100%)!important;\n  -ms-transform: translateX(100%)!important;\n  transform: translateX(100%)!important;\n}\n.ui.slide.active.reveal>.visible.content,\n.ui.slide.reveal:hover>.visible.content {\n  -webkit-transform: translateX(-100%)!important;\n  -ms-transform: translateX(-100%)!important;\n  transform: translateX(-100%)!important;\n}\n.ui.slide.active.reveal>.hidden.content,\n.ui.slide.reveal:hover>.hidden.content,\n.ui.slide.right.reveal>.visible.content {\n  -webkit-transform: translateX(0)!important;\n  -ms-transform: translateX(0)!important;\n  transform: translateX(0)!important;\n}\n.ui.slide.right.reveal>.hidden.content {\n  -webkit-transform: translateX(-100%)!important;\n  -ms-transform: translateX(-100%)!important;\n  transform: translateX(-100%)!important;\n}\n.ui.slide.right.active.reveal>.visible.content,\n.ui.slide.right.reveal:hover>.visible.content {\n  -webkit-transform: translateX(100%)!important;\n  -ms-transform: translateX(100%)!important;\n  transform: translateX(100%)!important;\n}\n.ui.slide.right.active.reveal>.hidden.content,\n.ui.slide.right.reveal:hover>.hidden.content {\n  -webkit-transform: translateX(0)!important;\n  -ms-transform: translateX(0)!important;\n  transform: translateX(0)!important;\n}\n.ui.slide.up.reveal>.hidden.content {\n  -webkit-transform: translateY(100%)!important;\n  -ms-transform: translateY(100%)!important;\n  transform: translateY(100%)!important;\n}\n.ui.slide.up.active.reveal>.visible.content,\n.ui.slide.up.reveal:hover>.visible.content {\n  -webkit-transform: translateY(-100%)!important;\n  -ms-transform: translateY(-100%)!important;\n  transform: translateY(-100%)!important;\n}\n.ui.slide.up.active.reveal>.hidden.content,\n.ui.slide.up.reveal:hover>.hidden.content {\n  -webkit-transform: translateY(0)!important;\n  -ms-transform: translateY(0)!important;\n  transform: translateY(0)!important;\n}\n.ui.slide.down.reveal>.hidden.content {\n  -webkit-transform: translateY(-100%)!important;\n  -ms-transform: translateY(-100%)!important;\n  transform: translateY(-100%)!important;\n}\n.ui.slide.down.active.reveal>.visible.content,\n.ui.slide.down.reveal:hover>.visible.content {\n  -webkit-transform: translateY(100%)!important;\n  -ms-transform: translateY(100%)!important;\n  transform: translateY(100%)!important;\n}\n.ui.slide.down.active.reveal>.hidden.content,\n.ui.slide.down.reveal:hover>.hidden.content {\n  -webkit-transform: translateY(0)!important;\n  -ms-transform: translateY(0)!important;\n  transform: translateY(0)!important;\n}\n.ui.fade.reveal>.visible.content {\n  opacity: 1;\n}\n.ui.fade.active.reveal>.visible.content,\n.ui.fade.reveal:hover>.visible.content {\n  opacity: 0;\n}\n.ui.move.reveal {\n  position: relative!important;\n  overflow: hidden!important;\n  white-space: nowrap;\n}\n.ui.move.reveal>.content {\n  display: block;\n  float: left;\n  margin: 0;\n  -webkit-transition: -webkit-transform .5s cubic-bezier(.175,.885,.32,1) .1s;\n  transition: -webkit-transform .5s cubic-bezier(.175,.885,.32,1) .1s;\n  transition: transform .5s cubic-bezier(.175,.885,.32,1) .1s;\n  transition: transform .5s cubic-bezier(.175,.885,.32,1) .1s,-webkit-transform .5s cubic-bezier(.175,.885,.32,1) .1s;\n}\n.ui.move.reveal>.visible.content {\n  position: relative!important;\n}\n.ui.move.reveal>.hidden.content {\n  position: absolute!important;\n  left: 0!important;\n  width: 100%!important;\n}\n.ui.move.active.reveal>.visible.content,\n.ui.move.reveal:hover>.visible.content {\n  -webkit-transform: translateX(-100%)!important;\n  -ms-transform: translateX(-100%)!important;\n  transform: translateX(-100%)!important;\n}\n.ui.move.right.active.reveal>.visible.content,\n.ui.move.right.reveal:hover>.visible.content {\n  -webkit-transform: translateX(100%)!important;\n  -ms-transform: translateX(100%)!important;\n  transform: translateX(100%)!important;\n}\n.ui.move.up.active.reveal>.visible.content,\n.ui.move.up.reveal:hover>.visible.content {\n  -webkit-transform: translateY(-100%)!important;\n  -ms-transform: translateY(-100%)!important;\n  transform: translateY(-100%)!important;\n}\n.ui.move.down.active.reveal>.visible.content,\n.ui.move.down.reveal:hover>.visible.content {\n  -webkit-transform: translateY(100%)!important;\n  -ms-transform: translateY(100%)!important;\n  transform: translateY(100%)!important;\n}\n.ui.rotate.reveal>.visible.content {\n  -webkit-transition-duration: .5s;\n  transition-duration: .5s;\n  -webkit-transform: rotate(0);\n  -ms-transform: rotate(0);\n  transform: rotate(0);\n}\n.ui.rotate.reveal>.visible.content,\n.ui.rotate.right.reveal>.visible.content {\n  -webkit-transform-origin: bottom right;\n  -ms-transform-origin: bottom right;\n  transform-origin: bottom right;\n}\n.ui.rotate.active.reveal>.visible.content,\n.ui.rotate.reveal:hover>.visible.content,\n.ui.rotate.right.active.reveal>.visible.content,\n.ui.rotate.right.reveal:hover>.visible.content {\n  -webkit-transform: rotate(110deg);\n  -ms-transform: rotate(110deg);\n  transform: rotate(110deg);\n}\n.ui.rotate.left.reveal>.visible.content {\n  -webkit-transform-origin: bottom left;\n  -ms-transform-origin: bottom left;\n  transform-origin: bottom left;\n}\n.ui.rotate.left.active.reveal>.visible.content,\n.ui.rotate.left.reveal:hover>.visible.content {\n  -webkit-transform: rotate(-110deg);\n  -ms-transform: rotate(-110deg);\n  transform: rotate(-110deg);\n}\n.ui.disabled.reveal:hover>.visible.visible.content {\n  position: static!important;\n  display: block!important;\n  opacity: 1!important;\n  top: 0!important;\n  left: 0!important;\n  right: auto!important;\n  bottom: auto!important;\n  -webkit-transform: none!important;\n  -ms-transform: none!important;\n  transform: none!important;\n}\n.ui.disabled.reveal:hover>.hidden.hidden.content {\n  display: none!important;\n}\n.ui.visible.reveal {\n  overflow: visible;\n}\n.ui.instant.reveal>.content {\n  -webkit-transition-delay: 0s!important;\n  transition-delay: 0s!important;\n}\n.ui.reveal>.content {\n  font-size: 1rem!important;\n}\n.ui.segment {\n  position: relative;\n  background: #FFF;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n  margin: 1rem 0;\n  padding: 1em;\n  border-radius: .28571429rem;\n  border: 1px solid rgba(34,36,38,.15);\n}\n.ui.segment:first-child {\n  margin-top: 0;\n}\n.ui.segment:last-child {\n  margin-bottom: 0;\n}\n.ui.vertical.segment {\n  margin: 0;\n  padding-left: 0;\n  padding-right: 0;\n  background: none;\n  border-radius: 0;\n  box-shadow: none;\n  border: none;\n  border-bottom: 1px solid rgba(34,36,38,.15);\n}\n.ui.vertical.segment:last-child {\n  border-bottom: none;\n}\n.ui.inverted.segment>.ui.header {\n  color: #FFF;\n}\n.ui[class*=\"bottom attached\"].segment>[class*=\"top attached\"].label {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.ui[class*=\"top attached\"].segment>[class*=\"bottom attached\"].label {\n  border-bottom-left-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.attached.segment:not(.top):not(.bottom)>[class*=\"top attached\"].label {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.ui.attached.segment:not(.top):not(.bottom)>[class*=\"bottom attached\"].label {\n  border-bottom-left-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.grid>.row>.ui.segment.column,\n.ui.grid>.ui.segment.column,\n.ui.page.grid.segment {\n  padding-top: 2em;\n  padding-bottom: 2em;\n}\n.ui.grid.segment {\n  margin: 1rem 0;\n  border-radius: .28571429rem;\n}\n.ui.basic.table.segment {\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n}\n.ui[class*=\"very basic\"].table.segment {\n  padding: 1em;\n}\n.ui.piled.segment,\n.ui.piled.segments {\n  margin: 3em 0;\n  box-shadow: '';\n  z-index: auto;\n}\n.ui.piled.segment:first-child {\n  margin-top: 0;\n}\n.ui.piled.segment:last-child {\n  margin-bottom: 0;\n}\n.ui.piled.segment:after,\n.ui.piled.segment:before,\n.ui.piled.segments:after,\n.ui.piled.segments:before {\n  background-color: #FFF;\n  visibility: visible;\n  content: '';\n  display: block;\n  height: 100%;\n  left: 0;\n  position: absolute;\n  width: 100%;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: '';\n}\n.ui.piled.segment:before,\n.ui.piled.segments:before {\n  -webkit-transform: rotate(-1.2deg);\n  -ms-transform: rotate(-1.2deg);\n  transform: rotate(-1.2deg);\n  top: 0;\n  z-index: -2;\n}\n.ui.piled.segment:after,\n.ui.piled.segments:after {\n  -webkit-transform: rotate(1.2deg);\n  -ms-transform: rotate(1.2deg);\n  transform: rotate(1.2deg);\n  top: 0;\n  z-index: -1;\n}\n.ui[class*=\"top attached\"].piled.segment {\n  margin-top: 3em;\n  margin-bottom: 0;\n}\n.ui.piled.segment[class*=\"top attached\"]:first-child {\n  margin-top: 0;\n}\n.ui.piled.segment[class*=\"bottom attached\"] {\n  margin-top: 0;\n  margin-bottom: 3em;\n}\n.ui.piled.segment[class*=\"bottom attached\"]:last-child {\n  margin-bottom: 0;\n}\n.ui.stacked.segment {\n  padding-bottom: 1.4em;\n}\n.ui.stacked.segment:after,\n.ui.stacked.segment:before,\n.ui.stacked.segments:after,\n.ui.stacked.segments:before {\n  content: '';\n  position: absolute;\n  bottom: -3px;\n  left: 0;\n  border-top: 1px solid rgba(34,36,38,.15);\n  background: rgba(0,0,0,.03);\n  width: 100%;\n  height: 6px;\n  visibility: visible;\n}\n.ui.stacked.segment:before,\n.ui.stacked.segments:before {\n  display: none;\n}\n.ui.tall.stacked.segment:before,\n.ui.tall.stacked.segments:before {\n  display: block;\n  bottom: 0;\n}\n.ui.stacked.inverted.segment:after,\n.ui.stacked.inverted.segment:before,\n.ui.stacked.inverted.segments:after,\n.ui.stacked.inverted.segments:before {\n  background-color: rgba(0,0,0,.03);\n  border-top: 1px solid rgba(34,36,38,.35);\n}\n.ui.padded.segment {\n  padding: 1.5em;\n}\n.ui[class*=\"very padded\"].segment {\n  padding: 3em;\n}\n.ui.compact.segment {\n  display: table;\n}\n.ui.compact.segments {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n}\n.ui.compact.segments .segment,\n.ui.segments .compact.segment {\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n}\n.ui.circular.segment {\n  display: table-cell;\n  padding: 2em;\n  text-align: center;\n  vertical-align: middle;\n  border-radius: 500em;\n}\n.ui.raised.segment,\n.ui.raised.segments {\n  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n}\n.ui.segments {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  position: relative;\n  margin: 1rem 0;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n}\n.ui.segments:first-child {\n  margin-top: 0;\n}\n.ui.segments:last-child {\n  margin-bottom: 0;\n}\n.ui.segments>.segment {\n  top: 0;\n  bottom: 0;\n  border-radius: 0;\n  margin: 0;\n  width: auto;\n  box-shadow: none;\n  border: none;\n  border-top: 1px solid rgba(34,36,38,.15);\n}\n.ui.segments:not(.horizontal)>.segment:first-child {\n  border-top: none;\n  margin-top: 0;\n  bottom: 0;\n  margin-bottom: 0;\n  top: 0;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.segments:not(.horizontal)>.segment:last-child {\n  top: 0;\n  bottom: 0;\n  margin-top: 0;\n  margin-bottom: 0;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.segments:not(.horizontal)>.segment:only-child {\n  border-radius: .28571429rem;\n}\n.ui.segments>.ui.segments {\n  border-top: 1px solid rgba(34,36,38,.15);\n  margin: 1rem;\n}\n.ui.segments>.segments:first-child {\n  border-top: none;\n}\n.ui.segments>.segment+.segments:not(.horizontal) {\n  margin-top: 0;\n}\n.ui.horizontal.segments {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  padding: 0;\n  background-color: #FFF;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n  margin: 1rem 0;\n  border-radius: .28571429rem;\n  border: 1px solid rgba(34,36,38,.15);\n}\n.ui.segments>.horizontal.segments {\n  margin: 0;\n  background-color: transparent;\n  border-radius: 0;\n  border: none;\n  box-shadow: none;\n  border-top: 1px solid rgba(34,36,38,.15);\n}\n.ui.horizontal.segments>.segment {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  flex: 1 1 auto;\n  -ms-flex: 1 1 0px;\n  margin: 0;\n  min-width: 0;\n  background-color: transparent;\n  border-radius: 0;\n  border: none;\n  box-shadow: none;\n  border-left: 1px solid rgba(34,36,38,.15);\n}\n.ui.segments>.horizontal.segments:first-child {\n  border-top: none;\n}\n.ui.horizontal.segments>.segment:first-child {\n  border-left: none;\n}\n.ui.disabled.segment {\n  opacity: .45;\n  color: rgba(40,40,40,.3);\n}\n.ui.loading.segment {\n  position: relative;\n  cursor: default;\n  pointer-events: none;\n  text-shadow: none!important;\n  color: transparent!important;\n  -webkit-transition: all 0s linear;\n  transition: all 0s linear;\n}\n.ui.loading.segment:before {\n  position: absolute;\n  content: '';\n  top: 0;\n  left: 0;\n  background: rgba(255,255,255,.8);\n  width: 100%;\n  height: 100%;\n  border-radius: .28571429rem;\n  z-index: 100;\n}\n.ui.loading.segment:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -1.5em 0 0 -1.5em;\n  width: 3em;\n  height: 3em;\n  -webkit-animation: segment-spin .6s linear;\n  animation: segment-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 rgba(0,0,0,.1) rgba(0,0,0,.1);\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n  visibility: visible;\n  z-index: 101;\n}\n@-webkit-keyframes segment-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes segment-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n.ui.basic.segment {\n  background: none;\n  box-shadow: none;\n  border: none;\n  border-radius: 0;\n}\n.ui.clearing.segment:after {\n  content: \".\";\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.ui.red.segment:not(.inverted) {\n  border-top: 2px solid #DB2828;\n}\n.ui.inverted.red.segment {\n  background-color: #DB2828!important;\n  color: #FFF!important;\n}\n.ui.orange.segment:not(.inverted) {\n  border-top: 2px solid #F2711C;\n}\n.ui.inverted.orange.segment {\n  background-color: #F2711C!important;\n  color: #FFF!important;\n}\n.ui.yellow.segment:not(.inverted) {\n  border-top: 2px solid #FBBD08;\n}\n.ui.inverted.yellow.segment {\n  background-color: #FBBD08!important;\n  color: #FFF!important;\n}\n.ui.olive.segment:not(.inverted) {\n  border-top: 2px solid #B5CC18;\n}\n.ui.inverted.olive.segment {\n  background-color: #B5CC18!important;\n  color: #FFF!important;\n}\n.ui.green.segment:not(.inverted) {\n  border-top: 2px solid #21BA45;\n}\n.ui.inverted.green.segment {\n  background-color: #21BA45!important;\n  color: #FFF!important;\n}\n.ui.teal.segment:not(.inverted) {\n  border-top: 2px solid #00B5AD;\n}\n.ui.inverted.teal.segment {\n  background-color: #00B5AD!important;\n  color: #FFF!important;\n}\n.ui.blue.segment:not(.inverted) {\n  border-top: 2px solid #2185D0;\n}\n.ui.inverted.blue.segment {\n  background-color: #2185D0!important;\n  color: #FFF!important;\n}\n.ui.violet.segment:not(.inverted) {\n  border-top: 2px solid #6435C9;\n}\n.ui.inverted.violet.segment {\n  background-color: #6435C9!important;\n  color: #FFF!important;\n}\n.ui.purple.segment:not(.inverted) {\n  border-top: 2px solid #A333C8;\n}\n.ui.inverted.purple.segment {\n  background-color: #A333C8!important;\n  color: #FFF!important;\n}\n.ui.pink.segment:not(.inverted) {\n  border-top: 2px solid #E03997;\n}\n.ui.inverted.pink.segment {\n  background-color: #E03997!important;\n  color: #FFF!important;\n}\n.ui.brown.segment:not(.inverted) {\n  border-top: 2px solid #A5673F;\n}\n.ui.inverted.brown.segment {\n  background-color: #A5673F!important;\n  color: #FFF!important;\n}\n.ui.grey.segment:not(.inverted) {\n  border-top: 2px solid #767676;\n}\n.ui.inverted.grey.segment {\n  background-color: #767676!important;\n  color: #FFF!important;\n}\n.ui.black.segment:not(.inverted) {\n  border-top: 2px solid #1B1C1D;\n}\n.ui.inverted.black.segment {\n  background-color: #1B1C1D!important;\n  color: #FFF!important;\n}\n.ui[class*=\"left aligned\"].segment {\n  text-align: left;\n}\n.ui[class*=\"right aligned\"].segment {\n  text-align: right;\n}\n.ui[class*=\"center aligned\"].segment {\n  text-align: center;\n}\n.ui.floated.segment,\n.ui[class*=\"left floated\"].segment {\n  float: left;\n  margin-right: 1em;\n}\n.ui[class*=\"right floated\"].segment {\n  float: right;\n  margin-left: 1em;\n}\n.ui.inverted.segment {\n  border: none;\n  box-shadow: none;\n}\n.ui.inverted.segment,\n.ui.primary.inverted.segment {\n  background: #1B1C1D;\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.segment .segment {\n  color: rgba(0,0,0,.87);\n}\n.ui.inverted.segment .inverted.segment {\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.attached.segment {\n  border-color: #555;\n}\n.ui.secondary.segment {\n  background: #F3F4F5;\n  color: rgba(0,0,0,.6);\n}\n.ui.secondary.inverted.segment {\n  background: -webkit-linear-gradient(rgba(255,255,255,.2) 0,rgba(255,255,255,.2) 100%) #4c4f52;\n  background: linear-gradient(rgba(255,255,255,.2) 0,rgba(255,255,255,.2) 100%) #4c4f52;\n  color: rgba(255,255,255,.8);\n}\n.ui.tertiary.segment {\n  background: #DCDDDE;\n  color: rgba(0,0,0,.6);\n}\n.ui.tertiary.inverted.segment {\n  background: -webkit-linear-gradient(rgba(255,255,255,.35) 0,rgba(255,255,255,.35) 100%) #717579;\n  background: linear-gradient(rgba(255,255,255,.35) 0,rgba(255,255,255,.35) 100%) #717579;\n  color: rgba(255,255,255,.8);\n}\n.ui.attached.segment {\n  top: 0;\n  bottom: 0;\n  border-radius: 0;\n  margin: 0 -1px;\n  width: calc(100% + 2px);\n  max-width: calc(100% + 2px);\n  box-shadow: none;\n  border: 1px solid #D4D4D5;\n}\n.ui.attached:not(.message)+.ui.attached.segment:not(.top) {\n  border-top: none;\n}\n.ui[class*=\"top attached\"].segment {\n  bottom: 0;\n  margin-bottom: 0;\n  top: 0;\n  margin-top: 1rem;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.segment[class*=\"top attached\"]:first-child {\n  margin-top: 0;\n}\n.ui.segment[class*=\"bottom attached\"] {\n  bottom: 0;\n  margin-top: 0;\n  top: 0;\n  margin-bottom: 1rem;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.segment[class*=\"bottom attached\"]:last-child {\n  margin-bottom: 0;\n}\n.ui.mini.segment,\n.ui.mini.segments .segment {\n  font-size: .78571429rem;\n}\n.ui.tiny.segment,\n.ui.tiny.segments .segment {\n  font-size: .85714286rem;\n}\n.ui.small.segment,\n.ui.small.segments .segment {\n  font-size: .92857143rem;\n}\n.ui.segment,\n.ui.segments .segment {\n  font-size: 1rem;\n}\n.ui.large.segment,\n.ui.large.segments .segment {\n  font-size: 1.14285714rem;\n}\n.ui.big.segment,\n.ui.big.segments .segment {\n  font-size: 1.28571429rem;\n}\n.ui.huge.segment,\n.ui.huge.segments .segment {\n  font-size: 1.42857143rem;\n}\n.ui.massive.segment,\n.ui.massive.segments .segment {\n  font-size: 1.71428571rem;\n}\n.ui.steps {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  margin: 1em 0;\n  background: 0 0;\n  box-shadow: none;\n  line-height: 1.14285714em;\n  border-radius: .28571429rem;\n  border: 1px solid rgba(34,36,38,.15);\n}\n.ui.steps:first-child {\n  margin-top: 0;\n}\n.ui.steps:last-child {\n  margin-bottom: 0;\n}\n.ui.steps .step {\n  position: relative;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  vertical-align: middle;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n  margin: 0;\n  padding: 1.14285714em 2em;\n  background: #FFF;\n  color: rgba(0,0,0,.87);\n  box-shadow: none;\n  border-radius: 0;\n  border: none;\n  border-right: 1px solid rgba(34,36,38,.15);\n  -webkit-transition: background-color .1s ease,opacity .1s ease,color .1s ease,box-shadow .1s ease;\n  transition: background-color .1s ease,opacity .1s ease,color .1s ease,box-shadow .1s ease;\n}\n.ui.steps .step:after {\n  position: absolute;\n  z-index: 2;\n  content: '';\n  top: 50%;\n  right: 0;\n  border: solid;\n  background-color: #FFF;\n  width: 1.14285714em;\n  height: 1.14285714em;\n  border-color: rgba(34,36,38,.15);\n  border-width: 0 1px 1px 0;\n  -webkit-transition: background-color .1s ease,opacity .1s ease,color .1s ease,box-shadow .1s ease;\n  transition: background-color .1s ease,opacity .1s ease,color .1s ease,box-shadow .1s ease;\n  -webkit-transform: translateY(-50%) translateX(50%) rotate(-45deg);\n  -ms-transform: translateY(-50%) translateX(50%) rotate(-45deg);\n  transform: translateY(-50%) translateX(50%) rotate(-45deg);\n}\n.ui.steps .step:first-child {\n  padding-left: 2em;\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui.steps .step:last-child {\n  border-radius: 0 .28571429rem .28571429rem 0;\n  border-right: none;\n  margin-right: 0;\n}\n.ui.steps .step:only-child {\n  border-radius: .28571429rem;\n}\n.ui.steps .step .title {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1.14285714em;\n  font-weight: 700;\n}\n.ui.steps .step>.title {\n  width: 100%;\n}\n.ui.steps .step .description {\n  font-weight: 400;\n  font-size: .92857143em;\n  color: rgba(0,0,0,.87);\n}\n.ui.steps .step>.description {\n  width: 100%;\n}\n.ui.steps .step .title~.description {\n  margin-top: .25em;\n}\n.ui.steps .step>.icon {\n  line-height: 1;\n  font-size: 2.5em;\n  margin: 0 1rem 0 0;\n}\n.ui.steps .step>.icon,\n.ui.steps .step>.icon~.content {\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  -webkit-align-self: middle;\n  -ms-flex-item-align: middle;\n  align-self: middle;\n}\n.ui.steps .step>.icon~.content {\n  -webkit-box-flex: 1 0 auto;\n  -webkit-flex-grow: 1 0 auto;\n  -ms-flex-positive: 1 0 auto;\n  flex-grow: 1 0 auto;\n}\n.ui.steps:not(.vertical) .step>.icon {\n  width: auto;\n}\n.ui.steps .link.step,\n.ui.steps a.step {\n  cursor: pointer;\n}\n.ui.ordered.steps {\n  counter-reset: ordered;\n}\n.ui.ordered.steps .step:before {\n  display: block;\n  position: static;\n  text-align: center;\n  content: counters(ordered,\".\");\n  -webkit-align-self: middle;\n  -ms-flex-item-align: middle;\n  align-self: middle;\n  margin-right: 1rem;\n  font-size: 2.5em;\n  counter-increment: ordered;\n  font-family: inherit;\n  font-weight: 700;\n}\n.ui.ordered.steps .step>* {\n  display: block;\n  -webkit-align-self: middle;\n  -ms-flex-item-align: middle;\n  align-self: middle;\n}\n.ui.vertical.steps {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  overflow: visible;\n}\n.ui.vertical.steps .step {\n  -webkit-box-pack: start;\n  -webkit-justify-content: flex-start;\n  -ms-flex-pack: start;\n  justify-content: flex-start;\n  border-radius: 0;\n  padding: 1.14285714em 2em;\n  border-right: none;\n  border-bottom: 1px solid rgba(34,36,38,.15);\n}\n.ui.vertical.steps .step:first-child {\n  padding: 1.14285714em 2em;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.vertical.steps .step:last-child {\n  border-bottom: none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.vertical.steps .step:only-child {\n  border-radius: .28571429rem;\n}\n.ui.vertical.steps .step:after {\n  top: 50%;\n  right: 0;\n  border-width: 0 1px 1px 0;\n  display: none;\n}\n.ui.vertical.steps .active.step:after {\n  display: block;\n}\n.ui.vertical.steps .step:last-child:after {\n  display: none;\n}\n.ui.vertical.steps .active.step:last-child:after {\n  display: block;\n}\n@media only screen and (max-width:767px) {\n  .ui.steps {\n    display: -webkit-inline-box;\n    display: -webkit-inline-flex;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    overflow: visible;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n  }\n\n  .ui.steps .step {\n    width: 100%!important;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    border-radius: 0;\n    padding: 1.14285714em 2em;\n  }\n\n  .ui.steps .step:first-child {\n    padding: 1.14285714em 2em;\n    border-radius: .28571429rem .28571429rem 0 0;\n  }\n\n  .ui.steps .step:last-child {\n    border-radius: 0 0 .28571429rem .28571429rem;\n  }\n\n  .ui.steps .step:after {\n    display: none!important;\n  }\n\n  .ui.steps .step .content {\n    text-align: center;\n  }\n\n  .ui.ordered.steps .step:before,\n  .ui.steps .step>.icon {\n    margin: 0 0 1rem;\n  }\n}\n.ui.steps .link.step:hover,\n.ui.steps .link.step:hover::after,\n.ui.steps a.step:hover,\n.ui.steps a.step:hover::after {\n  background: #F9FAFB;\n  color: rgba(0,0,0,.8);\n}\n.ui.steps .link.step:active,\n.ui.steps .link.step:active::after,\n.ui.steps a.step:active,\n.ui.steps a.step:active::after {\n  background: #F3F4F5;\n  color: rgba(0,0,0,.9);\n}\n.ui.steps .step.active {\n  cursor: auto;\n  background: #F3F4F5;\n}\n.ui.steps .step.active:after {\n  background: #F3F4F5;\n}\n.ui.steps .step.active .title {\n  color: #4183C4;\n}\n.ui.ordered.steps .step.active:before,\n.ui.steps .active.step .icon {\n  color: rgba(0,0,0,.85);\n}\n.ui.steps .active.step:after,\n.ui.steps .step:after {\n  display: block;\n}\n.ui.steps .active.step:last-child:after,\n.ui.steps .step:last-child:after {\n  display: none;\n}\n.ui.steps .link.active.step:hover,\n.ui.steps .link.active.step:hover::after,\n.ui.steps a.active.step:hover,\n.ui.steps a.active.step:hover::after {\n  cursor: pointer;\n  background: #DCDDDE;\n  color: rgba(0,0,0,.87);\n}\n.ui.ordered.steps .step.completed:before,\n.ui.steps .step.completed>.icon:before {\n  color: #21BA45;\n  font-family: Step;\n  content: '\\e800';\n}\n.ui.steps .disabled.step {\n  cursor: auto;\n  background: #FFF;\n  pointer-events: none;\n}\n.ui.steps .disabled.step,\n.ui.steps .disabled.step .description,\n.ui.steps .disabled.step .title {\n  color: rgba(40,40,40,.3);\n}\n.ui.steps .disabled.step:after {\n  background: #FFF;\n}\n@media only screen and (max-width:991px) {\n  .ui[class*=\"tablet stackable\"].steps {\n    display: -webkit-inline-box;\n    display: -webkit-inline-flex;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    overflow: visible;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n  }\n\n  .ui[class*=\"tablet stackable\"].steps .step {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    border-radius: 0;\n    padding: 1.14285714em 2em;\n  }\n\n  .ui[class*=\"tablet stackable\"].steps .step:first-child {\n    padding: 1.14285714em 2em;\n    border-radius: .28571429rem .28571429rem 0 0;\n  }\n\n  .ui[class*=\"tablet stackable\"].steps .step:last-child {\n    border-radius: 0 0 .28571429rem .28571429rem;\n  }\n\n  .ui[class*=\"tablet stackable\"].steps .step:after {\n    display: none!important;\n  }\n\n  .ui[class*=\"tablet stackable\"].steps .step .content {\n    text-align: center;\n  }\n\n  .ui[class*=\"tablet stackable\"].ordered.steps .step:before,\n  .ui[class*=\"tablet stackable\"].steps .step>.icon {\n    margin: 0 0 1rem;\n  }\n}\n.ui.fluid.steps {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n}\n.ui.attached.steps {\n  width: calc(100% + 2px)!important;\n  margin: 0 -1px;\n  max-width: calc(100% + 2px);\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.attached.steps .step:first-child {\n  border-radius: .28571429rem 0 0;\n}\n.ui.attached.steps .step:last-child {\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui.bottom.attached.steps {\n  margin: 0 -1px;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.bottom.attached.steps .step:first-child {\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui.bottom.attached.steps .step:last-child {\n  border-radius: 0 0 .28571429rem;\n}\n.ui.eight.steps,\n.ui.five.steps,\n.ui.four.steps,\n.ui.one.steps,\n.ui.seven.steps,\n.ui.six.steps,\n.ui.three.steps,\n.ui.two.steps {\n  width: 100%;\n}\n.ui.eight.steps>.step,\n.ui.five.steps>.step,\n.ui.four.steps>.step,\n.ui.one.steps>.step,\n.ui.seven.steps>.step,\n.ui.six.steps>.step,\n.ui.three.steps>.step,\n.ui.two.steps>.step {\n  -webkit-flex-wrap: nowrap;\n  -ms-flex-wrap: nowrap;\n  flex-wrap: nowrap;\n}\n.ui.one.steps>.step {\n  width: 100%;\n}\n.ui.two.steps>.step {\n  width: 50%;\n}\n.ui.three.steps>.step {\n  width: 33.333%;\n}\n.ui.four.steps>.step {\n  width: 25%;\n}\n.ui.five.steps>.step {\n  width: 20%;\n}\n.ui.six.steps>.step {\n  width: 16.666%;\n}\n.ui.seven.steps>.step {\n  width: 14.285%;\n}\n.ui.eight.steps>.step {\n  width: 12.5%;\n}\n.ui.mini.step,\n.ui.mini.steps .step {\n  font-size: .78571429rem;\n}\n.ui.tiny.step,\n.ui.tiny.steps .step {\n  font-size: .85714286rem;\n}\n.ui.small.step,\n.ui.small.steps .step {\n  font-size: .92857143rem;\n}\n.ui.step,\n.ui.steps .step {\n  font-size: 1rem;\n}\n.ui.large.step,\n.ui.large.steps .step {\n  font-size: 1.14285714rem;\n}\n.ui.big.step,\n.ui.big.steps .step {\n  font-size: 1.28571429rem;\n}\n.ui.huge.step,\n.ui.huge.steps .step {\n  font-size: 1.42857143rem;\n}\n.ui.massive.step,\n.ui.massive.steps .step {\n  font-size: 1.71428571rem;\n}\n@font-face {\n  font-family: Step;\n  src: url(data:application/x-font-ttf;charset=utf-8;;base64,AAEAAAAOAIAAAwBgT1MvMj3hSQEAAADsAAAAVmNtYXDQEhm3AAABRAAAAUpjdnQgBkn/lAAABuwAAAAcZnBnbYoKeDsAAAcIAAAJkWdhc3AAAAAQAAAG5AAAAAhnbHlm32cEdgAAApAAAAC2aGVhZAErPHsAAANIAAAANmhoZWEHUwNNAAADgAAAACRobXR4CykAAAAAA6QAAAAMbG9jYQA4AFsAAAOwAAAACG1heHAApgm8AAADuAAAACBuYW1lzJ0aHAAAA9gAAALNcG9zdK69QJgAAAaoAAAAO3ByZXCSoZr/AAAQnAAAAFYAAQO4AZAABQAIAnoCvAAAAIwCegK8AAAB4AAxAQIAAAIABQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUGZFZABA6ADoAQNS/2oAWgMLAE8AAAABAAAAAAAAAAAAAwAAAAMAAAAcAAEAAAAAAEQAAwABAAAAHAAEACgAAAAGAAQAAQACAADoAf//AAAAAOgA//8AABgBAAEAAAAAAAAAAAEGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAADpAKYABUAHEAZDwEAAQFCAAIBAmoAAQABagAAAGEUFxQDEisBFAcBBiInASY0PwE2Mh8BATYyHwEWA6QP/iAQLBD+6g8PTBAsEKQBbhAsEEwPAhYWEP4gDw8BFhAsEEwQEKUBbxAQTBAAAAH//f+xA18DCwAMABJADwABAQpDAAAACwBEFRMCESsBFA4BIi4CPgEyHgEDWXLG6MhuBnq89Lp+AV51xHR0xOrEdHTEAAAAAAEAAAABAADDeRpdXw889QALA+gAAAAAzzWYjQAAAADPNWBN//3/sQOkAwsAAAAIAAIAAAAAAAAAAQAAA1L/agBaA+gAAP/3A6QAAQAAAAAAAAAAAAAAAAAAAAMD6AAAA+gAAANZAAAAAAAAADgAWwABAAAAAwAWAAEAAAAAAAIABgATAG4AAAAtCZEAAAAAAAAAEgDeAAEAAAAAAAAANQAAAAEAAAAAAAEACAA1AAEAAAAAAAIABwA9AAEAAAAAAAMACABEAAEAAAAAAAQACABMAAEAAAAAAAUACwBUAAEAAAAAAAYACABfAAEAAAAAAAoAKwBnAAEAAAAAAAsAEwCSAAMAAQQJAAAAagClAAMAAQQJAAEAEAEPAAMAAQQJAAIADgEfAAMAAQQJAAMAEAEtAAMAAQQJAAQAEAE9AAMAAQQJAAUAFgFNAAMAAQQJAAYAEAFjAAMAAQQJAAoAVgFzAAMAAQQJAAsAJgHJQ29weXJpZ2h0IChDKSAyMDE0IGJ5IG9yaWdpbmFsIGF1dGhvcnMgQCBmb250ZWxsby5jb21mb250ZWxsb1JlZ3VsYXJmb250ZWxsb2ZvbnRlbGxvVmVyc2lvbiAxLjBmb250ZWxsb0dlbmVyYXRlZCBieSBzdmcydHRmIGZyb20gRm9udGVsbG8gcHJvamVjdC5odHRwOi8vZm9udGVsbG8uY29tAEMAbwBwAHkAcgBpAGcAaAB0ACAAKABDACkAIAAyADAAMQA0ACAAYgB5ACAAbwByAGkAZwBpAG4AYQBsACAAYQB1AHQAaABvAHIAcwAgAEAAIABmAG8AbgB0AGUAbABsAG8ALgBjAG8AbQBmAG8AbgB0AGUAbABsAG8AUgBlAGcAdQBsAGEAcgBmAG8AbgB0AGUAbABsAG8AZgBvAG4AdABlAGwAbABvAFYAZQByAHMAaQBvAG4AIAAxAC4AMABmAG8AbgB0AGUAbABsAG8ARwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABzAHYAZwAyAHQAdABmACAAZgByAG8AbQAgAEYAbwBuAHQAZQBsAGwAbwAgAHAAcgBvAGoAZQBjAHQALgBoAHQAdABwADoALwAvAGYAbwBuAHQAZQBsAGwAbwAuAGMAbwBtAAAAAAIAAAAAAAAACgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAQIBAwljaGVja21hcmsGY2lyY2xlAAAAAAEAAf//AA8AAAAAAAAAAAAAAAAAAAAAADIAMgML/7EDC/+xsAAssCBgZi2wASwgZCCwwFCwBCZasARFW1ghIyEbilggsFBQWCGwQFkbILA4UFghsDhZWSCwCkVhZLAoUFghsApFILAwUFghsDBZGyCwwFBYIGYgiophILAKUFhgGyCwIFBYIbAKYBsgsDZQWCGwNmAbYFlZWRuwACtZWSOwAFBYZVlZLbACLCBFILAEJWFkILAFQ1BYsAUjQrAGI0IbISFZsAFgLbADLCMhIyEgZLEFYkIgsAYjQrIKAAIqISCwBkMgiiCKsAArsTAFJYpRWGBQG2FSWVgjWSEgsEBTWLAAKxshsEBZI7AAUFhlWS2wBCywB0MrsgACAENgQi2wBSywByNCIyCwACNCYbCAYrABYLAEKi2wBiwgIEUgsAJFY7ABRWJgRLABYC2wBywgIEUgsAArI7ECBCVgIEWKI2EgZCCwIFBYIbAAG7AwUFiwIBuwQFlZI7AAUFhlWbADJSNhRESwAWAtsAgssQUFRbABYUQtsAkssAFgICCwCUNKsABQWCCwCSNCWbAKQ0qwAFJYILAKI0JZLbAKLCC4BABiILgEAGOKI2GwC0NgIIpgILALI0IjLbALLEtUWLEHAURZJLANZSN4LbAMLEtRWEtTWLEHAURZGyFZJLATZSN4LbANLLEADENVWLEMDEOwAWFCsAorWbAAQ7ACJUKxCQIlQrEKAiVCsAEWIyCwAyVQWLEBAENgsAQlQoqKIIojYbAJKiEjsAFhIIojYbAJKiEbsQEAQ2CwAiVCsAIlYbAJKiFZsAlDR7AKQ0dgsIBiILACRWOwAUViYLEAABMjRLABQ7AAPrIBAQFDYEItsA4ssQAFRVRYALAMI0IgYLABYbUNDQEACwBCQopgsQ0FK7BtKxsiWS2wDyyxAA4rLbAQLLEBDistsBEssQIOKy2wEiyxAw4rLbATLLEEDistsBQssQUOKy2wFSyxBg4rLbAWLLEHDistsBcssQgOKy2wGCyxCQ4rLbAZLLAIK7EABUVUWACwDCNCIGCwAWG1DQ0BAAsAQkKKYLENBSuwbSsbIlktsBossQAZKy2wGyyxARkrLbAcLLECGSstsB0ssQMZKy2wHiyxBBkrLbAfLLEFGSstsCAssQYZKy2wISyxBxkrLbAiLLEIGSstsCMssQkZKy2wJCwgPLABYC2wJSwgYLANYCBDI7ABYEOwAiVhsAFgsCQqIS2wJiywJSuwJSotsCcsICBHICCwAkVjsAFFYmAjYTgjIIpVWCBHICCwAkVjsAFFYmAjYTgbIVktsCgssQAFRVRYALABFrAnKrABFTAbIlktsCkssAgrsQAFRVRYALABFrAnKrABFTAbIlktsCosIDWwAWAtsCssALADRWOwAUVisAArsAJFY7ABRWKwACuwABa0AAAAAABEPiM4sSoBFSotsCwsIDwgRyCwAkVjsAFFYmCwAENhOC2wLSwuFzwtsC4sIDwgRyCwAkVjsAFFYmCwAENhsAFDYzgtsC8ssQIAFiUgLiBHsAAjQrACJUmKikcjRyNhIFhiGyFZsAEjQrIuAQEVFCotsDAssAAWsAQlsAQlRyNHI2GwBkUrZYouIyAgPIo4LbAxLLAAFrAEJbAEJSAuRyNHI2EgsAQjQrAGRSsgsGBQWCCwQFFYswIgAyAbswImAxpZQkIjILAIQyCKI0cjRyNhI0ZgsARDsIBiYCCwACsgiophILACQ2BkI7ADQ2FkUFiwAkNhG7ADQ2BZsAMlsIBiYSMgILAEJiNGYTgbI7AIQ0awAiWwCENHI0cjYWAgsARDsIBiYCMgsAArI7AEQ2CwACuwBSVhsAUlsIBisAQmYSCwBCVgZCOwAyVgZFBYIRsjIVkjICCwBCYjRmE4WS2wMiywABYgICCwBSYgLkcjRyNhIzw4LbAzLLAAFiCwCCNCICAgRiNHsAArI2E4LbA0LLAAFrADJbACJUcjRyNhsABUWC4gPCMhG7ACJbACJUcjRyNhILAFJbAEJUcjRyNhsAYlsAUlSbACJWGwAUVjIyBYYhshWWOwAUViYCMuIyAgPIo4IyFZLbA1LLAAFiCwCEMgLkcjRyNhIGCwIGBmsIBiIyAgPIo4LbA2LCMgLkawAiVGUlggPFkusSYBFCstsDcsIyAuRrACJUZQWCA8WS6xJgEUKy2wOCwjIC5GsAIlRlJYIDxZIyAuRrACJUZQWCA8WS6xJgEUKy2wOSywMCsjIC5GsAIlRlJYIDxZLrEmARQrLbA6LLAxK4ogIDywBCNCijgjIC5GsAIlRlJYIDxZLrEmARQrsARDLrAmKy2wOyywABawBCWwBCYgLkcjRyNhsAZFKyMgPCAuIzixJgEUKy2wPCyxCAQlQrAAFrAEJbAEJSAuRyNHI2EgsAQjQrAGRSsgsGBQWCCwQFFYswIgAyAbswImAxpZQkIjIEewBEOwgGJgILAAKyCKimEgsAJDYGQjsANDYWRQWLACQ2EbsANDYFmwAyWwgGJhsAIlRmE4IyA8IzgbISAgRiNHsAArI2E4IVmxJgEUKy2wPSywMCsusSYBFCstsD4ssDErISMgIDywBCNCIzixJgEUK7AEQy6wJistsD8ssAAVIEewACNCsgABARUUEy6wLCotsEAssAAVIEewACNCsgABARUUEy6wLCotsEEssQABFBOwLSotsEIssC8qLbBDLLAAFkUjIC4gRoojYTixJgEUKy2wRCywCCNCsEMrLbBFLLIAADwrLbBGLLIAATwrLbBHLLIBADwrLbBILLIBATwrLbBJLLIAAD0rLbBKLLIAAT0rLbBLLLIBAD0rLbBMLLIBAT0rLbBNLLIAADkrLbBOLLIAATkrLbBPLLIBADkrLbBQLLIBATkrLbBRLLIAADsrLbBSLLIAATsrLbBTLLIBADsrLbBULLIBATsrLbBVLLIAAD4rLbBWLLIAAT4rLbBXLLIBAD4rLbBYLLIBAT4rLbBZLLIAADorLbBaLLIAATorLbBbLLIBADorLbBcLLIBATorLbBdLLAyKy6xJgEUKy2wXiywMiuwNistsF8ssDIrsDcrLbBgLLAAFrAyK7A4Ky2wYSywMysusSYBFCstsGIssDMrsDYrLbBjLLAzK7A3Ky2wZCywMyuwOCstsGUssDQrLrEmARQrLbBmLLA0K7A2Ky2wZyywNCuwNystsGgssDQrsDgrLbBpLLA1Ky6xJgEUKy2waiywNSuwNistsGsssDUrsDcrLbBsLLA1K7A4Ky2wbSwrsAhlsAMkUHiwARUwLQAAAEu4AMhSWLEBAY5ZuQgACABjILABI0SwAyNwsgQoCUVSRLIKAgcqsQYBRLEkAYhRWLBAiFixBgNEsSYBiFFYuAQAiFixBgFEWVlZWbgB/4WwBI2xBQBEAAA=) format('truetype'),url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAoUAA4AAAAAEPQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABRAAAAEQAAABWPeFJAWNtYXAAAAGIAAAAOgAAAUrQEhm3Y3Z0IAAAAcQAAAAUAAAAHAZJ/5RmcGdtAAAB2AAABPkAAAmRigp4O2dhc3AAAAbUAAAACAAAAAgAAAAQZ2x5ZgAABtwAAACuAAAAtt9nBHZoZWFkAAAHjAAAADUAAAA2ASs8e2hoZWEAAAfEAAAAIAAAACQHUwNNaG10eAAAB+QAAAAMAAAADAspAABsb2NhAAAH8AAAAAgAAAAIADgAW21heHAAAAf4AAAAIAAAACAApgm8bmFtZQAACBgAAAF3AAACzcydGhxwb3N0AAAJkAAAACoAAAA7rr1AmHByZXAAAAm8AAAAVgAAAFaSoZr/eJxjYGTewTiBgZWBg6mKaQ8DA0MPhGZ8wGDIyMTAwMTAysyAFQSkuaYwOLxgeMHIHPQ/iyGKmZvBHyjMCJIDAPe9C2B4nGNgYGBmgGAZBkYGEHAB8hjBfBYGDSDNBqQZGZgYGF4w/v8PUvCCAURLMELVAwEjG8OIBwBk5AavAAB4nGNgQANGDEbM3P83gjAAELQD4XicnVXZdtNWFJU8ZHASOmSgoA7X3DhQ68qEKRgwaSrFdiEdHAitBB2kDHTkncc+62uOQrtWH/m07n09JLR0rbYsls++R1tn2DrnRhwjKn0aiGvUoZKXA6msPZZK90lc13Uvj5UMBnFdthJPSZuonSRKat3sUC7xWOsqWSdYJ+PlIFZPVZ5noAziFB5lSUQbRBuplyZJ4onjJ4kWZxAfJUkgJaMQp9LIUEI1GsRS1aFM6dCr1xNx00DKRqMedVhU90PFJ8c1p9SsA0YqVznCFevVRr4bpwMve5DEOsGzrYcxHnisfpQqkIqR6cg/dkpOlIaBVHHUoVbi6DCTX/eRTCrNQKaMYkWl7oG43f102xYxPXQ6vi5KlUaqurnOKJrt0fGogygP2cbppNzQ2fbw5RlTVKtdcbPtQGYNXErJbHSfRAAdJlLj6QFONZwCqRn1R8XZ588BEslclKo8VTKHegOZMzt7cTHtbiersnCknwcyb3Z2452HQ6dXh3/R+hdM4cxHj+Jifj5C+lBqfiJOJKVGWMzyp4YfcVcgQrkxiAsXyuBThDl0RdrZZl3jtTH2hs/5SqlhPQna6KP4fgr9TiQrHGdRo/VInM1j13Wt3GdQS7W7Fzsyr0OVIu7vCwuuM+eEYZ4WC1VfnvneBTT/Bohn/EDeNIVL+5YpSrRvm6JMu2iKCu0SVKVdNsUU7YoppmnPmmKG9h1TzNKeMzLj/8vc55H7HN7xkJv2XeSmfQ+5ad9HbtoPkJtWITdtHblpLyA3rUZu2lWjOnYEGgZpF1IVQdA0svph3Fab9UDWjDR8aWDyLmLI+upER521tcofxX914gsHcmmip7siF5viLq/bFj483e6rj5pG3bDV+MaR8jAeRnocmtBZ+c3hv+1N3S6a7jKqMugBFUwKwABl7UAC0zrbCaT1mqf48gdgXIZ4zkpDtVSfO4am7+V5X/exOfG+x+3GLrdcd3kJWdYNcmP28N9SZKrrH+UtrVQnR6wrJ49VaxhDKrwour6SlHu0tRu/KKmy8l6U1srnk5CbPYMbQlu27mGwI0xpyiUeXlOlKD3UUo6yQyxvKco84JSLC1qGxLgOdQ9qa8TpoXoYGwshhqG0vRBwSCldFd+0ynfxHqtr2Oj4xRXh6XpyEhGf4ir7UfBU10b96A7avGbdMoMpVaqn+4xPsa/b9lFZaaSOsxe3VAfXNOsaORXTT+Rr4HRvOGjdAz1UfDRBI1U1x+jGKGM0ljXl3wR0MVZ+w2jVYvs93E+dpFWsuUuY7JsT9+C0u/0q+7WcW0bW/dcGvW3kip8jMb8tCvw7B2K3ZA3UO5OBGAvIWdAYxhYmdxiug23EbfY/Jqf/34aFRXJXOxq7eerD1ZNRJXfZ8rjLTXZZ16M2R9VOGvsIjS0PN+bY4XIstsRgQbb+wf8x7gF3aVEC4NDIZZiI2nShnurh6h6rsW04VxIBds2x43QAegAuQd8cu9bzCYD13CPnLsB9cgh2yCH4lByCz8i5BfA5OQRfkEMwIIdgl5w7AA/IIXhIDsEeOQSPyNkE+JIcgq/IIYjJIUjIuQ3wmByCJ+QQfE0OwTdGrk5k/pYH2QD6zqKbQKmdGhzaOGRGrk3Y+zxY9oFFZB9aROqRkesT6lMeLPV7i0j9wSJSfzRyY0L9iQdL/dkiUn+xiNRnxpeZIymvDp7zjg7+BJfqrV4AAAAAAQAB//8AD3icY2BkAALmJUwzGEQZZBwk+RkZGBmdGJgYmbIYgMwsoGSiiLgIs5A2owg7I5uSOqOaiT2jmZE8I5gQY17C/09BQEfg3yt+fh8gvYQxD0j68DOJiQn8U+DnZxQDcQUEljLmCwBpBgbG/3//b2SOZ+Zm4GEQcuAH2sblDLSEm8FFVJhJEGgLH6OSHpMdo5EcI3Nk0bEXJ/LYqvZ82VXHGFd6pKTkyCsQwQAAq+QkqAAAeJxjYGRgYADiw5VSsfH8Nl8ZuJlfAEUYzpvO6IXQCb7///7fyLyEmRvI5WBgAokCAFb/DJAAAAB4nGNgZGBgDvqfxRDF/IKB4f935iUMQBEUwAwAi5YFpgPoAAAD6AAAA1kAAAAAAAAAOABbAAEAAAADABYAAQAAAAAAAgAGABMAbgAAAC0JkQAAAAB4nHWQy2rCQBSG//HSi0JbWui2sypKabxgN4IgWHTTbqS4LTHGJBIzMhkFX6Pv0IfpS/RZ+puMpShNmMx3vjlz5mQAXOMbAvnzxJGzwBmjnAs4Rc9ykf7Zcon8YrmMKt4sn9C/W67gAYHlKm7wwQqidM5ogU/LAlfi0nIBF+LOcpH+0XKJ3LNcxq14tXxC71muYCJSy1Xci6+BWm11FIRG1gZ12W62OnK6lYoqStxYumsTKp3KvpyrxPhxrBxPLfc89oN17Op9uJ8nvk4jlciW09yrkZ/42jX+bFc93QRtY+ZyrtVSDm2GXGm18D3jhMasuo3G3/MwgMIKW2hEvKoQBhI12jrnNppooUOaMkMyM8+KkMBFTONizR1htpIy7nPMGSW0PjNisgOP3+WRH5MC7o9ZRR+tHsYT0u6MKPOSfTns7jBrREqyTDezs9/eU2x4WpvWcNeuS511JTE8qCF5H7u1BY1H72S3Ymi7aPD95/9+AN1fhEsAeJxjYGKAAC4G7ICZgYGRiZGZMzkjNTk7N7Eomy05syg5J5WBAQBE1QZBAABLuADIUlixAQGOWbkIAAgAYyCwASNEsAMjcLIEKAlFUkSyCgIHKrEGAUSxJAGIUViwQIhYsQYDRLEmAYhRWLgEAIhYsQYBRFlZWVm4Af+FsASNsQUARAAA) format('woff');\n}\n.ui.breadcrumb {\n  line-height: 1;\n  display: inline-block;\n  margin: 0;\n  vertical-align: middle;\n}\n.ui.breadcrumb:first-child {\n  margin-top: 0;\n}\n.ui.breadcrumb:last-child {\n  margin-bottom: 0;\n}\n.ui.breadcrumb .divider {\n  display: inline-block;\n  opacity: .7;\n  margin: 0 .21428571rem;\n  font-size: .92857143em;\n  color: rgba(0,0,0,.4);\n  vertical-align: baseline;\n}\n.ui.breadcrumb a {\n  color: #4183C4;\n}\n.ui.breadcrumb a:hover {\n  color: #1e70bf;\n}\n.ui.breadcrumb .icon.divider {\n  font-size: .85714286em;\n  vertical-align: baseline;\n}\n.ui.breadcrumb a.section {\n  cursor: pointer;\n}\n.ui.breadcrumb .section {\n  display: inline-block;\n  margin: 0;\n  padding: 0;\n}\n.ui.breadcrumb.segment {\n  display: inline-block;\n  padding: .78571429em 1em;\n}\n.ui.breadcrumb .active.section {\n  font-weight: 700;\n}\n.ui.mini.breadcrumb {\n  font-size: .78571429rem;\n}\n.ui.tiny.breadcrumb {\n  font-size: .85714286rem;\n}\n.ui.small.breadcrumb {\n  font-size: .92857143rem;\n}\n.ui.breadcrumb {\n  font-size: 1rem;\n}\n.ui.large.breadcrumb {\n  font-size: 1.14285714rem;\n}\n.ui.big.breadcrumb {\n  font-size: 1.28571429rem;\n}\n.ui.huge.breadcrumb {\n  font-size: 1.42857143rem;\n}\n.ui.massive.breadcrumb {\n  font-size: 1.71428571rem;\n}\n.ui.form {\n  position: relative;\n  max-width: 100%;\n}\n.ui.form>p {\n  margin: 1em 0;\n}\n.ui.form .field {\n  clear: both;\n  margin: 0 0 1em;\n}\n.ui.form .field:last-child,\n.ui.form .fields:last-child .field {\n  margin-bottom: 0;\n}\n.ui.form .fields .field {\n  clear: both;\n  margin: 0;\n}\n.ui.form .field>label {\n  display: block;\n  margin: 0 0 .28571429rem;\n  color: rgba(0,0,0,.87);\n  font-size: .92857143em;\n  font-weight: 700;\n  text-transform: none;\n}\n.ui.form input:not([type]),\n.ui.form input[type=text],\n.ui.form input[type=email],\n.ui.form input[type=search],\n.ui.form input[type=password],\n.ui.form input[type=date],\n.ui.form input[type=datetime-local],\n.ui.form input[type=tel],\n.ui.form input[type=time],\n.ui.form input[type=file],\n.ui.form input[type=url],\n.ui.form input[type=number],\n.ui.form textarea {\n  width: 100%;\n  vertical-align: top;\n}\n.ui.form ::-webkit-datetime-edit,\n.ui.form ::-webkit-inner-spin-button {\n  height: 1.2142em;\n}\n.ui.form input:not([type]),\n.ui.form input[type=text],\n.ui.form input[type=email],\n.ui.form input[type=search],\n.ui.form input[type=password],\n.ui.form input[type=date],\n.ui.form input[type=datetime-local],\n.ui.form input[type=tel],\n.ui.form input[type=time],\n.ui.form input[type=file],\n.ui.form input[type=url],\n.ui.form input[type=number] {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  margin: 0;\n  outline: 0;\n  -webkit-appearance: none;\n  tap-highlight-color: rgba(255,255,255,0);\n  line-height: 1.2142em;\n  padding: .67861429em 1em;\n  font-size: 1em;\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  color: rgba(0,0,0,.87);\n  border-radius: .28571429rem;\n  box-shadow: 0 0 0 0 transparent inset;\n  -webkit-transition: color .1s ease,border-color .1s ease;\n  transition: color .1s ease,border-color .1s ease;\n}\n.ui.form textarea {\n  margin: 0;\n  -webkit-appearance: none;\n  tap-highlight-color: rgba(255,255,255,0);\n  padding: .78571429em 1em;\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  outline: 0;\n  color: rgba(0,0,0,.87);\n  border-radius: .28571429rem;\n  box-shadow: 0 0 0 0 transparent inset;\n  -webkit-transition: color .1s ease,border-color .1s ease;\n  transition: color .1s ease,border-color .1s ease;\n  font-size: 1em;\n  line-height: 1.2857;\n  resize: vertical;\n}\n.ui.form textarea:not([rows]) {\n  height: 12em;\n  min-height: 8em;\n  max-height: 24em;\n}\n.ui.form input[type=checkbox],\n.ui.form textarea {\n  vertical-align: top;\n}\n.ui.form input.attached {\n  width: auto;\n}\n.ui.form select {\n  display: block;\n  height: auto;\n  width: 100%;\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n  box-shadow: 0 0 0 0 transparent inset;\n  padding: .62em 1em;\n  color: rgba(0,0,0,.87);\n  -webkit-transition: color .1s ease,border-color .1s ease;\n  transition: color .1s ease,border-color .1s ease;\n}\n.ui.form .field>.selection.dropdown {\n  width: 100%;\n}\n.ui.form .field>.selection.dropdown>.dropdown.icon {\n  float: right;\n}\n.ui.form .inline.field>.selection.dropdown,\n.ui.form .inline.fields .field>.selection.dropdown {\n  width: auto;\n}\n.ui.form .inline.field>.selection.dropdown>.dropdown.icon,\n.ui.form .inline.fields .field>.selection.dropdown>.dropdown.icon {\n  float: none;\n}\n.ui.form .field .ui.input,\n.ui.form .fields .field .ui.input,\n.ui.form .wide.field .ui.input {\n  width: 100%;\n}\n.ui.form .inline.field:not(.wide) .ui.input,\n.ui.form .inline.fields .field:not(.wide) .ui.input {\n  width: auto;\n  vertical-align: middle;\n}\n.ui.form .field .ui.input input,\n.ui.form .fields .field .ui.input input {\n  width: auto;\n}\n.ui.form .eight.fields .ui.input input,\n.ui.form .five.fields .ui.input input,\n.ui.form .four.fields .ui.input input,\n.ui.form .nine.fields .ui.input input,\n.ui.form .seven.fields .ui.input input,\n.ui.form .six.fields .ui.input input,\n.ui.form .ten.fields .ui.input input,\n.ui.form .three.fields .ui.input input,\n.ui.form .two.fields .ui.input input,\n.ui.form .wide.field .ui.input input {\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  width: 0;\n}\n.ui.form .error.message,\n.ui.form .success.message,\n.ui.form .warning.message {\n  display: none;\n}\n.ui.form .message:first-child {\n  margin-top: 0;\n}\n.ui.form .field .prompt.label {\n  white-space: normal;\n  background: #FFF!important;\n  border: 1px solid #E0B4B4!important;\n  color: #9F3A38!important;\n}\n.ui.form .inline.field .prompt,\n.ui.form .inline.fields .field .prompt {\n  vertical-align: top;\n  margin: -.25em 0 -.5em .5em;\n}\n.ui.form .inline.field .prompt:before,\n.ui.form .inline.fields .field .prompt:before {\n  border-width: 0 0 1px 1px;\n  bottom: auto;\n  right: auto;\n  top: 50%;\n  left: 0;\n}\n.ui.form .field.field input:-webkit-autofill {\n  box-shadow: 0 0 0 100px ivory inset!important;\n  border-color: #E5DFA1!important;\n}\n.ui.form .field.field input:-webkit-autofill:focus {\n  box-shadow: 0 0 0 100px ivory inset!important;\n  border-color: #D5C315!important;\n}\n.ui.form .error.error input:-webkit-autofill {\n  box-shadow: 0 0 0 100px #FFFAF0 inset!important;\n  border-color: #E0B4B4!important;\n}\n.ui.form ::-webkit-input-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.form :-ms-input-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.form ::-moz-placeholder {\n  color: rgba(191,191,191,.87);\n}\n.ui.form :focus::-webkit-input-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.form :focus:-ms-input-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.form :focus::-moz-placeholder {\n  color: rgba(115,115,115,.87);\n}\n.ui.form .error ::-webkit-input-placeholder {\n  color: #e7bdbc;\n}\n.ui.form .error :-ms-input-placeholder {\n  color: #e7bdbc!important;\n}\n.ui.form .error ::-moz-placeholder {\n  color: #e7bdbc;\n}\n.ui.form .error :focus::-webkit-input-placeholder {\n  color: #da9796;\n}\n.ui.form .error :focus:-ms-input-placeholder {\n  color: #da9796!important;\n}\n.ui.form .error :focus::-moz-placeholder {\n  color: #da9796;\n}\n.ui.form input:not([type]):focus,\n.ui.form input[type=text]:focus,\n.ui.form input[type=email]:focus,\n.ui.form input[type=search]:focus,\n.ui.form input[type=password]:focus,\n.ui.form input[type=date]:focus,\n.ui.form input[type=datetime-local]:focus,\n.ui.form input[type=tel]:focus,\n.ui.form input[type=time]:focus,\n.ui.form input[type=file]:focus,\n.ui.form input[type=url]:focus,\n.ui.form input[type=number]:focus {\n  color: rgba(0,0,0,.95);\n  border-color: #85B7D9;\n  border-radius: .28571429rem;\n  background: #FFF;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.35) inset;\n}\n.ui.form textarea:focus {\n  color: rgba(0,0,0,.95);\n  border-color: #85B7D9;\n  border-radius: .28571429rem;\n  background: #FFF;\n  box-shadow: 0 0 0 0 rgba(34,36,38,.35) inset;\n  -webkit-appearance: none;\n}\n.ui.form.success .success.message:not(:empty) {\n  display: block;\n}\n.ui.form.success .compact.success.message:not(:empty) {\n  display: inline-block;\n}\n.ui.form.success .icon.success.message:not(:empty) {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.form.warning .warning.message:not(:empty) {\n  display: block;\n}\n.ui.form.warning .compact.warning.message:not(:empty) {\n  display: inline-block;\n}\n.ui.form.warning .icon.warning.message:not(:empty) {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.form.error .error.message:not(:empty) {\n  display: block;\n}\n.ui.form.error .compact.error.message:not(:empty) {\n  display: inline-block;\n}\n.ui.form.error .icon.error.message:not(:empty) {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.form .field.error .input,\n.ui.form .field.error label,\n.ui.form .fields.error .field .input,\n.ui.form .fields.error .field label {\n  color: #9F3A38;\n}\n.ui.form .field.error .corner.label,\n.ui.form .fields.error .field .corner.label {\n  border-color: #9F3A38;\n  color: #FFF;\n}\n.ui.form .field.error input:not([type]),\n.ui.form .field.error input[type=text],\n.ui.form .field.error input[type=email],\n.ui.form .field.error input[type=search],\n.ui.form .field.error input[type=password],\n.ui.form .field.error input[type=date],\n.ui.form .field.error input[type=datetime-local],\n.ui.form .field.error input[type=tel],\n.ui.form .field.error input[type=time],\n.ui.form .field.error input[type=file],\n.ui.form .field.error input[type=url],\n.ui.form .field.error input[type=number],\n.ui.form .field.error select,\n.ui.form .field.error textarea,\n.ui.form .fields.error .field input:not([type]),\n.ui.form .fields.error .field input[type=text],\n.ui.form .fields.error .field input[type=email],\n.ui.form .fields.error .field input[type=search],\n.ui.form .fields.error .field input[type=password],\n.ui.form .fields.error .field input[type=date],\n.ui.form .fields.error .field input[type=datetime-local],\n.ui.form .fields.error .field input[type=tel],\n.ui.form .fields.error .field input[type=time],\n.ui.form .fields.error .field input[type=file],\n.ui.form .fields.error .field input[type=url],\n.ui.form .fields.error .field input[type=number],\n.ui.form .fields.error .field select,\n.ui.form .fields.error .field textarea {\n  background: #FFF6F6;\n  border-color: #E0B4B4;\n  color: #9F3A38;\n  border-radius: '';\n  box-shadow: none;\n}\n.ui.form .field.error input:not([type]):focus,\n.ui.form .field.error input[type=text]:focus,\n.ui.form .field.error input[type=email]:focus,\n.ui.form .field.error input[type=search]:focus,\n.ui.form .field.error input[type=password]:focus,\n.ui.form .field.error input[type=date]:focus,\n.ui.form .field.error input[type=datetime-local]:focus,\n.ui.form .field.error input[type=tel]:focus,\n.ui.form .field.error input[type=time]:focus,\n.ui.form .field.error input[type=file]:focus,\n.ui.form .field.error input[type=url]:focus,\n.ui.form .field.error input[type=number]:focus,\n.ui.form .field.error select:focus,\n.ui.form .field.error textarea:focus {\n  background: #FFF6F6;\n  border-color: #E0B4B4;\n  color: #9F3A38;\n  -webkit-appearance: none;\n  box-shadow: none;\n}\n.ui.form .field.error select {\n  -webkit-appearance: menulist-button;\n}\n.ui.form .field.error .ui.dropdown,\n.ui.form .field.error .ui.dropdown .item,\n.ui.form .field.error .ui.dropdown .text,\n.ui.form .fields.error .field .ui.dropdown,\n.ui.form .fields.error .field .ui.dropdown .item {\n  background: #FFF6F6;\n  color: #9F3A38;\n}\n.ui.form .field.error .ui.dropdown,\n.ui.form .field.error .ui.dropdown:hover,\n.ui.form .fields.error .field .ui.dropdown,\n.ui.form .fields.error .field .ui.dropdown:hover {\n  border-color: #E0B4B4!important;\n}\n.ui.form .field.error .ui.dropdown:hover .menu,\n.ui.form .fields.error .field .ui.dropdown:hover .menu {\n  border-color: #E0B4B4;\n}\n.ui.form .field.error .ui.multiple.selection.dropdown>.label,\n.ui.form .fields.error .field .ui.multiple.selection.dropdown>.label {\n  background-color: #EACBCB;\n  color: #9F3A38;\n}\n.ui.form .field.error .ui.dropdown .menu .item:hover,\n.ui.form .field.error .ui.dropdown .menu .selected.item,\n.ui.form .fields.error .field .ui.dropdown .menu .item:hover,\n.ui.form .fields.error .field .ui.dropdown .menu .selected.item {\n  background-color: #FBE7E7;\n}\n.ui.form .field.error .ui.dropdown .menu .active.item,\n.ui.form .fields.error .field .ui.dropdown .menu .active.item {\n  background-color: #FDCFCF!important;\n}\n.ui.form .field.error .checkbox:not(.toggle):not(.slider) .box,\n.ui.form .field.error .checkbox:not(.toggle):not(.slider) label,\n.ui.form .fields.error .field .checkbox:not(.toggle):not(.slider) .box,\n.ui.form .fields.error .field .checkbox:not(.toggle):not(.slider) label {\n  color: #9F3A38;\n}\n.ui.form .field.error .checkbox:not(.toggle):not(.slider) .box:before,\n.ui.form .field.error .checkbox:not(.toggle):not(.slider) label:before,\n.ui.form .fields.error .field .checkbox:not(.toggle):not(.slider) .box:before,\n.ui.form .fields.error .field .checkbox:not(.toggle):not(.slider) label:before {\n  background: #FFF6F6;\n  border-color: #E0B4B4;\n}\n.ui.form .field.error .checkbox .box:after,\n.ui.form .field.error .checkbox label:after,\n.ui.form .fields.error .field .checkbox .box:after,\n.ui.form .fields.error .field .checkbox label:after {\n  color: #9F3A38;\n}\n.ui.form .disabled.field,\n.ui.form .disabled.fields .field,\n.ui.form .field :disabled {\n  pointer-events: none;\n  opacity: .45;\n}\n.ui.form .field.disabled>label,\n.ui.form .fields.disabled>label {\n  opacity: .45;\n}\n.ui.form .field.disabled :disabled {\n  opacity: 1;\n}\n.ui.loading.form {\n  position: relative;\n  cursor: default;\n  pointer-events: none;\n}\n.ui.loading.form:before {\n  position: absolute;\n  content: '';\n  top: 0;\n  left: 0;\n  background: rgba(255,255,255,.8);\n  width: 100%;\n  height: 100%;\n  z-index: 100;\n}\n.ui.loading.form:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -1.5em 0 0 -1.5em;\n  width: 3em;\n  height: 3em;\n  -webkit-animation: form-spin .6s linear;\n  animation: form-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 rgba(0,0,0,.1) rgba(0,0,0,.1);\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n  visibility: visible;\n  z-index: 101;\n}\n@-webkit-keyframes form-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes form-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n.ui.form .required.field>.checkbox:after,\n.ui.form .required.field>label:after,\n.ui.form .required.fields.grouped>label:after,\n.ui.form .required.fields:not(.grouped)>.field>.checkbox:after,\n.ui.form .required.fields:not(.grouped)>.field>label:after {\n  margin: -.2em 0 0 .2em;\n  content: '*';\n  color: #DB2828;\n}\n.ui.form .required.field>label:after,\n.ui.form .required.fields.grouped>label:after,\n.ui.form .required.fields:not(.grouped)>.field>label:after {\n  display: inline-block;\n  vertical-align: top;\n}\n.ui.form .required.field>.checkbox:after,\n.ui.form .required.fields:not(.grouped)>.field>.checkbox:after {\n  position: absolute;\n  top: 0;\n  left: 100%;\n}\n.ui.form .inverted.segment .ui.checkbox .box,\n.ui.form .inverted.segment .ui.checkbox label,\n.ui.form .inverted.segment label,\n.ui.inverted.form .inline.field>label,\n.ui.inverted.form .inline.field>p,\n.ui.inverted.form .inline.fields .field>label,\n.ui.inverted.form .inline.fields .field>p,\n.ui.inverted.form .inline.fields>label,\n.ui.inverted.form .ui.checkbox .box,\n.ui.inverted.form .ui.checkbox label,\n.ui.inverted.form label {\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.form input:not([type]),\n.ui.inverted.form input[type=text],\n.ui.inverted.form input[type=email],\n.ui.inverted.form input[type=search],\n.ui.inverted.form input[type=password],\n.ui.inverted.form input[type=date],\n.ui.inverted.form input[type=datetime-local],\n.ui.inverted.form input[type=tel],\n.ui.inverted.form input[type=time],\n.ui.inverted.form input[type=file],\n.ui.inverted.form input[type=url],\n.ui.inverted.form input[type=number] {\n  background: #FFF;\n  border-color: rgba(255,255,255,.1);\n  color: rgba(0,0,0,.87);\n  box-shadow: none;\n}\n.ui.form .grouped.fields {\n  display: block;\n  margin: 0 0 1em;\n}\n.ui.form .grouped.fields:last-child {\n  margin-bottom: 0;\n}\n.ui.form .grouped.fields>label {\n  margin: 0 0 .28571429rem;\n  color: rgba(0,0,0,.87);\n  font-size: .92857143em;\n  font-weight: 700;\n  text-transform: none;\n}\n.ui.form .grouped.fields .field,\n.ui.form .grouped.inline.fields .field {\n  display: block;\n  margin: .5em 0;\n  padding: 0;\n}\n.ui.form .fields {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  margin: 0 -.5em 1em;\n}\n.ui.form .fields>.field {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  padding-left: .5em;\n  padding-right: .5em;\n}\n.ui.form .fields>.field:first-child {\n  border-left: none;\n  box-shadow: none;\n}\n.ui.form .two.fields>.field,\n.ui.form .two.fields>.fields {\n  width: 50%;\n}\n.ui.form .three.fields>.field,\n.ui.form .three.fields>.fields {\n  width: 33.33333333%;\n}\n.ui.form .four.fields>.field,\n.ui.form .four.fields>.fields {\n  width: 25%;\n}\n.ui.form .five.fields>.field,\n.ui.form .five.fields>.fields {\n  width: 20%;\n}\n.ui.form .six.fields>.field,\n.ui.form .six.fields>.fields {\n  width: 16.66666667%;\n}\n.ui.form .seven.fields>.field,\n.ui.form .seven.fields>.fields {\n  width: 14.28571429%;\n}\n.ui.form .eight.fields>.field,\n.ui.form .eight.fields>.fields {\n  width: 12.5%;\n}\n.ui.form .nine.fields>.field,\n.ui.form .nine.fields>.fields {\n  width: 11.11111111%;\n}\n.ui.form .ten.fields>.field,\n.ui.form .ten.fields>.fields {\n  width: 10%;\n}\n@media only screen and (max-width:767px) {\n  .ui.form .fields {\n    -webkit-flex-wrap: wrap;\n    -ms-flex-wrap: wrap;\n    flex-wrap: wrap;\n  }\n\n  .ui.form .eight.fields>.field,\n  .ui.form .eight.fields>.fields,\n  .ui.form .five.fields>.field,\n  .ui.form .five.fields>.fields,\n  .ui.form .four.fields>.field,\n  .ui.form .four.fields>.fields,\n  .ui.form .nine.fields>.field,\n  .ui.form .nine.fields>.fields,\n  .ui.form .seven.fields>.field,\n  .ui.form .seven.fields>.fields,\n  .ui.form .six.fields>.field,\n  .ui.form .six.fields>.fields,\n  .ui.form .ten.fields>.field,\n  .ui.form .ten.fields>.fields,\n  .ui.form .three.fields>.field,\n  .ui.form .three.fields>.fields,\n  .ui.form .two.fields>.field,\n  .ui.form .two.fields>.fields,\n  .ui.form [class*=\"equal width\"].fields>.field,\n  .ui[class*=\"equal width\"].form .fields>.field {\n    width: 100%!important;\n    margin: 0 0 1em;\n  }\n}\n.ui.form .fields .wide.field {\n  width: 6.25%;\n  padding-left: .5em;\n  padding-right: .5em;\n}\n.ui.form .one.wide.field {\n  width: 6.25%!important;\n}\n.ui.form .two.wide.field {\n  width: 12.5%!important;\n}\n.ui.form .three.wide.field {\n  width: 18.75%!important;\n}\n.ui.form .four.wide.field {\n  width: 25%!important;\n}\n.ui.form .five.wide.field {\n  width: 31.25%!important;\n}\n.ui.form .six.wide.field {\n  width: 37.5%!important;\n}\n.ui.form .seven.wide.field {\n  width: 43.75%!important;\n}\n.ui.form .eight.wide.field {\n  width: 50%!important;\n}\n.ui.form .nine.wide.field {\n  width: 56.25%!important;\n}\n.ui.form .ten.wide.field {\n  width: 62.5%!important;\n}\n.ui.form .eleven.wide.field {\n  width: 68.75%!important;\n}\n.ui.form .twelve.wide.field {\n  width: 75%!important;\n}\n.ui.form .thirteen.wide.field {\n  width: 81.25%!important;\n}\n.ui.form .fourteen.wide.field {\n  width: 87.5%!important;\n}\n.ui.form .fifteen.wide.field {\n  width: 93.75%!important;\n}\n.ui.form .sixteen.wide.field {\n  width: 100%!important;\n}\n@media only screen and (max-width:767px) {\n  .ui.form .fields>.eight.wide.field,\n  .ui.form .fields>.eleven.wide.field,\n  .ui.form .fields>.fifteen.wide.field,\n  .ui.form .fields>.five.wide.field,\n  .ui.form .fields>.four.wide.field,\n  .ui.form .fields>.fourteen.wide.field,\n  .ui.form .fields>.nine.wide.field,\n  .ui.form .fields>.seven.wide.field,\n  .ui.form .fields>.six.wide.field,\n  .ui.form .fields>.sixteen.wide.field,\n  .ui.form .fields>.ten.wide.field,\n  .ui.form .fields>.thirteen.wide.field,\n  .ui.form .fields>.three.wide.field,\n  .ui.form .fields>.twelve.wide.field,\n  .ui.form .fields>.two.wide.field,\n  .ui.form .five.fields>.field,\n  .ui.form .five.fields>.fields,\n  .ui.form .four.fields>.field,\n  .ui.form .four.fields>.fields,\n  .ui.form .three.fields>.field,\n  .ui.form .three.fields>.fields,\n  .ui.form .two.fields>.field,\n  .ui.form .two.fields>.fields {\n    width: 100%!important;\n  }\n\n  .ui.form .fields {\n    margin-bottom: 0;\n  }\n}\n.ui.form [class*=\"equal width\"].fields>.field,\n.ui[class*=\"equal width\"].form .fields>.field {\n  width: 100%;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n}\n.ui.form .inline.fields {\n  margin: 0 0 1em;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.ui.form .inline.fields .field {\n  margin: 0;\n  padding: 0 1em 0 0;\n}\n.ui.form .inline.field>label,\n.ui.form .inline.field>p,\n.ui.form .inline.fields .field>label,\n.ui.form .inline.fields .field>p,\n.ui.form .inline.fields>label {\n  display: inline-block;\n  width: auto;\n  margin-top: 0;\n  margin-bottom: 0;\n  vertical-align: baseline;\n  font-size: .92857143em;\n  font-weight: 700;\n  color: rgba(0,0,0,.87);\n  text-transform: none;\n}\n.ui.form .inline.fields>label {\n  margin: .035714em 1em 0 0;\n}\n.ui.form .inline.field>input,\n.ui.form .inline.field>select,\n.ui.form .inline.fields .field>input,\n.ui.form .inline.fields .field>select {\n  display: inline-block;\n  width: auto;\n  margin-top: 0;\n  margin-bottom: 0;\n  vertical-align: middle;\n  font-size: 1em;\n}\n.ui.form .inline.field>:first-child,\n.ui.form .inline.fields .field>:first-child {\n  margin: 0 .85714286em 0 0;\n}\n.ui.form .inline.field>:only-child,\n.ui.form .inline.fields .field>:only-child {\n  margin: 0;\n}\n.ui.form .inline.fields .wide.field {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.ui.form .inline.fields .wide.field>input,\n.ui.form .inline.fields .wide.field>select {\n  width: 100%;\n}\n.ui.mini.form {\n  font-size: .78571429rem;\n}\n.ui.tiny.form {\n  font-size: .85714286rem;\n}\n.ui.small.form {\n  font-size: .92857143rem;\n}\n.ui.form {\n  font-size: 1rem;\n}\n.ui.large.form {\n  font-size: 1.14285714rem;\n}\n.ui.big.form {\n  font-size: 1.28571429rem;\n}\n.ui.huge.form {\n  font-size: 1.42857143rem;\n}\n.ui.massive.form {\n  font-size: 1.71428571rem;\n}\n.ui.grid {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  padding: 0;\n  margin: -1rem;\n}\n.ui.relaxed.grid {\n  margin-left: -1.5rem;\n  margin-right: -1.5rem;\n}\n.ui[class*=\"very relaxed\"].grid {\n  margin-left: -2.5rem;\n  margin-right: -2.5rem;\n}\n.ui.grid+.grid {\n  margin-top: 1rem;\n}\n.ui.grid>.column:not(.row),\n.ui.grid>.row>.column {\n  position: relative;\n  display: inline-block;\n  width: 6.25%;\n  padding-left: 1rem;\n  padding-right: 1rem;\n  vertical-align: top;\n}\n.ui.grid>* {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n.ui.grid>.row {\n  position: relative;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n  -webkit-box-pack: inherit;\n  -webkit-justify-content: inherit;\n  -ms-flex-pack: inherit;\n  justify-content: inherit;\n  -webkit-box-align: stretch;\n  -webkit-align-items: stretch;\n  -ms-flex-align: stretch;\n  align-items: stretch;\n  width: 100%!important;\n  padding: 1rem 0;\n}\n.ui.grid>.column:not(.row) {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n.ui.grid>.row>.column {\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.ui.grid>.row>.column>img,\n.ui.grid>.row>img {\n  max-width: 100%;\n}\n.ui.grid>.ui.grid:first-child {\n  margin-top: 0;\n}\n.ui.grid>.ui.grid:last-child {\n  margin-bottom: 0;\n}\n.ui.aligned.grid .column>.segment:not(.compact):not(.attached),\n.ui.grid .aligned.row>.column>.segment:not(.compact):not(.attached) {\n  width: 100%;\n}\n.ui.grid .row+.ui.divider {\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  margin: 1rem;\n}\n.ui.grid .column+.ui.vertical.divider {\n  height: calc(50% - 1rem);\n}\n.ui.grid>.column:last-child>.horizontal.segment,\n.ui.grid>.row>.column:last-child>.horizontal.segment {\n  box-shadow: none;\n}\n@media only screen and (max-width:767px) {\n  .ui.page.grid {\n    width: auto;\n    padding-left: 0;\n    padding-right: 0;\n    margin-left: 0;\n    margin-right: 0;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.page.grid {\n    width: auto;\n    margin-left: 0;\n    margin-right: 0;\n    padding-left: 2em;\n    padding-right: 2em;\n  }\n}\n@media only screen and (min-width:992px) and (max-width:1199px) {\n  .ui.page.grid {\n    width: auto;\n    margin-left: 0;\n    margin-right: 0;\n    padding-left: 3%;\n    padding-right: 3%;\n  }\n}\n@media only screen and (min-width:1200px) and (max-width:1919px) {\n  .ui.page.grid {\n    width: auto;\n    margin-left: 0;\n    margin-right: 0;\n    padding-left: 15%;\n    padding-right: 15%;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.page.grid {\n    width: auto;\n    margin-left: 0;\n    margin-right: 0;\n    padding-left: 23%;\n    padding-right: 23%;\n  }\n}\n.ui.grid>.column:only-child,\n.ui.grid>.row>.column:only-child,\n.ui[class*=\"one column\"].grid>.column:not(.row),\n.ui[class*=\"one column\"].grid>.row>.column {\n  width: 100%;\n}\n.ui[class*=\"two column\"].grid>.column:not(.row),\n.ui[class*=\"two column\"].grid>.row>.column {\n  width: 50%;\n}\n.ui[class*=\"three column\"].grid>.column:not(.row),\n.ui[class*=\"three column\"].grid>.row>.column {\n  width: 33.33333333%;\n}\n.ui[class*=\"four column\"].grid>.column:not(.row),\n.ui[class*=\"four column\"].grid>.row>.column {\n  width: 25%;\n}\n.ui[class*=\"five column\"].grid>.column:not(.row),\n.ui[class*=\"five column\"].grid>.row>.column {\n  width: 20%;\n}\n.ui[class*=\"six column\"].grid>.column:not(.row),\n.ui[class*=\"six column\"].grid>.row>.column {\n  width: 16.66666667%;\n}\n.ui[class*=\"seven column\"].grid>.column:not(.row),\n.ui[class*=\"seven column\"].grid>.row>.column {\n  width: 14.28571429%;\n}\n.ui[class*=\"eight column\"].grid>.column:not(.row),\n.ui[class*=\"eight column\"].grid>.row>.column {\n  width: 12.5%;\n}\n.ui[class*=\"nine column\"].grid>.column:not(.row),\n.ui[class*=\"nine column\"].grid>.row>.column {\n  width: 11.11111111%;\n}\n.ui[class*=\"ten column\"].grid>.column:not(.row),\n.ui[class*=\"ten column\"].grid>.row>.column {\n  width: 10%;\n}\n.ui[class*=\"eleven column\"].grid>.column:not(.row),\n.ui[class*=\"eleven column\"].grid>.row>.column {\n  width: 9.09090909%;\n}\n.ui[class*=\"twelve column\"].grid>.column:not(.row),\n.ui[class*=\"twelve column\"].grid>.row>.column {\n  width: 8.33333333%;\n}\n.ui[class*=\"thirteen column\"].grid>.column:not(.row),\n.ui[class*=\"thirteen column\"].grid>.row>.column {\n  width: 7.69230769%;\n}\n.ui[class*=\"fourteen column\"].grid>.column:not(.row),\n.ui[class*=\"fourteen column\"].grid>.row>.column {\n  width: 7.14285714%;\n}\n.ui[class*=\"fifteen column\"].grid>.column:not(.row),\n.ui[class*=\"fifteen column\"].grid>.row>.column {\n  width: 6.66666667%;\n}\n.ui[class*=\"sixteen column\"].grid>.column:not(.row),\n.ui[class*=\"sixteen column\"].grid>.row>.column {\n  width: 6.25%;\n}\n.ui.grid>[class*=\"one column\"].row>.column {\n  width: 100%!important;\n}\n.ui.grid>[class*=\"two column\"].row>.column {\n  width: 50%!important;\n}\n.ui.grid>[class*=\"three column\"].row>.column {\n  width: 33.33333333%!important;\n}\n.ui.grid>[class*=\"four column\"].row>.column {\n  width: 25%!important;\n}\n.ui.grid>[class*=\"five column\"].row>.column {\n  width: 20%!important;\n}\n.ui.grid>[class*=\"six column\"].row>.column {\n  width: 16.66666667%!important;\n}\n.ui.grid>[class*=\"seven column\"].row>.column {\n  width: 14.28571429%!important;\n}\n.ui.grid>[class*=\"eight column\"].row>.column {\n  width: 12.5%!important;\n}\n.ui.grid>[class*=\"nine column\"].row>.column {\n  width: 11.11111111%!important;\n}\n.ui.grid>[class*=\"ten column\"].row>.column {\n  width: 10%!important;\n}\n.ui.grid>[class*=\"eleven column\"].row>.column {\n  width: 9.09090909%!important;\n}\n.ui.grid>[class*=\"twelve column\"].row>.column {\n  width: 8.33333333%!important;\n}\n.ui.grid>[class*=\"thirteen column\"].row>.column {\n  width: 7.69230769%!important;\n}\n.ui.grid>[class*=\"fourteen column\"].row>.column {\n  width: 7.14285714%!important;\n}\n.ui.grid>[class*=\"fifteen column\"].row>.column {\n  width: 6.66666667%!important;\n}\n.ui.grid>[class*=\"sixteen column\"].row>.column {\n  width: 6.25%!important;\n}\n.ui.celled.page.grid {\n  box-shadow: none;\n}\n.ui.column.grid>[class*=\"one wide\"].column,\n.ui.grid>.column.row>[class*=\"one wide\"].column,\n.ui.grid>.row>[class*=\"one wide\"].column,\n.ui.grid>[class*=\"one wide\"].column {\n  width: 6.25%!important;\n}\n.ui.column.grid>[class*=\"two wide\"].column,\n.ui.grid>.column.row>[class*=\"two wide\"].column,\n.ui.grid>.row>[class*=\"two wide\"].column,\n.ui.grid>[class*=\"two wide\"].column {\n  width: 12.5%!important;\n}\n.ui.column.grid>[class*=\"three wide\"].column,\n.ui.grid>.column.row>[class*=\"three wide\"].column,\n.ui.grid>.row>[class*=\"three wide\"].column,\n.ui.grid>[class*=\"three wide\"].column {\n  width: 18.75%!important;\n}\n.ui.column.grid>[class*=\"four wide\"].column,\n.ui.grid>.column.row>[class*=\"four wide\"].column,\n.ui.grid>.row>[class*=\"four wide\"].column,\n.ui.grid>[class*=\"four wide\"].column {\n  width: 25%!important;\n}\n.ui.column.grid>[class*=\"five wide\"].column,\n.ui.grid>.column.row>[class*=\"five wide\"].column,\n.ui.grid>.row>[class*=\"five wide\"].column,\n.ui.grid>[class*=\"five wide\"].column {\n  width: 31.25%!important;\n}\n.ui.column.grid>[class*=\"six wide\"].column,\n.ui.grid>.column.row>[class*=\"six wide\"].column,\n.ui.grid>.row>[class*=\"six wide\"].column,\n.ui.grid>[class*=\"six wide\"].column {\n  width: 37.5%!important;\n}\n.ui.column.grid>[class*=\"seven wide\"].column,\n.ui.grid>.column.row>[class*=\"seven wide\"].column,\n.ui.grid>.row>[class*=\"seven wide\"].column,\n.ui.grid>[class*=\"seven wide\"].column {\n  width: 43.75%!important;\n}\n.ui.column.grid>[class*=\"eight wide\"].column,\n.ui.grid>.column.row>[class*=\"eight wide\"].column,\n.ui.grid>.row>[class*=\"eight wide\"].column,\n.ui.grid>[class*=\"eight wide\"].column {\n  width: 50%!important;\n}\n.ui.column.grid>[class*=\"nine wide\"].column,\n.ui.grid>.column.row>[class*=\"nine wide\"].column,\n.ui.grid>.row>[class*=\"nine wide\"].column,\n.ui.grid>[class*=\"nine wide\"].column {\n  width: 56.25%!important;\n}\n.ui.column.grid>[class*=\"ten wide\"].column,\n.ui.grid>.column.row>[class*=\"ten wide\"].column,\n.ui.grid>.row>[class*=\"ten wide\"].column,\n.ui.grid>[class*=\"ten wide\"].column {\n  width: 62.5%!important;\n}\n.ui.column.grid>[class*=\"eleven wide\"].column,\n.ui.grid>.column.row>[class*=\"eleven wide\"].column,\n.ui.grid>.row>[class*=\"eleven wide\"].column,\n.ui.grid>[class*=\"eleven wide\"].column {\n  width: 68.75%!important;\n}\n.ui.column.grid>[class*=\"twelve wide\"].column,\n.ui.grid>.column.row>[class*=\"twelve wide\"].column,\n.ui.grid>.row>[class*=\"twelve wide\"].column,\n.ui.grid>[class*=\"twelve wide\"].column {\n  width: 75%!important;\n}\n.ui.column.grid>[class*=\"thirteen wide\"].column,\n.ui.grid>.column.row>[class*=\"thirteen wide\"].column,\n.ui.grid>.row>[class*=\"thirteen wide\"].column,\n.ui.grid>[class*=\"thirteen wide\"].column {\n  width: 81.25%!important;\n}\n.ui.column.grid>[class*=\"fourteen wide\"].column,\n.ui.grid>.column.row>[class*=\"fourteen wide\"].column,\n.ui.grid>.row>[class*=\"fourteen wide\"].column,\n.ui.grid>[class*=\"fourteen wide\"].column {\n  width: 87.5%!important;\n}\n.ui.column.grid>[class*=\"fifteen wide\"].column,\n.ui.grid>.column.row>[class*=\"fifteen wide\"].column,\n.ui.grid>.row>[class*=\"fifteen wide\"].column,\n.ui.grid>[class*=\"fifteen wide\"].column {\n  width: 93.75%!important;\n}\n.ui.column.grid>[class*=\"sixteen wide\"].column,\n.ui.grid>.column.row>[class*=\"sixteen wide\"].column,\n.ui.grid>.row>[class*=\"sixteen wide\"].column,\n.ui.grid>[class*=\"sixteen wide\"].column {\n  width: 100%!important;\n}\n@media only screen and (min-width:320px) and (max-width:767px) {\n  .ui.column.grid>[class*=\"one wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"one wide mobile\"].column,\n  .ui.grid>.row>[class*=\"one wide mobile\"].column,\n  .ui.grid>[class*=\"one wide mobile\"].column {\n    width: 6.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"two wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"two wide mobile\"].column,\n  .ui.grid>.row>[class*=\"two wide mobile\"].column,\n  .ui.grid>[class*=\"two wide mobile\"].column {\n    width: 12.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"three wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"three wide mobile\"].column,\n  .ui.grid>.row>[class*=\"three wide mobile\"].column,\n  .ui.grid>[class*=\"three wide mobile\"].column {\n    width: 18.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"four wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"four wide mobile\"].column,\n  .ui.grid>.row>[class*=\"four wide mobile\"].column,\n  .ui.grid>[class*=\"four wide mobile\"].column {\n    width: 25%!important;\n  }\n\n  .ui.column.grid>[class*=\"five wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"five wide mobile\"].column,\n  .ui.grid>.row>[class*=\"five wide mobile\"].column,\n  .ui.grid>[class*=\"five wide mobile\"].column {\n    width: 31.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"six wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"six wide mobile\"].column,\n  .ui.grid>.row>[class*=\"six wide mobile\"].column,\n  .ui.grid>[class*=\"six wide mobile\"].column {\n    width: 37.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"seven wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"seven wide mobile\"].column,\n  .ui.grid>.row>[class*=\"seven wide mobile\"].column,\n  .ui.grid>[class*=\"seven wide mobile\"].column {\n    width: 43.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"eight wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"eight wide mobile\"].column,\n  .ui.grid>.row>[class*=\"eight wide mobile\"].column,\n  .ui.grid>[class*=\"eight wide mobile\"].column {\n    width: 50%!important;\n  }\n\n  .ui.column.grid>[class*=\"nine wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"nine wide mobile\"].column,\n  .ui.grid>.row>[class*=\"nine wide mobile\"].column,\n  .ui.grid>[class*=\"nine wide mobile\"].column {\n    width: 56.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"ten wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"ten wide mobile\"].column,\n  .ui.grid>.row>[class*=\"ten wide mobile\"].column,\n  .ui.grid>[class*=\"ten wide mobile\"].column {\n    width: 62.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"eleven wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"eleven wide mobile\"].column,\n  .ui.grid>.row>[class*=\"eleven wide mobile\"].column,\n  .ui.grid>[class*=\"eleven wide mobile\"].column {\n    width: 68.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"twelve wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"twelve wide mobile\"].column,\n  .ui.grid>.row>[class*=\"twelve wide mobile\"].column,\n  .ui.grid>[class*=\"twelve wide mobile\"].column {\n    width: 75%!important;\n  }\n\n  .ui.column.grid>[class*=\"thirteen wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"thirteen wide mobile\"].column,\n  .ui.grid>.row>[class*=\"thirteen wide mobile\"].column,\n  .ui.grid>[class*=\"thirteen wide mobile\"].column {\n    width: 81.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"fourteen wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"fourteen wide mobile\"].column,\n  .ui.grid>.row>[class*=\"fourteen wide mobile\"].column,\n  .ui.grid>[class*=\"fourteen wide mobile\"].column {\n    width: 87.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"fifteen wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"fifteen wide mobile\"].column,\n  .ui.grid>.row>[class*=\"fifteen wide mobile\"].column,\n  .ui.grid>[class*=\"fifteen wide mobile\"].column {\n    width: 93.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"sixteen wide mobile\"].column,\n  .ui.grid>.column.row>[class*=\"sixteen wide mobile\"].column,\n  .ui.grid>.row>[class*=\"sixteen wide mobile\"].column,\n  .ui.grid>[class*=\"sixteen wide mobile\"].column {\n    width: 100%!important;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.column.grid>[class*=\"one wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"one wide tablet\"].column,\n  .ui.grid>.row>[class*=\"one wide tablet\"].column,\n  .ui.grid>[class*=\"one wide tablet\"].column {\n    width: 6.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"two wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"two wide tablet\"].column,\n  .ui.grid>.row>[class*=\"two wide tablet\"].column,\n  .ui.grid>[class*=\"two wide tablet\"].column {\n    width: 12.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"three wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"three wide tablet\"].column,\n  .ui.grid>.row>[class*=\"three wide tablet\"].column,\n  .ui.grid>[class*=\"three wide tablet\"].column {\n    width: 18.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"four wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"four wide tablet\"].column,\n  .ui.grid>.row>[class*=\"four wide tablet\"].column,\n  .ui.grid>[class*=\"four wide tablet\"].column {\n    width: 25%!important;\n  }\n\n  .ui.column.grid>[class*=\"five wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"five wide tablet\"].column,\n  .ui.grid>.row>[class*=\"five wide tablet\"].column,\n  .ui.grid>[class*=\"five wide tablet\"].column {\n    width: 31.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"six wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"six wide tablet\"].column,\n  .ui.grid>.row>[class*=\"six wide tablet\"].column,\n  .ui.grid>[class*=\"six wide tablet\"].column {\n    width: 37.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"seven wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"seven wide tablet\"].column,\n  .ui.grid>.row>[class*=\"seven wide tablet\"].column,\n  .ui.grid>[class*=\"seven wide tablet\"].column {\n    width: 43.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"eight wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"eight wide tablet\"].column,\n  .ui.grid>.row>[class*=\"eight wide tablet\"].column,\n  .ui.grid>[class*=\"eight wide tablet\"].column {\n    width: 50%!important;\n  }\n\n  .ui.column.grid>[class*=\"nine wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"nine wide tablet\"].column,\n  .ui.grid>.row>[class*=\"nine wide tablet\"].column,\n  .ui.grid>[class*=\"nine wide tablet\"].column {\n    width: 56.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"ten wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"ten wide tablet\"].column,\n  .ui.grid>.row>[class*=\"ten wide tablet\"].column,\n  .ui.grid>[class*=\"ten wide tablet\"].column {\n    width: 62.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"eleven wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"eleven wide tablet\"].column,\n  .ui.grid>.row>[class*=\"eleven wide tablet\"].column,\n  .ui.grid>[class*=\"eleven wide tablet\"].column {\n    width: 68.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"twelve wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"twelve wide tablet\"].column,\n  .ui.grid>.row>[class*=\"twelve wide tablet\"].column,\n  .ui.grid>[class*=\"twelve wide tablet\"].column {\n    width: 75%!important;\n  }\n\n  .ui.column.grid>[class*=\"thirteen wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"thirteen wide tablet\"].column,\n  .ui.grid>.row>[class*=\"thirteen wide tablet\"].column,\n  .ui.grid>[class*=\"thirteen wide tablet\"].column {\n    width: 81.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"fourteen wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"fourteen wide tablet\"].column,\n  .ui.grid>.row>[class*=\"fourteen wide tablet\"].column,\n  .ui.grid>[class*=\"fourteen wide tablet\"].column {\n    width: 87.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"fifteen wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"fifteen wide tablet\"].column,\n  .ui.grid>.row>[class*=\"fifteen wide tablet\"].column,\n  .ui.grid>[class*=\"fifteen wide tablet\"].column {\n    width: 93.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"sixteen wide tablet\"].column,\n  .ui.grid>.column.row>[class*=\"sixteen wide tablet\"].column,\n  .ui.grid>.row>[class*=\"sixteen wide tablet\"].column,\n  .ui.grid>[class*=\"sixteen wide tablet\"].column {\n    width: 100%!important;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.column.grid>[class*=\"one wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"one wide computer\"].column,\n  .ui.grid>.row>[class*=\"one wide computer\"].column,\n  .ui.grid>[class*=\"one wide computer\"].column {\n    width: 6.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"two wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"two wide computer\"].column,\n  .ui.grid>.row>[class*=\"two wide computer\"].column,\n  .ui.grid>[class*=\"two wide computer\"].column {\n    width: 12.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"three wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"three wide computer\"].column,\n  .ui.grid>.row>[class*=\"three wide computer\"].column,\n  .ui.grid>[class*=\"three wide computer\"].column {\n    width: 18.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"four wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"four wide computer\"].column,\n  .ui.grid>.row>[class*=\"four wide computer\"].column,\n  .ui.grid>[class*=\"four wide computer\"].column {\n    width: 25%!important;\n  }\n\n  .ui.column.grid>[class*=\"five wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"five wide computer\"].column,\n  .ui.grid>.row>[class*=\"five wide computer\"].column,\n  .ui.grid>[class*=\"five wide computer\"].column {\n    width: 31.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"six wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"six wide computer\"].column,\n  .ui.grid>.row>[class*=\"six wide computer\"].column,\n  .ui.grid>[class*=\"six wide computer\"].column {\n    width: 37.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"seven wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"seven wide computer\"].column,\n  .ui.grid>.row>[class*=\"seven wide computer\"].column,\n  .ui.grid>[class*=\"seven wide computer\"].column {\n    width: 43.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"eight wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"eight wide computer\"].column,\n  .ui.grid>.row>[class*=\"eight wide computer\"].column,\n  .ui.grid>[class*=\"eight wide computer\"].column {\n    width: 50%!important;\n  }\n\n  .ui.column.grid>[class*=\"nine wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"nine wide computer\"].column,\n  .ui.grid>.row>[class*=\"nine wide computer\"].column,\n  .ui.grid>[class*=\"nine wide computer\"].column {\n    width: 56.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"ten wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"ten wide computer\"].column,\n  .ui.grid>.row>[class*=\"ten wide computer\"].column,\n  .ui.grid>[class*=\"ten wide computer\"].column {\n    width: 62.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"eleven wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"eleven wide computer\"].column,\n  .ui.grid>.row>[class*=\"eleven wide computer\"].column,\n  .ui.grid>[class*=\"eleven wide computer\"].column {\n    width: 68.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"twelve wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"twelve wide computer\"].column,\n  .ui.grid>.row>[class*=\"twelve wide computer\"].column,\n  .ui.grid>[class*=\"twelve wide computer\"].column {\n    width: 75%!important;\n  }\n\n  .ui.column.grid>[class*=\"thirteen wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"thirteen wide computer\"].column,\n  .ui.grid>.row>[class*=\"thirteen wide computer\"].column,\n  .ui.grid>[class*=\"thirteen wide computer\"].column {\n    width: 81.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"fourteen wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"fourteen wide computer\"].column,\n  .ui.grid>.row>[class*=\"fourteen wide computer\"].column,\n  .ui.grid>[class*=\"fourteen wide computer\"].column {\n    width: 87.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"fifteen wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"fifteen wide computer\"].column,\n  .ui.grid>.row>[class*=\"fifteen wide computer\"].column,\n  .ui.grid>[class*=\"fifteen wide computer\"].column {\n    width: 93.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"sixteen wide computer\"].column,\n  .ui.grid>.column.row>[class*=\"sixteen wide computer\"].column,\n  .ui.grid>.row>[class*=\"sixteen wide computer\"].column,\n  .ui.grid>[class*=\"sixteen wide computer\"].column {\n    width: 100%!important;\n  }\n}\n@media only screen and (min-width:1200px) and (max-width:1919px) {\n  .ui.column.grid>[class*=\"one wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"one wide large screen\"].column,\n  .ui.grid>.row>[class*=\"one wide large screen\"].column,\n  .ui.grid>[class*=\"one wide large screen\"].column {\n    width: 6.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"two wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"two wide large screen\"].column,\n  .ui.grid>.row>[class*=\"two wide large screen\"].column,\n  .ui.grid>[class*=\"two wide large screen\"].column {\n    width: 12.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"three wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"three wide large screen\"].column,\n  .ui.grid>.row>[class*=\"three wide large screen\"].column,\n  .ui.grid>[class*=\"three wide large screen\"].column {\n    width: 18.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"four wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"four wide large screen\"].column,\n  .ui.grid>.row>[class*=\"four wide large screen\"].column,\n  .ui.grid>[class*=\"four wide large screen\"].column {\n    width: 25%!important;\n  }\n\n  .ui.column.grid>[class*=\"five wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"five wide large screen\"].column,\n  .ui.grid>.row>[class*=\"five wide large screen\"].column,\n  .ui.grid>[class*=\"five wide large screen\"].column {\n    width: 31.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"six wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"six wide large screen\"].column,\n  .ui.grid>.row>[class*=\"six wide large screen\"].column,\n  .ui.grid>[class*=\"six wide large screen\"].column {\n    width: 37.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"seven wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"seven wide large screen\"].column,\n  .ui.grid>.row>[class*=\"seven wide large screen\"].column,\n  .ui.grid>[class*=\"seven wide large screen\"].column {\n    width: 43.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"eight wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"eight wide large screen\"].column,\n  .ui.grid>.row>[class*=\"eight wide large screen\"].column,\n  .ui.grid>[class*=\"eight wide large screen\"].column {\n    width: 50%!important;\n  }\n\n  .ui.column.grid>[class*=\"nine wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"nine wide large screen\"].column,\n  .ui.grid>.row>[class*=\"nine wide large screen\"].column,\n  .ui.grid>[class*=\"nine wide large screen\"].column {\n    width: 56.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"ten wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"ten wide large screen\"].column,\n  .ui.grid>.row>[class*=\"ten wide large screen\"].column,\n  .ui.grid>[class*=\"ten wide large screen\"].column {\n    width: 62.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"eleven wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"eleven wide large screen\"].column,\n  .ui.grid>.row>[class*=\"eleven wide large screen\"].column,\n  .ui.grid>[class*=\"eleven wide large screen\"].column {\n    width: 68.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"twelve wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"twelve wide large screen\"].column,\n  .ui.grid>.row>[class*=\"twelve wide large screen\"].column,\n  .ui.grid>[class*=\"twelve wide large screen\"].column {\n    width: 75%!important;\n  }\n\n  .ui.column.grid>[class*=\"thirteen wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"thirteen wide large screen\"].column,\n  .ui.grid>.row>[class*=\"thirteen wide large screen\"].column,\n  .ui.grid>[class*=\"thirteen wide large screen\"].column {\n    width: 81.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"fourteen wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"fourteen wide large screen\"].column,\n  .ui.grid>.row>[class*=\"fourteen wide large screen\"].column,\n  .ui.grid>[class*=\"fourteen wide large screen\"].column {\n    width: 87.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"fifteen wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"fifteen wide large screen\"].column,\n  .ui.grid>.row>[class*=\"fifteen wide large screen\"].column,\n  .ui.grid>[class*=\"fifteen wide large screen\"].column {\n    width: 93.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"sixteen wide large screen\"].column,\n  .ui.grid>.column.row>[class*=\"sixteen wide large screen\"].column,\n  .ui.grid>.row>[class*=\"sixteen wide large screen\"].column,\n  .ui.grid>[class*=\"sixteen wide large screen\"].column {\n    width: 100%!important;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.column.grid>[class*=\"one wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"one wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"one wide widescreen\"].column,\n  .ui.grid>[class*=\"one wide widescreen\"].column {\n    width: 6.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"two wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"two wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"two wide widescreen\"].column,\n  .ui.grid>[class*=\"two wide widescreen\"].column {\n    width: 12.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"three wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"three wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"three wide widescreen\"].column,\n  .ui.grid>[class*=\"three wide widescreen\"].column {\n    width: 18.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"four wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"four wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"four wide widescreen\"].column,\n  .ui.grid>[class*=\"four wide widescreen\"].column {\n    width: 25%!important;\n  }\n\n  .ui.column.grid>[class*=\"five wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"five wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"five wide widescreen\"].column,\n  .ui.grid>[class*=\"five wide widescreen\"].column {\n    width: 31.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"six wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"six wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"six wide widescreen\"].column,\n  .ui.grid>[class*=\"six wide widescreen\"].column {\n    width: 37.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"seven wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"seven wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"seven wide widescreen\"].column,\n  .ui.grid>[class*=\"seven wide widescreen\"].column {\n    width: 43.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"eight wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"eight wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"eight wide widescreen\"].column,\n  .ui.grid>[class*=\"eight wide widescreen\"].column {\n    width: 50%!important;\n  }\n\n  .ui.column.grid>[class*=\"nine wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"nine wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"nine wide widescreen\"].column,\n  .ui.grid>[class*=\"nine wide widescreen\"].column {\n    width: 56.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"ten wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"ten wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"ten wide widescreen\"].column,\n  .ui.grid>[class*=\"ten wide widescreen\"].column {\n    width: 62.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"eleven wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"eleven wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"eleven wide widescreen\"].column,\n  .ui.grid>[class*=\"eleven wide widescreen\"].column {\n    width: 68.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"twelve wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"twelve wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"twelve wide widescreen\"].column,\n  .ui.grid>[class*=\"twelve wide widescreen\"].column {\n    width: 75%!important;\n  }\n\n  .ui.column.grid>[class*=\"thirteen wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"thirteen wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"thirteen wide widescreen\"].column,\n  .ui.grid>[class*=\"thirteen wide widescreen\"].column {\n    width: 81.25%!important;\n  }\n\n  .ui.column.grid>[class*=\"fourteen wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"fourteen wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"fourteen wide widescreen\"].column,\n  .ui.grid>[class*=\"fourteen wide widescreen\"].column {\n    width: 87.5%!important;\n  }\n\n  .ui.column.grid>[class*=\"fifteen wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"fifteen wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"fifteen wide widescreen\"].column,\n  .ui.grid>[class*=\"fifteen wide widescreen\"].column {\n    width: 93.75%!important;\n  }\n\n  .ui.column.grid>[class*=\"sixteen wide widescreen\"].column,\n  .ui.grid>.column.row>[class*=\"sixteen wide widescreen\"].column,\n  .ui.grid>.row>[class*=\"sixteen wide widescreen\"].column,\n  .ui.grid>[class*=\"sixteen wide widescreen\"].column {\n    width: 100%!important;\n  }\n}\n.ui.centered.grid,\n.ui.centered.grid>.row,\n.ui.grid>.centered.row {\n  text-align: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.ui.centered.grid>.column:not(.aligned):not(.justified):not(.row),\n.ui.centered.grid>.row>.column:not(.aligned):not(.justified),\n.ui.grid .centered.row>.column:not(.aligned):not(.justified) {\n  text-align: left;\n}\n.ui.grid>.centered.column,\n.ui.grid>.row>.centered.column {\n  display: block;\n  margin-left: auto;\n  margin-right: auto;\n}\n.ui.grid>.relaxed.row>.column,\n.ui.relaxed.grid>.column:not(.row),\n.ui.relaxed.grid>.row>.column {\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n}\n.ui.grid>[class*=\"very relaxed\"].row>.column,\n.ui[class*=\"very relaxed\"].grid>.column:not(.row),\n.ui[class*=\"very relaxed\"].grid>.row>.column {\n  padding-left: 2.5rem;\n  padding-right: 2.5rem;\n}\n.ui.grid .relaxed.row+.ui.divider,\n.ui.relaxed.grid .row+.ui.divider {\n  margin-left: 1.5rem;\n  margin-right: 1.5rem;\n}\n.ui.grid [class*=\"very relaxed\"].row+.ui.divider,\n.ui[class*=\"very relaxed\"].grid .row+.ui.divider {\n  margin-left: 2.5rem;\n  margin-right: 2.5rem;\n}\n.ui.padded.grid:not(.vertically):not(.horizontally) {\n  margin: 0!important;\n}\n[class*=\"horizontally padded\"].ui.grid {\n  margin-left: 0!important;\n  margin-right: 0!important;\n}\n[class*=\"vertically padded\"].ui.grid {\n  margin-top: 0!important;\n  margin-bottom: 0!important;\n}\n.ui.grid [class*=\"left floated\"].column {\n  margin-right: auto;\n}\n.ui.grid [class*=\"right floated\"].column {\n  margin-left: auto;\n}\n.ui.divided.grid:not([class*=\"vertically divided\"])>.column:not(.row),\n.ui.divided.grid:not([class*=\"vertically divided\"])>.row>.column {\n  box-shadow: -1px 0 0 0 rgba(34,36,38,.15);\n}\n.ui[class*=\"vertically divided\"].grid>.column:not(.row),\n.ui[class*=\"vertically divided\"].grid>.row>.column {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  padding-top: 0;\n  padding-bottom: 0;\n}\n.ui[class*=\"vertically divided\"].grid>.row {\n  margin-top: 0;\n  margin-bottom: 0;\n  position: relative;\n}\n.ui.divided.grid:not([class*=\"vertically divided\"])>.column:first-child,\n.ui.divided.grid:not([class*=\"vertically divided\"])>.row>.column:first-child {\n  box-shadow: none;\n}\n.ui[class*=\"vertically divided\"].grid>.row:first-child>.column {\n  margin-top: 0;\n}\n.ui.grid>.divided.row>.column {\n  box-shadow: -1px 0 0 0 rgba(34,36,38,.15);\n}\n.ui.grid>.divided.row>.column:first-child {\n  box-shadow: none;\n}\n.ui[class*=\"vertically divided\"].grid>.row:before {\n  position: absolute;\n  content: \"\";\n  top: 0;\n  left: 0;\n  width: calc(100% - 2rem);\n  height: 1px;\n  margin: 0 1rem;\n  box-shadow: 0 -1px 0 0 rgba(34,36,38,.15);\n}\n.ui.padded.divided.grid:not(.vertically):not(.horizontally),\n[class*=\"horizontally padded\"].ui.divided.grid {\n  width: 100%;\n}\n.ui[class*=\"vertically divided\"].grid>.row:first-child:before {\n  box-shadow: none;\n}\n.ui.inverted.divided.grid:not([class*=\"vertically divided\"])>.column:not(.row),\n.ui.inverted.divided.grid:not([class*=\"vertically divided\"])>.row>.column {\n  box-shadow: -1px 0 0 0 rgba(255,255,255,.1);\n}\n.ui.inverted.divided.grid:not([class*=\"vertically divided\"])>.column:not(.row):first-child,\n.ui.inverted.divided.grid:not([class*=\"vertically divided\"])>.row>.column:first-child {\n  box-shadow: none;\n}\n.ui.inverted[class*=\"vertically divided\"].grid>.row:before {\n  box-shadow: 0 -1px 0 0 rgba(255,255,255,.1);\n}\n.ui.relaxed[class*=\"vertically divided\"].grid>.row:before {\n  margin-left: 1.5rem;\n  margin-right: 1.5rem;\n  width: calc(100% - 3rem);\n}\n.ui[class*=\"very relaxed\"][class*=\"vertically divided\"].grid>.row:before {\n  margin-left: 5rem;\n  margin-right: 5rem;\n  width: calc(100% - 5rem);\n}\n.ui.celled.grid {\n  width: 100%;\n  margin: 1em 0;\n  box-shadow: 0 0 0 1px #D4D4D5;\n}\n.ui.celled.grid>.row {\n  width: 100%!important;\n  margin: 0;\n  padding: 0;\n  box-shadow: 0 -1px 0 0 #D4D4D5;\n}\n.ui.celled.grid>.column:not(.row),\n.ui.celled.grid>.row>.column {\n  box-shadow: -1px 0 0 0 #D4D4D5;\n  padding: 1em;\n}\n.ui.celled.grid>.column:first-child,\n.ui.celled.grid>.row>.column:first-child {\n  box-shadow: none;\n}\n.ui.relaxed.celled.grid>.column:not(.row),\n.ui.relaxed.celled.grid>.row>.column {\n  padding: 1.5em;\n}\n.ui[class*=\"very relaxed\"].celled.grid>.column:not(.row),\n.ui[class*=\"very relaxed\"].celled.grid>.row>.column {\n  padding: 2em;\n}\n.ui[class*=\"internally celled\"].grid {\n  box-shadow: none;\n  margin: 0;\n}\n.ui[class*=\"internally celled\"].grid>.row:first-child,\n.ui[class*=\"internally celled\"].grid>.row>.column:first-child {\n  box-shadow: none;\n}\n.ui.grid>.row>[class*=\"top aligned\"].column,\n.ui.grid>[class*=\"top aligned\"].column:not(.row),\n.ui.grid>[class*=\"top aligned\"].row>.column,\n.ui[class*=\"top aligned\"].grid>.column:not(.row),\n.ui[class*=\"top aligned\"].grid>.row>.column {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  vertical-align: top;\n  -webkit-align-self: flex-start!important;\n  -ms-flex-item-align: start!important;\n  align-self: flex-start!important;\n}\n.ui.grid>.row>[class*=\"middle aligned\"].column,\n.ui.grid>[class*=\"middle aligned\"].column:not(.row),\n.ui.grid>[class*=\"middle aligned\"].row>.column,\n.ui[class*=\"middle aligned\"].grid>.column:not(.row),\n.ui[class*=\"middle aligned\"].grid>.row>.column {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  vertical-align: middle;\n  -webkit-align-self: center!important;\n  -ms-flex-item-align: center!important;\n  align-self: center!important;\n}\n.ui.grid>.row>[class*=\"bottom aligned\"].column,\n.ui.grid>[class*=\"bottom aligned\"].column:not(.row),\n.ui.grid>[class*=\"bottom aligned\"].row>.column,\n.ui[class*=\"bottom aligned\"].grid>.column:not(.row),\n.ui[class*=\"bottom aligned\"].grid>.row>.column {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  vertical-align: bottom;\n  -webkit-align-self: flex-end!important;\n  -ms-flex-item-align: end!important;\n  align-self: flex-end!important;\n}\n.ui.grid>.row>.stretched.column,\n.ui.grid>.stretched.column:not(.row),\n.ui.grid>.stretched.row>.column,\n.ui.stretched.grid>.column,\n.ui.stretched.grid>.row>.column {\n  display: -webkit-inline-box!important;\n  display: -webkit-inline-flex!important;\n  display: -ms-inline-flexbox!important;\n  display: inline-flex!important;\n  -webkit-align-self: stretch;\n  -ms-flex-item-align: stretch;\n  align-self: stretch;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n}\n.ui.grid>.row>.stretched.column>*,\n.ui.grid>.stretched.column:not(.row)>*,\n.ui.grid>.stretched.row>.column>*,\n.ui.stretched.grid>.column>*,\n.ui.stretched.grid>.row>.column>* {\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n}\n.ui.grid>.row>[class*=\"left aligned\"].column.column,\n.ui.grid>[class*=\"left aligned\"].column.column,\n.ui.grid>[class*=\"left aligned\"].row>.column,\n.ui[class*=\"left aligned\"].grid>.column,\n.ui[class*=\"left aligned\"].grid>.row>.column {\n  text-align: left;\n  -webkit-align-self: inherit;\n  -ms-flex-item-align: inherit;\n  align-self: inherit;\n}\n.ui.grid>.row>[class*=\"center aligned\"].column.column,\n.ui.grid>[class*=\"center aligned\"].column.column,\n.ui.grid>[class*=\"center aligned\"].row>.column,\n.ui[class*=\"center aligned\"].grid>.column,\n.ui[class*=\"center aligned\"].grid>.row>.column {\n  text-align: center;\n  -webkit-align-self: inherit;\n  -ms-flex-item-align: inherit;\n  align-self: inherit;\n}\n.ui[class*=\"center aligned\"].grid {\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.ui.grid>.row>[class*=\"right aligned\"].column.column,\n.ui.grid>[class*=\"right aligned\"].column.column,\n.ui.grid>[class*=\"right aligned\"].row>.column,\n.ui[class*=\"right aligned\"].grid>.column,\n.ui[class*=\"right aligned\"].grid>.row>.column {\n  text-align: right;\n  -webkit-align-self: inherit;\n  -ms-flex-item-align: inherit;\n  align-self: inherit;\n}\n.ui.grid>.justified.column.column,\n.ui.grid>.justified.row>.column,\n.ui.grid>.row>.justified.column.column,\n.ui.justified.grid>.column,\n.ui.justified.grid>.row>.column {\n  text-align: justify;\n  -webkit-hyphens: auto;\n  -moz-hyphens: auto;\n  -ms-hyphens: auto;\n  hyphens: auto;\n}\n.ui.grid>.row>.black.column,\n.ui.grid>.row>.blue.column,\n.ui.grid>.row>.brown.column,\n.ui.grid>.row>.green.column,\n.ui.grid>.row>.grey.column,\n.ui.grid>.row>.olive.column,\n.ui.grid>.row>.orange.column,\n.ui.grid>.row>.pink.column,\n.ui.grid>.row>.purple.column,\n.ui.grid>.row>.red.column,\n.ui.grid>.row>.teal.column,\n.ui.grid>.row>.violet.column,\n.ui.grid>.row>.yellow.column {\n  margin-top: -1rem;\n  margin-bottom: -1rem;\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n.ui.grid>.red.column,\n.ui.grid>.red.row,\n.ui.grid>.row>.red.column {\n  background-color: #DB2828!important;\n  color: #FFF;\n}\n.ui.grid>.orange.column,\n.ui.grid>.orange.row,\n.ui.grid>.row>.orange.column {\n  background-color: #F2711C!important;\n  color: #FFF;\n}\n.ui.grid>.row>.yellow.column,\n.ui.grid>.yellow.column,\n.ui.grid>.yellow.row {\n  background-color: #FBBD08!important;\n  color: #FFF;\n}\n.ui.grid>.olive.column,\n.ui.grid>.olive.row,\n.ui.grid>.row>.olive.column {\n  background-color: #B5CC18!important;\n  color: #FFF;\n}\n.ui.grid>.green.column,\n.ui.grid>.green.row,\n.ui.grid>.row>.green.column {\n  background-color: #21BA45!important;\n  color: #FFF;\n}\n.ui.grid>.row>.teal.column,\n.ui.grid>.teal.column,\n.ui.grid>.teal.row {\n  background-color: #00B5AD!important;\n  color: #FFF;\n}\n.ui.grid>.blue.column,\n.ui.grid>.blue.row,\n.ui.grid>.row>.blue.column {\n  background-color: #2185D0!important;\n  color: #FFF;\n}\n.ui.grid>.row>.violet.column,\n.ui.grid>.violet.column,\n.ui.grid>.violet.row {\n  background-color: #6435C9!important;\n  color: #FFF;\n}\n.ui.grid>.purple.column,\n.ui.grid>.purple.row,\n.ui.grid>.row>.purple.column {\n  background-color: #A333C8!important;\n  color: #FFF;\n}\n.ui.grid>.pink.column,\n.ui.grid>.pink.row,\n.ui.grid>.row>.pink.column {\n  background-color: #E03997!important;\n  color: #FFF;\n}\n.ui.grid>.brown.column,\n.ui.grid>.brown.row,\n.ui.grid>.row>.brown.column {\n  background-color: #A5673F!important;\n  color: #FFF;\n}\n.ui.grid>.grey.column,\n.ui.grid>.grey.row,\n.ui.grid>.row>.grey.column {\n  background-color: #767676!important;\n  color: #FFF;\n}\n.ui.grid>.black.column,\n.ui.grid>.black.row,\n.ui.grid>.row>.black.column {\n  background-color: #1B1C1D!important;\n  color: #FFF;\n}\n.ui.grid>[class*=\"equal width\"].row>.column,\n.ui[class*=\"equal width\"].grid>.column:not(.row),\n.ui[class*=\"equal width\"].grid>.row>.column {\n  display: inline-block;\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n}\n.ui.grid>[class*=\"equal width\"].row>.wide.column,\n.ui[class*=\"equal width\"].grid>.row>.wide.column,\n.ui[class*=\"equal width\"].grid>.wide.column {\n  -webkit-box-flex: 0;\n  -webkit-flex-grow: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n}\n@media only screen and (max-width:767px) {\n  .ui.grid>[class*=\"mobile reversed\"].row,\n  .ui[class*=\"mobile reversed\"].grid,\n  .ui[class*=\"mobile reversed\"].grid>.row {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: row-reverse;\n    -ms-flex-direction: row-reverse;\n    flex-direction: row-reverse;\n  }\n\n  .ui.stackable[class*=\"mobile reversed\"],\n  .ui[class*=\"mobile vertically reversed\"].grid {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: column-reverse;\n    -ms-flex-direction: column-reverse;\n    flex-direction: column-reverse;\n  }\n\n  .ui[class*=\"mobile reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:first-child,\n  .ui[class*=\"mobile reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui[class*=\"mobile reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:last-child,\n  .ui[class*=\"mobile reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:last-child {\n    box-shadow: none;\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"mobile vertically reversed\"]>.row:first-child:before {\n    box-shadow: 0 -1px 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"mobile vertically reversed\"]>.row:last-child:before {\n    box-shadow: none;\n  }\n\n  .ui[class*=\"mobile reversed\"].celled.grid>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 #D4D4D5;\n  }\n\n  .ui[class*=\"mobile reversed\"].celled.grid>.row>.column:last-child {\n    box-shadow: none;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.grid>[class*=\"tablet reversed\"].row,\n  .ui[class*=\"tablet reversed\"].grid,\n  .ui[class*=\"tablet reversed\"].grid>.row {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: row-reverse;\n    -ms-flex-direction: row-reverse;\n    flex-direction: row-reverse;\n  }\n\n  .ui[class*=\"tablet vertically reversed\"].grid {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: column-reverse;\n    -ms-flex-direction: column-reverse;\n    flex-direction: column-reverse;\n  }\n\n  .ui[class*=\"tablet reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:first-child,\n  .ui[class*=\"tablet reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui[class*=\"tablet reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:last-child,\n  .ui[class*=\"tablet reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:last-child {\n    box-shadow: none;\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"tablet vertically reversed\"]>.row:first-child:before {\n    box-shadow: 0 -1px 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"tablet vertically reversed\"]>.row:last-child:before {\n    box-shadow: none;\n  }\n\n  .ui[class*=\"tablet reversed\"].celled.grid>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 #D4D4D5;\n  }\n\n  .ui[class*=\"tablet reversed\"].celled.grid>.row>.column:last-child {\n    box-shadow: none;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.grid>[class*=\"computer reversed\"].row,\n  .ui[class*=\"computer reversed\"].grid,\n  .ui[class*=\"computer reversed\"].grid>.row {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: row-reverse;\n    -ms-flex-direction: row-reverse;\n    flex-direction: row-reverse;\n  }\n\n  .ui[class*=\"computer vertically reversed\"].grid {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: reverse;\n    -webkit-flex-direction: column-reverse;\n    -ms-flex-direction: column-reverse;\n    flex-direction: column-reverse;\n  }\n\n  .ui[class*=\"computer reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:first-child,\n  .ui[class*=\"computer reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui[class*=\"computer reversed\"].divided.grid:not([class*=\"vertically divided\"])>.column:last-child,\n  .ui[class*=\"computer reversed\"].divided.grid:not([class*=\"vertically divided\"])>.row>.column:last-child {\n    box-shadow: none;\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"computer vertically reversed\"]>.row:first-child:before {\n    box-shadow: 0 -1px 0 0 rgba(34,36,38,.15);\n  }\n\n  .ui.grid[class*=\"vertically divided\"][class*=\"computer vertically reversed\"]>.row:last-child:before {\n    box-shadow: none;\n  }\n\n  .ui[class*=\"computer reversed\"].celled.grid>.row>.column:first-child {\n    box-shadow: -1px 0 0 0 #D4D4D5;\n  }\n\n  .ui[class*=\"computer reversed\"].celled.grid>.row>.column:last-child {\n    box-shadow: none;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.doubling.grid {\n    width: auto;\n  }\n\n  .ui.doubling.grid>.row,\n  .ui.grid>.doubling.row {\n    margin: 0!important;\n    padding: 0!important;\n  }\n\n  .ui.doubling.grid>.row>.column,\n  .ui.grid>.doubling.row>.column {\n    display: inline-block!important;\n    padding-top: 1rem!important;\n    padding-bottom: 1rem!important;\n    box-shadow: none!important;\n    margin: 0;\n  }\n\n  .ui.grid>[class*=\"two column\"].doubling.row.row>.column,\n  .ui[class*=\"two column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"two column\"].doubling.grid>.row>.column {\n    width: 100%!important;\n  }\n\n  .ui.grid>[class*=\"three column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"four column\"].doubling.row.row>.column,\n  .ui[class*=\"three column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"three column\"].doubling.grid>.row>.column,\n  .ui[class*=\"four column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"four column\"].doubling.grid>.row>.column {\n    width: 50%!important;\n  }\n\n  .ui.grid>[class*=\"five column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"six column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"seven column\"].doubling.row.row>.column,\n  .ui[class*=\"five column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"five column\"].doubling.grid>.row>.column,\n  .ui[class*=\"six column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"six column\"].doubling.grid>.row>.column,\n  .ui[class*=\"seven column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"seven column\"].doubling.grid>.row>.column {\n    width: 33.33333333%!important;\n  }\n\n  .ui.grid>[class*=\"eight column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"nine column\"].doubling.row.row>.column,\n  .ui[class*=\"eight column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"eight column\"].doubling.grid>.row>.column,\n  .ui[class*=\"nine column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"nine column\"].doubling.grid>.row>.column {\n    width: 25%!important;\n  }\n\n  .ui.grid>[class*=\"ten column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"eleven column\"].doubling.row.row>.column,\n  .ui[class*=\"ten column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"ten column\"].doubling.grid>.row>.column,\n  .ui[class*=\"eleven column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"eleven column\"].doubling.grid>.row>.column {\n    width: 20%!important;\n  }\n\n  .ui.grid>[class*=\"twelve column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"thirteen column\"].doubling.row.row>.column,\n  .ui[class*=\"twelve column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"twelve column\"].doubling.grid>.row>.column,\n  .ui[class*=\"thirteen column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"thirteen column\"].doubling.grid>.row>.column {\n    width: 16.66666667%!important;\n  }\n\n  .ui.grid>[class*=\"fourteen column\"].doubling.row.row>.column,\n  .ui.grid>[class*=\"fifteen column\"].doubling.row.row>.column,\n  .ui[class*=\"fourteen column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"fourteen column\"].doubling.grid>.row>.column,\n  .ui[class*=\"fifteen column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"fifteen column\"].doubling.grid>.row>.column {\n    width: 14.28571429%!important;\n  }\n\n  .ui.grid>[class*=\"sixteen column\"].doubling.row.row>.column,\n  .ui[class*=\"sixteen column\"].doubling.grid>.column:not(.row),\n  .ui[class*=\"sixteen column\"].doubling.grid>.row>.column {\n    width: 12.5%!important;\n  }\n\n  .ui.grid.grid.grid>.row>[class*=\"computer only\"].column:not(.tablet),\n  .ui.grid.grid.grid>.row>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"mobile only\"].column:not(.tablet),\n  .ui.grid.grid.grid>[class*=\"computer only\"].column:not(.tablet),\n  .ui.grid.grid.grid>[class*=\"computer only\"].row:not(.tablet),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].column:not(.tablet),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].row:not(.tablet),\n  .ui[class*=\"computer only\"].grid.grid.grid:not(.tablet),\n  .ui[class*=\"large screen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"widescreen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"mobile only\"].grid.grid.grid:not(.tablet) {\n    display: none!important;\n  }\n}\n@media only screen and (max-width:767px) {\n  .ui.doubling.grid>.row,\n  .ui.grid>.doubling.row {\n    margin: 0!important;\n    padding: 0!important;\n  }\n\n  .ui.doubling.grid>.row>.column,\n  .ui.grid>.doubling.row>.column {\n    padding-top: 1rem!important;\n    padding-bottom: 1rem!important;\n    margin: 0!important;\n    box-shadow: none!important;\n  }\n\n  .ui.grid>[class*=\"two column\"].doubling:not(.stackable).row.row>.column,\n  .ui[class*=\"two column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"two column\"].doubling:not(.stackable).grid>.row>.column {\n    width: 100%!important;\n  }\n\n  .ui.grid>[class*=\"three column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"four column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"five column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"six column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"seven column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"eight column\"].doubling:not(.stackable).row.row>.column,\n  .ui[class*=\"three column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"three column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"four column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"four column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"five column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"five column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"six column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"six column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"seven column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"seven column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"eight column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"eight column\"].doubling:not(.stackable).grid>.row>.column {\n    width: 50%!important;\n  }\n\n  .ui.grid>[class*=\"nine column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"ten column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"eleven column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"twelve column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"thirteen column\"].doubling:not(.stackable).row.row>.column,\n  .ui[class*=\"nine column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"nine column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"ten column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"ten column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"eleven column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"eleven column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"twelve column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"twelve column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"thirteen column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"thirteen column\"].doubling:not(.stackable).grid>.row>.column {\n    width: 33.33333333%!important;\n  }\n\n  .ui.grid>[class*=\"fourteen column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"fifteen column\"].doubling:not(.stackable).row.row>.column,\n  .ui.grid>[class*=\"sixteen column\"].doubling:not(.stackable).row.row>.column,\n  .ui[class*=\"fourteen column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"fourteen column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"fifteen column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"fifteen column\"].doubling:not(.stackable).grid>.row>.column,\n  .ui[class*=\"sixteen column\"].doubling:not(.stackable).grid>.column:not(.row),\n  .ui[class*=\"sixteen column\"].doubling:not(.stackable).grid>.row>.column {\n    width: 25%!important;\n  }\n\n  .ui.stackable.grid {\n    width: auto;\n    margin-left: 0!important;\n    margin-right: 0!important;\n  }\n\n  .ui.grid>.stackable.stackable.row>.column,\n  .ui.stackable.grid>.column.grid>.column,\n  .ui.stackable.grid>.column.row>.column,\n  .ui.stackable.grid>.column:not(.row),\n  .ui.stackable.grid>.row>.column,\n  .ui.stackable.grid>.row>.wide.column,\n  .ui.stackable.grid>.wide.column {\n    width: 100%!important;\n    margin: 0!important;\n    box-shadow: none!important;\n    padding: 1rem!important;\n  }\n\n  .ui.stackable.grid:not(.vertically)>.row {\n    margin: 0;\n    padding: 0;\n  }\n\n  .ui.container>.ui.stackable.grid>.column,\n  .ui.container>.ui.stackable.grid>.row>.column {\n    padding-left: 0!important;\n    padding-right: 0!important;\n  }\n\n  .ui.grid .ui.stackable.grid,\n  .ui.segment:not(.vertical) .ui.stackable.page.grid {\n    margin-left: -1rem!important;\n    margin-right: -1rem!important;\n  }\n\n  .ui.stackable.celled.grid>.column:not(.row):first-child,\n  .ui.stackable.celled.grid>.row:first-child>.column:first-child,\n  .ui.stackable.divided.grid>.column:not(.row):first-child,\n  .ui.stackable.divided.grid>.row:first-child>.column:first-child {\n    border-top: none!important;\n  }\n\n  .ui.inverted.stackable.celled.grid>.column:not(.row),\n  .ui.inverted.stackable.celled.grid>.row>.column,\n  .ui.inverted.stackable.divided.grid>.column:not(.row),\n  .ui.inverted.stackable.divided.grid>.row>.column {\n    border-top: 1px solid rgba(255,255,255,.1);\n  }\n\n  .ui.stackable.celled.grid>.column:not(.row),\n  .ui.stackable.celled.grid>.row>.column,\n  .ui.stackable.divided:not(.vertically).grid>.column:not(.row),\n  .ui.stackable.divided:not(.vertically).grid>.row>.column {\n    border-top: 1px solid rgba(34,36,38,.15);\n    box-shadow: none!important;\n    padding-top: 2rem!important;\n    padding-bottom: 2rem!important;\n  }\n\n  .ui.stackable.celled.grid>.row {\n    box-shadow: none!important;\n  }\n\n  .ui.stackable.divided:not(.vertically).grid>.column:not(.row),\n  .ui.stackable.divided:not(.vertically).grid>.row>.column {\n    padding-left: 0!important;\n    padding-right: 0!important;\n  }\n\n  .ui.grid.grid.grid>.row>[class*=\"tablet only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"computer only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"computer only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"computer only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].row:not(.mobile),\n  .ui[class*=\"tablet only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"computer only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"large screen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"widescreen only\"].grid.grid.grid:not(.mobile) {\n    display: none!important;\n  }\n}\n@media only screen and (min-width:992px) and (max-width:1199px) {\n  .ui.grid.grid.grid>.row>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>.row>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].row:not(.computer),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"large screen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].row:not(.computer),\n  .ui[class*=\"tablet only\"].grid.grid.grid:not(.computer),\n  .ui[class*=\"large screen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"widescreen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"mobile only\"].grid.grid.grid:not(.computer) {\n    display: none!important;\n  }\n}\n@media only screen and (min-width:1200px) and (max-width:1919px) {\n  .ui.grid.grid.grid>.row>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>.row>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>.row>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].row:not(.computer),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].column:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"widescreen only\"].row:not(.mobile),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].row:not(.computer),\n  .ui[class*=\"tablet only\"].grid.grid.grid:not(.computer),\n  .ui[class*=\"widescreen only\"].grid.grid.grid:not(.mobile),\n  .ui[class*=\"mobile only\"].grid.grid.grid:not(.computer) {\n    display: none!important;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.grid.grid.grid>.row>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>.row>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"tablet only\"].row:not(.computer),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].column:not(.computer),\n  .ui.grid.grid.grid>[class*=\"mobile only\"].row:not(.computer),\n  .ui[class*=\"tablet only\"].grid.grid.grid:not(.computer),\n  .ui[class*=\"mobile only\"].grid.grid.grid:not(.computer) {\n    display: none!important;\n  }\n}\n.ui.menu {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 1rem 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  background: #FFF;\n  font-weight: 400;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n  min-height: 2.85714286em;\n}\n.ui.menu:after {\n  content: '';\n  display: block;\n  height: 0;\n  clear: both;\n  visibility: hidden;\n}\n.ui.menu:first-child {\n  margin-top: 0;\n}\n.ui.menu:last-child {\n  margin-bottom: 0;\n}\n.ui.menu .menu {\n  margin: 0;\n}\n.ui.menu:not(.vertical)>.menu {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.menu:not(.vertical) .item {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.ui.menu .item {\n  position: relative;\n  vertical-align: middle;\n  line-height: 1;\n  text-decoration: none;\n  -webkit-tap-highlight-color: transparent;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  background: 0 0;\n  padding: .92857143em 1.14285714em;\n  text-transform: none;\n  color: rgba(0,0,0,.87);\n  font-weight: 400;\n  -webkit-transition: background .1s ease,box-shadow .1s ease,color .1s ease;\n  transition: background .1s ease,box-shadow .1s ease,color .1s ease;\n}\n.ui.menu>.item:first-child {\n  border-radius: .28571429rem 0 0 .28571429rem;\n}\n.ui.menu .item:before {\n  position: absolute;\n  content: '';\n  top: 0;\n  right: 0;\n  height: 100%;\n  width: 1px;\n  background: rgba(34,36,38,.1);\n}\n.ui.menu .item>a:not(.ui),\n.ui.menu .item>p:only-child,\n.ui.menu .text.item>* {\n  -webkit-user-select: text;\n  -moz-user-select: text;\n  -ms-user-select: text;\n  user-select: text;\n  line-height: 1.3;\n}\n.ui.menu .item>p:first-child {\n  margin-top: 0;\n}\n.ui.menu .item>p:last-child {\n  margin-bottom: 0;\n}\n.ui.menu .item>i.icon {\n  opacity: .9;\n  float: none;\n  margin: 0 .35714286em 0 0;\n}\n.ui.menu:not(.vertical) .item>.button {\n  position: relative;\n  top: 0;\n  margin: -.5em 0;\n  padding-bottom: .78571429em;\n  padding-top: .78571429em;\n  font-size: 1em;\n}\n.ui.menu>.container,\n.ui.menu>.grid {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: inherit;\n  -webkit-align-items: inherit;\n  -ms-flex-align: inherit;\n  align-items: inherit;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: inherit;\n  -ms-flex-direction: inherit;\n  flex-direction: inherit;\n}\n.ui.menu .item>.input {\n  width: 100%;\n}\n.ui.menu:not(.vertical) .item>.input {\n  position: relative;\n  top: 0;\n  margin: -.5em 0;\n}\n.ui.menu .item>.input input {\n  font-size: 1em;\n  padding-top: .57142857em;\n  padding-bottom: .57142857em;\n}\n.ui.menu .header.item,\n.ui.vertical.menu .header.item {\n  margin: 0;\n  background: 0 0;\n  text-transform: normal;\n  font-weight: 700;\n}\n.ui.vertical.menu .item>.header:not(.ui) {\n  margin: 0 0 .5em;\n  font-size: 1em;\n  font-weight: 700;\n}\n.ui.menu .item>i.dropdown.icon {\n  padding: 0;\n  float: right;\n  margin: 0 0 0 1em;\n}\n.ui.menu .dropdown.item .menu {\n  left: 0;\n  min-width: calc(100% - 1px);\n  border-radius: 0 0 .28571429rem .28571429rem;\n  background: #FFF;\n  margin: 0;\n  box-shadow: 0 1px 3px 0 rgba(0,0,0,.08);\n  -webkit-box-orient: vertical!important;\n  -webkit-box-direction: normal!important;\n  -webkit-flex-direction: column!important;\n  -ms-flex-direction: column!important;\n  flex-direction: column!important;\n}\n.ui.menu .ui.dropdown .menu>.item {\n  margin: 0;\n  text-align: left;\n  font-size: 1em!important;\n  padding: .78571429em 1.14285714em!important;\n  background: 0 0!important;\n  color: rgba(0,0,0,.87)!important;\n  text-transform: none!important;\n  font-weight: 400!important;\n  box-shadow: none!important;\n  -webkit-transition: none!important;\n  transition: none!important;\n}\n.ui.menu .ui.dropdown .menu>.item:hover,\n.ui.menu .ui.dropdown .menu>.selected.item {\n  background: rgba(0,0,0,.05)!important;\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.menu .ui.dropdown .menu>.active.item {\n  background: rgba(0,0,0,.03)!important;\n  font-weight: 700!important;\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.menu .ui.dropdown.item .menu .item:not(.filtered) {\n  display: block;\n}\n.ui.menu .ui.dropdown .menu>.item .icon:not(.dropdown) {\n  display: inline-block;\n  font-size: 1em!important;\n  float: none;\n  margin: 0 .75em 0 0;\n}\n.ui.secondary.menu .dropdown.item>.menu,\n.ui.text.menu .dropdown.item>.menu {\n  border-radius: .28571429rem;\n  margin-top: .35714286em;\n}\n.ui.menu .pointing.dropdown.item .menu {\n  margin-top: .75em;\n}\n.ui.inverted.menu .search.dropdown.item>.search,\n.ui.inverted.menu .search.dropdown.item>.text {\n  color: rgba(255,255,255,.9);\n}\n.ui.vertical.menu .dropdown.item>.icon {\n  float: right;\n  content: \"\\f0da\";\n  margin-left: 1em;\n}\n.ui.vertical.menu .dropdown.item .menu {\n  left: 100%;\n  min-width: 0;\n  margin: 0;\n  box-shadow: 0 1px 3px 0 rgba(0,0,0,.08);\n  border-radius: 0 .28571429rem .28571429rem;\n}\n.ui.vertical.menu .dropdown.item.upward .menu {\n  bottom: 0;\n}\n.ui.vertical.menu .dropdown.item:not(.upward) .menu {\n  top: 0;\n}\n.ui.vertical.menu .active.dropdown.item {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.ui.vertical.menu .dropdown.active.item {\n  box-shadow: none;\n}\n.ui.item.menu .dropdown .menu .item {\n  width: 100%;\n}\n.ui.menu .item>.label {\n  background: #999;\n  color: #FFF;\n  margin-left: 1em;\n  padding: .3em .78571429em;\n}\n.ui.vertical.menu .item>.label {\n  background: #999;\n  color: #FFF;\n  margin-top: -.15em;\n  margin-bottom: -.15em;\n  padding: .3em .78571429em;\n  float: right;\n  text-align: center;\n}\n.ui.menu .item>.floating.label {\n  padding: .3em .78571429em;\n}\n.ui.menu .item>img:not(.ui) {\n  display: inline-block;\n  vertical-align: middle;\n  margin: -.3em 0;\n  width: 2.5em;\n}\n.ui.vertical.menu .item>img:not(.ui):only-child {\n  display: block;\n  max-width: 100%;\n  width: auto;\n}\n.ui.vertical.sidebar.menu>.item:first-child:before {\n  display: block!important;\n}\n.ui.vertical.sidebar.menu>.item::before {\n  top: auto;\n  bottom: 0;\n}\n@media only screen and (max-width:767px) {\n  .ui.menu>.ui.container {\n    width: 100%!important;\n    margin-left: 0!important;\n    margin-right: 0!important;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.menu:not(.secondary):not(.text):not(.tabular):not(.borderless)>.container>.item:not(.right):not(.borderless):first-child {\n    border-left: 1px solid rgba(34,36,38,.1);\n  }\n}\n.ui.link.menu .item:hover,\n.ui.menu .dropdown.item:hover,\n.ui.menu .link.item:hover,\n.ui.menu a.item:hover {\n  cursor: pointer;\n  background: rgba(0,0,0,.03);\n  color: rgba(0,0,0,.95);\n}\n.ui.link.menu .item:active,\n.ui.menu .link.item:active,\n.ui.menu a.item:active {\n  background: rgba(0,0,0,.03);\n  color: rgba(0,0,0,.95);\n}\n.ui.menu .active.item {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n  font-weight: 400;\n  box-shadow: none;\n}\n.ui.menu .active.item>i.icon {\n  opacity: 1;\n}\n.ui.menu .active.item:hover,\n.ui.vertical.menu .active.item:hover {\n  background-color: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.menu .item.disabled,\n.ui.menu .item.disabled:hover {\n  cursor: default;\n  background-color: transparent!important;\n  color: rgba(40,40,40,.3);\n}\n.ui.menu:not(.vertical) .left.item,\n.ui.menu:not(.vertical) .left.menu {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin-right: auto!important;\n}\n.ui.menu:not(.vertical) .right.item,\n.ui.menu:not(.vertical) .right.menu {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin-left: auto!important;\n}\n.ui.menu .right.item::before,\n.ui.menu .right.menu>.item::before {\n  right: auto;\n  left: 0;\n}\n.ui.vertical.menu {\n  display: block;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  background: #FFF;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15);\n}\n.ui.vertical.menu .item {\n  display: block;\n  background: 0 0;\n  border-top: none;\n  border-right: none;\n}\n.ui.vertical.menu>.item:first-child {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.vertical.menu>.item:last-child {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.vertical.menu .item>i.icon {\n  width: 1.18em;\n  float: right;\n  margin: 0 0 0 .5em;\n}\n.ui.vertical.menu .item>.label+i.icon {\n  float: none;\n  margin: 0 .5em 0 0;\n}\n.ui.vertical.menu .item:before {\n  position: absolute;\n  content: '';\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 1px;\n  background: rgba(34,36,38,.1);\n}\n.ui.vertical.menu .item:first-child:before {\n  display: none!important;\n}\n.ui.vertical.menu .item>.menu {\n  margin: .5em -1.14285714em 0;\n}\n.ui.vertical.menu .menu .item {\n  background: 0 0;\n  padding: .5em 1.33333333em;\n  font-size: .85714286em;\n  color: rgba(0,0,0,.5);\n}\n.ui.vertical.menu .item .menu .link.item:hover,\n.ui.vertical.menu .item .menu a.item:hover {\n  color: rgba(0,0,0,.85);\n}\n.ui.vertical.menu .menu .item:before {\n  display: none;\n}\n.ui.vertical.menu .active.item {\n  background: rgba(0,0,0,.05);\n  border-radius: 0;\n  box-shadow: none;\n}\n.ui.vertical.menu>.active.item:first-child {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.vertical.menu>.active.item:last-child {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.vertical.menu>.active.item:only-child {\n  border-radius: .28571429rem;\n}\n.ui.vertical.menu .active.item .menu .active.item {\n  border-left: none;\n}\n.ui.vertical.menu .item .menu .active.item {\n  background-color: transparent;\n  font-weight: 700;\n  color: rgba(0,0,0,.95);\n}\n.ui.tabular.menu {\n  border-radius: 0;\n  box-shadow: none!important;\n  border: none;\n  background: none;\n  border-bottom: 1px solid #D4D4D5;\n}\n.ui.tabular.fluid.menu {\n  width: calc(100% + 2px)!important;\n}\n.ui.tabular.menu .item {\n  background: 0 0;\n  border-bottom: none;\n  border-left: 1px solid transparent;\n  border-right: 1px solid transparent;\n  border-top: 2px solid transparent;\n  padding: .92857143em 1.42857143em;\n  color: rgba(0,0,0,.87);\n}\n.ui.tabular.menu .item:before {\n  display: none;\n}\n.ui.tabular.menu .item:hover {\n  background-color: transparent;\n  color: rgba(0,0,0,.8);\n}\n.ui.tabular.menu .active.item {\n  background: #FFF;\n  color: rgba(0,0,0,.95);\n  border-top-width: 1px;\n  border-color: #D4D4D5;\n  font-weight: 700;\n  margin-bottom: -1px;\n  box-shadow: none;\n  border-radius: .28571429rem .28571429rem 0 0!important;\n}\n.ui.tabular.menu+.attached:not(.top).segment,\n.ui.tabular.menu+.attached:not(.top).segment+.attached:not(.top).segment {\n  border-top: none;\n  margin-left: 0;\n  margin-top: 0;\n  margin-right: 0;\n  width: 100%;\n}\n.top.attached.segment+.ui.bottom.tabular.menu {\n  position: relative;\n  width: calc(100% + 2px);\n  left: -1px;\n}\n.ui.bottom.tabular.menu {\n  background: none;\n  border-radius: 0;\n  box-shadow: none!important;\n  border-bottom: none;\n  border-top: 1px solid #D4D4D5;\n}\n.ui.bottom.tabular.menu .item {\n  background: 0 0;\n  border-left: 1px solid transparent;\n  border-right: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  border-top: none;\n}\n.ui.bottom.tabular.menu .active.item {\n  background: #FFF;\n  color: rgba(0,0,0,.95);\n  border-color: #D4D4D5;\n  margin: -1px 0 0;\n  border-radius: 0 0 .28571429rem .28571429rem!important;\n}\n.ui.vertical.tabular.menu {\n  background: none;\n  border-radius: 0;\n  box-shadow: none!important;\n  border-bottom: none;\n  border-right: 1px solid #D4D4D5;\n}\n.ui.vertical.tabular.menu .item {\n  background: 0 0;\n  border-left: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  border-top: 1px solid transparent;\n  border-right: none;\n}\n.ui.vertical.tabular.menu .active.item {\n  background: #FFF;\n  color: rgba(0,0,0,.95);\n  border-color: #D4D4D5;\n  margin: 0 -1px 0 0;\n  border-radius: .28571429rem 0 0 .28571429rem!important;\n}\n.ui.vertical.right.tabular.menu {\n  background: none;\n  border-radius: 0;\n  box-shadow: none!important;\n  border-bottom: none;\n  border-right: none;\n  border-left: 1px solid #D4D4D5;\n}\n.ui.vertical.right.tabular.menu .item {\n  background: 0 0;\n  border-right: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  border-top: 1px solid transparent;\n  border-left: none;\n}\n.ui.vertical.right.tabular.menu .active.item {\n  background: #FFF;\n  color: rgba(0,0,0,.95);\n  border-color: #D4D4D5;\n  margin: 0 0 0 -1px;\n  border-radius: 0 .28571429rem .28571429rem 0!important;\n}\n.ui.tabular.menu .active.dropdown.item {\n  margin-bottom: 0;\n  border-left: 1px solid transparent;\n  border-right: 1px solid transparent;\n  border-top: 2px solid transparent;\n  border-bottom: none;\n}\n.ui.pagination.menu {\n  margin: 0;\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  vertical-align: middle;\n}\n.ui.pagination.menu .item:last-child {\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui.pagination.menu .item:last-child:before {\n  display: none;\n}\n.ui.pagination.menu .item {\n  min-width: 3em;\n  text-align: center;\n}\n.ui.pagination.menu .icon.item i.icon {\n  vertical-align: top;\n}\n.ui.pagination.menu .active.item {\n  border-top: none;\n  padding-top: .92857143em;\n  background-color: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n  box-shadow: none;\n}\n.ui.secondary.menu {\n  background: 0 0;\n  margin-left: -.35714286em;\n  margin-right: -.35714286em;\n  border-radius: 0;\n  border: none;\n  box-shadow: none;\n}\n.ui.secondary.menu .item {\n  -webkit-align-self: center;\n  -ms-flex-item-align: center;\n  align-self: center;\n  box-shadow: none;\n  border: none;\n  padding: .78571429em .92857143em;\n  margin: 0 .35714286em;\n  background: 0 0;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n  border-radius: .28571429rem;\n}\n.ui.secondary.menu .item:before {\n  display: none!important;\n}\n.ui.secondary.menu .header.item {\n  border-radius: 0;\n  border-right: none;\n  background: none;\n}\n.ui.secondary.menu .item>img:not(.ui) {\n  margin: 0;\n}\n.ui.secondary.menu .dropdown.item:hover,\n.ui.secondary.menu .link.item:hover,\n.ui.secondary.menu a.item:hover {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.secondary.menu .active.item {\n  box-shadow: none;\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n  border-radius: .28571429rem;\n}\n.ui.secondary.menu .active.item:hover {\n  box-shadow: none;\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.secondary.inverted.menu .link.item,\n.ui.secondary.inverted.menu a.item {\n  color: rgba(255,255,255,.7)!important;\n}\n.ui.secondary.inverted.menu .dropdown.item:hover,\n.ui.secondary.inverted.menu .link.item:hover,\n.ui.secondary.inverted.menu a.item:hover {\n  background: rgba(255,255,255,.08);\n  color: #fff!important;\n}\n.ui.secondary.inverted.menu .active.item {\n  background: rgba(255,255,255,.15);\n  color: #fff!important;\n}\n.ui.secondary.item.menu {\n  margin-left: 0;\n  margin-right: 0;\n}\n.ui.secondary.item.menu .item:last-child {\n  margin-right: 0;\n}\n.ui.secondary.attached.menu {\n  box-shadow: none;\n}\n.ui.vertical.secondary.menu .item:not(.dropdown)>.menu {\n  margin: 0 -.92857143em;\n}\n.ui.vertical.secondary.menu .item:not(.dropdown)>.menu>.item {\n  margin: 0;\n  padding: .5em 1.33333333em;\n}\n.ui.secondary.vertical.menu>.item {\n  border: none;\n  margin: 0 0 .35714286em;\n  border-radius: .28571429rem!important;\n}\n.ui.secondary.vertical.menu>.header.item {\n  border-radius: 0;\n}\n.ui.secondary.inverted.menu,\n.ui.vertical.secondary.menu .item>.menu .item {\n  background-color: transparent;\n}\n.ui.secondary.pointing.menu {\n  margin-left: 0;\n  margin-right: 0;\n  border-bottom: 2px solid rgba(34,36,38,.15);\n}\n.ui.secondary.pointing.menu .item {\n  border-bottom-color: transparent;\n  border-bottom-style: solid;\n  border-radius: 0;\n  -webkit-align-self: flex-end;\n  -ms-flex-item-align: end;\n  align-self: flex-end;\n  margin: 0 0 -2px;\n  padding: .85714286em 1.14285714em;\n  border-bottom-width: 2px;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.secondary.pointing.menu .header.item {\n  color: rgba(0,0,0,.85)!important;\n}\n.ui.secondary.pointing.menu .text.item {\n  box-shadow: none!important;\n}\n.ui.secondary.pointing.menu .item:after {\n  display: none;\n}\n.ui.secondary.pointing.menu .dropdown.item:hover,\n.ui.secondary.pointing.menu .link.item:hover,\n.ui.secondary.pointing.menu a.item:hover {\n  background-color: transparent;\n  color: rgba(0,0,0,.87);\n}\n.ui.secondary.pointing.menu .dropdown.item:active,\n.ui.secondary.pointing.menu .link.item:active,\n.ui.secondary.pointing.menu a.item:active {\n  background-color: transparent;\n  border-color: rgba(34,36,38,.15);\n}\n.ui.secondary.pointing.menu .active.item {\n  background-color: transparent;\n  box-shadow: none;\n  border-color: #1B1C1D;\n  font-weight: 700;\n  color: rgba(0,0,0,.95);\n}\n.ui.secondary.pointing.menu .active.item:hover {\n  border-color: #1B1C1D;\n  color: rgba(0,0,0,.95);\n}\n.ui.secondary.pointing.menu .active.dropdown.item {\n  border-color: transparent;\n}\n.ui.secondary.vertical.pointing.menu {\n  border-bottom-width: 0;\n  border-right-width: 2px;\n  border-right-style: solid;\n  border-right-color: rgba(34,36,38,.15);\n}\n.ui.secondary.vertical.pointing.menu .item {\n  border-bottom: none;\n  border-right-style: solid;\n  border-right-color: transparent;\n  border-radius: 0!important;\n  margin: 0 -2px 0 0;\n  border-right-width: 2px;\n}\n.ui.secondary.vertical.pointing.menu .active.item {\n  border-color: #1B1C1D;\n}\n.ui.secondary.inverted.pointing.menu {\n  border-width: 2px;\n  border-color: rgba(34,36,38,.15);\n}\n.ui.secondary.inverted.pointing.menu .item {\n  color: rgba(255,255,255,.9);\n}\n.ui.secondary.inverted.pointing.menu .header.item {\n  color: #FFF!important;\n}\n.ui.secondary.inverted.pointing.menu .link.item:hover,\n.ui.secondary.inverted.pointing.menu a.item:hover {\n  color: rgba(0,0,0,.95);\n}\n.ui.secondary.inverted.pointing.menu .active.item {\n  border-color: #FFF;\n  color: #fff;\n}\n.ui.text.menu {\n  background: none;\n  border-radius: 0;\n  box-shadow: none;\n  border: none;\n  margin: 1em -.5em;\n}\n.ui.text.menu .item {\n  border-radius: 0;\n  box-shadow: none;\n  -webkit-align-self: center;\n  -ms-flex-item-align: center;\n  align-self: center;\n  margin: 0;\n  padding: .35714286em .5em;\n  font-weight: 400;\n  color: rgba(0,0,0,.6);\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\n.ui.text.menu .item:before,\n.ui.text.menu .menu .item:before {\n  display: none!important;\n}\n.ui.text.menu .header.item {\n  background-color: transparent;\n  opacity: 1;\n  color: rgba(0,0,0,.85);\n  font-size: .92857143em;\n  text-transform: uppercase;\n  font-weight: 700;\n}\n.ui.text.item.menu .item,\n.ui.text.menu .item>img:not(.ui) {\n  margin: 0;\n}\n.ui.vertical.text.menu {\n  margin: 1em 0;\n}\n.ui.vertical.text.menu:first-child {\n  margin-top: 0;\n}\n.ui.vertical.text.menu:last-child {\n  margin-bottom: 0;\n}\n.ui.vertical.text.menu .item {\n  margin: .57142857em 0;\n  padding-left: 0;\n  padding-right: 0;\n}\n.ui.vertical.text.menu .item>i.icon {\n  float: none;\n  margin: 0 .35714286em 0 0;\n}\n.ui.vertical.text.menu .header.item {\n  margin: .57142857em 0 .71428571em;\n}\n.ui.vertical.text.menu .item:not(.dropdown)>.menu {\n  margin: 0;\n}\n.ui.vertical.text.menu .item:not(.dropdown)>.menu>.item {\n  margin: 0;\n  padding: .5em 0;\n}\n.ui.text.menu .item:hover {\n  opacity: 1;\n  background-color: transparent;\n}\n.ui.text.menu .active.item {\n  background-color: transparent;\n  border: none;\n  box-shadow: none;\n  font-weight: 400;\n  color: rgba(0,0,0,.95);\n}\n.ui.text.menu .active.item:hover {\n  background-color: transparent;\n}\n.ui.text.attached.menu,\n.ui.text.pointing.menu .active.item:after {\n  box-shadow: none;\n}\n.ui.inverted.text.menu,\n.ui.inverted.text.menu .active.item,\n.ui.inverted.text.menu .item,\n.ui.inverted.text.menu .item:hover {\n  background-color: transparent!important;\n}\n.ui.fluid.text.menu {\n  margin-left: 0;\n  margin-right: 0;\n}\n.ui.vertical.icon.menu {\n  display: inline-block;\n  width: auto;\n}\n.ui.icon.menu .item {\n  height: auto;\n  text-align: center;\n  color: #1B1C1D;\n}\n.ui.icon.menu .item>.icon:not(.dropdown) {\n  margin: 0;\n  opacity: 1;\n}\n.ui.icon.menu .icon:before {\n  opacity: 1;\n}\n.ui.menu .icon.item>.icon {\n  width: auto;\n  margin: 0 auto;\n}\n.ui.vertical.icon.menu .item>.icon:not(.dropdown) {\n  display: block;\n  opacity: 1;\n  margin: 0 auto;\n  float: none;\n}\n.ui.inverted.icon.menu .item {\n  color: #FFF;\n}\n.ui.labeled.icon.menu {\n  text-align: center;\n}\n.ui.labeled.icon.menu .item {\n  min-width: 6em;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n}\n.ui.labeled.icon.menu .item>.icon:not(.dropdown) {\n  height: 1em;\n  display: block;\n  font-size: 1.71428571em!important;\n  margin: 0 auto .5rem!important;\n}\n.ui.fluid.labeled.icon.menu>.item {\n  min-width: 0;\n}\n@media only screen and (max-width:767px) {\n  .ui.stackable.menu {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n  }\n\n  .ui.stackable.menu .item {\n    width: 100%!important;\n  }\n\n  .ui.stackable.menu .item:before {\n    position: absolute;\n    content: '';\n    top: auto;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 1px;\n    background: rgba(34,36,38,.1);\n  }\n\n  .ui.stackable.menu .left.item,\n  .ui.stackable.menu .left.menu {\n    margin-right: 0!important;\n  }\n\n  .ui.stackable.menu .right.item,\n  .ui.stackable.menu .right.menu {\n    margin-left: 0!important;\n  }\n}\n.ui.menu .red.active.item,\n.ui.red.menu .active.item {\n  border-color: #DB2828!important;\n  color: #DB2828!important;\n}\n.ui.menu .orange.active.item,\n.ui.orange.menu .active.item {\n  border-color: #F2711C!important;\n  color: #F2711C!important;\n}\n.ui.menu .yellow.active.item,\n.ui.yellow.menu .active.item {\n  border-color: #FBBD08!important;\n  color: #FBBD08!important;\n}\n.ui.menu .olive.active.item,\n.ui.olive.menu .active.item {\n  border-color: #B5CC18!important;\n  color: #B5CC18!important;\n}\n.ui.green.menu .active.item,\n.ui.menu .green.active.item {\n  border-color: #21BA45!important;\n  color: #21BA45!important;\n}\n.ui.menu .teal.active.item,\n.ui.teal.menu .active.item {\n  border-color: #00B5AD!important;\n  color: #00B5AD!important;\n}\n.ui.blue.menu .active.item,\n.ui.menu .blue.active.item {\n  border-color: #2185D0!important;\n  color: #2185D0!important;\n}\n.ui.menu .violet.active.item,\n.ui.violet.menu .active.item {\n  border-color: #6435C9!important;\n  color: #6435C9!important;\n}\n.ui.menu .purple.active.item,\n.ui.purple.menu .active.item {\n  border-color: #A333C8!important;\n  color: #A333C8!important;\n}\n.ui.menu .pink.active.item,\n.ui.pink.menu .active.item {\n  border-color: #E03997!important;\n  color: #E03997!important;\n}\n.ui.brown.menu .active.item,\n.ui.menu .brown.active.item {\n  border-color: #A5673F!important;\n  color: #A5673F!important;\n}\n.ui.grey.menu .active.item,\n.ui.menu .grey.active.item {\n  border-color: #767676!important;\n  color: #767676!important;\n}\n.ui.inverted.menu {\n  border: 0 solid transparent;\n  background: #1B1C1D;\n  box-shadow: none;\n}\n.ui.inverted.menu .item,\n.ui.inverted.menu .item>a:not(.ui) {\n  background: 0 0;\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.menu .item.menu {\n  background: 0 0;\n}\n.ui.inverted.menu .item:before,\n.ui.vertical.inverted.menu .item:before {\n  background: rgba(255,255,255,.08);\n}\n.ui.vertical.inverted.menu .menu .item,\n.ui.vertical.inverted.menu .menu .item a:not(.ui) {\n  color: rgba(255,255,255,.5);\n}\n.ui.inverted.menu .header.item {\n  margin: 0;\n  background: 0 0;\n  box-shadow: none;\n}\n.ui.inverted.menu .item.disabled,\n.ui.inverted.menu .item.disabled:hover {\n  color: rgba(225,225,225,.3);\n}\n.ui.inverted.menu .dropdown.item:hover,\n.ui.inverted.menu .link.item:hover,\n.ui.inverted.menu a.item:hover,\n.ui.link.inverted.menu .item:hover {\n  background: rgba(255,255,255,.08);\n  color: #fff;\n}\n.ui.vertical.inverted.menu .item .menu .link.item:hover,\n.ui.vertical.inverted.menu .item .menu a.item:hover {\n  background: 0 0;\n  color: #fff;\n}\n.ui.inverted.menu .link.item:active,\n.ui.inverted.menu a.item:active {\n  background: rgba(255,255,255,.08);\n  color: #fff;\n}\n.ui.inverted.menu .active.item {\n  background: rgba(255,255,255,.15);\n  color: #fff!important;\n}\n.ui.inverted.vertical.menu .item .menu .active.item {\n  background: 0 0;\n  color: #FFF;\n}\n.ui.inverted.pointing.menu .active.item:after {\n  background: #3D3E3F!important;\n  margin: 0!important;\n  box-shadow: none!important;\n  border: none!important;\n}\n.ui.inverted.menu .active.item:hover {\n  background: rgba(255,255,255,.15);\n  color: #FFF!important;\n}\n.ui.inverted.pointing.menu .active.item:hover:after {\n  background: #3D3E3F!important;\n}\n.ui.floated.menu {\n  float: left;\n  margin: 0 .5rem 0 0;\n}\n.ui.floated.menu .item:last-child:before {\n  display: none;\n}\n.ui.right.floated.menu {\n  float: right;\n  margin: 0 0 0 .5rem;\n}\n.ui.inverted.menu .red.active.item,\n.ui.inverted.red.menu {\n  background-color: #DB2828;\n}\n.ui.inverted.red.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.red.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .orange.active.item,\n.ui.inverted.orange.menu {\n  background-color: #F2711C;\n}\n.ui.inverted.orange.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.orange.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .yellow.active.item,\n.ui.inverted.yellow.menu {\n  background-color: #FBBD08;\n}\n.ui.inverted.yellow.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.yellow.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .olive.active.item,\n.ui.inverted.olive.menu {\n  background-color: #B5CC18;\n}\n.ui.inverted.olive.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.olive.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.green.menu,\n.ui.inverted.menu .green.active.item {\n  background-color: #21BA45;\n}\n.ui.inverted.green.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.green.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .teal.active.item,\n.ui.inverted.teal.menu {\n  background-color: #00B5AD;\n}\n.ui.inverted.teal.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.teal.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.blue.menu,\n.ui.inverted.menu .blue.active.item {\n  background-color: #2185D0;\n}\n.ui.inverted.blue.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.blue.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .violet.active.item,\n.ui.inverted.violet.menu {\n  background-color: #6435C9;\n}\n.ui.inverted.violet.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.violet.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .purple.active.item,\n.ui.inverted.purple.menu {\n  background-color: #A333C8;\n}\n.ui.inverted.purple.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.purple.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.menu .pink.active.item,\n.ui.inverted.pink.menu {\n  background-color: #E03997;\n}\n.ui.inverted.pink.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.pink.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.brown.menu,\n.ui.inverted.menu .brown.active.item {\n  background-color: #A5673F;\n}\n.ui.inverted.brown.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.brown.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.inverted.grey.menu,\n.ui.inverted.menu .grey.active.item {\n  background-color: #767676;\n}\n.ui.inverted.grey.menu .item:before {\n  background-color: rgba(34,36,38,.1);\n}\n.ui.inverted.grey.menu .active.item {\n  background-color: rgba(0,0,0,.1)!important;\n}\n.ui.fitted.menu .item,\n.ui.fitted.menu .item .menu .item,\n.ui.menu .fitted.item {\n  padding: 0;\n}\n.ui.horizontally.fitted.menu .item,\n.ui.horizontally.fitted.menu .item .menu .item,\n.ui.menu .horizontally.fitted.item {\n  padding-top: .92857143em;\n  padding-bottom: .92857143em;\n}\n.ui.menu .vertically.fitted.item,\n.ui.vertically.fitted.menu .item,\n.ui.vertically.fitted.menu .item .menu .item {\n  padding-left: 1.14285714em;\n  padding-right: 1.14285714em;\n}\n.ui.borderless.menu .item .menu .item:before,\n.ui.borderless.menu .item:before,\n.ui.menu .borderless.item:before {\n  background: 0 0!important;\n}\n.ui.compact.menu {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  margin: 0;\n  vertical-align: middle;\n}\n.ui.compact.vertical.menu {\n  display: inline-block;\n  width: auto!important;\n}\n.ui.compact.menu .item:last-child {\n  border-radius: 0 .28571429rem .28571429rem 0;\n}\n.ui.compact.menu .item:last-child:before {\n  display: none;\n}\n.ui.compact.vertical.menu .item:last-child::before {\n  display: block;\n}\n.ui.menu.fluid,\n.ui.vertical.menu.fluid {\n  width: 100%!important;\n}\n.ui.item.menu,\n.ui.item.menu .item {\n  width: 100%;\n  padding-left: 0!important;\n  padding-right: 0!important;\n  margin-left: 0!important;\n  margin-right: 0!important;\n  text-align: center;\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.ui.item.menu .item:last-child:before {\n  display: none;\n}\n.ui.menu.two.item .item {\n  width: 50%;\n}\n.ui.menu.three.item .item {\n  width: 33.333%;\n}\n.ui.menu.four.item .item {\n  width: 25%;\n}\n.ui.menu.five.item .item {\n  width: 20%;\n}\n.ui.menu.six.item .item {\n  width: 16.666%;\n}\n.ui.menu.seven.item .item {\n  width: 14.285%;\n}\n.ui.menu.eight.item .item {\n  width: 12.5%;\n}\n.ui.menu.nine.item .item {\n  width: 11.11%;\n}\n.ui.menu.ten.item .item {\n  width: 10%;\n}\n.ui.menu.eleven.item .item {\n  width: 9.09%;\n}\n.ui.menu.twelve.item .item {\n  width: 8.333%;\n}\n.ui.menu.fixed {\n  position: fixed;\n  z-index: 101;\n  margin: 0;\n  width: 100%;\n}\n.ui.menu.fixed,\n.ui.menu.fixed .item:first-child,\n.ui.menu.fixed .item:last-child {\n  border-radius: 0!important;\n}\n.ui.fixed.menu,\n.ui[class*=\"top fixed\"].menu {\n  top: 0;\n  left: 0;\n  right: auto;\n  bottom: auto;\n}\n.ui[class*=\"top fixed\"].menu {\n  border-top: none;\n  border-left: none;\n  border-right: none;\n}\n.ui[class*=\"right fixed\"].menu {\n  border-top: none;\n  border-bottom: none;\n  border-right: none;\n  top: 0;\n  right: 0;\n  left: auto;\n  bottom: auto;\n  width: auto;\n  height: 100%;\n}\n.ui[class*=\"bottom fixed\"].menu {\n  border-bottom: none;\n  border-left: none;\n  border-right: none;\n  bottom: 0;\n  left: 0;\n  top: auto;\n  right: auto;\n}\n.ui[class*=\"left fixed\"].menu {\n  border-top: none;\n  border-bottom: none;\n  border-left: none;\n  top: 0;\n  left: 0;\n  right: auto;\n  bottom: auto;\n  width: auto;\n  height: 100%;\n}\n.ui.fixed.menu+.ui.grid {\n  padding-top: 2.75rem;\n}\n.ui.pointing.menu .item:after {\n  visibility: hidden;\n  position: absolute;\n  content: '';\n  top: 100%;\n  left: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  transform: translateX(-50%) translateY(-50%) rotate(45deg);\n  background: 0 0;\n  margin: .5px 0 0;\n  width: .57142857em;\n  height: .57142857em;\n  border: none;\n  border-bottom: 1px solid #D4D4D5;\n  border-right: 1px solid #D4D4D5;\n  z-index: 2;\n  -webkit-transition: background .1s ease;\n  transition: background .1s ease;\n}\n.ui.vertical.pointing.menu .item:after {\n  position: absolute;\n  top: 50%;\n  right: 0;\n  bottom: auto;\n  left: auto;\n  -webkit-transform: translateX(50%) translateY(-50%) rotate(45deg);\n  -ms-transform: translateX(50%) translateY(-50%) rotate(45deg);\n  transform: translateX(50%) translateY(-50%) rotate(45deg);\n  margin: 0 -.5px 0 0;\n  border: none;\n  border-top: 1px solid #D4D4D5;\n  border-right: 1px solid #D4D4D5;\n}\n.ui.pointing.menu .active.item:after {\n  visibility: visible;\n}\n.ui.pointing.menu .active.dropdown.item:after {\n  visibility: hidden;\n}\n.ui.pointing.menu .active.item .menu .active.item:after,\n.ui.pointing.menu .dropdown.active.item:after {\n  display: none;\n}\n.ui.pointing.menu .active.item:after,\n.ui.pointing.menu .active.item:hover:after,\n.ui.vertical.pointing.menu .active.item:after,\n.ui.vertical.pointing.menu .active.item:hover:after {\n  background-color: #F2F2F2;\n}\n.ui.vertical.pointing.menu .menu .active.item:after {\n  background-color: #FFF;\n}\n.ui.attached.menu {\n  top: 0;\n  bottom: 0;\n  border-radius: 0;\n  margin: 0 -1px;\n  width: calc(100% + 2px);\n  max-width: calc(100% + 2px);\n  box-shadow: none;\n}\n.ui.attached+.ui.attached.menu:not(.top) {\n  border-top: none;\n}\n.ui[class*=\"top attached\"].menu {\n  bottom: 0;\n  margin-bottom: 0;\n  top: 0;\n  margin-top: 1rem;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.menu[class*=\"top attached\"]:first-child {\n  margin-top: 0;\n}\n.ui[class*=\"bottom attached\"].menu {\n  bottom: 0;\n  margin-top: 0;\n  top: 0;\n  margin-bottom: 1rem;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui[class*=\"bottom attached\"].menu:last-child {\n  margin-bottom: 0;\n}\n.ui.top.attached.menu>.item:first-child {\n  border-radius: .28571429rem 0 0;\n}\n.ui.bottom.attached.menu>.item:first-child {\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui.attached.menu:not(.tabular) {\n  border: 1px solid #D4D4D5;\n}\n.ui.attached.inverted.menu {\n  border: none;\n}\n.ui.attached.tabular.menu {\n  margin-left: 0;\n  margin-right: 0;\n  width: 100%;\n}\n.ui.mini.menu {\n  font-size: .78571429rem;\n}\n.ui.mini.vertical.menu {\n  width: 9rem;\n}\n.ui.tiny.menu {\n  font-size: .85714286rem;\n}\n.ui.tiny.vertical.menu {\n  width: 11rem;\n}\n.ui.small.menu {\n  font-size: .92857143rem;\n}\n.ui.small.vertical.menu {\n  width: 13rem;\n}\n.ui.menu {\n  font-size: 1rem;\n}\n.ui.vertical.menu {\n  width: 15rem;\n}\n.ui.large.menu {\n  font-size: 1.07142857rem;\n}\n.ui.large.vertical.menu {\n  width: 18rem;\n}\n.ui.huge.menu {\n  font-size: 1.14285714rem;\n}\n.ui.huge.vertical.menu {\n  width: 20rem;\n}\n.ui.big.menu {\n  font-size: 1.21428571rem;\n}\n.ui.big.vertical.menu {\n  width: 22rem;\n}\n.ui.massive.menu {\n  font-size: 1.28571429rem;\n}\n.ui.massive.vertical.menu {\n  width: 25rem;\n}\n.ui.message {\n  position: relative;\n  min-height: 1em;\n  margin: 1em 0;\n  background: #F8F8F9;\n  padding: 1em 1.5em;\n  line-height: 1.4285em;\n  color: rgba(0,0,0,.87);\n  -webkit-transition: opacity .1s ease,color .1s ease,background .1s ease,box-shadow .1s ease;\n  transition: opacity .1s ease,color .1s ease,background .1s ease,box-shadow .1s ease;\n  border-radius: .28571429rem;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.22) inset,0 0 0 0 transparent;\n}\n.ui.message:first-child {\n  margin-top: 0;\n}\n.ui.message:last-child {\n  margin-bottom: 0;\n}\n.ui.message .header {\n  display: block;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 700;\n  margin: -.14285em 0 0;\n}\n.ui.message .header:not(.ui) {\n  font-size: 1.14285714em;\n}\n.ui.message p {\n  opacity: .85;\n  margin: .75em 0;\n}\n.ui.message p:first-child {\n  margin-top: 0;\n}\n.ui.message p:last-child {\n  margin-bottom: 0;\n}\n.ui.message .header+p {\n  margin-top: .25em;\n}\n.ui.message .list:not(.ui) {\n  text-align: left;\n  padding: 0;\n  opacity: .85;\n  list-style-position: inside;\n  margin: .5em 0 0;\n}\n.ui.message .list:not(.ui):first-child {\n  margin-top: 0;\n}\n.ui.message .list:not(.ui):last-child {\n  margin-bottom: 0;\n}\n.ui.message .list:not(.ui) li {\n  position: relative;\n  list-style-type: none;\n  margin: 0 0 .3em 1em;\n  padding: 0;\n}\n.ui.message .list:not(.ui) li:before {\n  position: absolute;\n  content: '•';\n  left: -1em;\n  height: 100%;\n  vertical-align: baseline;\n}\n.ui.message .list:not(.ui) li:last-child {\n  margin-bottom: 0;\n}\n.ui.message>.icon {\n  margin-right: .6em;\n}\n.ui.message>.close.icon {\n  cursor: pointer;\n  position: absolute;\n  margin: 0;\n  top: .78575em;\n  right: .5em;\n  opacity: .7;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\n.ui.message>.close.icon:hover {\n  opacity: 1;\n}\n.ui.message>:first-child {\n  margin-top: 0;\n}\n.ui.message>:last-child {\n  margin-bottom: 0;\n}\n.ui.dropdown .menu>.message {\n  margin: 0 -1px;\n}\n.ui.visible.visible.visible.visible.message {\n  display: block;\n}\n.ui.icon.visible.visible.visible.visible.message {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n}\n.ui.hidden.hidden.hidden.hidden.message {\n  display: none;\n}\n.ui.compact.message {\n  display: inline-block;\n}\n.ui.attached.message {\n  margin-bottom: -1px;\n  border-radius: .28571429rem .28571429rem 0 0;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset;\n  margin-left: -1px;\n  margin-right: -1px;\n}\n.ui.attached+.ui.attached.message:not(.top):not(.bottom) {\n  margin-top: -1px;\n  border-radius: 0;\n}\n.ui.bottom.attached.message {\n  margin-top: -1px;\n  border-radius: 0 0 .28571429rem .28571429rem;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset,0 1px 2px 0 rgba(34,36,38,.15);\n}\n.ui.bottom.attached.message:not(:last-child) {\n  margin-bottom: 1em;\n}\n.ui.attached.icon.message {\n  width: auto;\n}\n.ui.icon.message {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.ui.icon.message>.icon:not(.close) {\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  width: auto;\n  line-height: 1;\n  vertical-align: middle;\n  font-size: 3em;\n  opacity: .8;\n}\n.ui.icon.message>.content {\n  display: block;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  vertical-align: middle;\n}\n.ui.icon.message .icon:not(.close)+.content {\n  padding-left: 0;\n}\n.ui.icon.message .circular.icon {\n  width: 1em;\n}\n.ui.floating.message {\n  box-shadow: 0 0 0 1px rgba(34,36,38,.22) inset,0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n}\n.ui.positive.message {\n  background-color: #FCFFF5;\n  color: #2C662D;\n}\n.ui.attached.positive.message,\n.ui.positive.message {\n  box-shadow: 0 0 0 1px #A3C293 inset,0 0 0 0 transparent;\n}\n.ui.positive.message .header {\n  color: #1A531B;\n}\n.ui.negative.message {\n  background-color: #FFF6F6;\n  color: #9F3A38;\n}\n.ui.attached.negative.message,\n.ui.negative.message {\n  box-shadow: 0 0 0 1px #E0B4B4 inset,0 0 0 0 transparent;\n}\n.ui.negative.message .header {\n  color: #912D2B;\n}\n.ui.info.message {\n  background-color: #F8FFFF;\n  color: #276F86;\n}\n.ui.attached.info.message,\n.ui.info.message {\n  box-shadow: 0 0 0 1px #A9D5DE inset,0 0 0 0 transparent;\n}\n.ui.info.message .header {\n  color: #0E566C;\n}\n.ui.warning.message {\n  background-color: #FFFAF3;\n  color: #573A08;\n}\n.ui.attached.warning.message,\n.ui.warning.message {\n  box-shadow: 0 0 0 1px #C9BA9B inset,0 0 0 0 transparent;\n}\n.ui.warning.message .header {\n  color: #794B02;\n}\n.ui.error.message {\n  background-color: #FFF6F6;\n  color: #9F3A38;\n}\n.ui.attached.error.message,\n.ui.error.message {\n  box-shadow: 0 0 0 1px #E0B4B4 inset,0 0 0 0 transparent;\n}\n.ui.error.message .header {\n  color: #912D2B;\n}\n.ui.success.message {\n  background-color: #FCFFF5;\n  color: #2C662D;\n}\n.ui.attached.success.message,\n.ui.success.message {\n  box-shadow: 0 0 0 1px #A3C293 inset,0 0 0 0 transparent;\n}\n.ui.success.message .header {\n  color: #1A531B;\n}\n.ui.black.message,\n.ui.inverted.message {\n  background-color: #1B1C1D;\n  color: rgba(255,255,255,.9);\n}\n.ui.red.message {\n  background-color: #FFE8E6;\n  color: #DB2828;\n  box-shadow: 0 0 0 1px #DB2828 inset,0 0 0 0 transparent;\n}\n.ui.red.message .header {\n  color: #c82121;\n}\n.ui.orange.message {\n  background-color: #FFEDDE;\n  color: #F2711C;\n  box-shadow: 0 0 0 1px #F2711C inset,0 0 0 0 transparent;\n}\n.ui.orange.message .header {\n  color: #e7640d;\n}\n.ui.yellow.message {\n  background-color: #FFF8DB;\n  color: #B58105;\n  box-shadow: 0 0 0 1px #B58105 inset,0 0 0 0 transparent;\n}\n.ui.yellow.message .header {\n  color: #9c6f04;\n}\n.ui.olive.message {\n  background-color: #FBFDEF;\n  color: #8ABC1E;\n  box-shadow: 0 0 0 1px #8ABC1E inset,0 0 0 0 transparent;\n}\n.ui.olive.message .header {\n  color: #7aa61a;\n}\n.ui.green.message {\n  background-color: #E5F9E7;\n  color: #1EBC30;\n  box-shadow: 0 0 0 1px #1EBC30 inset,0 0 0 0 transparent;\n}\n.ui.green.message .header {\n  color: #1aa62a;\n}\n.ui.teal.message {\n  background-color: #E1F7F7;\n  color: #10A3A3;\n  box-shadow: 0 0 0 1px #10A3A3 inset,0 0 0 0 transparent;\n}\n.ui.teal.message .header {\n  color: #0e8c8c;\n}\n.ui.blue.message {\n  background-color: #DFF0FF;\n  color: #2185D0;\n  box-shadow: 0 0 0 1px #2185D0 inset,0 0 0 0 transparent;\n}\n.ui.blue.message .header {\n  color: #1e77ba;\n}\n.ui.violet.message {\n  background-color: #EAE7FF;\n  color: #6435C9;\n  box-shadow: 0 0 0 1px #6435C9 inset,0 0 0 0 transparent;\n}\n.ui.violet.message .header {\n  color: #5a30b5;\n}\n.ui.purple.message {\n  background-color: #F6E7FF;\n  color: #A333C8;\n  box-shadow: 0 0 0 1px #A333C8 inset,0 0 0 0 transparent;\n}\n.ui.purple.message .header {\n  color: #922eb4;\n}\n.ui.pink.message {\n  background-color: #FFE3FB;\n  color: #E03997;\n  box-shadow: 0 0 0 1px #E03997 inset,0 0 0 0 transparent;\n}\n.ui.pink.message .header {\n  color: #dd238b;\n}\n.ui.brown.message {\n  background-color: #F1E2D3;\n  color: #A5673F;\n  box-shadow: 0 0 0 1px #A5673F inset,0 0 0 0 transparent;\n}\n.ui.brown.message .header {\n  color: #935b38;\n}\n.ui.mini.message {\n  font-size: .78571429em;\n}\n.ui.tiny.message {\n  font-size: .85714286em;\n}\n.ui.small.message {\n  font-size: .92857143em;\n}\n.ui.message {\n  font-size: 1em;\n}\n.ui.large.message {\n  font-size: 1.14285714em;\n}\n.ui.big.message {\n  font-size: 1.28571429em;\n}\n.ui.huge.message {\n  font-size: 1.42857143em;\n}\n.ui.massive.message {\n  font-size: 1.71428571em;\n}\n.ui.table {\n  width: 100%;\n  background: #FFF;\n  margin: 1em 0;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: none;\n  border-radius: .28571429rem;\n  text-align: left;\n  color: rgba(0,0,0,.87);\n  border-collapse: separate;\n  border-spacing: 0;\n}\n.ui.table:first-child {\n  margin-top: 0;\n}\n.ui.table:last-child {\n  margin-bottom: 0;\n}\n.ui.table td,\n.ui.table th {\n  -webkit-transition: background .1s ease,color .1s ease;\n  transition: background .1s ease,color .1s ease;\n}\n.ui.table thead {\n  box-shadow: none;\n}\n.ui.table thead th {\n  cursor: auto;\n  background: #F9FAFB;\n  text-align: inherit;\n  color: rgba(0,0,0,.87);\n  padding: .92857143em .78571429em;\n  vertical-align: inherit;\n  font-style: none;\n  font-weight: 700;\n  text-transform: none;\n  border-bottom: 1px solid rgba(34,36,38,.1);\n  border-left: none;\n}\n.ui.table thead tr>th:first-child {\n  border-left: none;\n}\n.ui.table thead tr:first-child>th:first-child {\n  border-radius: .28571429rem 0 0;\n}\n.ui.table thead tr:first-child>th:last-child {\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui.table thead tr:first-child>th:only-child {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.table tfoot {\n  box-shadow: none;\n}\n.ui.table tfoot th {\n  cursor: auto;\n  border-top: 1px solid rgba(34,36,38,.15);\n  background: #F9FAFB;\n  text-align: inherit;\n  color: rgba(0,0,0,.87);\n  padding: .78571429em;\n  vertical-align: middle;\n  font-style: normal;\n  font-weight: 400;\n  text-transform: none;\n}\n.ui.table tfoot tr>th:first-child {\n  border-left: none;\n}\n.ui.table tfoot tr:first-child>th:first-child {\n  border-radius: 0 0 0 .28571429rem;\n}\n.ui.table tfoot tr:first-child>th:last-child {\n  border-radius: 0 0 .28571429rem;\n}\n.ui.table tfoot tr:first-child>th:only-child {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.table tr td {\n  border-top: 1px solid rgba(34,36,38,.1);\n}\n.ui.table tr:first-child td {\n  border-top: none;\n}\n.ui.table td {\n  padding: .78571429em;\n  text-align: inherit;\n}\n.ui.table>.icon {\n  vertical-align: baseline;\n}\n.ui.table>.icon:only-child {\n  margin: 0;\n}\n.ui.table.segment {\n  padding: 0;\n}\n.ui.table.segment:after {\n  display: none;\n}\n.ui.table.segment.stacked:after {\n  display: block;\n}\n@media only screen and (max-width:767px) {\n  .ui.table:not(.unstackable) {\n    width: 100%;\n    padding: 0;\n  }\n\n  .ui.table:not(.unstackable) tbody,\n  .ui.table:not(.unstackable) tr,\n  .ui.table:not(.unstackable) tr>td,\n  .ui.table:not(.unstackable) tr>th {\n    width: auto!important;\n    display: block!important;\n  }\n\n  .ui.table:not(.unstackable) tfoot,\n  .ui.table:not(.unstackable) thead {\n    display: block;\n  }\n\n  .ui.table:not(.unstackable) tr {\n    padding-top: 1em;\n    padding-bottom: 1em;\n    box-shadow: 0 -1px 0 0 rgba(0,0,0,.1) inset!important;\n  }\n\n  .ui.table:not(.unstackable) tr>td,\n  .ui.table:not(.unstackable) tr>th {\n    background: 0 0;\n    border: none!important;\n    padding: .25em .75em!important;\n    box-shadow: none!important;\n  }\n\n  .ui.table:not(.unstackable) td:first-child,\n  .ui.table:not(.unstackable) th:first-child {\n    font-weight: 700;\n  }\n\n  .ui.definition.table:not(.unstackable) thead th:first-child {\n    box-shadow: none!important;\n  }\n}\n.ui.table td .image,\n.ui.table td .image img,\n.ui.table th .image,\n.ui.table th .image img {\n  max-width: none;\n}\n.ui.structured.table {\n  border-collapse: collapse;\n}\n.ui.structured.table thead th {\n  border-left: none;\n  border-right: none;\n}\n.ui.structured.sortable.table thead th {\n  border-left: 1px solid rgba(34,36,38,.15);\n  border-right: 1px solid rgba(34,36,38,.15);\n}\n.ui.structured.basic.table th {\n  border-left: none;\n  border-right: none;\n}\n.ui.structured.celled.table tr td,\n.ui.structured.celled.table tr th {\n  border-left: 1px solid rgba(34,36,38,.1);\n  border-right: 1px solid rgba(34,36,38,.1);\n}\n.ui.definition.table thead:not(.full-width) th:first-child {\n  pointer-events: none;\n  background: 0 0;\n  font-weight: 400;\n  color: rgba(0,0,0,.4);\n  box-shadow: -1px -1px 0 1px #FFF;\n}\n.ui.definition.table tfoot:not(.full-width) th:first-child {\n  pointer-events: none;\n  background: 0 0;\n  font-weight: rgba(0,0,0,.4);\n  color: normal;\n  box-shadow: 1px 1px 0 1px #FFF;\n}\n.ui.celled.definition.table thead:not(.full-width) th:first-child {\n  box-shadow: 0 -1px 0 1px #FFF;\n}\n.ui.celled.definition.table tfoot:not(.full-width) th:first-child {\n  box-shadow: 0 1px 0 1px #FFF;\n}\n.ui.definition.table tr td.definition,\n.ui.definition.table tr td:first-child:not(.ignored) {\n  background: rgba(0,0,0,.03);\n  font-weight: 700;\n  color: rgba(0,0,0,.95);\n  text-transform: '';\n  box-shadow: '';\n  text-align: '';\n  font-size: 1em;\n  padding-left: '';\n  padding-right: '';\n}\n.ui.definition.table td:nth-child(2),\n.ui.definition.table tfoot:not(.full-width) th:nth-child(2),\n.ui.definition.table thead:not(.full-width) th:nth-child(2) {\n  border-left: 1px solid rgba(34,36,38,.15);\n}\n.ui.table td.positive,\n.ui.table tr.positive {\n  box-shadow: 0 0 0 #A3C293 inset;\n  background: #FCFFF5!important;\n  color: #2C662D!important;\n}\n.ui.table td.negative,\n.ui.table tr.negative {\n  box-shadow: 0 0 0 #E0B4B4 inset;\n  background: #FFF6F6!important;\n  color: #9F3A38!important;\n}\n.ui.table td.error,\n.ui.table tr.error {\n  box-shadow: 0 0 0 #E0B4B4 inset;\n  background: #FFF6F6!important;\n  color: #9F3A38!important;\n}\n.ui.table td.warning,\n.ui.table tr.warning {\n  box-shadow: 0 0 0 #C9BA9B inset;\n  background: #FFFAF3!important;\n  color: #573A08!important;\n}\n.ui.table td.active,\n.ui.table tr.active {\n  box-shadow: 0 0 0 rgba(0,0,0,.87) inset;\n  background: #E0E0E0!important;\n  color: rgba(0,0,0,.87)!important;\n}\n.ui.table tr td.disabled,\n.ui.table tr.disabled td,\n.ui.table tr.disabled:hover,\n.ui.table tr:hover td.disabled {\n  pointer-events: none;\n  color: rgba(40,40,40,.3);\n}\n@media only screen and (max-width:991px) {\n  .ui[class*=\"tablet stackable\"].table,\n  .ui[class*=\"tablet stackable\"].table tbody,\n  .ui[class*=\"tablet stackable\"].table tr,\n  .ui[class*=\"tablet stackable\"].table tr>td,\n  .ui[class*=\"tablet stackable\"].table tr>th {\n    width: 100%!important;\n    display: block!important;\n  }\n\n  .ui[class*=\"tablet stackable\"].table {\n    padding: 0;\n  }\n\n  .ui[class*=\"tablet stackable\"].table tfoot,\n  .ui[class*=\"tablet stackable\"].table thead {\n    display: block;\n  }\n\n  .ui[class*=\"tablet stackable\"].table tr {\n    padding-top: 1em;\n    padding-bottom: 1em;\n    box-shadow: 0 -1px 0 0 rgba(0,0,0,.1) inset!important;\n  }\n\n  .ui[class*=\"tablet stackable\"].table tr>td,\n  .ui[class*=\"tablet stackable\"].table tr>th {\n    background: 0 0;\n    border: none!important;\n    padding: .25em .75em;\n    box-shadow: none!important;\n  }\n\n  .ui.definition[class*=\"tablet stackable\"].table thead th:first-child {\n    box-shadow: none!important;\n  }\n}\n.ui.table [class*=\"left aligned\"],\n.ui.table[class*=\"left aligned\"] {\n  text-align: left;\n}\n.ui.table [class*=\"center aligned\"],\n.ui.table[class*=\"center aligned\"] {\n  text-align: center;\n}\n.ui.table [class*=\"right aligned\"],\n.ui.table[class*=\"right aligned\"] {\n  text-align: right;\n}\n.ui.table [class*=\"top aligned\"],\n.ui.table[class*=\"top aligned\"] {\n  vertical-align: top;\n}\n.ui.table [class*=\"middle aligned\"],\n.ui.table[class*=\"middle aligned\"] {\n  vertical-align: middle;\n}\n.ui.table [class*=\"bottom aligned\"],\n.ui.table[class*=\"bottom aligned\"] {\n  vertical-align: bottom;\n}\n.ui.table td.collapsing,\n.ui.table th.collapsing {\n  width: 1px;\n  white-space: nowrap;\n}\n.ui.fixed.table {\n  table-layout: fixed;\n}\n.ui.fixed.table td,\n.ui.fixed.table th {\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.ui.selectable.table tbody tr:hover,\n.ui.table tbody tr td.selectable:hover {\n  background: rgba(0,0,0,.05)!important;\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.inverted.table tbody tr td.selectable:hover,\n.ui.selectable.inverted.table tbody tr:hover {\n  background: rgba(255,255,255,.08)!important;\n  color: #fff!important;\n}\n.ui.table tbody tr td.selectable {\n  padding: 0;\n}\n.ui.table tbody tr td.selectable>a:not(.ui) {\n  display: block;\n  color: inherit;\n  padding: .78571429em;\n}\n.ui.selectable.table tr.error:hover,\n.ui.selectable.table tr:hover td.error,\n.ui.table tr td.selectable.error:hover {\n  background: #ffe7e7!important;\n  color: #943634!important;\n}\n.ui.selectable.table tr.warning:hover,\n.ui.selectable.table tr:hover td.warning,\n.ui.table tr td.selectable.warning:hover {\n  background: #fff4e4!important;\n  color: #493107!important;\n}\n.ui.selectable.table tr.active:hover,\n.ui.selectable.table tr:hover td.active,\n.ui.table tr td.selectable.active:hover {\n  background: #E0E0E0!important;\n  color: rgba(0,0,0,.87)!important;\n}\n.ui.selectable.table tr.positive:hover,\n.ui.selectable.table tr:hover td.positive,\n.ui.table tr td.selectable.positive:hover {\n  background: #f7ffe6!important;\n  color: #275b28!important;\n}\n.ui.selectable.table tr.negative:hover,\n.ui.selectable.table tr:hover td.negative,\n.ui.table tr td.selectable.negative:hover {\n  background: #ffe7e7!important;\n  color: #943634!important;\n}\n.ui.attached.table {\n  top: 0;\n  bottom: 0;\n  border-radius: 0;\n  margin: 0 -1px;\n  width: calc(100% + 2px);\n  max-width: calc(100% + 2px);\n  box-shadow: none;\n  border: 1px solid #D4D4D5;\n}\n.ui.attached+.ui.attached.table:not(.top) {\n  border-top: none;\n}\n.ui[class*=\"top attached\"].table {\n  bottom: 0;\n  margin-bottom: 0;\n  top: 0;\n  margin-top: 1em;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.table[class*=\"top attached\"]:first-child {\n  margin-top: 0;\n}\n.ui[class*=\"bottom attached\"].table {\n  bottom: 0;\n  margin-top: 0;\n  top: 0;\n  margin-bottom: 1em;\n  box-shadow: none,none;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui[class*=\"bottom attached\"].table:last-child {\n  margin-bottom: 0;\n}\n.ui.striped.table tbody tr:nth-child(2n),\n.ui.striped.table>tr:nth-child(2n) {\n  background-color: rgba(0,0,50,.02);\n}\n.ui.inverted.striped.table tbody tr:nth-child(2n),\n.ui.inverted.striped.table>tr:nth-child(2n) {\n  background-color: rgba(255,255,255,.05);\n}\n.ui.striped.selectable.selectable.selectable.table tbody tr.active:hover {\n  background: #EFEFEF!important;\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.table [class*=\"single line\"],\n.ui.table[class*=\"single line\"] {\n  white-space: nowrap;\n}\n.ui.red.table {\n  border-top: .2em solid #DB2828;\n}\n.ui.inverted.red.table {\n  background-color: #DB2828!important;\n  color: #FFF!important;\n}\n.ui.orange.table {\n  border-top: .2em solid #F2711C;\n}\n.ui.inverted.orange.table {\n  background-color: #F2711C!important;\n  color: #FFF!important;\n}\n.ui.yellow.table {\n  border-top: .2em solid #FBBD08;\n}\n.ui.inverted.yellow.table {\n  background-color: #FBBD08!important;\n  color: #FFF!important;\n}\n.ui.olive.table {\n  border-top: .2em solid #B5CC18;\n}\n.ui.inverted.olive.table {\n  background-color: #B5CC18!important;\n  color: #FFF!important;\n}\n.ui.green.table {\n  border-top: .2em solid #21BA45;\n}\n.ui.inverted.green.table {\n  background-color: #21BA45!important;\n  color: #FFF!important;\n}\n.ui.teal.table {\n  border-top: .2em solid #00B5AD;\n}\n.ui.inverted.teal.table {\n  background-color: #00B5AD!important;\n  color: #FFF!important;\n}\n.ui.blue.table {\n  border-top: .2em solid #2185D0;\n}\n.ui.inverted.blue.table {\n  background-color: #2185D0!important;\n  color: #FFF!important;\n}\n.ui.violet.table {\n  border-top: .2em solid #6435C9;\n}\n.ui.inverted.violet.table {\n  background-color: #6435C9!important;\n  color: #FFF!important;\n}\n.ui.purple.table {\n  border-top: .2em solid #A333C8;\n}\n.ui.inverted.purple.table {\n  background-color: #A333C8!important;\n  color: #FFF!important;\n}\n.ui.pink.table {\n  border-top: .2em solid #E03997;\n}\n.ui.inverted.pink.table {\n  background-color: #E03997!important;\n  color: #FFF!important;\n}\n.ui.brown.table {\n  border-top: .2em solid #A5673F;\n}\n.ui.inverted.brown.table {\n  background-color: #A5673F!important;\n  color: #FFF!important;\n}\n.ui.grey.table {\n  border-top: .2em solid #767676;\n}\n.ui.inverted.grey.table {\n  background-color: #767676!important;\n  color: #FFF!important;\n}\n.ui.black.table {\n  border-top: .2em solid #1B1C1D;\n}\n.ui.inverted.black.table {\n  background-color: #1B1C1D!important;\n  color: #FFF!important;\n}\n.ui.one.column.table td {\n  width: 100%;\n}\n.ui.two.column.table td {\n  width: 50%;\n}\n.ui.three.column.table td {\n  width: 33.33333333%;\n}\n.ui.four.column.table td {\n  width: 25%;\n}\n.ui.five.column.table td {\n  width: 20%;\n}\n.ui.six.column.table td {\n  width: 16.66666667%;\n}\n.ui.seven.column.table td {\n  width: 14.28571429%;\n}\n.ui.eight.column.table td {\n  width: 12.5%;\n}\n.ui.nine.column.table td {\n  width: 11.11111111%;\n}\n.ui.ten.column.table td {\n  width: 10%;\n}\n.ui.eleven.column.table td {\n  width: 9.09090909%;\n}\n.ui.twelve.column.table td {\n  width: 8.33333333%;\n}\n.ui.thirteen.column.table td {\n  width: 7.69230769%;\n}\n.ui.fourteen.column.table td {\n  width: 7.14285714%;\n}\n.ui.fifteen.column.table td {\n  width: 6.66666667%;\n}\n.ui.sixteen.column.table td,\n.ui.table td.one.wide,\n.ui.table th.one.wide {\n  width: 6.25%;\n}\n.ui.table td.two.wide,\n.ui.table th.two.wide {\n  width: 12.5%;\n}\n.ui.table td.three.wide,\n.ui.table th.three.wide {\n  width: 18.75%;\n}\n.ui.table td.four.wide,\n.ui.table th.four.wide {\n  width: 25%;\n}\n.ui.table td.five.wide,\n.ui.table th.five.wide {\n  width: 31.25%;\n}\n.ui.table td.six.wide,\n.ui.table th.six.wide {\n  width: 37.5%;\n}\n.ui.table td.seven.wide,\n.ui.table th.seven.wide {\n  width: 43.75%;\n}\n.ui.table td.eight.wide,\n.ui.table th.eight.wide {\n  width: 50%;\n}\n.ui.table td.nine.wide,\n.ui.table th.nine.wide {\n  width: 56.25%;\n}\n.ui.table td.ten.wide,\n.ui.table th.ten.wide {\n  width: 62.5%;\n}\n.ui.table td.eleven.wide,\n.ui.table th.eleven.wide {\n  width: 68.75%;\n}\n.ui.table td.twelve.wide,\n.ui.table th.twelve.wide {\n  width: 75%;\n}\n.ui.table td.thirteen.wide,\n.ui.table th.thirteen.wide {\n  width: 81.25%;\n}\n.ui.table td.fourteen.wide,\n.ui.table th.fourteen.wide {\n  width: 87.5%;\n}\n.ui.table td.fifteen.wide,\n.ui.table th.fifteen.wide {\n  width: 93.75%;\n}\n.ui.table td.sixteen.wide,\n.ui.table th.sixteen.wide {\n  width: 100%;\n}\n.ui.sortable.table thead th {\n  cursor: pointer;\n  white-space: nowrap;\n  border-left: 1px solid rgba(34,36,38,.15);\n  color: rgba(0,0,0,.87);\n}\n.ui.sortable.table thead th:first-child {\n  border-left: none;\n}\n.ui.sortable.table thead th.sorted,\n.ui.sortable.table thead th.sorted:hover {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.ui.sortable.table thead th:after {\n  display: none;\n  font-style: normal;\n  font-weight: 400;\n  text-decoration: inherit;\n  content: '';\n  height: 1em;\n  width: auto;\n  opacity: .8;\n  margin: 0 0 0 .5em;\n  font-family: Icons;\n}\n.ui.sortable.table thead th.ascending:after {\n  content: '\\f0d8';\n}\n.ui.sortable.table thead th.descending:after {\n  content: '\\f0d7';\n}\n.ui.sortable.table th.disabled:hover {\n  cursor: auto;\n  color: rgba(40,40,40,.3);\n}\n.ui.sortable.table thead th:hover {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.8);\n}\n.ui.sortable.table thead th.sorted {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.sortable.table thead th.sorted:after {\n  display: inline-block;\n}\n.ui.sortable.table thead th.sorted:hover {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n}\n.ui.inverted.sortable.table thead th.sorted {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) rgba(255,255,255,.15);\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) rgba(255,255,255,.15);\n  color: #fff;\n}\n.ui.inverted.sortable.table thead th:hover {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) rgba(255,255,255,.08);\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) rgba(255,255,255,.08);\n  color: #fff;\n}\n.ui.inverted.sortable.table thead th {\n  border-left-color: transparent;\n  border-right-color: transparent;\n}\n.ui.inverted.table {\n  background: #333;\n  color: rgba(255,255,255,.9);\n  border: none;\n}\n.ui.inverted.table th {\n  background-color: rgba(0,0,0,.15);\n  border-color: rgba(255,255,255,.1)!important;\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.table tr td {\n  border-color: rgba(255,255,255,.1)!important;\n}\n.ui.inverted.table tr td.disabled,\n.ui.inverted.table tr.disabled td,\n.ui.inverted.table tr.disabled:hover td,\n.ui.inverted.table tr:hover td.disabled {\n  pointer-events: none;\n  color: rgba(225,225,225,.3);\n}\n.ui.inverted.definition.table tfoot:not(.full-width) th:first-child,\n.ui.inverted.definition.table thead:not(.full-width) th:first-child {\n  background: #FFF;\n}\n.ui.inverted.definition.table tr td:first-child {\n  background: rgba(255,255,255,.02);\n  color: #fff;\n}\n.ui.collapsing.table {\n  width: auto;\n}\n.ui.basic.table {\n  background: 0 0;\n  border: 1px solid rgba(34,36,38,.15);\n  box-shadow: none;\n}\n.ui.basic.table tfoot,\n.ui.basic.table thead {\n  box-shadow: none;\n}\n.ui.basic.table th {\n  background: 0 0;\n  border-left: none;\n}\n.ui.basic.table tbody tr {\n  border-bottom: 1px solid rgba(0,0,0,.1);\n}\n.ui.basic.table td {\n  background: 0 0;\n}\n.ui.basic.striped.table tbody tr:nth-child(2n) {\n  background-color: rgba(0,0,0,.05)!important;\n}\n.ui[class*=\"very basic\"].table {\n  border: none;\n}\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) td,\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) th {\n  padding: '';\n}\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) td:first-child,\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) th:first-child {\n  padding-left: 0;\n}\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) td:last-child,\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) th:last-child {\n  padding-right: 0;\n}\n.ui[class*=\"very basic\"].table:not(.sortable):not(.striped) thead tr:first-child th {\n  padding-top: 0;\n}\n.ui.celled.table tr td,\n.ui.celled.table tr th {\n  border-left: 1px solid rgba(34,36,38,.1);\n}\n.ui.celled.table tr td:first-child,\n.ui.celled.table tr th:first-child {\n  border-left: none;\n}\n.ui.padded.table th {\n  padding-left: 1em;\n  padding-right: 1em;\n}\n.ui.padded.table td,\n.ui.padded.table th {\n  padding: 1em;\n}\n.ui[class*=\"very padded\"].table th {\n  padding-left: 1.5em;\n  padding-right: 1.5em;\n}\n.ui[class*=\"very padded\"].table td {\n  padding: 1.5em;\n}\n.ui.compact.table th {\n  padding-left: .7em;\n  padding-right: .7em;\n}\n.ui.compact.table td {\n  padding: .5em .7em;\n}\n.ui[class*=\"very compact\"].table th {\n  padding-left: .6em;\n  padding-right: .6em;\n}\n.ui[class*=\"very compact\"].table td {\n  padding: .4em .6em;\n}\n.ui.small.table {\n  font-size: .9em;\n}\n.ui.table {\n  font-size: 1em;\n}\n.ui.large.table {\n  font-size: 1.1em;\n}\n.ui.ad {\n  display: block;\n  overflow: hidden;\n  margin: 1em 0;\n}\n.ui.ad:first-child,\n.ui.ad:last-child {\n  margin: 0;\n}\n.ui.ad iframe {\n  margin: 0;\n  padding: 0;\n  border: none;\n  overflow: hidden;\n}\n.ui.leaderboard.ad {\n  width: 728px;\n  height: 90px;\n}\n.ui[class*=\"medium rectangle\"].ad {\n  width: 300px;\n  height: 250px;\n}\n.ui[class*=\"large rectangle\"].ad {\n  width: 336px;\n  height: 280px;\n}\n.ui[class*=\"half page\"].ad {\n  width: 300px;\n  height: 600px;\n}\n.ui.square.ad {\n  width: 250px;\n  height: 250px;\n}\n.ui[class*=\"small square\"].ad {\n  width: 200px;\n  height: 200px;\n}\n.ui[class*=\"small rectangle\"].ad {\n  width: 180px;\n  height: 150px;\n}\n.ui[class*=\"vertical rectangle\"].ad {\n  width: 240px;\n  height: 400px;\n}\n.ui.button.ad {\n  width: 120px;\n  height: 90px;\n}\n.ui[class*=\"square button\"].ad {\n  width: 125px;\n  height: 125px;\n}\n.ui[class*=\"small button\"].ad {\n  width: 120px;\n  height: 60px;\n}\n.ui.skyscraper.ad {\n  width: 120px;\n  height: 600px;\n}\n.ui[class*=\"wide skyscraper\"].ad {\n  width: 160px;\n}\n.ui.banner.ad {\n  width: 468px;\n  height: 60px;\n}\n.ui[class*=\"vertical banner\"].ad {\n  width: 120px;\n  height: 240px;\n}\n.ui[class*=\"top banner\"].ad {\n  width: 930px;\n  height: 180px;\n}\n.ui[class*=\"half banner\"].ad {\n  width: 234px;\n  height: 60px;\n}\n.ui[class*=\"large leaderboard\"].ad {\n  width: 970px;\n  height: 90px;\n}\n.ui.billboard.ad {\n  width: 970px;\n  height: 250px;\n}\n.ui.panorama.ad {\n  width: 980px;\n  height: 120px;\n}\n.ui.netboard.ad {\n  width: 580px;\n  height: 400px;\n}\n.ui[class*=\"large mobile banner\"].ad {\n  width: 320px;\n  height: 100px;\n}\n.ui[class*=\"mobile leaderboard\"].ad {\n  width: 320px;\n  height: 50px;\n}\n.ui.mobile.ad {\n  display: none;\n}\n@media only screen and (max-width:767px) {\n  .ui.mobile.ad {\n    display: block;\n  }\n}\n.ui.centered.ad {\n  margin-left: auto;\n  margin-right: auto;\n}\n.ui.test.ad {\n  position: relative;\n  background: #545454;\n}\n.ui.test.ad:after {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  width: 100%;\n  text-align: center;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n  -ms-transform: translateX(-50%) translateY(-50%);\n  transform: translateX(-50%) translateY(-50%);\n  content: 'Ad';\n  color: #FFF;\n  font-size: 1em;\n  font-weight: 700;\n}\n.ui.mobile.test.ad:after {\n  font-size: .85714286em;\n}\n.ui.test.ad[data-text]:after {\n  content: attr(data-text);\n}\n.ui.card,\n.ui.cards>.card {\n  max-width: 100%;\n  position: relative;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  width: 290px;\n  min-height: 0;\n  background: #FFF;\n  padding: 0;\n  border: none;\n  border-radius: .28571429rem;\n  box-shadow: 0 1px 3px 0 #D4D4D5,0 0 0 1px #D4D4D5;\n  -webkit-transition: box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: box-shadow .1s ease,transform .1s ease;\n  transition: box-shadow .1s ease,transform .1s ease,-webkit-transform .1s ease;\n  z-index: '';\n}\n.ui.card {\n  margin: 1em 0;\n}\n.ui.card a,\n.ui.cards>.card a {\n  cursor: pointer;\n}\n.ui.card:first-child {\n  margin-top: 0;\n}\n.ui.card:last-child {\n  margin-bottom: 0;\n}\n.ui.cards {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: -.875em -.5em;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n}\n.ui.cards>.card {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: .875em .5em;\n  float: none;\n}\n.ui.card:after,\n.ui.cards:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.cards~.ui.cards {\n  margin-top: .875em;\n}\n.ui.card>:first-child,\n.ui.cards>.card>:first-child {\n  border-radius: .28571429rem .28571429rem 0 0!important;\n  border-top: none!important;\n}\n.ui.card>:last-child,\n.ui.cards>.card>:last-child {\n  border-radius: 0 0 .28571429rem .28571429rem!important;\n}\n.ui.card>:only-child,\n.ui.cards>.card>:only-child {\n  border-radius: .28571429rem!important;\n}\n.ui.card>.image,\n.ui.cards>.card>.image {\n  position: relative;\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  padding: 0;\n  background: rgba(0,0,0,.05);\n}\n.ui.card>.image>img,\n.ui.cards>.card>.image>img {\n  display: block;\n  width: 100%;\n  height: auto;\n  border-radius: inherit;\n}\n.ui.card>.image:not(.ui)>img,\n.ui.cards>.card>.image:not(.ui)>img {\n  border: none;\n}\n.ui.card>.content,\n.ui.cards>.card>.content {\n  -webkit-box-flex: 1;\n  -webkit-flex-grow: 1;\n  -ms-flex-positive: 1;\n  flex-grow: 1;\n  border: none;\n  border-top: 1px solid rgba(34,36,38,.1);\n  background: 0 0;\n  margin: 0;\n  padding: 1em;\n  box-shadow: none;\n  font-size: 1em;\n  border-radius: 0;\n}\n.ui.card>.content:after,\n.ui.cards>.card>.content:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.card>.content>.header,\n.ui.cards>.card>.content>.header {\n  display: block;\n  margin: '';\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  color: rgba(0,0,0,.85);\n}\n.ui.card>.content>.header:not(.ui),\n.ui.cards>.card>.content>.header:not(.ui) {\n  font-weight: 700;\n  font-size: 1.28571429em;\n  margin-top: -.21425em;\n  line-height: 1.2857em;\n}\n.ui.card>.content>.header+.description,\n.ui.card>.content>.meta+.description,\n.ui.cards>.card>.content>.header+.description,\n.ui.cards>.card>.content>.meta+.description {\n  margin-top: .5em;\n}\n.ui.card [class*=\"left floated\"],\n.ui.cards>.card [class*=\"left floated\"] {\n  float: left;\n}\n.ui.card [class*=\"right floated\"],\n.ui.cards>.card [class*=\"right floated\"] {\n  float: right;\n}\n.ui.card [class*=\"left aligned\"],\n.ui.cards>.card [class*=\"left aligned\"] {\n  text-align: left;\n}\n.ui.card [class*=\"center aligned\"],\n.ui.cards>.card [class*=\"center aligned\"] {\n  text-align: center;\n}\n.ui.card [class*=\"right aligned\"],\n.ui.cards>.card [class*=\"right aligned\"] {\n  text-align: right;\n}\n.ui.card .content img,\n.ui.cards>.card .content img {\n  display: inline-block;\n  vertical-align: middle;\n  width: '';\n}\n.ui.card .avatar img,\n.ui.card img.avatar,\n.ui.cards>.card .avatar img,\n.ui.cards>.card img.avatar {\n  width: 2em;\n  height: 2em;\n  border-radius: 500rem;\n}\n.ui.card>.content>.description,\n.ui.cards>.card>.content>.description {\n  clear: both;\n  color: rgba(0,0,0,.68);\n}\n.ui.card>.content p,\n.ui.cards>.card>.content p {\n  margin: 0 0 .5em;\n}\n.ui.card>.content p:last-child,\n.ui.cards>.card>.content p:last-child {\n  margin-bottom: 0;\n}\n.ui.card .meta,\n.ui.cards>.card .meta {\n  font-size: 1em;\n  color: rgba(0,0,0,.4);\n}\n.ui.card .meta *,\n.ui.cards>.card .meta * {\n  margin-right: .3em;\n}\n.ui.card .meta :last-child,\n.ui.cards>.card .meta :last-child {\n  margin-right: 0;\n}\n.ui.card .meta [class*=\"right floated\"],\n.ui.cards>.card .meta [class*=\"right floated\"] {\n  margin-right: 0;\n  margin-left: .3em;\n}\n.ui.card>.content a:not(.ui),\n.ui.cards>.card>.content a:not(.ui) {\n  color: '';\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.card>.content a:not(.ui):hover,\n.ui.cards>.card>.content a:not(.ui):hover {\n  color: '';\n}\n.ui.card>.content>a.header,\n.ui.cards>.card>.content>a.header {\n  color: rgba(0,0,0,.85);\n}\n.ui.card>.content>a.header:hover,\n.ui.cards>.card>.content>a.header:hover {\n  color: #1e70bf;\n}\n.ui.card .meta>a:not(.ui),\n.ui.cards>.card .meta>a:not(.ui) {\n  color: rgba(0,0,0,.4);\n}\n.ui.card .meta>a:not(.ui):hover,\n.ui.cards>.card .meta>a:not(.ui):hover {\n  color: rgba(0,0,0,.87);\n}\n.ui.card>.button,\n.ui.card>.buttons,\n.ui.cards>.card>.button,\n.ui.cards>.card>.buttons {\n  margin: 0 -1px;\n  width: calc(100% + 2px);\n}\n.ui.card .dimmer,\n.ui.cards>.card .dimmer {\n  background-color: '';\n  z-index: 10;\n}\n.ui.card>.content .star.icon,\n.ui.cards>.card>.content .star.icon {\n  cursor: pointer;\n  opacity: .75;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.card>.content .star.icon:hover,\n.ui.cards>.card>.content .star.icon:hover {\n  opacity: 1;\n  color: #FFB70A;\n}\n.ui.card>.content .active.star.icon,\n.ui.cards>.card>.content .active.star.icon {\n  color: #FFE623;\n}\n.ui.card>.content .like.icon,\n.ui.cards>.card>.content .like.icon {\n  cursor: pointer;\n  opacity: .75;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.card>.content .like.icon:hover,\n.ui.cards>.card>.content .like.icon:hover {\n  opacity: 1;\n  color: #FF2733;\n}\n.ui.card>.content .active.like.icon,\n.ui.cards>.card>.content .active.like.icon {\n  color: #FF2733;\n}\n.ui.card>.extra,\n.ui.cards>.card>.extra {\n  max-width: 100%;\n  min-height: 0!important;\n  -webkit-box-flex: 0;\n  -webkit-flex-grow: 0;\n  -ms-flex-positive: 0;\n  flex-grow: 0;\n  border-top: 1px solid rgba(0,0,0,.05)!important;\n  position: static;\n  background: 0 0;\n  width: auto;\n  margin: 0;\n  padding: .75em 1em;\n  top: 0;\n  left: 0;\n  color: rgba(0,0,0,.4);\n  box-shadow: none;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.card>.extra a:not(.ui),\n.ui.cards>.card>.extra a:not(.ui) {\n  color: rgba(0,0,0,.4);\n}\n.ui.card>.extra a:not(.ui):hover,\n.ui.cards>.card>.extra a:not(.ui):hover {\n  color: #1e70bf;\n}\n.ui.link.cards .raised.card:hover,\n.ui.link.raised.card:hover,\n.ui.raised.cards a.card:hover,\na.ui.raised.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 4px 0 rgba(34,36,38,.15),0 2px 10px 0 rgba(34,36,38,.25);\n}\n.ui.raised.card,\n.ui.raised.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n}\n.ui.centered.cards {\n  -webkit-box-pack: center;\n  -webkit-justify-content: center;\n  -ms-flex-pack: center;\n  justify-content: center;\n}\n.ui.centered.card {\n  margin-left: auto;\n  margin-right: auto;\n}\n.ui.fluid.card {\n  width: 100%;\n  max-width: 9999px;\n}\n.ui.cards a.card,\n.ui.link.card,\n.ui.link.cards .card,\na.ui.card {\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n}\n.ui.cards a.card:hover,\n.ui.link.card:hover,\n.ui.link.cards .card:hover,\na.ui.card:hover {\n  cursor: pointer;\n  z-index: 5;\n  background: #FFF;\n  border: none;\n  box-shadow: 0 1px 3px 0 #BCBDBD,0 0 0 1px #D4D4D5;\n  -webkit-transform: translateY(-3px);\n  -ms-transform: translateY(-3px);\n  transform: translateY(-3px);\n}\n.ui.cards>.red.card,\n.ui.red.card,\n.ui.red.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #DB2828,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.red.card:hover,\n.ui.red.card:hover,\n.ui.red.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #d01919,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.orange.card,\n.ui.orange.card,\n.ui.orange.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #F2711C,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.orange.card:hover,\n.ui.orange.card:hover,\n.ui.orange.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #f26202,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.yellow.card,\n.ui.yellow.card,\n.ui.yellow.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #FBBD08,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.yellow.card:hover,\n.ui.yellow.card:hover,\n.ui.yellow.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #eaae00,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.olive.card,\n.ui.olive.card,\n.ui.olive.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #B5CC18,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.olive.card:hover,\n.ui.olive.card:hover,\n.ui.olive.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #a7bd0d,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.green.card,\n.ui.green.card,\n.ui.green.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #21BA45,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.green.card:hover,\n.ui.green.card:hover,\n.ui.green.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #16ab39,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.teal.card,\n.ui.teal.card,\n.ui.teal.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #00B5AD,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.teal.card:hover,\n.ui.teal.card:hover,\n.ui.teal.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #009c95,0 1px 3px 0 #BCBDBD;\n}\n.ui.blue.card,\n.ui.blue.cards>.card,\n.ui.cards>.blue.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #2185D0,0 1px 3px 0 #D4D4D5;\n}\n.ui.blue.card:hover,\n.ui.blue.cards>.card:hover,\n.ui.cards>.blue.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #1678c2,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.violet.card,\n.ui.violet.card,\n.ui.violet.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #6435C9,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.violet.card:hover,\n.ui.violet.card:hover,\n.ui.violet.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #5829bb,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.purple.card,\n.ui.purple.card,\n.ui.purple.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #A333C8,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.purple.card:hover,\n.ui.purple.card:hover,\n.ui.purple.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #9627ba,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.pink.card,\n.ui.pink.card,\n.ui.pink.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #E03997,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.pink.card:hover,\n.ui.pink.card:hover,\n.ui.pink.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #e61a8d,0 1px 3px 0 #BCBDBD;\n}\n.ui.brown.card,\n.ui.brown.cards>.card,\n.ui.cards>.brown.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #A5673F,0 1px 3px 0 #D4D4D5;\n}\n.ui.brown.card:hover,\n.ui.brown.cards>.card:hover,\n.ui.cards>.brown.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #975b33,0 1px 3px 0 #BCBDBD;\n}\n.ui.cards>.grey.card,\n.ui.grey.card,\n.ui.grey.cards>.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #767676,0 1px 3px 0 #D4D4D5;\n}\n.ui.cards>.grey.card:hover,\n.ui.grey.card:hover,\n.ui.grey.cards>.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #838383,0 1px 3px 0 #BCBDBD;\n}\n.ui.black.card,\n.ui.black.cards>.card,\n.ui.cards>.black.card {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #1B1C1D,0 1px 3px 0 #D4D4D5;\n}\n.ui.black.card:hover,\n.ui.black.cards>.card:hover,\n.ui.cards>.black.card:hover {\n  box-shadow: 0 0 0 1px #D4D4D5,0 2px 0 0 #27292a,0 1px 3px 0 #BCBDBD;\n}\n.ui.one.cards {\n  margin-left: 0;\n  margin-right: 0;\n}\n.ui.one.cards>.card {\n  width: 100%;\n}\n.ui.two.cards {\n  margin-left: -1em;\n  margin-right: -1em;\n}\n.ui.two.cards>.card {\n  width: calc(50% - 2em);\n  margin-left: 1em;\n  margin-right: 1em;\n}\n.ui.three.cards {\n  margin-left: -1em;\n  margin-right: -1em;\n}\n.ui.three.cards>.card {\n  width: calc(33.33333333% - 2em);\n  margin-left: 1em;\n  margin-right: 1em;\n}\n.ui.four.cards {\n  margin-left: -.75em;\n  margin-right: -.75em;\n}\n.ui.four.cards>.card {\n  width: calc(25% - 1.5em);\n  margin-left: .75em;\n  margin-right: .75em;\n}\n.ui.five.cards {\n  margin-left: -.75em;\n  margin-right: -.75em;\n}\n.ui.five.cards>.card {\n  width: calc(20% - 1.5em);\n  margin-left: .75em;\n  margin-right: .75em;\n}\n.ui.six.cards {\n  margin-left: -.75em;\n  margin-right: -.75em;\n}\n.ui.six.cards>.card {\n  width: calc(16.66666667% - 1.5em);\n  margin-left: .75em;\n  margin-right: .75em;\n}\n.ui.seven.cards {\n  margin-left: -.5em;\n  margin-right: -.5em;\n}\n.ui.seven.cards>.card {\n  width: calc(14.28571429% - 1em);\n  margin-left: .5em;\n  margin-right: .5em;\n}\n.ui.eight.cards {\n  margin-left: -.5em;\n  margin-right: -.5em;\n}\n.ui.eight.cards>.card {\n  width: calc(12.5% - 1em);\n  margin-left: .5em;\n  margin-right: .5em;\n  font-size: 11px;\n}\n.ui.nine.cards {\n  margin-left: -.5em;\n  margin-right: -.5em;\n}\n.ui.nine.cards>.card {\n  width: calc(11.11111111% - 1em);\n  margin-left: .5em;\n  margin-right: .5em;\n  font-size: 10px;\n}\n.ui.ten.cards {\n  margin-left: -.5em;\n  margin-right: -.5em;\n}\n.ui.ten.cards>.card {\n  width: calc(10% - 1em);\n  margin-left: .5em;\n  margin-right: .5em;\n}\n@media only screen and (max-width:767px) {\n  .ui.two.doubling.cards {\n    margin-left: 0;\n    margin-right: 0;\n  }\n\n  .ui.two.doubling.cards .card {\n    width: 100%;\n    margin-left: 0;\n    margin-right: 0;\n  }\n\n  .ui.three.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.three.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.four.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.four.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.five.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.five.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.six.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.six.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.seven.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.seven.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.eight.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.eight.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.nine.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.nine.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.ten.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.ten.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.two.doubling.cards {\n    margin-left: 0;\n    margin-right: 0;\n  }\n\n  .ui.two.doubling.cards .card {\n    width: 100%;\n    margin-left: 0;\n    margin-right: 0;\n  }\n\n  .ui.three.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.three.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.four.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.four.doubling.cards .card {\n    width: calc(50% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.five.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.five.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.six.doubling.cards {\n    margin-left: -1em;\n    margin-right: -1em;\n  }\n\n  .ui.six.doubling.cards .card {\n    width: calc(33.33333333% - 2em);\n    margin-left: 1em;\n    margin-right: 1em;\n  }\n\n  .ui.eight.doubling.cards {\n    margin-left: -.75em;\n    margin-right: -.75em;\n  }\n\n  .ui.eight.doubling.cards .card {\n    width: calc(25% - 1.5em);\n    margin-left: .75em;\n    margin-right: .75em;\n  }\n\n  .ui.nine.doubling.cards {\n    margin-left: -.75em;\n    margin-right: -.75em;\n  }\n\n  .ui.nine.doubling.cards .card {\n    width: calc(25% - 1.5em);\n    margin-left: .75em;\n    margin-right: .75em;\n  }\n\n  .ui.ten.doubling.cards {\n    margin-left: -.75em;\n    margin-right: -.75em;\n  }\n\n  .ui.ten.doubling.cards .card {\n    width: calc(20% - 1.5em);\n    margin-left: .75em;\n    margin-right: .75em;\n  }\n}\n@media only screen and (max-width:767px) {\n  .ui.stackable.cards {\n    display: block!important;\n  }\n\n  .ui.stackable.cards .card:first-child {\n    margin-top: 0!important;\n  }\n\n  .ui.stackable.cards>.card {\n    display: block!important;\n    height: auto!important;\n    margin: 1em;\n    padding: 0!important;\n    width: calc(100% - 2em)!important;\n  }\n}\n.ui.cards>.card {\n  font-size: 1em;\n}\n.ui.comments {\n  margin: 1.5em 0;\n  max-width: 650px;\n}\n.ui.comments:first-child {\n  margin-top: 0;\n}\n.ui.comments:last-child {\n  margin-bottom: 0;\n}\n.ui.comments .comment {\n  position: relative;\n  background: 0 0;\n  margin: .5em 0 0;\n  padding: .5em 0 0;\n  border: none;\n  border-top: none;\n  line-height: 1.2;\n}\n.ui.comments .comment:first-child {\n  margin-top: 0;\n  padding-top: 0;\n}\n.ui.comments .comment .comments {\n  margin: 0 0 .5em .5em;\n  padding: 1em 0 1em 1em;\n}\n.ui.comments .comment .comments:before {\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n.ui.comments .comment .comments .comment {\n  border: none;\n  border-top: none;\n  background: 0 0;\n}\n.ui.comments .comment .avatar {\n  display: block;\n  width: 2.5em;\n  height: auto;\n  float: left;\n  margin: .2em 0 0;\n}\n.ui.comments .comment .avatar img,\n.ui.comments .comment img.avatar {\n  display: block;\n  margin: 0 auto;\n  width: 100%;\n  height: 100%;\n  border-radius: .25rem;\n}\n.ui.comments .comment>.content {\n  display: block;\n}\n.ui.comments .comment>.avatar~.content {\n  margin-left: 3.5em;\n}\n.ui.comments .comment .author {\n  font-size: 1em;\n  color: rgba(0,0,0,.87);\n  font-weight: 700;\n}\n.ui.comments .comment a.author {\n  cursor: pointer;\n}\n.ui.comments .comment a.author:hover {\n  color: #1e70bf;\n}\n.ui.comments .comment .metadata {\n  display: inline-block;\n  margin-left: .5em;\n  color: rgba(0,0,0,.4);\n  font-size: .875em;\n}\n.ui.comments .comment .metadata>* {\n  display: inline-block;\n  margin: 0 .5em 0 0;\n}\n.ui.comments .comment .metadata>:last-child {\n  margin-right: 0;\n}\n.ui.comments .comment .text {\n  margin: .25em 0 .5em;\n  font-size: 1em;\n  word-wrap: break-word;\n  color: rgba(0,0,0,.87);\n  line-height: 1.3;\n}\n.ui.comments .comment .actions {\n  font-size: .875em;\n}\n.ui.comments .comment .actions a {\n  cursor: pointer;\n  display: inline-block;\n  margin: 0 .75em 0 0;\n  color: rgba(0,0,0,.4);\n}\n.ui.comments .comment .actions a:last-child {\n  margin-right: 0;\n}\n.ui.comments .comment .actions a.active,\n.ui.comments .comment .actions a:hover {\n  color: rgba(0,0,0,.8);\n}\n.ui.comments>.reply.form {\n  margin-top: 1em;\n}\n.ui.comments .comment .reply.form {\n  width: 100%;\n  margin-top: 1em;\n}\n.ui.comments .reply.form textarea {\n  font-size: 1em;\n  height: 12em;\n}\n.ui.collapsed.comments,\n.ui.comments .collapsed.comment,\n.ui.comments .collapsed.comments {\n  display: none;\n}\n.ui.threaded.comments .comment .comments {\n  margin: -1.5em 0 -1em 1.25em;\n  padding: 3em 0 2em 2.25em;\n  box-shadow: -1px 0 0 rgba(34,36,38,.15);\n}\n.ui.minimal.comments .comment .actions {\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: auto;\n  -webkit-transition: opacity .2s ease;\n  transition: opacity .2s ease;\n  -webkit-transition-delay: .1s;\n  transition-delay: .1s;\n}\n.ui.minimal.comments .comment>.content:hover>.actions {\n  opacity: 1;\n}\n.ui.mini.comments {\n  font-size: .78571429rem;\n}\n.ui.tiny.comments {\n  font-size: .85714286rem;\n}\n.ui.small.comments {\n  font-size: .9em;\n}\n.ui.comments {\n  font-size: 1em;\n}\n.ui.large.comments {\n  font-size: 1.1em;\n}\n.ui.big.comments {\n  font-size: 1.28571429rem;\n}\n.ui.huge.comments {\n  font-size: 1.2em;\n}\n.ui.massive.comments {\n  font-size: 1.71428571rem;\n}\n.ui.feed {\n  margin: 1em 0;\n}\n.ui.feed:first-child {\n  margin-top: 0;\n}\n.ui.feed:last-child {\n  margin-bottom: 0;\n}\n.ui.feed>.event {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  width: 100%;\n  padding: .21428571rem 0;\n  margin: 0;\n  background: 0 0;\n  border-top: none;\n}\n.ui.feed>.event:first-child {\n  border-top: 0;\n  padding-top: 0;\n}\n.ui.feed>.event:last-child {\n  padding-bottom: 0;\n}\n.ui.feed>.event>.label {\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  width: 2.5em;\n  height: auto;\n  -webkit-align-self: stretch;\n  -ms-flex-item-align: stretch;\n  align-self: stretch;\n  text-align: left;\n}\n.ui.feed>.event>.label .icon {\n  opacity: 1;\n  font-size: 1.5em;\n  width: 100%;\n  padding: .25em;\n  background: 0 0;\n  border: none;\n  border-radius: none;\n  color: rgba(0,0,0,.6);\n}\n.ui.feed>.event>.label img {\n  width: 100%;\n  height: auto;\n  border-radius: 500rem;\n}\n.ui.feed>.event>.label+.content {\n  margin: .5em 0 .35714286em 1.14285714em;\n}\n.ui.feed>.event>.content {\n  display: block;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  -webkit-align-self: stretch;\n  -ms-flex-item-align: stretch;\n  align-self: stretch;\n  text-align: left;\n  word-wrap: break-word;\n}\n.ui.feed>.event:last-child>.content {\n  padding-bottom: 0;\n}\n.ui.feed>.event>.content a {\n  cursor: pointer;\n}\n.ui.feed>.event>.content .date {\n  margin: -.5rem 0 0;\n  padding: 0;\n  font-weight: 400;\n  font-size: 1em;\n  font-style: normal;\n  color: rgba(0,0,0,.4);\n}\n.ui.feed>.event>.content .summary {\n  margin: 0;\n  font-size: 1em;\n  font-weight: 700;\n  color: rgba(0,0,0,.87);\n}\n.ui.feed>.event>.content .summary img {\n  display: inline-block;\n  width: auto;\n  height: 10em;\n  margin: -.25em .25em 0 0;\n  border-radius: .25em;\n  vertical-align: middle;\n}\n.ui.feed>.event>.content .user {\n  display: inline-block;\n  font-weight: 700;\n  margin-right: 0;\n  vertical-align: baseline;\n}\n.ui.feed>.event>.content .user img {\n  margin: -.25em .25em 0 0;\n  width: auto;\n  height: 10em;\n  vertical-align: middle;\n}\n.ui.feed>.event>.content .summary>.date {\n  display: inline-block;\n  float: none;\n  font-weight: 400;\n  font-size: .85714286em;\n  font-style: normal;\n  margin: 0 0 0 .5em;\n  padding: 0;\n  color: rgba(0,0,0,.4);\n}\n.ui.feed>.event>.content .extra {\n  margin: .5em 0 0;\n  background: 0 0;\n  padding: 0;\n  color: rgba(0,0,0,.87);\n}\n.ui.feed>.event>.content .extra.images img {\n  display: inline-block;\n  margin: 0 .25em 0 0;\n  width: 6em;\n}\n.ui.feed>.event>.content .extra.text {\n  padding: 0;\n  border-left: none;\n  font-size: 1em;\n  max-width: 500px;\n  line-height: 1.4285em;\n}\n.ui.feed>.event>.content .meta {\n  display: inline-block;\n  font-size: .85714286em;\n  margin: .5em 0 0;\n  background: 0 0;\n  border: none;\n  border-radius: 0;\n  box-shadow: none;\n  padding: 0;\n  color: rgba(0,0,0,.6);\n}\n.ui.feed>.event>.content .meta>* {\n  position: relative;\n  margin-left: .75em;\n}\n.ui.feed>.event>.content .meta>:after {\n  content: '';\n  color: rgba(0,0,0,.2);\n  top: 0;\n  left: -1em;\n  opacity: 1;\n  position: absolute;\n  vertical-align: top;\n}\n.ui.feed>.event>.content .meta .like {\n  color: '';\n  -webkit-transition: .2s color ease;\n  transition: .2s color ease;\n}\n.ui.feed>.event>.content .meta .like:hover .icon {\n  color: #FF2733;\n}\n.ui.feed>.event>.content .meta .active.like .icon {\n  color: #EF404A;\n}\n.ui.feed>.event>.content .meta>:first-child {\n  margin-left: 0;\n}\n.ui.feed>.event>.content .meta>:first-child::after {\n  display: none;\n}\n.ui.feed>.event>.content .meta a,\n.ui.feed>.event>.content .meta>.icon {\n  cursor: pointer;\n  opacity: 1;\n  color: rgba(0,0,0,.5);\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.feed>.event>.content .meta a:hover,\n.ui.feed>.event>.content .meta a:hover .icon,\n.ui.feed>.event>.content .meta>.icon:hover {\n  color: rgba(0,0,0,.95);\n}\n.ui.small.feed {\n  font-size: .92857143rem;\n}\n.ui.feed {\n  font-size: 1rem;\n}\n.ui.large.feed {\n  font-size: 1.14285714rem;\n}\n.ui.items>.item {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 1em 0;\n  width: 100%;\n  min-height: 0;\n  background: 0 0;\n  padding: 0;\n  border: none;\n  border-radius: 0;\n  box-shadow: none;\n  -webkit-transition: box-shadow .1s ease;\n  transition: box-shadow .1s ease;\n  z-index: '';\n}\n.ui.items>.item a {\n  cursor: pointer;\n}\n.ui.items {\n  margin: 1.5em 0;\n}\n.ui.items:first-child {\n  margin-top: 0!important;\n}\n.ui.items:last-child {\n  margin-bottom: 0!important;\n}\n.ui.items>.item:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.items>.item:first-child {\n  margin-top: 0;\n}\n.ui.items>.item:last-child {\n  margin-bottom: 0;\n}\n.ui.items>.item>.image {\n  position: relative;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 0 auto;\n  -ms-flex: 0 0 auto;\n  flex: 0 0 auto;\n  display: block;\n  float: none;\n  margin: 0;\n  padding: 0;\n  max-height: '';\n  -webkit-align-self: top;\n  -ms-flex-item-align: top;\n  align-self: top;\n}\n.ui.items>.item>.image>img {\n  display: block;\n  width: 100%;\n  height: auto;\n  border-radius: .125rem;\n  border: none;\n}\n.ui.items>.item>.image:only-child>img {\n  border-radius: 0;\n}\n.ui.items>.item>.content {\n  display: block;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 1 auto;\n  -ms-flex: 1 1 auto;\n  flex: 1 1 auto;\n  background: 0 0;\n  margin: 0;\n  padding: 0;\n  box-shadow: none;\n  font-size: 1em;\n  border: none;\n  border-radius: 0;\n}\n.ui.items>.item>.content:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.items>.item>.image+.content {\n  min-width: 0;\n  width: auto;\n  display: block;\n  margin-left: 0;\n  -webkit-align-self: top;\n  -ms-flex-item-align: top;\n  align-self: top;\n  padding-left: 1.5em;\n}\n.ui.items>.item>.content>.header {\n  display: inline-block;\n  margin: -.21425em 0 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 700;\n  color: rgba(0,0,0,.85);\n}\n.ui.items>.item>.content>.header:not(.ui) {\n  font-size: 1.28571429em;\n}\n.ui.items>.item [class*=\"left floated\"] {\n  float: left;\n}\n.ui.items>.item [class*=\"right floated\"] {\n  float: right;\n}\n.ui.items>.item .content img {\n  -webkit-align-self: middle;\n  -ms-flex-item-align: middle;\n  align-self: middle;\n  width: '';\n}\n.ui.items>.item .avatar img,\n.ui.items>.item img.avatar {\n  width: '';\n  height: '';\n  border-radius: 500rem;\n}\n.ui.items>.item>.content>.description {\n  margin-top: .6em;\n  max-width: auto;\n  font-size: 1em;\n  line-height: 1.4285em;\n  color: rgba(0,0,0,.87);\n}\n.ui.items>.item>.content p {\n  margin: 0 0 .5em;\n}\n.ui.items>.item>.content p:last-child {\n  margin-bottom: 0;\n}\n.ui.items>.item .meta {\n  margin: .5em 0;\n  font-size: 1em;\n  line-height: 1em;\n  color: rgba(0,0,0,.6);\n}\n.ui.items>.item .meta * {\n  margin-right: .3em;\n}\n.ui.items>.item .meta :last-child {\n  margin-right: 0;\n}\n.ui.items>.item .meta [class*=\"right floated\"] {\n  margin-right: 0;\n  margin-left: .3em;\n}\n.ui.items>.item>.content a:not(.ui) {\n  color: '';\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.items>.item>.content a:not(.ui):hover {\n  color: '';\n}\n.ui.items>.item>.content>a.header {\n  color: rgba(0,0,0,.85);\n}\n.ui.items>.item>.content>a.header:hover {\n  color: #1e70bf;\n}\n.ui.items>.item .meta>a:not(.ui) {\n  color: rgba(0,0,0,.4);\n}\n.ui.items>.item .meta>a:not(.ui):hover {\n  color: rgba(0,0,0,.87);\n}\n.ui.items>.item>.content .favorite.icon {\n  cursor: pointer;\n  opacity: .75;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.items>.item>.content .favorite.icon:hover {\n  opacity: 1;\n  color: #FFB70A;\n}\n.ui.items>.item>.content .active.favorite.icon {\n  color: #FFE623;\n}\n.ui.items>.item>.content .like.icon {\n  cursor: pointer;\n  opacity: .75;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.items>.item>.content .like.icon:hover {\n  opacity: 1;\n  color: #FF2733;\n}\n.ui.items>.item>.content .active.like.icon {\n  color: #FF2733;\n}\n.ui.items>.item .extra {\n  display: block;\n  position: relative;\n  background: 0 0;\n  margin: .5rem 0 0;\n  width: 100%;\n  padding: 0;\n  top: 0;\n  left: 0;\n  color: rgba(0,0,0,.4);\n  box-shadow: none;\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n  border-top: none;\n}\n.ui.items>.item .extra>* {\n  margin: .25rem .5rem .25rem 0;\n}\n.ui.items>.item .extra>[class*=\"right floated\"] {\n  margin: .25rem 0 .25rem .5rem;\n}\n.ui.items>.item .extra:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.items>.item>.image:not(.ui) {\n  width: 175px;\n}\n@media only screen and (min-width:768px) and (max-width:991px) {\n  .ui.items>.item {\n    margin: 1em 0;\n  }\n\n  .ui.items>.item>.image:not(.ui) {\n    width: 150px;\n  }\n\n  .ui.items>.item>.image+.content {\n    display: block;\n    padding: 0 0 0 1em;\n  }\n}\n@media only screen and (max-width:767px) {\n  .ui.items>.item {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n    margin: 2em 0;\n  }\n\n  .ui.items>.item>.image {\n    display: block;\n    margin-left: auto;\n    margin-right: auto;\n  }\n\n  .ui.items>.item>.image,\n  .ui.items>.item>.image>img {\n    max-width: 100%!important;\n    width: auto!important;\n    max-height: 250px!important;\n  }\n\n  .ui.items>.item>.image+.content {\n    display: block;\n    padding: 1.5em 0 0;\n  }\n}\n.ui.items>.item>.image+[class*=\"top aligned\"].content {\n  -webkit-align-self: flex-start;\n  -ms-flex-item-align: start;\n  align-self: flex-start;\n}\n.ui.items>.item>.image+[class*=\"middle aligned\"].content {\n  -webkit-align-self: center;\n  -ms-flex-item-align: center;\n  align-self: center;\n}\n.ui.items>.item>.image+[class*=\"bottom aligned\"].content {\n  -webkit-align-self: flex-end;\n  -ms-flex-item-align: end;\n  align-self: flex-end;\n}\n.ui.relaxed.items>.item {\n  margin: 1.5em 0;\n}\n.ui[class*=\"very relaxed\"].items>.item {\n  margin: 2em 0;\n}\n.ui.divided.items>.item {\n  border-top: 1px solid rgba(34,36,38,.15);\n  margin: 0;\n  padding: 1em 0;\n}\n.ui.divided.items>.item:first-child {\n  border-top: none;\n  margin-top: 0!important;\n  padding-top: 0!important;\n}\n.ui.divided.items>.item:last-child {\n  margin-bottom: 0!important;\n  padding-bottom: 0!important;\n}\n.ui.relaxed.divided.items>.item {\n  margin: 0;\n  padding: 1.5em 0;\n}\n.ui[class*=\"very relaxed\"].divided.items>.item {\n  margin: 0;\n  padding: 2em 0;\n}\n.ui.items a.item:hover,\n.ui.link.items>.item:hover {\n  cursor: pointer;\n}\n.ui.items a.item:hover .content .header,\n.ui.link.items>.item:hover .content .header {\n  color: #1e70bf;\n}\n.ui.items>.item {\n  font-size: 1em;\n}\n.ui.statistic {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  margin: 1em 0;\n  max-width: auto;\n}\n.ui.statistic+.ui.statistic {\n  margin: 0 0 0 1.5em;\n}\n.ui.statistic:first-child {\n  margin-top: 0;\n}\n.ui.statistic:last-child {\n  margin-bottom: 0;\n}\n.ui.statistics {\n  -webkit-box-align: start;\n  -webkit-align-items: flex-start;\n  -ms-flex-align: start;\n  align-items: flex-start;\n  -webkit-flex-wrap: wrap;\n  -ms-flex-wrap: wrap;\n  flex-wrap: wrap;\n}\n.ui.statistics>.statistic {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  margin: 0 1.5em 2em;\n  max-width: auto;\n}\n.ui.statistics {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 1em -1.5em -2em;\n}\n.ui.statistics:after {\n  display: block;\n  content: ' ';\n  height: 0;\n  clear: both;\n  overflow: hidden;\n  visibility: hidden;\n}\n.ui.statistics:first-child {\n  margin-top: 0;\n}\n.ui.statistics:last-child {\n  margin-bottom: 0;\n}\n.ui.statistic>.value,\n.ui.statistics .statistic>.value {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 400;\n  line-height: 1em;\n  color: #1B1C1D;\n  text-transform: uppercase;\n  text-align: center;\n}\n.ui.statistic>.label,\n.ui.statistics .statistic>.label {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1em;\n  font-weight: 700;\n  color: rgba(0,0,0,.87);\n  text-transform: uppercase;\n  text-align: center;\n}\n.ui.statistic>.label~.value,\n.ui.statistic>.value~.label,\n.ui.statistics .statistic>.label~.value,\n.ui.statistics .statistic>.value~.label {\n  margin-top: 0;\n}\n.ui.statistic>.value .icon,\n.ui.statistics .statistic>.value .icon {\n  opacity: 1;\n  width: auto;\n  margin: 0;\n}\n.ui.statistic>.text.value,\n.ui.statistics .statistic>.text.value {\n  line-height: 1em;\n  min-height: 2em;\n  font-weight: 700;\n  text-align: center;\n}\n.ui.statistic>.text.value+.label,\n.ui.statistics .statistic>.text.value+.label {\n  text-align: center;\n}\n.ui.statistic>.value img,\n.ui.statistics .statistic>.value img {\n  max-height: 3rem;\n  vertical-align: baseline;\n}\n.ui.ten.statistics {\n  margin: 0 0 -2em;\n}\n.ui.ten.statistics .statistic {\n  min-width: 10%;\n  margin: 0 0 2em;\n}\n.ui.nine.statistics {\n  margin: 0 0 -2em;\n}\n.ui.nine.statistics .statistic {\n  min-width: 11.11111111%;\n  margin: 0 0 2em;\n}\n.ui.eight.statistics {\n  margin: 0 0 -2em;\n}\n.ui.eight.statistics .statistic {\n  min-width: 12.5%;\n  margin: 0 0 2em;\n}\n.ui.seven.statistics {\n  margin: 0 0 -2em;\n}\n.ui.seven.statistics .statistic {\n  min-width: 14.28571429%;\n  margin: 0 0 2em;\n}\n.ui.six.statistics {\n  margin: 0 0 -2em;\n}\n.ui.six.statistics .statistic {\n  min-width: 16.66666667%;\n  margin: 0 0 2em;\n}\n.ui.five.statistics {\n  margin: 0 0 -2em;\n}\n.ui.five.statistics .statistic {\n  min-width: 20%;\n  margin: 0 0 2em;\n}\n.ui.four.statistics {\n  margin: 0 0 -2em;\n}\n.ui.four.statistics .statistic {\n  min-width: 25%;\n  margin: 0 0 2em;\n}\n.ui.three.statistics {\n  margin: 0 0 -2em;\n}\n.ui.three.statistics .statistic {\n  min-width: 33.33333333%;\n  margin: 0 0 2em;\n}\n.ui.two.statistics {\n  margin: 0 0 -2em;\n}\n.ui.two.statistics .statistic {\n  min-width: 50%;\n  margin: 0 0 2em;\n}\n.ui.one.statistics {\n  margin: 0 0 -2em;\n}\n.ui.one.statistics .statistic {\n  min-width: 100%;\n  margin: 0 0 2em;\n}\n.ui.horizontal.statistic {\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n}\n.ui.horizontal.statistics {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: column;\n  -ms-flex-direction: column;\n  flex-direction: column;\n  margin: 0;\n  max-width: none;\n}\n.ui.horizontal.statistics .statistic {\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n  -webkit-box-align: center;\n  -webkit-align-items: center;\n  -ms-flex-align: center;\n  align-items: center;\n  max-width: none;\n  margin: 1em 0;\n}\n.ui.horizontal.statistic>.text.value,\n.ui.horizontal.statistics>.statistic>.text.value {\n  min-height: 0!important;\n}\n.ui.horizontal.statistic>.value .icon,\n.ui.horizontal.statistics .statistic>.value .icon {\n  width: 1.18em;\n}\n.ui.horizontal.statistic>.label,\n.ui.horizontal.statistics .statistic>.label {\n  display: inline-block;\n  vertical-align: middle;\n  margin: 0 0 0 .75em;\n}\n.ui.red.statistic>.value,\n.ui.red.statistics .statistic>.value,\n.ui.statistics .red.statistic>.value {\n  color: #DB2828;\n}\n.ui.orange.statistic>.value,\n.ui.orange.statistics .statistic>.value,\n.ui.statistics .orange.statistic>.value {\n  color: #F2711C;\n}\n.ui.statistics .yellow.statistic>.value,\n.ui.yellow.statistic>.value,\n.ui.yellow.statistics .statistic>.value {\n  color: #FBBD08;\n}\n.ui.olive.statistic>.value,\n.ui.olive.statistics .statistic>.value,\n.ui.statistics .olive.statistic>.value {\n  color: #B5CC18;\n}\n.ui.green.statistic>.value,\n.ui.green.statistics .statistic>.value,\n.ui.statistics .green.statistic>.value {\n  color: #21BA45;\n}\n.ui.statistics .teal.statistic>.value,\n.ui.teal.statistic>.value,\n.ui.teal.statistics .statistic>.value {\n  color: #00B5AD;\n}\n.ui.blue.statistic>.value,\n.ui.blue.statistics .statistic>.value,\n.ui.statistics .blue.statistic>.value {\n  color: #2185D0;\n}\n.ui.statistics .violet.statistic>.value,\n.ui.violet.statistic>.value,\n.ui.violet.statistics .statistic>.value {\n  color: #6435C9;\n}\n.ui.purple.statistic>.value,\n.ui.purple.statistics .statistic>.value,\n.ui.statistics .purple.statistic>.value {\n  color: #A333C8;\n}\n.ui.pink.statistic>.value,\n.ui.pink.statistics .statistic>.value,\n.ui.statistics .pink.statistic>.value {\n  color: #E03997;\n}\n.ui.brown.statistic>.value,\n.ui.brown.statistics .statistic>.value,\n.ui.statistics .brown.statistic>.value {\n  color: #A5673F;\n}\n.ui.grey.statistic>.value,\n.ui.grey.statistics .statistic>.value,\n.ui.statistics .grey.statistic>.value {\n  color: #767676;\n}\n.ui.inverted.statistic .value,\n.ui.inverted.statistics .statistic>.value {\n  color: #FFF;\n}\n.ui.inverted.statistic .label,\n.ui.inverted.statistics .statistic>.label {\n  color: rgba(255,255,255,.9);\n}\n.ui.inverted.red.statistic>.value,\n.ui.inverted.red.statistics .statistic>.value,\n.ui.statistics .inverted.red.statistic>.value {\n  color: #FF695E;\n}\n.ui.inverted.orange.statistic>.value,\n.ui.inverted.orange.statistics .statistic>.value,\n.ui.statistics .inverted.orange.statistic>.value {\n  color: #FF851B;\n}\n.ui.inverted.yellow.statistic>.value,\n.ui.inverted.yellow.statistics .statistic>.value,\n.ui.statistics .inverted.yellow.statistic>.value {\n  color: #FFE21F;\n}\n.ui.inverted.olive.statistic>.value,\n.ui.inverted.olive.statistics .statistic>.value,\n.ui.statistics .inverted.olive.statistic>.value {\n  color: #D9E778;\n}\n.ui.inverted.green.statistic>.value,\n.ui.inverted.green.statistics .statistic>.value,\n.ui.statistics .inverted.green.statistic>.value {\n  color: #2ECC40;\n}\n.ui.inverted.teal.statistic>.value,\n.ui.inverted.teal.statistics .statistic>.value,\n.ui.statistics .inverted.teal.statistic>.value {\n  color: #6DFFFF;\n}\n.ui.inverted.blue.statistic>.value,\n.ui.inverted.blue.statistics .statistic>.value,\n.ui.statistics .inverted.blue.statistic>.value {\n  color: #54C8FF;\n}\n.ui.inverted.violet.statistic>.value,\n.ui.inverted.violet.statistics .statistic>.value,\n.ui.statistics .inverted.violet.statistic>.value {\n  color: #A291FB;\n}\n.ui.inverted.purple.statistic>.value,\n.ui.inverted.purple.statistics .statistic>.value,\n.ui.statistics .inverted.purple.statistic>.value {\n  color: #DC73FF;\n}\n.ui.inverted.pink.statistic>.value,\n.ui.inverted.pink.statistics .statistic>.value,\n.ui.statistics .inverted.pink.statistic>.value {\n  color: #FF8EDF;\n}\n.ui.inverted.brown.statistic>.value,\n.ui.inverted.brown.statistics .statistic>.value,\n.ui.statistics .inverted.brown.statistic>.value {\n  color: #D67C1C;\n}\n.ui.inverted.grey.statistic>.value,\n.ui.inverted.grey.statistics .statistic>.value,\n.ui.statistics .inverted.grey.statistic>.value {\n  color: #DCDDDE;\n}\n.ui[class*=\"left floated\"].statistic {\n  float: left;\n  margin: 0 2em 1em 0;\n}\n.ui[class*=\"right floated\"].statistic {\n  float: right;\n  margin: 0 0 1em 2em;\n}\n.ui.floated.statistic:last-child {\n  margin-bottom: 0;\n}\n.ui.mini.horizontal.statistic>.value,\n.ui.mini.horizontal.statistics .statistic>.value,\n.ui.mini.statistic>.value,\n.ui.mini.statistics .statistic>.value {\n  font-size: 1.5rem!important;\n}\n.ui.mini.statistic>.text.value,\n.ui.mini.statistics .statistic>.text.value {\n  font-size: 1rem!important;\n}\n.ui.tiny.horizontal.statistic>.value,\n.ui.tiny.horizontal.statistics .statistic>.value,\n.ui.tiny.statistic>.value,\n.ui.tiny.statistics .statistic>.value {\n  font-size: 2rem!important;\n}\n.ui.tiny.statistic>.text.value,\n.ui.tiny.statistics .statistic>.text.value {\n  font-size: 1rem!important;\n}\n.ui.small.statistic>.value,\n.ui.small.statistics .statistic>.value {\n  font-size: 3rem!important;\n}\n.ui.small.horizontal.statistic>.value,\n.ui.small.horizontal.statistics .statistic>.value {\n  font-size: 2rem!important;\n}\n.ui.small.statistic>.text.value,\n.ui.small.statistics .statistic>.text.value {\n  font-size: 1rem!important;\n}\n.ui.statistic>.value,\n.ui.statistics .statistic>.value {\n  font-size: 4rem!important;\n}\n.ui.horizontal.statistic>.value,\n.ui.horizontal.statistics .statistic>.value {\n  display: inline-block;\n  vertical-align: middle;\n  font-size: 3rem!important;\n}\n.ui.statistic>.text.value,\n.ui.statistics .statistic>.text.value {\n  font-size: 2rem!important;\n}\n.ui.large.statistic>.value,\n.ui.large.statistics .statistic>.value {\n  font-size: 5rem!important;\n}\n.ui.large.horizontal.statistic>.value,\n.ui.large.horizontal.statistics .statistic>.value {\n  font-size: 4rem!important;\n}\n.ui.large.statistic>.text.value,\n.ui.large.statistics .statistic>.text.value {\n  font-size: 2.5rem!important;\n}\n.ui.huge.statistic>.value,\n.ui.huge.statistics .statistic>.value {\n  font-size: 6rem!important;\n}\n.ui.huge.horizontal.statistic>.value,\n.ui.huge.horizontal.statistics .statistic>.value {\n  font-size: 5rem!important;\n}\n.ui.huge.statistic>.text.value,\n.ui.huge.statistics .statistic>.text.value {\n  font-size: 2.5rem!important;\n}\n.ui.accordion,\n.ui.accordion .accordion {\n  max-width: 100%;\n}\n.ui.accordion .accordion {\n  margin: 1em 0 0;\n  padding: 0;\n}\n.ui.accordion .accordion .title,\n.ui.accordion .title {\n  cursor: pointer;\n}\n.ui.accordion .title:not(.ui) {\n  padding: .5em 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1em;\n  color: rgba(0,0,0,.87);\n}\n.ui.accordion .accordion .title~.content,\n.ui.accordion .title~.content {\n  display: none;\n}\n.ui.accordion:not(.styled) .accordion .title~.content:not(.ui),\n.ui.accordion:not(.styled) .title~.content:not(.ui) {\n  margin: '';\n  padding: .5em 0 1em;\n}\n.ui.accordion:not(.styled) .title~.content:not(.ui):last-child {\n  padding-bottom: 0;\n}\n.ui.accordion .accordion .title .dropdown.icon,\n.ui.accordion .title .dropdown.icon {\n  display: inline-block;\n  float: none;\n  opacity: 1;\n  width: 1.25em;\n  height: 1em;\n  margin: 0 .25rem 0 0;\n  padding: 0;\n  font-size: 1em;\n  -webkit-transition: opacity .1s ease,-webkit-transform .1s ease;\n  transition: opacity .1s ease,-webkit-transform .1s ease;\n  transition: transform .1s ease,opacity .1s ease;\n  transition: transform .1s ease,opacity .1s ease,-webkit-transform .1s ease;\n  vertical-align: baseline;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n}\n.ui.accordion.menu .item .title {\n  display: block;\n  padding: 0;\n}\n.ui.accordion.menu .item .title>.dropdown.icon {\n  float: right;\n  margin: .21425em 0 0 1em;\n  -webkit-transform: rotate(180deg);\n  -ms-transform: rotate(180deg);\n  transform: rotate(180deg);\n}\n.ui.accordion .ui.header .dropdown.icon {\n  font-size: 1em;\n  margin: 0 .25rem 0 0;\n}\n.ui.accordion .accordion .active.title .dropdown.icon,\n.ui.accordion .active.title .dropdown.icon,\n.ui.accordion.menu .item .active.title>.dropdown.icon {\n  -webkit-transform: rotate(90deg);\n  -ms-transform: rotate(90deg);\n  transform: rotate(90deg);\n}\n.ui.styled.accordion {\n  width: 600px;\n}\n.ui.styled.accordion,\n.ui.styled.accordion .accordion {\n  border-radius: .28571429rem;\n  background: #FFF;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),0 0 0 1px rgba(34,36,38,.15);\n}\n.ui.styled.accordion .accordion .title,\n.ui.styled.accordion .title {\n  margin: 0;\n  padding: .75em 1em;\n  color: rgba(0,0,0,.4);\n  font-weight: 700;\n  border-top: 1px solid rgba(34,36,38,.15);\n  -webkit-transition: background .1s ease,color .1s ease;\n  transition: background .1s ease,color .1s ease;\n}\n.ui.styled.accordion .accordion .title:first-child,\n.ui.styled.accordion>.title:first-child {\n  border-top: none;\n}\n.ui.styled.accordion .accordion .content,\n.ui.styled.accordion .content {\n  margin: 0;\n  padding: .5em 1em 1.5em;\n}\n.ui.styled.accordion .accordion .content {\n  padding: .5em 1em 1.5em;\n}\n.ui.styled.accordion .accordion .active.title,\n.ui.styled.accordion .accordion .title:hover,\n.ui.styled.accordion .active.title,\n.ui.styled.accordion .title:hover {\n  background: 0 0;\n  color: rgba(0,0,0,.87);\n}\n.ui.styled.accordion .accordion .active.title,\n.ui.styled.accordion .active.title {\n  background: 0 0;\n  color: rgba(0,0,0,.95);\n}\n.ui.accordion .accordion .active.content,\n.ui.accordion .active.content {\n  display: block;\n}\n.ui.fluid.accordion,\n.ui.fluid.accordion .accordion {\n  width: 100%;\n}\n.ui.inverted.accordion .title:not(.ui) {\n  color: rgba(255,255,255,.9);\n}\n@font-face {\n  font-family: Accordion;\n  src: url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMggjB5AAAAC8AAAAYGNtYXAPfOIKAAABHAAAAExnYXNwAAAAEAAAAWgAAAAIZ2x5Zryj6HgAAAFwAAAAyGhlYWT/0IhHAAACOAAAADZoaGVhApkB5wAAAnAAAAAkaG10eAJuABIAAAKUAAAAGGxvY2EAjABWAAACrAAAAA5tYXhwAAgAFgAAArwAAAAgbmFtZfC1n04AAALcAAABPHBvc3QAAwAAAAAEGAAAACAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADw2gHg/+D/4AHgACAAAAABAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEADgAAAAKAAgAAgACAAEAIPDa//3//wAAAAAAIPDZ//3//wAB/+MPKwADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQASAEkAtwFuABMAADc0PwE2FzYXFh0BFAcGJwYvASY1EgaABQgHBQYGBQcIBYAG2wcGfwcBAQcECf8IBAcBAQd/BgYAAAAAAQAAAEkApQFuABMAADcRNDc2MzIfARYVFA8BBiMiJyY1AAUGBwgFgAYGgAUIBwYFWwEACAUGBoAFCAcFgAYGBQcAAAABAAAAAQAAqWYls18PPPUACwIAAAAAAM/9o+4AAAAAz/2j7gAAAAAAtwFuAAAACAACAAAAAAAAAAEAAAHg/+AAAAIAAAAAAAC3AAEAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAQAAAAC3ABIAtwAAAAAAAAAKABQAHgBCAGQAAAABAAAABgAUAAEAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAADgCuAAEAAAAAAAEADAAAAAEAAAAAAAIADgBAAAEAAAAAAAMADAAiAAEAAAAAAAQADABOAAEAAAAAAAUAFgAMAAEAAAAAAAYABgAuAAEAAAAAAAoANABaAAMAAQQJAAEADAAAAAMAAQQJAAIADgBAAAMAAQQJAAMADAAiAAMAAQQJAAQADABOAAMAAQQJAAUAFgAMAAMAAQQJAAYADAA0AAMAAQQJAAoANABaAHIAYQB0AGkAbgBnAFYAZQByAHMAaQBvAG4AIAAxAC4AMAByAGEAdABpAG4AZ3JhdGluZwByAGEAdABpAG4AZwBSAGUAZwB1AGwAYQByAHIAYQB0AGkAbgBnAEYAbwBuAHQAIABnAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAEkAYwBvAE0AbwBvAG4ALgADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('truetype'),url(data:application/font-woff;charset=utf-8;base64,d09GRk9UVE8AAASwAAoAAAAABGgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAAS0AAAEtFpovuE9TLzIAAAIkAAAAYAAAAGAIIweQY21hcAAAAoQAAABMAAAATA984gpnYXNwAAAC0AAAAAgAAAAIAAAAEGhlYWQAAALYAAAANgAAADb/0IhHaGhlYQAAAxAAAAAkAAAAJAKZAedobXR4AAADNAAAABgAAAAYAm4AEm1heHAAAANMAAAABgAAAAYABlAAbmFtZQAAA1QAAAE8AAABPPC1n05wb3N0AAAEkAAAACAAAAAgAAMAAAEABAQAAQEBB3JhdGluZwABAgABADr4HAL4GwP4GAQeCgAZU/+Lix4KABlT/4uLDAeLa/iU+HQFHQAAAHkPHQAAAH4RHQAAAAkdAAABJBIABwEBBw0PERQZHnJhdGluZ3JhdGluZ3UwdTF1MjB1RjBEOXVGMERBAAACAYkABAAGAQEEBwoNVp38lA78lA78lA77lA773Z33bxWLkI2Qj44I9xT3FAWOj5CNkIuQi4+JjoePiI2Gi4YIi/uUBYuGiYeHiIiHh4mGi4aLho2Ijwj7FPcUBYeOiY+LkAgO+92L5hWL95QFi5CNkI6Oj4+PjZCLkIuQiY6HCPcU+xQFj4iNhouGi4aJh4eICPsU+xQFiIeGiYaLhouHjYePiI6Jj4uQCA74lBT4lBWLDAoAAAAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADw2gHg/+D/4AHgACAAAAABAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEADgAAAAKAAgAAgACAAEAIPDa//3//wAAAAAAIPDZ//3//wAB/+MPKwADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAEAADfYOJZfDzz1AAsCAAAAAADP/aPuAAAAAM/9o+4AAAAAALcBbgAAAAgAAgAAAAAAAAABAAAB4P/gAAACAAAAAAAAtwABAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAEAAAAAtwASALcAAAAAUAAABgAAAAAADgCuAAEAAAAAAAEADAAAAAEAAAAAAAIADgBAAAEAAAAAAAMADAAiAAEAAAAAAAQADABOAAEAAAAAAAUAFgAMAAEAAAAAAAYABgAuAAEAAAAAAAoANABaAAMAAQQJAAEADAAAAAMAAQQJAAIADgBAAAMAAQQJAAMADAAiAAMAAQQJAAQADABOAAMAAQQJAAUAFgAMAAMAAQQJAAYADAA0AAMAAQQJAAoANABaAHIAYQB0AGkAbgBnAFYAZQByAHMAaQBvAG4AIAAxAC4AMAByAGEAdABpAG4AZ3JhdGluZwByAGEAdABpAG4AZwBSAGUAZwB1AGwAYQByAHIAYQB0AGkAbgBnAEYAbwBuAHQAIABnAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAEkAYwBvAE0AbwBvAG4ALgADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('woff');\n  font-weight: 400;\n  font-style: normal;\n}\n.ui.accordion .accordion .title .dropdown.icon,\n.ui.accordion .title .dropdown.icon {\n  font-family: Accordion;\n  line-height: 1;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  font-weight: 400;\n  font-style: normal;\n  text-align: center;\n}\n.ui.accordion .accordion .title .dropdown.icon:before,\n.ui.accordion .title .dropdown.icon:before {\n  content: '\\f0da';\n}\n.ui.checkbox {\n  position: relative;\n  display: inline-block;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  outline: 0;\n  vertical-align: baseline;\n  font-style: normal;\n  min-height: 17px;\n  font-size: 1rem;\n  line-height: 17px;\n  min-width: 17px;\n}\n.ui.checkbox input[type=checkbox],\n.ui.checkbox input[type=radio] {\n  cursor: pointer;\n  position: absolute;\n  top: 0;\n  left: 0;\n  opacity: 0!important;\n  outline: 0;\n  z-index: 3;\n  width: 17px;\n  height: 17px;\n}\n.ui.checkbox .box,\n.ui.checkbox label {\n  cursor: auto;\n  position: relative;\n  display: block;\n  padding-left: 1.85714em;\n  outline: 0;\n  font-size: 1em;\n}\n.ui.checkbox .box:before,\n.ui.checkbox label:before {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 17px;\n  height: 17px;\n  content: '';\n  background: #FFF;\n  border-radius: .21428571rem;\n  -webkit-transition: border .1s ease,opacity .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: border .1s ease,opacity .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: border .1s ease,opacity .1s ease,transform .1s ease,box-shadow .1s ease;\n  transition: border .1s ease,opacity .1s ease,transform .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  border: 1px solid #D4D4D5;\n}\n.ui.checkbox .box:after,\n.ui.checkbox label:after {\n  position: absolute;\n  font-size: 14px;\n  top: 0;\n  left: 0;\n  width: 17px;\n  height: 17px;\n  text-align: center;\n  opacity: 0;\n  color: rgba(0,0,0,.87);\n  -webkit-transition: border .1s ease,opacity .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: border .1s ease,opacity .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  transition: border .1s ease,opacity .1s ease,transform .1s ease,box-shadow .1s ease;\n  transition: border .1s ease,opacity .1s ease,transform .1s ease,box-shadow .1s ease,-webkit-transform .1s ease;\n  font-family: Checkbox;\n}\n.ui.checkbox label,\n.ui.checkbox+label {\n  color: rgba(0,0,0,.87);\n  -webkit-transition: color .1s ease;\n  transition: color .1s ease;\n}\n.ui.checkbox+label {\n  vertical-align: middle;\n}\n.ui.checkbox .box:hover::before,\n.ui.checkbox label:hover::before {\n  background: #FFF;\n  border-color: rgba(34,36,38,.35);\n}\n.ui.checkbox label:hover,\n.ui.checkbox+label:hover {\n  color: rgba(0,0,0,.8);\n}\n.ui.checkbox .box:active::before,\n.ui.checkbox label:active::before {\n  background: #F9FAFB;\n  border-color: rgba(34,36,38,.35);\n}\n.ui.checkbox .box:active::after,\n.ui.checkbox input:active~label,\n.ui.checkbox label:active::after {\n  color: rgba(0,0,0,.95);\n}\n.ui.checkbox input:focus~.box:before,\n.ui.checkbox input:focus~label:before {\n  background: #FFF;\n  border-color: #96C8DA;\n}\n.ui.checkbox input:focus~.box:after,\n.ui.checkbox input:focus~label,\n.ui.checkbox input:focus~label:after {\n  color: rgba(0,0,0,.95);\n}\n.ui.checkbox input:checked~.box:before,\n.ui.checkbox input:checked~label:before {\n  background: #FFF;\n  border-color: rgba(34,36,38,.35);\n}\n.ui.checkbox input:checked~.box:after,\n.ui.checkbox input:checked~label:after {\n  opacity: 1;\n  color: rgba(0,0,0,.95);\n}\n.ui.checkbox input:not([type=radio]):indeterminate~.box:before,\n.ui.checkbox input:not([type=radio]):indeterminate~label:before {\n  background: #FFF;\n  border-color: rgba(34,36,38,.35);\n}\n.ui.checkbox input:not([type=radio]):indeterminate~.box:after,\n.ui.checkbox input:not([type=radio]):indeterminate~label:after {\n  opacity: 1;\n  color: rgba(0,0,0,.95);\n}\n.ui.checkbox input:checked:focus~.box:before,\n.ui.checkbox input:checked:focus~label:before,\n.ui.checkbox input:not([type=radio]):indeterminate:focus~.box:before,\n.ui.checkbox input:not([type=radio]):indeterminate:focus~label:before {\n  background: #FFF;\n  border-color: #96C8DA;\n}\n.ui.checkbox input:checked:focus~.box:after,\n.ui.checkbox input:checked:focus~label:after,\n.ui.checkbox input:not([type=radio]):indeterminate:focus~.box:after,\n.ui.checkbox input:not([type=radio]):indeterminate:focus~label:after {\n  color: rgba(0,0,0,.95);\n}\n.ui.read-only.checkbox,\n.ui.read-only.checkbox label {\n  cursor: default;\n}\n.ui.checkbox input[disabled]~.box:after,\n.ui.checkbox input[disabled]~label,\n.ui.disabled.checkbox .box:after,\n.ui.disabled.checkbox label {\n  cursor: default!important;\n  opacity: .5;\n  color: #000;\n}\n.ui.checkbox input.hidden {\n  z-index: -1;\n}\n.ui.checkbox input.hidden+label {\n  cursor: pointer;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.ui.radio.checkbox {\n  min-height: 15px;\n}\n.ui.radio.checkbox .box,\n.ui.radio.checkbox label {\n  padding-left: 1.85714em;\n}\n.ui.radio.checkbox .box:before,\n.ui.radio.checkbox label:before {\n  content: '';\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  width: 15px;\n  height: 15px;\n  border-radius: 500rem;\n  top: 1px;\n  left: 0;\n}\n.ui.radio.checkbox .box:after,\n.ui.radio.checkbox label:after {\n  border: none;\n  content: ''!important;\n  line-height: 15px;\n  top: 1px;\n  left: 0;\n  width: 15px;\n  height: 15px;\n  border-radius: 500rem;\n  -webkit-transform: scale(.46666667);\n  -ms-transform: scale(.46666667);\n  transform: scale(.46666667);\n  background-color: rgba(0,0,0,.87);\n}\n.ui.radio.checkbox input:focus~.box:before,\n.ui.radio.checkbox input:focus~label:before {\n  background-color: #FFF;\n}\n.ui.radio.checkbox input:focus~.box:after,\n.ui.radio.checkbox input:focus~label:after {\n  background-color: rgba(0,0,0,.95);\n}\n.ui.radio.checkbox input:indeterminate~.box:after,\n.ui.radio.checkbox input:indeterminate~label:after {\n  opacity: 0;\n}\n.ui.radio.checkbox input:checked~.box:before,\n.ui.radio.checkbox input:checked~label:before {\n  background-color: #FFF;\n}\n.ui.radio.checkbox input:checked~.box:after,\n.ui.radio.checkbox input:checked~label:after {\n  background-color: rgba(0,0,0,.95);\n}\n.ui.radio.checkbox input:focus:checked~.box:before,\n.ui.radio.checkbox input:focus:checked~label:before {\n  background-color: #FFF;\n}\n.ui.radio.checkbox input:focus:checked~.box:after,\n.ui.radio.checkbox input:focus:checked~label:after {\n  background-color: rgba(0,0,0,.95);\n}\n.ui.slider.checkbox {\n  min-height: 1.25rem;\n}\n.ui.slider.checkbox input {\n  width: 3.5rem;\n  height: 1.25rem;\n}\n.ui.slider.checkbox .box,\n.ui.slider.checkbox label {\n  padding-left: 4.5rem;\n  line-height: 1rem;\n  color: rgba(0,0,0,.4);\n}\n.ui.slider.checkbox .box:before,\n.ui.slider.checkbox label:before {\n  display: block;\n  position: absolute;\n  content: '';\n  border: none!important;\n  left: 0;\n  z-index: 1;\n  top: .4rem;\n  background-color: rgba(0,0,0,.05);\n  width: 3.5rem;\n  height: .21428571rem;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  border-radius: 500rem;\n  -webkit-transition: background .3s ease;\n  transition: background .3s ease;\n}\n.ui.slider.checkbox .box:after,\n.ui.slider.checkbox label:after {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) #FFF;\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) #FFF;\n  position: absolute;\n  content: ''!important;\n  opacity: 1;\n  z-index: 2;\n  border: none;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),0 0 0 1px rgba(34,36,38,.15) inset;\n  width: 1.5rem;\n  height: 1.5rem;\n  top: -.25rem;\n  left: 0;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  border-radius: 500rem;\n  -webkit-transition: left .3s ease;\n  transition: left .3s ease;\n}\n.ui.slider.checkbox input:focus~.box:before,\n.ui.slider.checkbox input:focus~label:before {\n  background-color: rgba(0,0,0,.15);\n  border: none;\n}\n.ui.slider.checkbox .box:hover,\n.ui.slider.checkbox label:hover {\n  color: rgba(0,0,0,.8);\n}\n.ui.slider.checkbox .box:hover::before,\n.ui.slider.checkbox label:hover::before {\n  background: rgba(0,0,0,.15);\n}\n.ui.slider.checkbox input:checked~.box,\n.ui.slider.checkbox input:checked~label {\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.slider.checkbox input:checked~.box:before,\n.ui.slider.checkbox input:checked~label:before {\n  background-color: #545454!important;\n}\n.ui.slider.checkbox input:checked~.box:after,\n.ui.slider.checkbox input:checked~label:after {\n  left: 2rem;\n}\n.ui.slider.checkbox input:focus:checked~.box,\n.ui.slider.checkbox input:focus:checked~label {\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.slider.checkbox input:focus:checked~.box:before,\n.ui.slider.checkbox input:focus:checked~label:before {\n  background-color: #000!important;\n}\n.ui.toggle.checkbox {\n  min-height: 1.5rem;\n}\n.ui.toggle.checkbox input {\n  width: 3.5rem;\n  height: 1.5rem;\n}\n.ui.toggle.checkbox .box,\n.ui.toggle.checkbox label {\n  min-height: 1.5rem;\n  padding-left: 4.5rem;\n  color: rgba(0,0,0,.87);\n}\n.ui.toggle.checkbox label {\n  padding-top: .15em;\n}\n.ui.toggle.checkbox .box:before,\n.ui.toggle.checkbox label:before {\n  display: block;\n  position: absolute;\n  content: '';\n  z-index: 1;\n  -webkit-transform: none;\n  -ms-transform: none;\n  transform: none;\n  border: none;\n  top: 0;\n  background: rgba(0,0,0,.05);\n  width: 3.5rem;\n  height: 1.5rem;\n  border-radius: 500rem;\n}\n.ui.toggle.checkbox .box:after,\n.ui.toggle.checkbox label:after {\n  background: -webkit-linear-gradient(transparent,rgba(0,0,0,.05)) #FFF;\n  background: linear-gradient(transparent,rgba(0,0,0,.05)) #FFF;\n  position: absolute;\n  content: ''!important;\n  opacity: 1;\n  z-index: 2;\n  border: none;\n  box-shadow: 0 1px 2px 0 rgba(34,36,38,.15),0 0 0 1px rgba(34,36,38,.15) inset;\n  width: 1.5rem;\n  height: 1.5rem;\n  top: 0;\n  left: 0;\n  border-radius: 500rem;\n  -webkit-transition: background .3s ease,left .3s ease;\n  transition: background .3s ease,left .3s ease;\n}\n.ui.toggle.checkbox input~.box:after,\n.ui.toggle.checkbox input~label:after {\n  left: -.05rem;\n}\n.ui.toggle.checkbox .box:hover::before,\n.ui.toggle.checkbox input:focus~.box:before,\n.ui.toggle.checkbox input:focus~label:before,\n.ui.toggle.checkbox label:hover::before {\n  background-color: rgba(0,0,0,.15);\n  border: none;\n}\n.ui.toggle.checkbox input:checked~.box,\n.ui.toggle.checkbox input:checked~label {\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.toggle.checkbox input:checked~.box:before,\n.ui.toggle.checkbox input:checked~label:before {\n  background-color: #2185D0!important;\n}\n.ui.toggle.checkbox input:checked~.box:after,\n.ui.toggle.checkbox input:checked~label:after {\n  left: 2.15rem;\n}\n.ui.toggle.checkbox input:focus:checked~.box,\n.ui.toggle.checkbox input:focus:checked~label {\n  color: rgba(0,0,0,.95)!important;\n}\n.ui.toggle.checkbox input:focus:checked~.box:before,\n.ui.toggle.checkbox input:focus:checked~label:before {\n  background-color: #0d71bb!important;\n}\n.ui.fitted.checkbox .box,\n.ui.fitted.checkbox label {\n  padding-left: 0!important;\n}\n.ui.fitted.slider.checkbox,\n.ui.fitted.toggle.checkbox {\n  width: 3.5rem;\n}\n@font-face {\n  font-family: Checkbox;\n  src: url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBD8AAAC8AAAAYGNtYXAYVtCJAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5Zn4huwUAAAF4AAABYGhlYWQGPe1ZAAAC2AAAADZoaGVhB30DyAAAAxAAAAAkaG10eBBKAEUAAAM0AAAAHGxvY2EAmgESAAADUAAAABBtYXhwAAkALwAAA2AAAAAgbmFtZSC8IugAAAOAAAABknBvc3QAAwAAAAAFFAAAACAAAwMTAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADoAgPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAOAAAAAoACAACAAIAAQAg6AL//f//AAAAAAAg6AD//f//AAH/4xgEAAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAEUAUQO7AvgAGgAAARQHAQYjIicBJjU0PwE2MzIfAQE2MzIfARYVA7sQ/hQQFhcQ/uMQEE4QFxcQqAF2EBcXEE4QAnMWEP4UEBABHRAXFhBOEBCoAXcQEE4QFwAAAAABAAABbgMlAkkAFAAAARUUBwYjISInJj0BNDc2MyEyFxYVAyUQEBf9SRcQEBAQFwK3FxAQAhJtFxAQEBAXbRcQEBAQFwAAAAABAAAASQMlA24ALAAAARUUBwYrARUUBwYrASInJj0BIyInJj0BNDc2OwE1NDc2OwEyFxYdATMyFxYVAyUQEBfuEBAXbhYQEO4XEBAQEBfuEBAWbhcQEO4XEBACEm0XEBDuFxAQEBAX7hAQF20XEBDuFxAQEBAX7hAQFwAAAQAAAAIAAHRSzT9fDzz1AAsEAAAAAADRsdR3AAAAANGx1HcAAAAAA7sDbgAAAAgAAgAAAAAAAAABAAADwP/AAAAEAAAAAAADuwABAAAAAAAAAAAAAAAAAAAABwQAAAAAAAAAAAAAAAIAAAAEAABFAyUAAAMlAAAAAAAAAAoAFAAeAE4AcgCwAAEAAAAHAC0AAQAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAIAAAAAQAAAAAAAgAHAGkAAQAAAAAAAwAIADkAAQAAAAAABAAIAH4AAQAAAAAABQALABgAAQAAAAAABgAIAFEAAQAAAAAACgAaAJYAAwABBAkAAQAQAAgAAwABBAkAAgAOAHAAAwABBAkAAwAQAEEAAwABBAkABAAQAIYAAwABBAkABQAWACMAAwABBAkABgAQAFkAAwABBAkACgA0ALBDaGVja2JveABDAGgAZQBjAGsAYgBvAHhWZXJzaW9uIDIuMABWAGUAcgBzAGkAbwBuACAAMgAuADBDaGVja2JveABDAGgAZQBjAGsAYgBvAHhDaGVja2JveABDAGgAZQBjAGsAYgBvAHhSZWd1bGFyAFIAZQBnAHUAbABhAHJDaGVja2JveABDAGgAZQBjAGsAYgBvAHhGb250IGdlbmVyYXRlZCBieSBJY29Nb29uLgBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('truetype');\n}\n.ui.checkbox input:checked~.box:after,\n.ui.checkbox input:checked~label:after {\n  content: '\\e800';\n}\n.ui.checkbox input:indeterminate~.box:after,\n.ui.checkbox input:indeterminate~label:after {\n  font-size: 12px;\n  content: '\\e801';\n}\n.dimmable:not(.body) {\n  position: relative;\n}\n.ui.dimmer {\n  display: none;\n  position: absolute;\n  top: 0!important;\n  left: 0!important;\n  width: 100%;\n  height: 100%;\n  text-align: center;\n  vertical-align: middle;\n  background-color: rgba(0,0,0,.85);\n  opacity: 0;\n  line-height: 1;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n  -webkit-animation-duration: .5s;\n  animation-duration: .5s;\n  -webkit-transition: background-color .5s linear;\n  transition: background-color .5s linear;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  will-change: opacity;\n  z-index: 1000;\n}\n.ui.dimmer>.content {\n  width: 100%;\n  height: 100%;\n  display: table;\n  -webkit-user-select: text;\n  -moz-user-select: text;\n  -ms-user-select: text;\n  user-select: text;\n}\n.ui.dimmer>.content>* {\n  display: table-cell;\n  vertical-align: middle;\n  color: #FFF;\n}\n.ui.segment>.ui.dimmer {\n  border-radius: inherit!important;\n}\n.animating.dimmable:not(body),\n.dimmed.dimmable:not(body) {\n  overflow: hidden;\n}\n.dimmed.dimmable>.ui.animating.dimmer,\n.dimmed.dimmable>.ui.visible.dimmer,\n.ui.active.dimmer {\n  display: block;\n  opacity: 1;\n}\n.ui.disabled.dimmer {\n  width: 0!important;\n  height: 0!important;\n}\n.ui.page.dimmer {\n  position: fixed;\n  -webkit-transform-style: '';\n  transform-style: '';\n  -webkit-perspective: 2000px;\n  perspective: 2000px;\n  -webkit-transform-origin: center center;\n  -ms-transform-origin: center center;\n  transform-origin: center center;\n}\nbody.animating.in.dimmable,\nbody.dimmed.dimmable {\n  overflow: hidden;\n}\nbody.dimmable>.dimmer {\n  position: fixed;\n}\n.blurring.dimmable>:not(.dimmer) {\n  -webkit-filter: blur(0) grayscale(0);\n  filter: blur(0) grayscale(0);\n  -webkit-transition: .8s filter ease;\n  transition: .8s filter ease;\n}\n.blurring.dimmed.dimmable>:not(.dimmer) {\n  -webkit-filter: blur(5px) grayscale(.7);\n  filter: blur(5px) grayscale(.7);\n}\n.blurring.dimmable>.dimmer {\n  background-color: rgba(0,0,0,.6);\n}\n.blurring.dimmable>.inverted.dimmer {\n  background-color: rgba(255,255,255,.6);\n}\n.ui.dimmer>.top.aligned.content>* {\n  vertical-align: top;\n}\n.ui.dimmer>.bottom.aligned.content>* {\n  vertical-align: bottom;\n}\n.ui.inverted.dimmer {\n  background-color: rgba(255,255,255,.85);\n}\n.ui.inverted.dimmer>.content>* {\n  color: #FFF;\n}\n.ui.simple.dimmer {\n  display: block;\n  overflow: hidden;\n  opacity: 1;\n  width: 0;\n  height: 0%;\n  z-index: -100;\n  background-color: rgba(0,0,0,0);\n}\n.dimmed.dimmable>.ui.simple.dimmer {\n  overflow: visible;\n  opacity: 1;\n  width: 100%;\n  height: 100%;\n  background-color: rgba(0,0,0,.85);\n  z-index: 1;\n}\n.ui.simple.inverted.dimmer {\n  background-color: rgba(255,255,255,0);\n}\n.dimmed.dimmable>.ui.simple.inverted.dimmer {\n  background-color: rgba(255,255,255,.85);\n}\n.ui.dropdown {\n  cursor: pointer;\n  position: relative;\n  display: inline-block;\n  outline: 0;\n  text-align: left;\n  -webkit-transition: box-shadow .1s ease,width .1s ease;\n  transition: box-shadow .1s ease,width .1s ease;\n  -webkit-tap-highlight-color: transparent;\n}\n.ui.dropdown .menu {\n  cursor: auto;\n  position: absolute;\n  display: none;\n  outline: 0;\n  top: 100%;\n  min-width: -webkit-max-content;\n  min-width: -moz-max-content;\n  min-width: max-content;\n  margin: 0;\n  padding: 0;\n  background: #FFF;\n  font-size: 1em;\n  text-shadow: none;\n  text-align: left;\n  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);\n  border: 1px solid rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n  z-index: 11;\n  will-change: transform,opacity;\n}\n.ui.dropdown .menu>* {\n  white-space: nowrap;\n}\n.ui.dropdown>input:not(.search):first-child,\n.ui.dropdown>select {\n  display: none!important;\n}\n.ui.dropdown>.dropdown.icon {\n  position: relative;\n  font-size: .85714286em;\n  margin: 0 0 0 1em;\n}\n.ui.dropdown .menu>.item .dropdown.icon {\n  width: auto;\n  float: right;\n  margin: 0 0 0 1em;\n}\n.ui.dropdown .menu>.item .dropdown.icon+.text {\n  margin-right: 1em;\n}\n.ui.dropdown>.text {\n  display: inline-block;\n  -webkit-transition: none;\n  transition: none;\n}\n.ui.dropdown .menu>.item {\n  position: relative;\n  cursor: pointer;\n  display: block;\n  border: none;\n  height: auto;\n  text-align: left;\n  border-top: none;\n  line-height: 1em;\n  color: rgba(0,0,0,.87);\n  padding: .78571429rem 1.14285714rem!important;\n  font-size: 1rem;\n  text-transform: none;\n  font-weight: 400;\n  box-shadow: none;\n  -webkit-touch-callout: none;\n}\n.ui.dropdown .menu>.item:first-child {\n  border-top-width: 0;\n}\n.ui.dropdown .menu .item>[class*=\"right floated\"],\n.ui.dropdown>.text>[class*=\"right floated\"] {\n  float: right!important;\n  margin-right: 0!important;\n  margin-left: 1em!important;\n}\n.ui.dropdown .menu .item>[class*=\"left floated\"],\n.ui.dropdown>.text>[class*=\"left floated\"] {\n  float: left!important;\n  margin-left: 0!important;\n  margin-right: 1em!important;\n}\n.ui.dropdown .menu .item>.flag.floated,\n.ui.dropdown .menu .item>.icon.floated,\n.ui.dropdown .menu .item>.image.floated,\n.ui.dropdown .menu .item>img.floated {\n  margin-top: 0;\n}\n.ui.dropdown .menu>.header {\n  margin: 1rem 0 .75rem;\n  padding: 0 1.14285714rem;\n  color: rgba(0,0,0,.85);\n  font-size: .78571429em;\n  font-weight: 700;\n  text-transform: uppercase;\n}\n.ui.dropdown .menu>.divider {\n  border-top: 1px solid rgba(34,36,38,.1);\n  height: 0;\n  margin: .5em 0;\n}\n.ui.dropdown .menu>.input {\n  width: auto;\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 1.14285714rem .78571429rem;\n  min-width: 10rem;\n}\n.ui.dropdown .menu>.header+.input {\n  margin-top: 0;\n}\n.ui.dropdown .menu>.input:not(.transparent) input {\n  padding: .5em 1em;\n}\n.ui.dropdown .menu>.input:not(.transparent) .button,\n.ui.dropdown .menu>.input:not(.transparent) .icon,\n.ui.dropdown .menu>.input:not(.transparent) .label {\n  padding-top: .5em;\n  padding-bottom: .5em;\n}\n.ui.dropdown .menu>.item>.description,\n.ui.dropdown>.text>.description {\n  float: right;\n  margin: 0 0 0 1em;\n  color: rgba(0,0,0,.4);\n}\n.ui.dropdown .menu>.message {\n  padding: .78571429rem 1.14285714rem;\n  font-weight: 400;\n}\n.ui.dropdown .menu>.message:not(.ui) {\n  color: rgba(0,0,0,.4);\n}\n.ui.dropdown .menu .menu {\n  top: 0!important;\n  left: 100%!important;\n  right: auto!important;\n  margin: 0 0 0 -.5em!important;\n  border-radius: .28571429rem!important;\n  z-index: 21!important;\n}\n.ui.dropdown .menu .menu:after {\n  display: none;\n}\n.ui.dropdown .menu>.item>.flag,\n.ui.dropdown .menu>.item>.icon,\n.ui.dropdown .menu>.item>.image,\n.ui.dropdown .menu>.item>.label,\n.ui.dropdown .menu>.item>img,\n.ui.dropdown>.text>.flag,\n.ui.dropdown>.text>.icon,\n.ui.dropdown>.text>.image,\n.ui.dropdown>.text>.label,\n.ui.dropdown>.text>img {\n  margin-top: 0;\n  margin-left: 0;\n  float: none;\n  margin-right: .78571429rem;\n}\n.ui.dropdown .menu>.item>.image,\n.ui.dropdown .menu>.item>img,\n.ui.dropdown>.text>.image,\n.ui.dropdown>.text>img {\n  display: inline-block;\n  vertical-align: middle;\n  width: auto;\n  max-height: 2em;\n}\n.ui.dropdown .ui.menu>.item:before,\n.ui.menu .ui.dropdown .menu>.item:before {\n  display: none;\n}\n.ui.menu .ui.dropdown .menu .active.item {\n  border-left: none;\n}\n.ui.buttons>.ui.dropdown:last-child .menu,\n.ui.menu .right.dropdown.item .menu,\n.ui.menu .right.menu .dropdown:last-child .menu {\n  left: auto;\n  right: 0;\n}\n.ui.label.dropdown .menu {\n  min-width: 100%;\n}\n.ui.dropdown.icon.button>.dropdown.icon {\n  margin: 0;\n}\n.ui.button.dropdown .menu {\n  min-width: 100%;\n}\n.ui.selection.dropdown {\n  cursor: pointer;\n  word-wrap: break-word;\n  line-height: 1em;\n  white-space: normal;\n  outline: 0;\n  -webkit-transform: rotateZ(0);\n  -ms-transform: rotate(0);\n  transform: rotateZ(0);\n  min-width: 14em;\n  min-height: 2.7142em;\n  background: #FFF;\n  display: inline-block;\n  padding: .78571429em 2.1em .78571429em 1em;\n  color: rgba(0,0,0,.87);\n  box-shadow: none;\n  border: 1px solid rgba(34,36,38,.15);\n  border-radius: .28571429rem;\n  -webkit-transition: box-shadow .1s ease,width .1s ease;\n  transition: box-shadow .1s ease,width .1s ease;\n}\n.ui.selection.dropdown.active,\n.ui.selection.dropdown.visible {\n  z-index: 10;\n}\nselect.ui.dropdown {\n  height: 38px;\n  padding: .5em;\n  border: 1px solid rgba(34,36,38,.15);\n  visibility: visible;\n}\n.ui.selection.dropdown>.delete.icon,\n.ui.selection.dropdown>.dropdown.icon,\n.ui.selection.dropdown>.search.icon {\n  cursor: pointer;\n  position: absolute;\n  width: auto;\n  height: auto;\n  line-height: 1.2142em;\n  top: .78571429em;\n  right: 1em;\n  z-index: 3;\n  margin: -.78571429em;\n  padding: .78571429em;\n  opacity: .8;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\n.ui.compact.selection.dropdown {\n  min-width: 0;\n}\n.ui.selection.dropdown .menu {\n  overflow-x: hidden;\n  overflow-y: auto;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  -webkit-overflow-scrolling: touch;\n  border-top-width: 0!important;\n  outline: 0;\n  margin: 0 -1px;\n  min-width: calc(100% + 2px);\n  width: calc(100% + 2px);\n  border-radius: 0 0 .28571429rem .28571429rem;\n  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\n.ui.selection.dropdown .menu:after,\n.ui.selection.dropdown .menu:before {\n  display: none;\n}\n.ui.selection.dropdown .menu>.message {\n  padding: .78571429rem 1.14285714rem;\n}\n@media only screen and (max-width:767px) {\n  .ui.selection.dropdown .menu {\n    max-height: 8.01428571rem;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.selection.dropdown .menu {\n    max-height: 10.68571429rem;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.selection.dropdown .menu {\n    max-height: 16.02857143rem;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.selection.dropdown .menu {\n    max-height: 21.37142857rem;\n  }\n}\n.ui.selection.dropdown .menu>.item {\n  border-top: 1px solid #FAFAFA;\n  padding: .78571429rem 1.14285714rem!important;\n  white-space: normal;\n  word-wrap: normal;\n}\n.ui.selection.dropdown .menu>.hidden.addition.item {\n  display: none;\n}\n.ui.selection.dropdown:hover {\n  border-color: rgba(34,36,38,.35);\n  box-shadow: none;\n}\n.ui.selection.active.dropdown,\n.ui.selection.active.dropdown .menu {\n  border-color: #96C8DA;\n  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);\n}\n.ui.selection.dropdown:focus {\n  border-color: #96C8DA;\n  box-shadow: none;\n}\n.ui.selection.dropdown:focus .menu {\n  border-color: #96C8DA;\n  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);\n}\n.ui.selection.visible.dropdown>.text:not(.default) {\n  font-weight: 400;\n  color: rgba(0,0,0,.8);\n}\n.ui.selection.active.dropdown:hover,\n.ui.selection.active.dropdown:hover .menu {\n  border-color: #96C8DA;\n  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);\n}\n.ui.active.selection.dropdown>.dropdown.icon,\n.ui.visible.selection.dropdown>.dropdown.icon {\n  opacity: 1;\n  z-index: 3;\n}\n.ui.active.selection.dropdown {\n  border-bottom-left-radius: 0!important;\n  border-bottom-right-radius: 0!important;\n}\n.ui.active.empty.selection.dropdown {\n  border-radius: .28571429rem!important;\n  box-shadow: none!important;\n}\n.ui.active.empty.selection.dropdown .menu {\n  border: none!important;\n  box-shadow: none!important;\n}\n.ui.search.dropdown {\n  min-width: '';\n}\n.ui.search.dropdown>input.search {\n  background: none!important;\n  border: none!important;\n  box-shadow: none!important;\n  cursor: text;\n  top: 0;\n  left: 1px;\n  width: 100%;\n  outline: 0;\n  -webkit-tap-highlight-color: rgba(255,255,255,0);\n  padding: inherit;\n  position: absolute;\n  z-index: 2;\n}\n.ui.search.dropdown>.text {\n  cursor: text;\n  position: relative;\n  left: 1px;\n  z-index: 3;\n}\n.ui.search.selection.dropdown>input.search {\n  line-height: 1.2142em;\n  padding: .67861429em 2.1em .67861429em 1em;\n}\n.ui.search.selection.dropdown>span.sizer {\n  line-height: 1.2142em;\n  padding: .67861429em 2.1em .67861429em 1em;\n  display: none;\n  white-space: pre;\n}\n.ui.search.dropdown.active>input.search,\n.ui.search.dropdown.visible>input.search {\n  cursor: auto;\n}\n.ui.search.dropdown.active>.text,\n.ui.search.dropdown.visible>.text {\n  pointer-events: none;\n}\n.ui.active.search.dropdown input.search:focus+.text .flag,\n.ui.active.search.dropdown input.search:focus+.text .icon {\n  opacity: .45;\n}\n.ui.active.search.dropdown input.search:focus+.text {\n  color: rgba(115,115,115,.87)!important;\n}\n.ui.search.dropdown .menu {\n  overflow-x: hidden;\n  overflow-y: auto;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  -webkit-overflow-scrolling: touch;\n}\n@media only screen and (max-width:767px) {\n  .ui.search.dropdown .menu {\n    max-height: 8.01428571rem;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.search.dropdown .menu {\n    max-height: 10.68571429rem;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.search.dropdown .menu {\n    max-height: 16.02857143rem;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.search.dropdown .menu {\n    max-height: 21.37142857rem;\n  }\n}\n.ui.multiple.dropdown {\n  padding: .22620476em 2.1em .22620476em .35714286em;\n}\n.ui.multiple.dropdown .menu {\n  cursor: auto;\n}\n.ui.multiple.search.dropdown,\n.ui.multiple.search.dropdown>input.search {\n  cursor: text;\n}\n.ui.multiple.dropdown>.label {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  display: inline-block;\n  vertical-align: top;\n  white-space: normal;\n  font-size: 1em;\n  padding: .35714286em .78571429em;\n  margin: .14285714rem .28571429rem .14285714rem 0;\n  box-shadow: 0 0 0 1px rgba(34,36,38,.15) inset;\n}\n.ui.multiple.dropdown .dropdown.icon {\n  margin: '';\n  padding: '';\n}\n.ui.multiple.dropdown>.text {\n  position: static;\n  padding: 0;\n  max-width: 100%;\n  margin: .45240952em 0 .45240952em .64285714em;\n  line-height: 1.21428571em;\n}\n.ui.multiple.dropdown>.label~input.search {\n  margin-left: .14285714em!important;\n}\n.ui.multiple.dropdown>.label~.text {\n  display: none;\n}\n.ui.multiple.search.dropdown>.text {\n  display: inline-block;\n  position: absolute;\n  top: 0;\n  left: 0;\n  padding: inherit;\n  margin: .45240952em 0 .45240952em .64285714em;\n  line-height: 1.21428571em;\n}\n.ui.multiple.search.dropdown>.label~.text {\n  display: none;\n}\n.ui.multiple.search.dropdown>input.search {\n  position: static;\n  padding: 0;\n  max-width: 100%;\n  margin: .45240952em 0 .45240952em .64285714em;\n  width: 2.2em;\n  line-height: 1.21428571em;\n}\n.ui.inline.dropdown {\n  cursor: pointer;\n  display: inline-block;\n  color: inherit;\n}\n.ui.inline.dropdown .dropdown.icon {\n  margin: 0 .5em 0 .21428571em;\n  vertical-align: baseline;\n}\n.ui.inline.dropdown>.text {\n  font-weight: 700;\n}\n.ui.inline.dropdown .menu {\n  cursor: auto;\n  margin-top: .21428571em;\n  border-radius: .28571429rem;\n}\n.ui.dropdown .menu .active.item {\n  background: 0 0;\n  font-weight: 700;\n  color: rgba(0,0,0,.95);\n  box-shadow: none;\n  z-index: 12;\n}\n.ui.dropdown .menu>.item:hover {\n  background: rgba(0,0,0,.05);\n  color: rgba(0,0,0,.95);\n  z-index: 13;\n}\n.ui.loading.dropdown>i.icon {\n  height: 1em!important;\n  padding: 1.14285714em 1.07142857em!important;\n}\n.ui.loading.dropdown>i.icon:before {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.1);\n}\n.ui.loading.dropdown>i.icon:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  box-shadow: 0 0 0 1px transparent;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  -webkit-animation: dropdown-spin .6s linear;\n  animation: dropdown-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n}\n.ui.loading.dropdown.button>i.icon:after,\n.ui.loading.dropdown.button>i.icon:before {\n  display: none;\n}\n@-webkit-keyframes dropdown-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n@keyframes dropdown-spin {\n  from {\n    -webkit-transform: rotate(0);\n    transform: rotate(0);\n  }\n\n  to {\n    -webkit-transform: rotate(360deg);\n    transform: rotate(360deg);\n  }\n}\n.ui.default.dropdown:not(.button)>.text,\n.ui.dropdown:not(.button)>.default.text {\n  color: rgba(191,191,191,.87);\n}\n.ui.default.dropdown:not(.button)>input:focus+.text,\n.ui.dropdown:not(.button)>input:focus+.default.text {\n  color: rgba(115,115,115,.87);\n}\n.ui.loading.dropdown>.text {\n  -webkit-transition: none;\n  transition: none;\n}\n.ui.dropdown .loading.menu {\n  display: block;\n  visibility: hidden;\n  z-index: -1;\n}\n.ui.dropdown .menu .selected.item,\n.ui.dropdown.selected {\n  background: rgba(0,0,0,.03);\n  color: rgba(0,0,0,.95);\n}\n.ui.dropdown>.filtered.text {\n  visibility: hidden;\n}\n.ui.dropdown .filtered.item {\n  display: none!important;\n}\n.ui.dropdown.error,\n.ui.dropdown.error>.default.text,\n.ui.dropdown.error>.text {\n  color: #9F3A38;\n}\n.ui.selection.dropdown.error {\n  background: #FFF6F6;\n  border-color: #E0B4B4;\n}\n.ui.dropdown.error>.menu,\n.ui.dropdown.error>.menu .menu,\n.ui.selection.dropdown.error:hover {\n  border-color: #E0B4B4;\n}\n.ui.dropdown.error>.menu>.item {\n  color: #9F3A38;\n}\n.ui.multiple.selection.error.dropdown>.label {\n  border-color: #E0B4B4;\n}\n.ui.dropdown.error>.menu>.item:hover {\n  background-color: #FFF2F2;\n}\n.ui.dropdown.error>.menu .active.item {\n  background-color: #FDCFCF;\n}\n.ui.disabled.dropdown,\n.ui.dropdown .menu>.disabled.item {\n  cursor: default;\n  pointer-events: none;\n  opacity: .45;\n}\n.ui.dropdown .menu {\n  left: 0;\n}\n.ui.dropdown .menu .right.menu,\n.ui.dropdown .right.menu>.menu {\n  left: 100%!important;\n  right: auto!important;\n  border-radius: .28571429rem!important;\n}\n.ui.dropdown .menu .left.menu,\n.ui.dropdown>.left.menu .menu {\n  left: auto!important;\n  right: 100%!important;\n  border-radius: .28571429rem!important;\n}\n.ui.dropdown .item .left.dropdown.icon,\n.ui.dropdown .left.menu .item .dropdown.icon {\n  width: auto;\n  float: left;\n  margin: 0 .78571429rem 0 0;\n}\n.ui.dropdown .item .left.dropdown.icon+.text,\n.ui.dropdown .left.menu .item .dropdown.icon+.text {\n  margin-left: 1em;\n}\n.ui.upward.dropdown>.menu {\n  top: auto;\n  bottom: 100%;\n  box-shadow: 0 0 3px 0 rgba(0,0,0,.08);\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.dropdown .upward.menu {\n  top: auto!important;\n  bottom: 0!important;\n}\n.ui.simple.upward.active.dropdown,\n.ui.simple.upward.dropdown:hover {\n  border-radius: .28571429rem .28571429rem 0 0!important;\n}\n.ui.upward.dropdown.button:not(.pointing):not(.floating).active {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.upward.selection.dropdown .menu {\n  border-top-width: 1px!important;\n  border-bottom-width: 0!important;\n  box-shadow: 0 -2px 3px 0 rgba(0,0,0,.08);\n}\n.ui.upward.selection.dropdown:hover {\n  box-shadow: 0 0 2px 0 rgba(0,0,0,.05);\n}\n.ui.active.upward.selection.dropdown {\n  border-radius: 0 0 .28571429rem .28571429rem!important;\n}\n.ui.upward.selection.dropdown.visible {\n  box-shadow: 0 0 3px 0 rgba(0,0,0,.08);\n  border-radius: 0 0 .28571429rem .28571429rem!important;\n}\n.ui.upward.active.selection.dropdown:hover {\n  box-shadow: 0 0 3px 0 rgba(0,0,0,.05);\n}\n.ui.upward.active.selection.dropdown:hover .menu {\n  box-shadow: 0 -2px 3px 0 rgba(0,0,0,.08);\n}\n.ui.dropdown .scrolling.menu,\n.ui.scrolling.dropdown .menu {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.ui.scrolling.dropdown .menu {\n  overflow-x: hidden;\n  overflow-y: auto;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  -webkit-overflow-scrolling: touch;\n  min-width: 100%!important;\n  width: auto!important;\n}\n.ui.dropdown .scrolling.menu {\n  position: static;\n  overflow-y: auto;\n  border: none;\n  box-shadow: none!important;\n  border-radius: 0!important;\n  margin: 0!important;\n  min-width: 100%!important;\n  width: auto!important;\n  border-top: 1px solid rgba(34,36,38,.15);\n}\n.ui.dropdown .scrolling.menu>.item.item.item,\n.ui.scrolling.dropdown .menu .item.item.item {\n  border-top: none;\n  padding-right: calc(1.14285714rem + 17px)!important;\n}\n.ui.dropdown .scrolling.menu .item:first-child,\n.ui.scrolling.dropdown .menu .item:first-child {\n  border-top: none;\n}\n.ui.dropdown>.animating.menu .scrolling.menu,\n.ui.dropdown>.visible.menu .scrolling.menu {\n  display: block;\n}\n@media all and (-ms-high-contrast:none) {\n  .ui.dropdown .scrolling.menu,\n  .ui.scrolling.dropdown .menu {\n    min-width: calc(100% - 17px);\n  }\n}\n@media only screen and (max-width:767px) {\n  .ui.dropdown .scrolling.menu,\n  .ui.scrolling.dropdown .menu {\n    max-height: 10.28571429rem;\n  }\n}\n.ui.simple.dropdown .menu:after,\n.ui.simple.dropdown .menu:before {\n  display: none;\n}\n.ui.simple.dropdown .menu {\n  position: absolute;\n  display: block;\n  overflow: hidden;\n  top: -9999px!important;\n  opacity: 0;\n  width: 0;\n  height: 0;\n  -webkit-transition: opacity .1s ease;\n  transition: opacity .1s ease;\n}\n.ui.simple.active.dropdown,\n.ui.simple.dropdown:hover {\n  border-bottom-left-radius: 0!important;\n  border-bottom-right-radius: 0!important;\n}\n.ui.simple.active.dropdown>.menu,\n.ui.simple.dropdown:hover>.menu {\n  overflow: visible;\n  width: auto;\n  height: auto;\n  top: 100%!important;\n  opacity: 1;\n}\n.ui.simple.dropdown:hover>.menu>.item:hover>.menu,\n.ui.simple.dropdown>.menu>.item:active>.menu {\n  overflow: visible;\n  width: auto;\n  height: auto;\n  top: 0!important;\n  left: 100%!important;\n  opacity: 1;\n}\n.ui.simple.disabled.dropdown:hover .menu {\n  display: none;\n  height: 0;\n  width: 0;\n  overflow: hidden;\n}\n.ui.simple.visible.dropdown>.menu {\n  display: block;\n}\n.ui.fluid.dropdown {\n  display: block;\n  width: 100%;\n  min-width: 0;\n}\n.ui.fluid.dropdown>.dropdown.icon {\n  float: right;\n}\n.ui.floating.dropdown .menu {\n  left: 0;\n  right: auto;\n  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15)!important;\n  border-radius: .28571429rem!important;\n}\n.ui.floating.dropdown>.menu {\n  margin-top: .5em!important;\n  border-radius: .28571429rem!important;\n}\n.ui.pointing.dropdown>.menu {\n  top: 100%;\n  margin-top: .78571429rem;\n  border-radius: .28571429rem;\n}\n.ui.pointing.dropdown>.menu:after {\n  display: block;\n  position: absolute;\n  pointer-events: none;\n  content: '';\n  visibility: visible;\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n  width: .5em;\n  height: .5em;\n  box-shadow: -1px -1px 0 1px rgba(34,36,38,.15);\n  background: #FFF;\n  z-index: 2;\n  top: -.25em;\n  left: 50%;\n  margin: 0 0 0 -.25em;\n}\n.ui.top.left.pointing.dropdown>.menu {\n  top: 100%;\n  bottom: auto;\n  left: 0;\n  right: auto;\n  margin: 1em 0 0;\n}\n.ui.top.left.pointing.dropdown>.menu:after {\n  top: -.25em;\n  left: 1em;\n  right: auto;\n  margin: 0;\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n}\n.ui.top.right.pointing.dropdown>.menu {\n  top: 100%;\n  bottom: auto;\n  right: 0;\n  left: auto;\n  margin: 1em 0 0;\n}\n.ui.top.right.pointing.dropdown>.menu:after {\n  top: -.25em;\n  left: auto;\n  right: 1em;\n  margin: 0;\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n}\n.ui.left.pointing.dropdown>.menu {\n  top: 0;\n  left: 100%;\n  right: auto;\n  margin: 0 0 0 1em;\n}\n.ui.left.pointing.dropdown>.menu:after {\n  top: 1em;\n  left: -.25em;\n  margin: 0;\n  -webkit-transform: rotate(-45deg);\n  -ms-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n}\n.ui.right.pointing.dropdown>.menu {\n  top: 0;\n  left: auto;\n  right: 100%;\n  margin: 0 1em 0 0;\n}\n.ui.right.pointing.dropdown>.menu:after {\n  top: 1em;\n  left: auto;\n  right: -.25em;\n  margin: 0;\n  -webkit-transform: rotate(135deg);\n  -ms-transform: rotate(135deg);\n  transform: rotate(135deg);\n}\n.ui.bottom.pointing.dropdown>.menu {\n  top: auto;\n  bottom: 100%;\n  left: 0;\n  right: auto;\n  margin: 0 0 1em;\n}\n.ui.bottom.pointing.dropdown>.menu:after {\n  top: auto;\n  bottom: -.25em;\n  right: auto;\n  margin: 0;\n  -webkit-transform: rotate(-135deg);\n  -ms-transform: rotate(-135deg);\n  transform: rotate(-135deg);\n}\n.ui.bottom.pointing.dropdown>.menu .menu {\n  top: auto!important;\n  bottom: 0!important;\n}\n.ui.bottom.left.pointing.dropdown>.menu {\n  left: 0;\n  right: auto;\n}\n.ui.bottom.left.pointing.dropdown>.menu:after {\n  left: 1em;\n  right: auto;\n}\n.ui.bottom.right.pointing.dropdown>.menu {\n  right: 0;\n  left: auto;\n}\n.ui.bottom.right.pointing.dropdown>.menu:after {\n  left: auto;\n  right: 1em;\n}\n.ui.upward.pointing.dropdown>.menu,\n.ui.upward.top.pointing.dropdown>.menu {\n  top: auto;\n  bottom: 100%;\n  margin: 0 0 .78571429rem;\n  border-radius: .28571429rem;\n}\n.ui.upward.pointing.dropdown>.menu:after,\n.ui.upward.top.pointing.dropdown>.menu:after {\n  top: 100%;\n  bottom: auto;\n  box-shadow: 1px 1px 0 1px rgba(34,36,38,.15);\n  margin: -.25em 0 0;\n}\n@font-face {\n  font-family: Dropdown;\n  src: url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMggjB5AAAAC8AAAAYGNtYXAPfuIIAAABHAAAAExnYXNwAAAAEAAAAWgAAAAIZ2x5Zjo82LgAAAFwAAABVGhlYWQAQ88bAAACxAAAADZoaGVhAwcB6QAAAvwAAAAkaG10eAS4ABIAAAMgAAAAIGxvY2EBNgDeAAADQAAAABJtYXhwAAoAFgAAA1QAAAAgbmFtZVcZpu4AAAN0AAABRXBvc3QAAwAAAAAEvAAAACAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADw2gHg/+D/4AHgACAAAAABAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEADgAAAAKAAgAAgACAAEAIPDa//3//wAAAAAAIPDX//3//wAB/+MPLQADAAEAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAIABJQElABMAABM0NzY3BTYXFhUUDwEGJwYvASY1AAUGBwEACAUGBoAFCAcGgAUBEgcGBQEBAQcECQYHfwYBAQZ/BwYAAQAAAG4BJQESABMAADc0PwE2MzIfARYVFAcGIyEiJyY1AAWABgcIBYAGBgUI/wAHBgWABwaABQWABgcHBgUFBgcAAAABABIASQC3AW4AEwAANzQ/ATYXNhcWHQEUBwYnBi8BJjUSBoAFCAcFBgYFBwgFgAbbBwZ/BwEBBwQJ/wgEBwEBB38GBgAAAAABAAAASQClAW4AEwAANxE0NzYzMh8BFhUUDwEGIyInJjUABQYHCAWABgaABQgHBgVbAQAIBQYGgAUIBwWABgYFBwAAAAEAAAABAADZuaKOXw889QALAgAAAAAA0ABHWAAAAADQAEdYAAAAAAElAW4AAAAIAAIAAAAAAAAAAQAAAeD/4AAAAgAAAAAAASUAAQAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAABAAAAASUAAAElAAAAtwASALcAAAAAAAAACgAUAB4AQgBkAIgAqgAAAAEAAAAIABQAAQAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAOAK4AAQAAAAAAAQAOAAAAAQAAAAAAAgAOAEcAAQAAAAAAAwAOACQAAQAAAAAABAAOAFUAAQAAAAAABQAWAA4AAQAAAAAABgAHADIAAQAAAAAACgA0AGMAAwABBAkAAQAOAAAAAwABBAkAAgAOAEcAAwABBAkAAwAOACQAAwABBAkABAAOAFUAAwABBAkABQAWAA4AAwABBAkABgAOADkAAwABBAkACgA0AGMAaQBjAG8AbQBvAG8AbgBWAGUAcgBzAGkAbwBuACAAMQAuADAAaQBjAG8AbQBvAG8Abmljb21vb24AaQBjAG8AbQBvAG8AbgBSAGUAZwB1AGwAYQByAGkAYwBvAG0AbwBvAG4ARgBvAG4AdAAgAGcAZQBuAGUAcgBhAHQAZQBkACAAYgB5ACAASQBjAG8ATQBvAG8AbgAuAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=) format('truetype'),url(data:application/font-woff;charset=utf-8;base64,d09GRk9UVE8AAAVwAAoAAAAABSgAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAAdkAAAHZLDXE/09TLzIAAALQAAAAYAAAAGAIIweQY21hcAAAAzAAAABMAAAATA9+4ghnYXNwAAADfAAAAAgAAAAIAAAAEGhlYWQAAAOEAAAANgAAADYAQ88baGhlYQAAA7wAAAAkAAAAJAMHAelobXR4AAAD4AAAACAAAAAgBLgAEm1heHAAAAQAAAAABgAAAAYACFAAbmFtZQAABAgAAAFFAAABRVcZpu5wb3N0AAAFUAAAACAAAAAgAAMAAAEABAQAAQEBCGljb21vb24AAQIAAQA6+BwC+BsD+BgEHgoAGVP/i4seCgAZU/+LiwwHi2v4lPh0BR0AAACIDx0AAACNER0AAAAJHQAAAdASAAkBAQgPERMWGyAlKmljb21vb25pY29tb29udTB1MXUyMHVGMEQ3dUYwRDh1RjBEOXVGMERBAAACAYkABgAIAgABAAQABwAKAA0AVgCfAOgBL/yUDvyUDvyUDvuUDvtvi/emFYuQjZCOjo+Pj42Qiwj3lIsFkIuQiY6Hj4iNhouGi4aJh4eHCPsU+xQFiIiGiYaLhouHjYeOCPsU9xQFiI+Jj4uQCA77b4v3FBWLkI2Pjo8I9xT3FAWPjo+NkIuQi5CJjogI9xT7FAWPh42Hi4aLhomHh4eIiIaJhosI+5SLBYaLh42HjoiPiY+LkAgO+92d928Vi5CNkI+OCPcU9xQFjo+QjZCLkIuPiY6Hj4iNhouGCIv7lAWLhomHh4iIh4eJhouGi4aNiI8I+xT3FAWHjomPi5AIDvvdi+YVi/eUBYuQjZCOjo+Pj42Qi5CLkImOhwj3FPsUBY+IjYaLhouGiYeHiAj7FPsUBYiHhomGi4aLh42Hj4iOiY+LkAgO+JQU+JQViwwKAAAAAAMCAAGQAAUAAAFMAWYAAABHAUwBZgAAAPUAGQCEAAAAAAAAAAAAAAAAAAAAARAAAAAAAAAAAAAAAAAAAAAAQAAA8NoB4P/g/+AB4AAgAAAAAQAAAAAAAAAAAAAAIAAAAAAAAgAAAAMAAAAUAAMAAQAAABQABAA4AAAACgAIAAIAAgABACDw2v/9//8AAAAAACDw1//9//8AAf/jDy0AAwABAAAAAAAAAAAAAAABAAH//wAPAAEAAAABAAA5emozXw889QALAgAAAAAA0ABHWAAAAADQAEdYAAAAAAElAW4AAAAIAAIAAAAAAAAAAQAAAeD/4AAAAgAAAAAAASUAAQAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAABAAAAASUAAAElAAAAtwASALcAAAAAUAAACAAAAAAADgCuAAEAAAAAAAEADgAAAAEAAAAAAAIADgBHAAEAAAAAAAMADgAkAAEAAAAAAAQADgBVAAEAAAAAAAUAFgAOAAEAAAAAAAYABwAyAAEAAAAAAAoANABjAAMAAQQJAAEADgAAAAMAAQQJAAIADgBHAAMAAQQJAAMADgAkAAMAAQQJAAQADgBVAAMAAQQJAAUAFgAOAAMAAQQJAAYADgA5AAMAAQQJAAoANABjAGkAYwBvAG0AbwBvAG4AVgBlAHIAcwBpAG8AbgAgADEALgAwAGkAYwBvAG0AbwBvAG5pY29tb29uAGkAYwBvAG0AbwBvAG4AUgBlAGcAdQBsAGEAcgBpAGMAbwBtAG8AbwBuAEYAbwBuAHQAIABnAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAEkAYwBvAE0AbwBvAG4ALgAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) format('woff');\n  font-weight: 400;\n  font-style: normal;\n}\n.ui.dropdown>.dropdown.icon {\n  font-family: Dropdown;\n  line-height: 1;\n  height: 1em;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  font-weight: 400;\n  font-style: normal;\n  text-align: center;\n  width: auto;\n}\n.ui.dropdown>.dropdown.icon:before {\n  content: '\\f0d7';\n}\n.ui.dropdown .menu .item .dropdown.icon:before {\n  content: '\\f0da';\n}\n.ui.dropdown .item .left.dropdown.icon:before,\n.ui.dropdown .left.menu .item .dropdown.icon:before {\n  content: \"\\f0d9\";\n}\n.ui.vertical.menu .dropdown.item>.dropdown.icon:before {\n  content: \"\\f0da\";\n}\n.ui.embed {\n  position: relative;\n  max-width: 100%;\n  height: 0;\n  overflow: hidden;\n  background: #DCDDDE;\n  padding-bottom: 56.25%;\n}\n.ui.embed embed,\n.ui.embed iframe,\n.ui.embed object {\n  position: absolute;\n  border: none;\n  width: 100%;\n  height: 100%;\n  top: 0;\n  left: 0;\n  margin: 0;\n  padding: 0;\n}\n.ui.embed>.embed {\n  display: none;\n}\n.ui.embed>.placeholder {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  display: block;\n  width: 100%;\n  height: 100%;\n  background-color: radial-gradient(transparent 45%,rgba(0,0,0,.3));\n}\n.ui.embed>.icon {\n  cursor: pointer;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 2;\n}\n.ui.embed>.icon:after {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  z-index: 3;\n  content: '';\n  background: -webkit-radial-gradient(transparent 45%,rgba(0,0,0,.3));\n  background: radial-gradient(transparent 45%,rgba(0,0,0,.3));\n  opacity: .5;\n  -webkit-transition: opacity .5s ease;\n  transition: opacity .5s ease;\n}\n.ui.embed>.icon:before {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  -webkit-transform: translateX(-50%) translateY(-50%);\n  -ms-transform: translateX(-50%) translateY(-50%);\n  transform: translateX(-50%) translateY(-50%);\n  color: #FFF;\n  font-size: 6rem;\n  text-shadow: 0 2px 10px rgba(34,36,38,.2);\n  -webkit-transition: opacity .5s ease,color .5s ease;\n  transition: opacity .5s ease,color .5s ease;\n  z-index: 10;\n}\n.ui.embed .icon:hover:after {\n  background: -webkit-radial-gradient(transparent 45%,rgba(0,0,0,.3));\n  background: radial-gradient(transparent 45%,rgba(0,0,0,.3));\n  opacity: 1;\n}\n.ui.embed .icon:hover:before {\n  color: #FFF;\n}\n.ui.active.embed>.icon,\n.ui.active.embed>.placeholder {\n  display: none;\n}\n.ui.active.embed>.embed {\n  display: block;\n}\n.ui.square.embed {\n  padding-bottom: 100%;\n}\n.ui[class*=\"4:3\"].embed {\n  padding-bottom: 75%;\n}\n.ui[class*=\"16:9\"].embed {\n  padding-bottom: 56.25%;\n}\n.ui[class*=\"21:9\"].embed {\n  padding-bottom: 42.85714286%;\n}\n.ui.modal {\n  display: none;\n  position: fixed;\n  z-index: 1001;\n  top: 50%;\n  left: 50%;\n  text-align: left;\n  background: #FFF;\n  border: none;\n  box-shadow: 1px 3px 3px 0 rgba(0,0,0,.2),1px 3px 15px 2px rgba(0,0,0,.2);\n  -webkit-transform-origin: 50% 25%;\n  -ms-transform-origin: 50% 25%;\n  transform-origin: 50% 25%;\n  border-radius: .28571429rem;\n  -webkit-user-select: text;\n  -moz-user-select: text;\n  -ms-user-select: text;\n  user-select: text;\n  will-change: top,left,margin,transform,opacity;\n}\n.ui.modal>.icon:first-child+*,\n.ui.modal>:first-child:not(.icon) {\n  border-top-left-radius: .28571429rem;\n  border-top-right-radius: .28571429rem;\n}\n.ui.modal>:last-child {\n  border-bottom-left-radius: .28571429rem;\n  border-bottom-right-radius: .28571429rem;\n}\n.ui.modal>.close {\n  cursor: pointer;\n  position: absolute;\n  top: -2.5rem;\n  right: -2.5rem;\n  z-index: 1;\n  opacity: .8;\n  font-size: 1.25em;\n  color: #FFF;\n  width: 2.25rem;\n  height: 2.25rem;\n  padding: .625rem 0 0;\n}\n.ui.modal>.close:hover {\n  opacity: 1;\n}\n.ui.modal>.header {\n  display: block;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  background: #FFF;\n  margin: 0;\n  padding: 1.25rem 1.5rem;\n  box-shadow: none;\n  color: rgba(0,0,0,.85);\n  border-bottom: 1px solid rgba(34,36,38,.15);\n}\n.ui.modal>.header:not(.ui) {\n  font-size: 1.42857143rem;\n  line-height: 1.2857em;\n  font-weight: 700;\n}\n.ui.modal>.content {\n  display: block;\n  width: 100%;\n  font-size: 1em;\n  line-height: 1.4;\n  padding: 1.5rem;\n  background: #FFF;\n}\n.ui.modal>.image.content {\n  display: -webkit-box;\n  display: -webkit-flex;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n  -webkit-flex-direction: row;\n  -ms-flex-direction: row;\n  flex-direction: row;\n}\n.ui.modal>.content>.image {\n  display: block;\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  width: '';\n  -webkit-align-self: top;\n  -ms-flex-item-align: top;\n  align-self: top;\n}\n.ui.modal>[class*=\"top aligned\"] {\n  -webkit-align-self: top;\n  -ms-flex-item-align: top;\n  align-self: top;\n}\n.ui.modal>[class*=\"middle aligned\"] {\n  -webkit-align-self: middle;\n  -ms-flex-item-align: middle;\n  align-self: middle;\n}\n.ui.modal>[class*=stretched] {\n  -webkit-align-self: stretch;\n  -ms-flex-item-align: stretch;\n  align-self: stretch;\n}\n.ui.modal>.content>.description {\n  display: block;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  min-width: 0;\n  -webkit-align-self: top;\n  -ms-flex-item-align: top;\n  align-self: top;\n}\n.ui.modal>.content>.icon+.description,\n.ui.modal>.content>.image+.description {\n  -webkit-box-flex: 0;\n  -webkit-flex: 0 1 auto;\n  -ms-flex: 0 1 auto;\n  flex: 0 1 auto;\n  min-width: '';\n  width: auto;\n  padding-left: 2em;\n}\n.ui.modal>.content>.image>i.icon {\n  margin: 0;\n  opacity: 1;\n  width: auto;\n  line-height: 1;\n  font-size: 8rem;\n}\n.ui.modal>.actions {\n  background: #F9FAFB;\n  padding: 1rem;\n  border-top: 1px solid rgba(34,36,38,.15);\n  text-align: right;\n}\n.ui.modal .actions>.button {\n  margin-left: .75em;\n}\n@media only screen and (max-width:767px) {\n  .ui.modal {\n    width: 95%;\n    margin: 0 0 0 -47.5%;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.dropdown .scrolling.menu,\n  .ui.scrolling.dropdown .menu {\n    max-height: 15.42857143rem;\n  }\n\n  .ui.modal {\n    width: 88%;\n    margin: 0 0 0 -44%;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.dropdown .scrolling.menu,\n  .ui.scrolling.dropdown .menu {\n    max-height: 20.57142857rem;\n  }\n\n  .ui.modal {\n    width: 850px;\n    margin: 0 0 0 -425px;\n  }\n}\n@media only screen and (min-width:1200px) {\n  .ui.modal {\n    width: 900px;\n    margin: 0 0 0 -450px;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.dropdown .scrolling.menu,\n  .ui.scrolling.dropdown .menu {\n    max-height: 20.57142857rem;\n  }\n\n  .ui.modal {\n    width: 950px;\n    margin: 0 0 0 -475px;\n  }\n}\n@media only screen and (max-width:991px) {\n  .ui.modal>.header {\n    padding-right: 2.25rem;\n  }\n\n  .ui.modal>.close {\n    top: 1.0535rem;\n    right: 1rem;\n    color: rgba(0,0,0,.87);\n  }\n}\n@media only screen and (max-width:767px) {\n  .ui.modal>.header {\n    padding: .75rem 2.25rem .75rem 1rem!important;\n  }\n\n  .ui.modal>.content {\n    display: block;\n    padding: 1rem!important;\n  }\n\n  .ui.modal>.close {\n    top: .5rem!important;\n    right: .5rem!important;\n  }\n\n  .ui.modal .image.content {\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n    -webkit-flex-direction: column;\n    -ms-flex-direction: column;\n    flex-direction: column;\n  }\n\n  .ui.modal .content>.image {\n    display: block;\n    max-width: 100%;\n    margin: 0 auto!important;\n    text-align: center;\n    padding: 0 0 1rem!important;\n  }\n\n  .ui.modal>.content>.image>i.icon {\n    font-size: 5rem;\n    text-align: center;\n  }\n\n  .ui.modal .content>.description {\n    display: block;\n    width: 100%!important;\n    margin: 0!important;\n    padding: 1rem 0!important;\n    box-shadow: none;\n  }\n\n  .ui.modal>.actions {\n    padding: 1rem 1rem 0!important;\n  }\n\n  .ui.modal .actions>.button,\n  .ui.modal .actions>.buttons {\n    margin-bottom: 1rem;\n  }\n}\n.ui.inverted.dimmer>.ui.modal {\n  box-shadow: 1px 3px 10px 2px rgba(0,0,0,.2);\n}\n.ui.basic.modal {\n  background-color: transparent;\n  border: none;\n  border-radius: 0;\n  box-shadow: none!important;\n  color: #FFF;\n}\n.ui.basic.modal>.actions,\n.ui.basic.modal>.content,\n.ui.basic.modal>.header {\n  background-color: transparent;\n}\n.ui.basic.modal>.header {\n  color: #FFF;\n}\n.ui.basic.modal>.close {\n  top: 1rem;\n  right: 1.5rem;\n}\n.ui.inverted.dimmer>.basic.modal {\n  color: rgba(0,0,0,.87);\n}\n.ui.inverted.dimmer>.ui.basic.modal>.header {\n  color: rgba(0,0,0,.85);\n}\n.ui.active.modal {\n  display: block;\n}\n.scrolling.dimmable.dimmed {\n  overflow: hidden;\n}\n.scrolling.dimmable.dimmed>.dimmer {\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n}\n.scrolling.dimmable>.dimmer {\n  position: fixed;\n}\n.modals.dimmer .ui.scrolling.modal {\n  position: static!important;\n  margin: 3.5rem auto!important;\n}\n.scrolling.undetached.dimmable.dimmed {\n  overflow: auto;\n  -webkit-overflow-scrolling: touch;\n}\n.scrolling.undetached.dimmable.dimmed>.dimmer {\n  overflow: hidden;\n}\n.scrolling.undetached.dimmable .ui.scrolling.modal {\n  position: absolute;\n  left: 50%;\n  margin-top: 3.5rem!important;\n}\n.undetached.dimmable.dimmed>.pusher {\n  z-index: auto;\n}\n@media only screen and (max-width:991px) {\n  .ui.basic.modal>.close {\n    color: #FFF;\n  }\n\n  .modals.dimmer .ui.scrolling.modal {\n    margin-top: 1rem!important;\n    margin-bottom: 1rem!important;\n  }\n}\n.ui.fullscreen.modal {\n  width: 95%!important;\n  left: 2.5%!important;\n  margin: 1em auto;\n}\n.ui.fullscreen.scrolling.modal {\n  left: 0!important;\n}\n.ui.fullscreen.modal>.header {\n  padding-right: 2.25rem;\n}\n.ui.fullscreen.modal>.close {\n  top: 1.0535rem;\n  right: 1rem;\n  color: rgba(0,0,0,.87);\n}\n.ui.modal {\n  font-size: 1rem;\n}\n.ui.small.modal>.header:not(.ui) {\n  font-size: 1.3em;\n}\n@media only screen and (max-width:767px) {\n  .ui.small.modal {\n    width: 95%;\n    margin: 0 0 0 -47.5%;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.small.modal {\n    width: 70.4%;\n    margin: 0 0 0 -35.2%;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.small.modal {\n    width: 680px;\n    margin: 0 0 0 -340px;\n  }\n}\n@media only screen and (min-width:1200px) {\n  .ui.small.modal {\n    width: 720px;\n    margin: 0 0 0 -360px;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.small.modal {\n    width: 760px;\n    margin: 0 0 0 -380px;\n  }\n}\n.ui.large.modal>.header {\n  font-size: 1.6em;\n}\n@media only screen and (max-width:767px) {\n  .ui.large.modal {\n    width: 95%;\n    margin: 0 0 0 -47.5%;\n  }\n}\n@media only screen and (min-width:768px) {\n  .ui.large.modal {\n    width: 88%;\n    margin: 0 0 0 -44%;\n  }\n}\n@media only screen and (min-width:992px) {\n  .ui.large.modal {\n    width: 1020px;\n    margin: 0 0 0 -510px;\n  }\n}\n@media only screen and (min-width:1200px) {\n  .ui.large.modal {\n    width: 1080px;\n    margin: 0 0 0 -540px;\n  }\n}\n@media only screen and (min-width:1920px) {\n  .ui.large.modal {\n    width: 1140px;\n    margin: 0 0 0 -570px;\n  }\n}\n.ui.nag {\n  display: none;\n  opacity: .95;\n  position: relative;\n  top: 0;\n  left: 0;\n  z-index: 999;\n  min-height: 0;\n  width: 100%;\n  margin: 0;\n  padding: .75em 1em;\n  background: #555;\n  box-shadow: 0 1px 2px 0 rgba(0,0,0,.2);\n  font-size: 1rem;\n  text-align: center;\n  color: rgba(0,0,0,.87);\n  border-radius: 0 0 .28571429rem .28571429rem;\n  -webkit-transition: .2s background ease;\n  transition: .2s background ease;\n}\na.ui.nag {\n  cursor: pointer;\n}\n.ui.nag>.title {\n  display: inline-block;\n  margin: 0 .5em;\n  color: #FFF;\n}\n.ui.nag>.close.icon {\n  cursor: pointer;\n  opacity: .4;\n  position: absolute;\n  top: 50%;\n  right: 1em;\n  font-size: 1em;\n  margin: -.5em 0 0;\n  color: #FFF;\n  -webkit-transition: opacity .2s ease;\n  transition: opacity .2s ease;\n}\n.ui.nag:hover {\n  background: #555;\n  opacity: 1;\n}\n.ui.nag .close:hover {\n  opacity: 1;\n}\n.ui.overlay.nag {\n  position: absolute;\n  display: block;\n}\n.ui.fixed.nag {\n  position: fixed;\n}\n.ui.bottom.nag,\n.ui.bottom.nags {\n  border-radius: .28571429rem .28571429rem 0 0;\n  top: auto;\n  bottom: 0;\n}\n.ui.inverted.nag,\n.ui.inverted.nags .nag {\n  background-color: #F3F4F5;\n  color: rgba(0,0,0,.85);\n}\n.ui.inverted.nag .close,\n.ui.inverted.nag .title,\n.ui.inverted.nags .nag .close,\n.ui.inverted.nags .nag .title {\n  color: rgba(0,0,0,.4);\n}\n.ui.nags .nag {\n  border-radius: 0!important;\n}\n.ui.nags .nag:last-child {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.bottom.nags .nag:last-child {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.popup {\n  display: none;\n  position: absolute;\n  top: 0;\n  right: 0;\n  min-width: -webkit-min-content;\n  min-width: -moz-min-content;\n  min-width: min-content;\n  z-index: 1900;\n  border: 1px solid #D4D4D5;\n  line-height: 1.4285em;\n  max-width: 250px;\n  background: #FFF;\n  padding: .833em 1em;\n  font-weight: 400;\n  font-style: normal;\n  color: rgba(0,0,0,.87);\n  border-radius: .28571429rem;\n  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n}\n.ui.popup>.header {\n  padding: 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1.14285714em;\n  line-height: 1.2;\n  font-weight: 700;\n}\n.ui.popup>.header+.content {\n  padding-top: .5em;\n}\n.ui.popup:before {\n  position: absolute;\n  content: '';\n  width: .71428571em;\n  height: .71428571em;\n  background: #FFF;\n  -webkit-transform: rotate(45deg);\n  -ms-transform: rotate(45deg);\n  transform: rotate(45deg);\n  z-index: 2;\n  box-shadow: 1px 1px 0 0 #bababc;\n}\n[data-tooltip] {\n  position: relative;\n}\n[data-tooltip]:not([data-position]):before {\n  top: auto;\n  right: auto;\n  bottom: 100%;\n  left: 50%;\n  background: #FFF;\n  margin-left: -.07142857rem;\n  margin-bottom: .14285714rem;\n}\n[data-tooltip]:not([data-position]):after {\n  left: 50%;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  bottom: 100%;\n  margin-bottom: .5em;\n}\n[data-tooltip]:after,\n[data-tooltip]:before {\n  pointer-events: none;\n  visibility: hidden;\n}\n[data-tooltip]:before {\n  position: absolute;\n  content: '';\n  font-size: 1rem;\n  width: .71428571em;\n  height: .71428571em;\n  background: #FFF;\n  z-index: 2;\n  box-shadow: 1px 1px 0 0 #bababc;\n  opacity: 0;\n  -webkit-transform: rotate(45deg) scale(0)!important;\n  -ms-transform: rotate(45deg) scale(0)!important;\n  transform: rotate(45deg) scale(0)!important;\n  -webkit-transform-origin: center top;\n  -ms-transform-origin: center top;\n  transform-origin: center top;\n  -webkit-transition: all .1s ease;\n  transition: all .1s ease;\n}\n[data-tooltip]:after {\n  content: attr(data-tooltip);\n  position: absolute;\n  text-transform: none;\n  text-align: left;\n  white-space: nowrap;\n  font-size: 1rem;\n  border: 1px solid #D4D4D5;\n  line-height: 1.4285em;\n  max-width: none;\n  background: #FFF;\n  padding: .833em 1em;\n  font-weight: 400;\n  font-style: normal;\n  color: rgba(0,0,0,.87);\n  border-radius: .28571429rem;\n  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n  z-index: 1;\n  opacity: 1;\n  -webkit-transform-origin: center bottom;\n  -ms-transform-origin: center bottom;\n  transform-origin: center bottom;\n  -webkit-transition: all .1s ease;\n  transition: all .1s ease;\n}\n[data-tooltip]:hover:after,\n[data-tooltip]:hover:before {\n  visibility: visible;\n  pointer-events: auto;\n}\n[data-tooltip]:hover:before {\n  -webkit-transform: rotate(45deg) scale(1)!important;\n  -ms-transform: rotate(45deg) scale(1)!important;\n  transform: rotate(45deg) scale(1)!important;\n  opacity: 1;\n}\n[data-tooltip]:after,\n[data-tooltip][data-position=\"top center\"]:after,\n[data-tooltip][data-position=\"bottom center\"]:after {\n  -webkit-transform: translateX(-50%) scale(0)!important;\n  -ms-transform: translateX(-50%) scale(0)!important;\n  transform: translateX(-50%) scale(0)!important;\n}\n[data-tooltip]:hover:after,\n[data-tooltip][data-position=\"bottom center\"]:hover:after {\n  -webkit-transform: translateX(-50%) scale(1)!important;\n  -ms-transform: translateX(-50%) scale(1)!important;\n  transform: translateX(-50%) scale(1)!important;\n}\n[data-tooltip][data-position=\"left center\"]:after,\n[data-tooltip][data-position=\"right center\"]:after {\n  -webkit-transform: translateY(-50%) scale(0)!important;\n  -ms-transform: translateY(-50%) scale(0)!important;\n  transform: translateY(-50%) scale(0)!important;\n}\n[data-tooltip][data-position=\"left center\"]:hover:after,\n[data-tooltip][data-position=\"right center\"]:hover:after {\n  -webkit-transform: translateY(-50%) scale(1)!important;\n  -ms-transform: translateY(-50%) scale(1)!important;\n  transform: translateY(-50%) scale(1)!important;\n}\n[data-tooltip][data-position=\"top left\"]:after,\n[data-tooltip][data-position=\"top right\"]:after,\n[data-tooltip][data-position=\"bottom left\"]:after,\n[data-tooltip][data-position=\"bottom right\"]:after {\n  -webkit-transform: scale(0)!important;\n  -ms-transform: scale(0)!important;\n  transform: scale(0)!important;\n}\n[data-tooltip][data-position=\"top left\"]:hover:after,\n[data-tooltip][data-position=\"top right\"]:hover:after,\n[data-tooltip][data-position=\"bottom left\"]:hover:after,\n[data-tooltip][data-position=\"bottom right\"]:hover:after {\n  -webkit-transform: scale(1)!important;\n  -ms-transform: scale(1)!important;\n  transform: scale(1)!important;\n}\n[data-tooltip][data-inverted]:before {\n  box-shadow: none!important;\n  background: #1B1C1D;\n}\n[data-tooltip][data-inverted]:after {\n  background: #1B1C1D;\n  color: #FFF;\n  border: none;\n  box-shadow: none;\n}\n[data-tooltip][data-inverted]:after .header {\n  background-color: none;\n  color: #FFF;\n}\n[data-position=\"top center\"][data-tooltip]:after {\n  top: auto;\n  right: auto;\n  left: 50%;\n  bottom: 100%;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  margin-bottom: .5em;\n}\n[data-position=\"top center\"][data-tooltip]:before {\n  top: auto;\n  right: auto;\n  bottom: 100%;\n  left: 50%;\n  background: #FFF;\n  margin-left: -.07142857rem;\n  margin-bottom: .14285714rem;\n}\n[data-position=\"top left\"][data-tooltip]:after {\n  top: auto;\n  right: auto;\n  left: 0;\n  bottom: 100%;\n  margin-bottom: .5em;\n}\n[data-position=\"top left\"][data-tooltip]:before {\n  top: auto;\n  right: auto;\n  bottom: 100%;\n  left: 1em;\n  margin-left: -.07142857rem;\n  margin-bottom: .14285714rem;\n}\n[data-position=\"top right\"][data-tooltip]:after {\n  top: auto;\n  left: auto;\n  right: 0;\n  bottom: 100%;\n  margin-bottom: .5em;\n}\n[data-position=\"top right\"][data-tooltip]:before {\n  top: auto;\n  left: auto;\n  bottom: 100%;\n  right: 1em;\n  margin-left: -.07142857rem;\n  margin-bottom: .14285714rem;\n}\n[data-position=\"bottom center\"][data-tooltip]:after {\n  bottom: auto;\n  right: auto;\n  left: 50%;\n  top: 100%;\n  -webkit-transform: translateX(-50%);\n  -ms-transform: translateX(-50%);\n  transform: translateX(-50%);\n  margin-top: .5em;\n}\n[data-position=\"bottom center\"][data-tooltip]:before {\n  bottom: auto;\n  right: auto;\n  top: 100%;\n  left: 50%;\n  margin-left: -.07142857rem;\n  margin-top: .14285714rem;\n}\n[data-position=\"bottom left\"][data-tooltip]:after {\n  left: 0;\n  top: 100%;\n  margin-top: .5em;\n}\n[data-position=\"bottom left\"][data-tooltip]:before {\n  bottom: auto;\n  right: auto;\n  top: 100%;\n  left: 1em;\n  margin-left: -.07142857rem;\n  margin-top: .14285714rem;\n}\n[data-position=\"bottom right\"][data-tooltip]:after {\n  right: 0;\n  top: 100%;\n  margin-top: .5em;\n}\n[data-position=\"bottom right\"][data-tooltip]:before {\n  bottom: auto;\n  left: auto;\n  top: 100%;\n  right: 1em;\n  margin-left: -.14285714rem;\n  margin-top: .07142857rem;\n}\n[data-position=\"left center\"][data-tooltip]:after {\n  right: 100%;\n  top: 50%;\n  margin-right: .5em;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n[data-position=\"right center\"][data-tooltip]:after {\n  left: 100%;\n  top: 50%;\n  margin-left: .5em;\n  -webkit-transform: translateY(-50%);\n  -ms-transform: translateY(-50%);\n  transform: translateY(-50%);\n}\n[data-position~=bottom][data-tooltip]:before {\n  background: #FFF;\n  box-shadow: -1px -1px 0 0 #bababc;\n  -webkit-transform-origin: center bottom;\n  -ms-transform-origin: center bottom;\n  transform-origin: center bottom;\n}\n[data-position=\"left center\"][data-tooltip]:before {\n  right: 100%;\n  top: 50%;\n  margin-top: -.14285714rem;\n  margin-right: -.07142857rem;\n  background: #FFF;\n  box-shadow: 1px -1px 0 0 #bababc;\n}\n[data-position=\"right center\"][data-tooltip]:before {\n  left: 100%;\n  top: 50%;\n  margin-top: -.07142857rem;\n  margin-left: .14285714rem;\n  background: #FFF;\n  box-shadow: -1px 1px 0 0 #bababc;\n}\n[data-position~=top][data-tooltip]:before {\n  background: #FFF;\n}\n[data-inverted][data-position~=bottom][data-tooltip]:before {\n  background: #1B1C1D;\n  box-shadow: -1px -1px 0 0 #bababc;\n}\n[data-inverted][data-position=\"left center\"][data-tooltip]:before {\n  background: #1B1C1D;\n  box-shadow: 1px -1px 0 0 #bababc;\n}\n[data-inverted][data-position=\"right center\"][data-tooltip]:before {\n  background: #1B1C1D;\n  box-shadow: -1px 1px 0 0 #bababc;\n}\n[data-inverted][data-position~=top][data-tooltip]:before {\n  background: #1B1C1D;\n}\n[data-position~=bottom][data-tooltip]:after {\n  -webkit-transform-origin: center top;\n  -ms-transform-origin: center top;\n  transform-origin: center top;\n}\n[data-position=\"left center\"][data-tooltip]:before {\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n}\n[data-position=\"left center\"][data-tooltip]:after,\n[data-position=\"right center\"][data-tooltip]:before {\n  -webkit-transform-origin: right center;\n  -ms-transform-origin: right center;\n  transform-origin: right center;\n}\n[data-position=\"right center\"][data-tooltip]:after {\n  -webkit-transform-origin: left center;\n  -ms-transform-origin: left center;\n  transform-origin: left center;\n}\n.ui.popup {\n  margin: 0;\n}\n.ui.top.popup {\n  margin: 0 0 .71428571em;\n}\n.ui.top.left.popup {\n  -webkit-transform-origin: left bottom;\n  -ms-transform-origin: left bottom;\n  transform-origin: left bottom;\n}\n.ui.top.center.popup {\n  -webkit-transform-origin: center bottom;\n  -ms-transform-origin: center bottom;\n  transform-origin: center bottom;\n}\n.ui.top.right.popup {\n  -webkit-transform-origin: right bottom;\n  -ms-transform-origin: right bottom;\n  transform-origin: right bottom;\n}\n.ui.left.center.popup {\n  margin: 0 .71428571em 0 0;\n  -webkit-transform-origin: right 50%;\n  -ms-transform-origin: right 50%;\n  transform-origin: right 50%;\n}\n.ui.right.center.popup {\n  margin: 0 0 0 .71428571em;\n  -webkit-transform-origin: left 50%;\n  -ms-transform-origin: left 50%;\n  transform-origin: left 50%;\n}\n.ui.bottom.popup {\n  margin: .71428571em 0 0;\n}\n.ui.bottom.left.popup {\n  -webkit-transform-origin: left top;\n  -ms-transform-origin: left top;\n  transform-origin: left top;\n}\n.ui.bottom.center.popup {\n  -webkit-transform-origin: center top;\n  -ms-transform-origin: center top;\n  transform-origin: center top;\n}\n.ui.bottom.right.popup {\n  -webkit-transform-origin: right top;\n  -ms-transform-origin: right top;\n  transform-origin: right top;\n  margin-right: 0;\n}\n.ui.bottom.center.popup:before {\n  margin-left: -.30714286em;\n  top: -.30714286em;\n  left: 50%;\n  right: auto;\n  bottom: auto;\n  box-shadow: -1px -1px 0 0 #bababc;\n}\n.ui.bottom.left.popup {\n  margin-left: 0;\n}\n.ui.bottom.left.popup:before {\n  top: -.30714286em;\n  left: 1em;\n  right: auto;\n  bottom: auto;\n  margin-left: 0;\n  box-shadow: -1px -1px 0 0 #bababc;\n}\n.ui.bottom.right.popup:before {\n  top: -.30714286em;\n  right: 1em;\n  bottom: auto;\n  left: auto;\n  margin-left: 0;\n  box-shadow: -1px -1px 0 0 #bababc;\n}\n.ui.top.center.popup:before {\n  top: auto;\n  right: auto;\n  bottom: -.30714286em;\n  left: 50%;\n  margin-left: -.30714286em;\n}\n.ui.top.left.popup {\n  margin-left: 0;\n}\n.ui.top.left.popup:before {\n  bottom: -.30714286em;\n  left: 1em;\n  top: auto;\n  right: auto;\n  margin-left: 0;\n}\n.ui.top.right.popup {\n  margin-right: 0;\n}\n.ui.top.right.popup:before {\n  bottom: -.30714286em;\n  right: 1em;\n  top: auto;\n  left: auto;\n  margin-left: 0;\n}\n.ui.left.center.popup:before {\n  top: 50%;\n  right: -.30714286em;\n  bottom: auto;\n  left: auto;\n  margin-top: -.30714286em;\n  box-shadow: 1px -1px 0 0 #bababc;\n}\n.ui.right.center.popup:before {\n  top: 50%;\n  left: -.30714286em;\n  bottom: auto;\n  right: auto;\n  margin-top: -.30714286em;\n  box-shadow: -1px 1px 0 0 #bababc;\n}\n.ui.bottom.popup:before,\n.ui.left.center.popup:before,\n.ui.right.center.popup:before,\n.ui.top.popup:before {\n  background: #FFF;\n}\n.ui.inverted.bottom.popup:before,\n.ui.inverted.left.center.popup:before,\n.ui.inverted.right.center.popup:before,\n.ui.inverted.top.popup:before {\n  background: #1B1C1D;\n}\n.ui.popup>.ui.grid:not(.padded) {\n  width: calc(100% + 1.75rem);\n  margin: -.7rem -.875rem;\n}\n.ui.loading.popup {\n  display: block;\n  visibility: hidden;\n  z-index: -1;\n}\n.ui.animating.popup,\n.ui.visible.popup {\n  display: block;\n}\n.ui.visible.popup {\n  -webkit-transform: translateZ(0);\n  transform: translateZ(0);\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\n.ui.basic.popup:before {\n  display: none;\n}\n.ui.wide.popup {\n  max-width: 350px;\n}\n.ui[class*=\"very wide\"].popup {\n  max-width: 550px;\n}\n@media only screen and (max-width:767px) {\n  .ui.wide.popup,\n  .ui[class*=\"very wide\"].popup {\n    max-width: 250px;\n  }\n}\n.ui.fluid.popup {\n  width: 100%;\n  max-width: none;\n}\n.ui.inverted.popup {\n  background: #1B1C1D;\n  color: #FFF;\n  border: none;\n  box-shadow: none;\n}\n.ui.inverted.popup .header {\n  background-color: none;\n  color: #FFF;\n}\n.ui.inverted.popup:before {\n  background-color: #1B1C1D;\n  box-shadow: none!important;\n}\n.ui.flowing.popup {\n  max-width: none;\n}\n.ui.mini.popup {\n  font-size: .78571429rem;\n}\n.ui.tiny.popup {\n  font-size: .85714286rem;\n}\n.ui.small.popup {\n  font-size: .92857143rem;\n}\n.ui.popup {\n  font-size: 1rem;\n}\n.ui.large.popup {\n  font-size: 1.14285714rem;\n}\n.ui.huge.popup {\n  font-size: 1.42857143rem;\n}\n.ui.progress {\n  position: relative;\n  display: block;\n  max-width: 100%;\n  border: none;\n  margin: 1em 0 2.5em;\n  box-shadow: none;\n  background: rgba(0,0,0,.1);\n  padding: 0;\n  border-radius: .28571429rem;\n}\n.ui.progress:first-child {\n  margin: 0 0 2.5em;\n}\n.ui.progress:last-child {\n  margin: 0 0 1.5em;\n}\n.ui.progress .bar {\n  display: block;\n  line-height: 1;\n  position: relative;\n  width: 0;\n  min-width: 2em;\n  background: #888;\n  border-radius: .28571429rem;\n  -webkit-transition: width .1s ease,background-color .1s ease;\n  transition: width .1s ease,background-color .1s ease;\n}\n.ui.progress .bar>.progress {\n  white-space: nowrap;\n  position: absolute;\n  width: auto;\n  font-size: .92857143em;\n  top: 50%;\n  right: .5em;\n  left: auto;\n  bottom: auto;\n  color: rgba(255,255,255,.7);\n  text-shadow: none;\n  margin-top: -.5em;\n  font-weight: 700;\n  text-align: left;\n}\n.ui.progress>.label {\n  position: absolute;\n  width: 100%;\n  font-size: 1em;\n  top: 100%;\n  right: auto;\n  left: 0;\n  bottom: auto;\n  color: rgba(0,0,0,.87);\n  font-weight: 700;\n  text-shadow: none;\n  margin-top: .2em;\n  text-align: center;\n  -webkit-transition: color .4s ease;\n  transition: color .4s ease;\n}\n.ui.indicating.progress[data-percent^=\"1\"] .bar,\n.ui.indicating.progress[data-percent^=\"2\"] .bar {\n  background-color: #D95C5C;\n}\n.ui.indicating.progress[data-percent^=\"3\"] .bar {\n  background-color: #EFBC72;\n}\n.ui.indicating.progress[data-percent^=\"4\"] .bar,\n.ui.indicating.progress[data-percent^=\"5\"] .bar {\n  background-color: #E6BB48;\n}\n.ui.indicating.progress[data-percent^=\"6\"] .bar {\n  background-color: #DDC928;\n}\n.ui.indicating.progress[data-percent^=\"7\"] .bar,\n.ui.indicating.progress[data-percent^=\"8\"] .bar {\n  background-color: #B4D95C;\n}\n.ui.indicating.progress[data-percent^=\"9\"] .bar,\n.ui.indicating.progress[data-percent^=\"100\"] .bar {\n  background-color: #66DA81;\n}\n.ui.indicating.progress[data-percent^=\"1\"] .label,\n.ui.indicating.progress[data-percent^=\"2\"] .label,\n.ui.indicating.progress[data-percent^=\"3\"] .label,\n.ui.indicating.progress[data-percent^=\"4\"] .label,\n.ui.indicating.progress[data-percent^=\"5\"] .label,\n.ui.indicating.progress[data-percent^=\"6\"] .label,\n.ui.indicating.progress[data-percent^=\"7\"] .label,\n.ui.indicating.progress[data-percent^=\"8\"] .label,\n.ui.indicating.progress[data-percent^=\"9\"] .label,\n.ui.indicating.progress[data-percent^=\"100\"] .label {\n  color: rgba(0,0,0,.87);\n}\n.ui.indicating.progress[data-percent=\"1\"] .bar,\n.ui.indicating.progress[data-percent=\"2\"] .bar,\n.ui.indicating.progress[data-percent=\"3\"] .bar,\n.ui.indicating.progress[data-percent=\"4\"] .bar,\n.ui.indicating.progress[data-percent=\"5\"] .bar,\n.ui.indicating.progress[data-percent=\"6\"] .bar,\n.ui.indicating.progress[data-percent=\"7\"] .bar,\n.ui.indicating.progress[data-percent=\"8\"] .bar,\n.ui.indicating.progress[data-percent=\"9\"] .bar {\n  background-color: #D95C5C;\n}\n.ui.indicating.progress[data-percent=\"1\"] .label,\n.ui.indicating.progress[data-percent=\"2\"] .label,\n.ui.indicating.progress[data-percent=\"3\"] .label,\n.ui.indicating.progress[data-percent=\"4\"] .label,\n.ui.indicating.progress[data-percent=\"5\"] .label,\n.ui.indicating.progress[data-percent=\"6\"] .label,\n.ui.indicating.progress[data-percent=\"7\"] .label,\n.ui.indicating.progress[data-percent=\"8\"] .label,\n.ui.indicating.progress[data-percent=\"9\"] .label {\n  color: rgba(0,0,0,.87);\n}\n.ui.indicating.progress.success .label {\n  color: #1A531B;\n}\n.ui.progress.success .bar {\n  background-color: #21BA45!important;\n}\n.ui.progress.success .bar,\n.ui.progress.success .bar::after {\n  -webkit-animation: none!important;\n  animation: none!important;\n}\n.ui.progress.success>.label {\n  color: #1A531B;\n}\n.ui.progress.warning .bar {\n  background-color: #F2C037!important;\n}\n.ui.progress.warning .bar,\n.ui.progress.warning .bar::after {\n  -webkit-animation: none!important;\n  animation: none!important;\n}\n.ui.progress.warning>.label {\n  color: #794B02;\n}\n.ui.progress.error .bar {\n  background-color: #DB2828!important;\n}\n.ui.progress.error .bar,\n.ui.progress.error .bar::after {\n  -webkit-animation: none!important;\n  animation: none!important;\n}\n.ui.progress.error>.label {\n  color: #912D2B;\n}\n.ui.active.progress .bar {\n  position: relative;\n  min-width: 2em;\n}\n.ui.active.progress .bar::after {\n  content: '';\n  opacity: 0;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background: #FFF;\n  border-radius: .28571429rem;\n  -webkit-animation: progress-active 2s ease infinite;\n  animation: progress-active 2s ease infinite;\n}\n@-webkit-keyframes progress-active {\n  0% {\n    opacity: .3;\n    width: 0;\n  }\n\n  100% {\n    opacity: 0;\n    width: 100%;\n  }\n}\n@keyframes progress-active {\n  0% {\n    opacity: .3;\n    width: 0;\n  }\n\n  100% {\n    opacity: 0;\n    width: 100%;\n  }\n}\n.ui.disabled.progress {\n  opacity: .35;\n}\n.ui.disabled.progress .bar,\n.ui.disabled.progress .bar::after {\n  -webkit-animation: none!important;\n  animation: none!important;\n}\n.ui.inverted.progress {\n  background: rgba(255,255,255,.08);\n  border: none;\n}\n.ui.inverted.progress .bar {\n  background: #888;\n}\n.ui.inverted.progress .bar>.progress {\n  color: #F9FAFB;\n}\n.ui.inverted.progress>.label {\n  color: #FFF;\n}\n.ui.inverted.progress.success>.label {\n  color: #21BA45;\n}\n.ui.inverted.progress.warning>.label {\n  color: #F2C037;\n}\n.ui.inverted.progress.error>.label {\n  color: #DB2828;\n}\n.ui.progress.attached {\n  background: 0 0;\n  position: relative;\n  border: none;\n  margin: 0;\n}\n.ui.progress.attached,\n.ui.progress.attached .bar {\n  display: block;\n  height: .2rem;\n  padding: 0;\n  overflow: hidden;\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.progress.attached .bar {\n  border-radius: 0;\n}\n.ui.progress.top.attached,\n.ui.progress.top.attached .bar {\n  top: 0;\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.progress.top.attached .bar {\n  border-radius: 0;\n}\n.ui.card>.ui.attached.progress,\n.ui.segment>.ui.attached.progress {\n  position: absolute;\n  top: auto;\n  left: 0;\n  bottom: 100%;\n  width: 100%;\n}\n.ui.card>.ui.bottom.attached.progress,\n.ui.segment>.ui.bottom.attached.progress {\n  top: 100%;\n  bottom: auto;\n}\n.ui.red.progress .bar {\n  background-color: #DB2828;\n}\n.ui.red.inverted.progress .bar {\n  background-color: #FF695E;\n}\n.ui.orange.progress .bar {\n  background-color: #F2711C;\n}\n.ui.orange.inverted.progress .bar {\n  background-color: #FF851B;\n}\n.ui.yellow.progress .bar {\n  background-color: #FBBD08;\n}\n.ui.yellow.inverted.progress .bar {\n  background-color: #FFE21F;\n}\n.ui.olive.progress .bar {\n  background-color: #B5CC18;\n}\n.ui.olive.inverted.progress .bar {\n  background-color: #D9E778;\n}\n.ui.green.progress .bar {\n  background-color: #21BA45;\n}\n.ui.green.inverted.progress .bar {\n  background-color: #2ECC40;\n}\n.ui.teal.progress .bar {\n  background-color: #00B5AD;\n}\n.ui.teal.inverted.progress .bar {\n  background-color: #6DFFFF;\n}\n.ui.blue.progress .bar {\n  background-color: #2185D0;\n}\n.ui.blue.inverted.progress .bar {\n  background-color: #54C8FF;\n}\n.ui.violet.progress .bar {\n  background-color: #6435C9;\n}\n.ui.violet.inverted.progress .bar {\n  background-color: #A291FB;\n}\n.ui.purple.progress .bar {\n  background-color: #A333C8;\n}\n.ui.purple.inverted.progress .bar {\n  background-color: #DC73FF;\n}\n.ui.pink.progress .bar {\n  background-color: #E03997;\n}\n.ui.pink.inverted.progress .bar {\n  background-color: #FF8EDF;\n}\n.ui.brown.progress .bar {\n  background-color: #A5673F;\n}\n.ui.brown.inverted.progress .bar {\n  background-color: #D67C1C;\n}\n.ui.grey.progress .bar {\n  background-color: #767676;\n}\n.ui.grey.inverted.progress .bar {\n  background-color: #DCDDDE;\n}\n.ui.black.progress .bar {\n  background-color: #1B1C1D;\n}\n.ui.black.inverted.progress .bar {\n  background-color: #545454;\n}\n.ui.tiny.progress {\n  font-size: .85714286rem;\n}\n.ui.tiny.progress .bar {\n  height: .5em;\n}\n.ui.small.progress {\n  font-size: .92857143rem;\n}\n.ui.small.progress .bar {\n  height: 1em;\n}\n.ui.progress {\n  font-size: 1rem;\n}\n.ui.progress .bar {\n  height: 1.75em;\n}\n.ui.large.progress {\n  font-size: 1.14285714rem;\n}\n.ui.large.progress .bar {\n  height: 2.5em;\n}\n.ui.big.progress {\n  font-size: 1.28571429rem;\n}\n.ui.big.progress .bar {\n  height: 3.5em;\n}\n.ui.rating:last-child {\n  margin-right: 0;\n}\n.ui.rating .icon {\n  padding: 0;\n  margin: 0;\n  -webkit-box-flex: 1;\n  -webkit-flex: 1 0 auto;\n  -ms-flex: 1 0 auto;\n  flex: 1 0 auto;\n  cursor: pointer;\n  width: 1.25em;\n  height: auto;\n  -webkit-transition: opacity .1s ease,background .1s ease,text-shadow .1s ease,color .1s ease;\n  transition: opacity .1s ease,background .1s ease,text-shadow .1s ease,color .1s ease;\n  background: 0 0;\n  color: rgba(0,0,0,.15);\n  font-family: Rating;\n  line-height: 1;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  font-weight: 400;\n  font-style: normal;\n  text-align: center;\n}\n.ui.rating .active.icon {\n  background: 0 0;\n  color: rgba(0,0,0,.85);\n}\n.ui.rating .icon.selected,\n.ui.rating .icon.selected.active {\n  background: 0 0;\n  color: rgba(0,0,0,.87);\n}\n.ui.star.rating .icon {\n  width: 1.25em;\n  height: auto;\n  background: 0 0;\n  color: rgba(0,0,0,.15);\n  text-shadow: none;\n}\n.ui.star.rating .active.icon {\n  background: 0 0!important;\n  color: #FFE623!important;\n  text-shadow: 0 -1px 0 #DDC507,-1px 0 0 #DDC507,0 1px 0 #DDC507,1px 0 0 #DDC507!important;\n}\n.ui.star.rating .icon.selected,\n.ui.star.rating .icon.selected.active {\n  background: 0 0!important;\n  color: #FC0!important;\n  text-shadow: 0 -1px 0 #E6A200,-1px 0 0 #E6A200,0 1px 0 #E6A200,1px 0 0 #E6A200!important;\n}\n.ui.heart.rating .icon {\n  width: 1.4em;\n  height: auto;\n  background: 0 0;\n  color: rgba(0,0,0,.15);\n  text-shadow: none!important;\n}\n.ui.heart.rating .active.icon {\n  background: 0 0!important;\n  color: #FF6D75!important;\n  text-shadow: 0 -1px 0 #CD0707,-1px 0 0 #CD0707,0 1px 0 #CD0707,1px 0 0 #CD0707!important;\n}\n.ui.heart.rating .icon.selected,\n.ui.heart.rating .icon.selected.active {\n  background: 0 0!important;\n  color: #FF3000!important;\n  text-shadow: 0 -1px 0 #AA0101,-1px 0 0 #AA0101,0 1px 0 #AA0101,1px 0 0 #AA0101!important;\n}\n.ui.disabled.rating .icon {\n  cursor: default;\n}\n.ui.rating .icon.selected,\n.ui.rating.selected .active.icon,\n.ui.rating.selected .icon.selected {\n  opacity: 1;\n}\n.ui.mini.rating {\n  font-size: .78571429rem;\n}\n.ui.tiny.rating {\n  font-size: .85714286rem;\n}\n.ui.small.rating {\n  font-size: .92857143rem;\n}\n.ui.rating {\n  display: -webkit-inline-box;\n  display: -webkit-inline-flex;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  white-space: nowrap;\n  vertical-align: baseline;\n  font-size: 1rem;\n}\n.ui.large.rating {\n  font-size: 1.14285714rem;\n}\n.ui.huge.rating {\n  font-size: 1.42857143rem;\n}\n.ui.massive.rating {\n  font-size: 2rem;\n}\n@font-face {\n  font-family: Rating;\n  src: url(data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMggjCBsAAAC8AAAAYGNtYXCj2pm8AAABHAAAAKRnYXNwAAAAEAAAAcAAAAAIZ2x5ZlJbXMYAAAHIAAARnGhlYWQBGAe5AAATZAAAADZoaGVhA+IB/QAAE5wAAAAkaG10eCzgAEMAABPAAAAAcGxvY2EwXCxOAAAUMAAAADptYXhwACIAnAAAFGwAAAAgbmFtZfC1n04AABSMAAABPHBvc3QAAwAAAAAVyAAAACAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADxZQHg/+D/4AHgACAAAAABAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAFAAEAJAAAAAgACAABAAAAAEAIOYF8AbwDfAj8C7wbvBw8Irwl/Cc8SPxZf/9//8AAAAAACDmAPAE8AzwI/Au8G7wcPCH8JfwnPEj8WT//f//AAH/4xoEEAYQAQ/sD+IPow+iD4wPgA98DvYOtgADAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAH//wAPAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAAAAAAAAAAAAAgAANzkBAAAAAAIAAP/tAgAB0wAKABUAAAEvAQ8BFwc3Fyc3BQc3Jz8BHwEHFycCALFPT7GAHp6eHoD/AHAWW304OH1bFnABGRqgoBp8sFNTsHyyOnxYEnFxElh8OgAAAAACAAD/7QIAAdMACgASAAABLwEPARcHNxcnNwUxER8BBxcnAgCxT0+xgB6enh6A/wA4fVsWcAEZGqCgGnywU1OwfLIBHXESWHw6AAAAAQAA/+0CAAHTAAoAAAEvAQ8BFwc3Fyc3AgCxT0+xgB6enh6AARkaoKAafLBTU7B8AAAAAAEAAAAAAgABwAArAAABFA4CBzEHDgMjIi4CLwEuAzU0PgIzMh4CFz4DMzIeAhUCAAcMEgugBgwMDAYGDAwMBqALEgwHFyg2HhAfGxkKChkbHxAeNigXAS0QHxsZCqAGCwkGBQkLBqAKGRsfEB42KBcHDBILCxIMBxcoNh4AAAAAAgAAAAACAAHAACsAWAAAATQuAiMiDgIHLgMjIg4CFRQeAhcxFx4DMzI+Aj8BPgM1DwEiFCIGMTAmIjQjJy4DNTQ+AjMyHgIfATc+AzMyHgIVFA4CBwIAFyg2HhAfGxkKChkbHxAeNigXBwwSC6AGDAwMBgYMDAwGoAsSDAdbogEBAQEBAaIGCgcEDRceEQkREA4GLy8GDhARCREeFw0EBwoGAS0eNigXBwwSCwsSDAcXKDYeEB8bGQqgBgsJBgUJCwagChkbHxA+ogEBAQGiBg4QEQkRHhcNBAcKBjQ0BgoHBA0XHhEJERAOBgABAAAAAAIAAcAAMQAAARQOAgcxBw4DIyIuAi8BLgM1ND4CMzIeAhcHFwc3Jzc+AzMyHgIVAgAHDBILoAYMDAwGBgwMDAagCxIMBxcoNh4KFRMSCC9wQLBwJwUJCgkFHjYoFwEtEB8bGQqgBgsJBgUJCwagChkbHxAeNigXAwUIBUtAoMBAOwECAQEXKDYeAAABAAAAAAIAAbcAKgAAEzQ3NjMyFxYXFhcWFzY3Njc2NzYzMhcWFRQPAQYjIi8BJicmJyYnJicmNQAkJUARExIQEAsMCgoMCxAQEhMRQCUkQbIGBwcGsgMFBQsKCQkGBwExPyMkBgYLCgkKCgoKCQoLBgYkIz8/QawFBawCBgUNDg4OFRQTAAAAAQAAAA0B2wHSACYAABM0PwI2FzYfAhYVFA8BFxQVFAcGByYvAQcGByYnJjU0PwEnJjUAEI9BBQkIBkCPEAdoGQMDBgUGgIEGBQYDAwEYaAcBIwsCFoEMAQEMgRYCCwYIZJABBQUFAwEBAkVFAgEBAwUFAwOQZAkFAAAAAAIAAAANAdsB0gAkAC4AABM0PwI2FzYfAhYVFA8BFxQVFAcmLwEHBgcmJyY1ND8BJyY1HwEHNxcnNy8BBwAQj0EFCQgGQI8QB2gZDAUGgIEGBQYDAwEYaAc/WBVsaxRXeDY2ASMLAhaBDAEBDIEWAgsGCGSQAQUNAQECRUUCAQEDBQUDA5BkCQURVXg4OHhVEW5uAAABACMAKQHdAXwAGgAANzQ/ATYXNh8BNzYXNh8BFhUUDwEGByYvASY1IwgmCAwLCFS8CAsMCCYICPUIDAsIjgjSCwkmCQEBCVS7CQEBCSYJCg0H9gcBAQePBwwAAAEAHwAfAXMBcwAsAAA3ND8BJyY1ND8BNjMyHwE3NjMyHwEWFRQPARcWFRQPAQYjIi8BBwYjIi8BJjUfCFRUCAgnCAwLCFRUCAwLCCcICFRUCAgnCAsMCFRUCAsMCCcIYgsIVFQIDAsIJwgIVFQICCcICwwIVFQICwwIJwgIVFQICCcIDAAAAAACAAAAJQFJAbcAHwArAAA3NTQ3NjsBNTQ3NjMyFxYdATMyFxYdARQHBiMhIicmNTczNTQnJiMiBwYdAQAICAsKJSY1NCYmCQsICAgIC/7tCwgIW5MWFR4fFRZApQsICDc0JiYmJjQ3CAgLpQsICAgIC8A3HhYVFRYeNwAAAQAAAAcBbgG3ACEAADcRNDc2NzYzITIXFhcWFREUBwYHBiMiLwEHBiMiJyYnJjUABgUKBgYBLAYGCgUGBgUKBQcOCn5+Cg4GBgoFBicBcAoICAMDAwMICAr+kAoICAQCCXl5CQIECAgKAAAAAwAAACUCAAFuABgAMQBKAAA3NDc2NzYzMhcWFxYVFAcGBwYjIicmJyY1MxYXFjMyNzY3JicWFRQHBiMiJyY1NDcGBzcUFxYzMjc2NTQ3NjMyNzY1NCcmIyIHBhUABihDREtLREMoBgYoQ0RLS0RDKAYlJjk5Q0M5OSYrQREmJTU1JSYRQSuEBAQGBgQEEREZBgQEBAQGJBkayQoKQSgoKChBCgoKCkEoJycoQQoKOiMjIyM6RCEeIjUmJSUmNSIeIUQlBgQEBAQGGBIRBAQGBgQEGhojAAAABQAAAAkCAAGJACwAOABRAGgAcAAANzQ3Njc2MzIXNzYzMhcWFxYXFhcWFxYVFDEGBwYPAQYjIicmNTQ3JicmJyY1MxYXNyYnJjU0NwYHNxQXFjMyNzY1NDc2MzI3NjU0JyYjIgcGFRc3Njc2NyYnNxYXFhcWFRQHBgcGBwYjPwEWFRQHBgcABitBQU0ZGhADBQEEBAUFBAUEBQEEHjw8Hg4DBQQiBQ0pIyIZBiUvSxYZDg4RQSuEBAQGBgQEEREZBgQEBAQGJBkaVxU9MzQiIDASGxkZEAYGCxQrODk/LlACFxYlyQsJQycnBRwEAgEDAwIDAwIBAwUCNmxsNhkFFAMFBBUTHh8nCQtKISgSHBsfIh4hRCUGBAQEBAYYEhEEBAYGBAQaGiPJJQUiIjYzISASGhkbCgoKChIXMRsbUZANCyghIA8AAAMAAAAAAbcB2wA5AEoAlAAANzU0NzY7ATY3Njc2NzY3Njc2MzIXFhcWFRQHMzIXFhUUBxYVFAcUFRQHFgcGKwEiJyYnJisBIicmNTcUFxYzMjc2NTQnJiMiBwYVFzMyFxYXFhcWFxYXFhcWOwEyNTQnNjc2NTQnNjU0JyYnNjc2NTQnJisBNDc2NTQnJiMGBwYHBgcGBwYHBgcGBwYHBgcGBwYrARUACwoQTgodEQ4GBAMFBgwLDxgTEwoKDjMdFhYOAgoRARkZKCUbGxsjIQZSEAoLJQUFCAcGBQUGBwgFBUkJBAUFBAQHBwMDBwcCPCUjNwIJBQUFDwMDBAkGBgsLDmUODgoJGwgDAwYFDAYQAQUGAwQGBgYFBgUGBgQJSbcPCwsGJhUPCBERExMMCgkJFBQhGxwWFR4ZFQoKFhMGBh0WKBcXBgcMDAoLDxIHBQYGBQcIBQYGBQgSAQEBAQICAQEDAgEULwgIBQoLCgsJDhQHCQkEAQ0NCg8LCxAdHREcDQ4IEBETEw0GFAEHBwUECAgFBQUFAgO3AAADAAD/2wG3AbcAPABNAJkAADc1NDc2OwEyNzY3NjsBMhcWBxUWFRQVFhUUBxYVFAcGKwEWFRQHBgcGIyInJicmJyYnJicmJyYnIyInJjU3FBcWMzI3NjU0JyYjIgcGFRczMhcWFxYXFhcWFxYXFhcWFxYXFhcWFzI3NjU0JyY1MzI3NjU0JyYjNjc2NTQnNjU0JyYnNjU0JyYrASIHIgcGBwYHBgcGIwYrARUACwoQUgYhJRsbHiAoGRkBEQoCDhYWHTMOCgoTExgPCwoFBgIBBAMFDhEdCk4QCgslBQUIBwYFBQYHCAUFSQkEBgYFBgUGBgYEAwYFARAGDAUGAwMIGwkKDg5lDgsLBgYJBAMDDwUFBQkCDg4ZJSU8AgcHAwMHBwQEBQUECbe3DwsKDAwHBhcWJwIWHQYGExYKChUZHhYVHRoiExQJCgsJDg4MDAwNBg4WJQcLCw+kBwUGBgUHCAUGBgUIpAMCBQYFBQcIBAUHBwITBwwTExERBw0OHBEdHRALCw8KDQ0FCQkHFA4JCwoLCgUICBgMCxUDAgEBAgMBAQG3AAAAAQAAAA0A7gHSABQAABM0PwI2FxEHBgcmJyY1ND8BJyY1ABCPQQUJgQYFBgMDARhoBwEjCwIWgQwB/oNFAgEBAwUFAwOQZAkFAAAAAAIAAAAAAgABtwAqAFkAABM0NzYzMhcWFxYXFhc2NzY3Njc2MzIXFhUUDwEGIyIvASYnJicmJyYnJjUzFB8BNzY1NCcmJyYnJicmIyIHBgcGBwYHBiMiJyYnJicmJyYjIgcGBwYHBgcGFQAkJUARExIQEAsMCgoMCxAQEhMRQCUkQbIGBwcGsgMFBQsKCQkGByU1pqY1BgYJCg4NDg0PDhIRDg8KCgcFCQkFBwoKDw4REg4PDQ4NDgoJBgYBMT8jJAYGCwoJCgoKCgkKCwYGJCM/P0GsBQWsAgYFDQ4ODhUUEzA1oJ82MBcSEgoLBgcCAgcHCwsKCQgHBwgJCgsLBwcCAgcGCwoSEhcAAAACAAAABwFuAbcAIQAoAAA3ETQ3Njc2MyEyFxYXFhURFAcGBwYjIi8BBwYjIicmJyY1PwEfAREhEQAGBQoGBgEsBgYKBQYGBQoFBw4Kfn4KDgYGCgUGJZIZef7cJwFwCggIAwMDAwgICv6QCggIBAIJeXkJAgQICAoIjRl0AWP+nQAAAAABAAAAJQHbAbcAMgAANzU0NzY7ATU0NzYzMhcWHQEUBwYrASInJj0BNCcmIyIHBh0BMzIXFh0BFAcGIyEiJyY1AAgIC8AmJjQ1JiUFBQgSCAUFFhUfHhUWHAsICAgIC/7tCwgIQKULCAg3NSUmJiU1SQgFBgYFCEkeFhUVFh43CAgLpQsICAgICwAAAAIAAQANAdsB0gAiAC0AABM2PwI2MzIfAhYXFg8BFxYHBiMiLwEHBiMiJyY/AScmNx8CLwE/AS8CEwEDDJBABggJBUGODgIDCmcYAgQCCAMIf4IFBgYEAgEZaQgC7hBbEgINSnkILgEBJggCFYILC4IVAggICWWPCgUFA0REAwUFCo9lCQipCTBmEw1HEhFc/u0AAAADAAAAAAHJAbcAFAAlAHkAADc1NDc2OwEyFxYdARQHBisBIicmNTcUFxYzMjc2NTQnJiMiBwYVFzU0NzYzNjc2NzY3Njc2NzY3Njc2NzY3NjMyFxYXFhcWFxYXFhUUFRQHBgcGBxQHBgcGBzMyFxYVFAcWFRYHFgcGBxYHBgcjIicmJyYnJiciJyY1AAUGB1MHBQYGBQdTBwYFJQUFCAcGBQUGBwgFBWQFBQgGDw8OFAkFBAQBAQMCAQIEBAYFBw4KCgcHBQQCAwEBAgMDAgYCAgIBAU8XEBAQBQEOBQUECwMREiYlExYXDAwWJAoHBQY3twcGBQUGB7cIBQUFBQgkBwYFBQYHCAUGBgUIJLcHBQYBEBATGQkFCQgGBQwLBgcICQUGAwMFBAcHBgYICQQEBwsLCwYGCgIDBAMCBBEQFhkSDAoVEhAREAsgFBUBBAUEBAcMAQUFCAAAAAADAAD/2wHJAZIAFAAlAHkAADcUFxYXNxY3Nj0BNCcmBycGBwYdATc0NzY3FhcWFRQHBicGJyY1FzU0NzY3Fjc2NzY3NjcXNhcWBxYXFgcWBxQHFhUUBwYHJxYXFhcWFRYXFhcWFRQVFAcGBwYHBgcGBwYnBicmJyYnJicmJyYnJicmJyYnJiciJyY1AAUGB1MHBQYGBQdTBwYFJQUFCAcGBQUGBwgFBWQGBQcKJBYMDBcWEyUmEhEDCwQFBQ4BBRAQEBdPAQECAgIGAgMDAgEBAwIEBQcHCgoOBwUGBAQCAQIDAQEEBAUJFA4PDwYIBQWlBwYFAQEBBwQJtQkEBwEBAQUGB7eTBwYEAQEEBgcJBAYBAQYECZS4BwYEAgENBwUCBgMBAQEXEyEJEhAREBcIDhAaFhEPAQEFAgQCBQELBQcKDAkIBAUHCgUGBwgDBgIEAQEHBQkIBwUMCwcECgcGCRoREQ8CBgQIAAAAAQAAAAEAAJth57dfDzz1AAsCAAAAAADP/GODAAAAAM/8Y4MAAP/bAgAB2wAAAAgAAgAAAAAAAAABAAAB4P/gAAACAAAAAAACAAABAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAEAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAdwAAAHcAAACAAAjAZMAHwFJAAABbgAAAgAAAAIAAAACAAAAAgAAAAEAAAACAAAAAW4AAAHcAAAB3AABAdwAAAHcAAAAAAAAAAoAFAAeAEoAcACKAMoBQAGIAcwCCgJUAoICxgMEAzoDpgRKBRgF7AYSBpgG2gcgB2oIGAjOAAAAAQAAABwAmgAFAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABAAwAAAABAAAAAAACAA4AQAABAAAAAAADAAwAIgABAAAAAAAEAAwATgABAAAAAAAFABYADAABAAAAAAAGAAYALgABAAAAAAAKADQAWgADAAEECQABAAwAAAADAAEECQACAA4AQAADAAEECQADAAwAIgADAAEECQAEAAwATgADAAEECQAFABYADAADAAEECQAGAAwANAADAAEECQAKADQAWgByAGEAdABpAG4AZwBWAGUAcgBzAGkAbwBuACAAMQAuADAAcgBhAHQAaQBuAGdyYXRpbmcAcgBhAHQAaQBuAGcAUgBlAGcAdQBsAGEAcgByAGEAdABpAG4AZwBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('truetype'),url(data:application/font-woff;charset=utf-8;base64,d09GRk9UVE8AABcUAAoAAAAAFswAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABDRkYgAAAA9AAAEuEAABLho6TvIE9TLzIAABPYAAAAYAAAAGAIIwgbY21hcAAAFDgAAACkAAAApKPambxnYXNwAAAU3AAAAAgAAAAIAAAAEGhlYWQAABTkAAAANgAAADYBGAe5aGhlYQAAFRwAAAAkAAAAJAPiAf1obXR4AAAVQAAAAHAAAABwLOAAQ21heHAAABWwAAAABgAAAAYAHFAAbmFtZQAAFbgAAAE8AAABPPC1n05wb3N0AAAW9AAAACAAAAAgAAMAAAEABAQAAQEBB3JhdGluZwABAgABADr4HAL4GwP4GAQeCgAZU/+Lix4KABlT/4uLDAeLZviU+HQFHQAAAP0PHQAAAQIRHQAAAAkdAAAS2BIAHQEBBw0PERQZHiMoLTI3PEFGS1BVWl9kaW5zeH2Ch4xyYXRpbmdyYXRpbmd1MHUxdTIwdUU2MDB1RTYwMXVFNjAydUU2MDN1RTYwNHVFNjA1dUYwMDR1RjAwNXVGMDA2dUYwMEN1RjAwRHVGMDIzdUYwMkV1RjA2RXVGMDcwdUYwODd1RjA4OHVGMDg5dUYwOEF1RjA5N3VGMDlDdUYxMjN1RjE2NHVGMTY1AAACAYkAGgAcAgABAAQABwAKAA0AVgCWAL0BAgGMAeQCbwLwA4cD5QR0BQMFdgZgB8MJkQtxC7oM2Q1jDggOmRAYEZr8lA78lA78lA77lA74lPetFftFpTz3NDz7NPtFcfcU+xBt+0T3Mt73Mjht90T3FPcQBfuU+0YV+wRRofcQMOP3EZ3D9wXD+wX3EXkwM6H7EPsExQUO+JT3rRX7RaU89zQ8+zT7RXH3FPsQbftE9zLe9zI4bfdE9xT3EAX7lPtGFYuLi/exw/sF9xF5MDOh+xD7BMUFDviU960V+0WlPPc0PPs0+0Vx9xT7EG37RPcy3vcyOG33RPcU9xAFDviU98EVi2B4ZG5wCIuL+zT7NAV7e3t7e4t7i3ube5sI+zT3NAVupniyi7aL3M3N3Iu2i7J4pm6mqLKetovci81JizoIDviU98EVi9xJzTqLYItkeHBucKhknmCLOotJSYs6i2CeZKhwCIuL9zT7NAWbe5t7m4ubi5ubm5sI9zT3NAWopp6yi7YIME0V+zb7NgWKioqKiouKi4qMiowI+zb3NgV6m4Ghi6OLubCwuYuji6GBm3oIule6vwWbnKGVo4u5i7Bmi12Lc4F1ensIDviU98EVi2B4ZG5wCIuL+zT7NAV7e3t7e4t7i3ube5sI+zT3NAVupniyi7aL3M3N3Iuni6WDoX4IXED3BEtL+zT3RPdU+wTLssYFl46YjZiL3IvNSYs6CA6L98UVi7WXrKOio6Otl7aLlouXiZiHl4eWhZaEloSUhZKFk4SShZKEkpKSkZOSkpGUkZaSCJaSlpGXj5iPl42Wi7aLrX+jc6N0l2qLYYthdWBgYAj7RvtABYeIh4mGi4aLh42Hjgj7RvdABYmNiY2Hj4iOhpGDlISUhZWFlIWVhpaHmYaYiZiLmAgOZ4v3txWLkpCPlo0I9yOgzPcWBY6SkI+Ri5CLkIePhAjL+xb3I3YFlomQh4uEi4aJh4aGCCMmpPsjBYuKi4mLiIuHioiJiImIiIqHi4iLh4yHjQj7FM/7FUcFh4mHioiLh4uIjImOiY6KjouPi4yLjYyOCKP3IyPwBYaQiZCLjwgOZ4v3txWLkpCPlo0I9yOgzPcWBY6SkI+Ri5CLkIePhAjL+xb3I3YFlomQh4uEi4aJh4aGCCMmpPsjBYuKi4mLiIuCh4aDi4iLh4yHjQj7FM/7FUcFh4mHioiLh4uIjImOiY6KjouPi4yLjYyOCKP3IyPwBYaQiZCLjwjKeRXjN3b7DfcAxPZSd/cN4t/7DJ1V9wFV+wEFDq73ZhWLk42RkZEIsbIFkZCRjpOLkouSiJCGCN8291D3UAWQkJKOkouTi5GIkYYIsWQFkYaNhIuEi4OJhYWFCPuJ+4kFhYWFiYOLhIuEjYaRCPsi9yIFhZCJkouSCA77AartFYuSjpKQkAjf3zffBYaQiJKLk4uSjpKQkAiysgWRkJGOk4uSi5KIkIYI3zff3wWQkJKOk4uSi5KIkIYIsmQFkIaOhIuEi4OIhIaGCDc33zcFkIaOhIuEi4OIhYaFCGRkBYaGhIiEi4OLhI6GkAg33zc3BYaGhIiEi4OLhY6FkAhksgWGkYiRi5MIDvtLi8sVi/c5BYuSjpKQkJCQko6SiwiVi4vCBYuul6mkpKSkqpiui66LqX6kcqRymG2LaAiLVJSLBZKLkoiQhpCGjoSLhAiL+zkFi4OIhYaGhoWEiYSLCPuniwWEi4SNhpGGkIiRi5MI5vdUFfcni4vCBYufhJx8mn2ZepJ3i3aLeoR9fX18g3qLdwiLVAUO+yaLshWL+AQFi5GNkY+RjpCQj5KNj42PjI+LCPfAiwWPi4+Kj4mRiZCHj4aPhY2Fi4UIi/wEBYuEiYWHhoeGhoeFiIiKhoqHi4GLhI6EkQj7EvcN+xL7DQWEhYOIgouHi4eLh42EjoaPiJCHkImRi5IIDov3XRWLko2Rj5Kltq+vuKW4pbuZvYu9i7t9uHG4ca9npWCPhI2Fi4SLhYmEh4RxYGdoXnAIXnFbflmLWYtbmF6lXqZnrnG2h5KJkouRCLCLFaRkq2yxdLF0tH+4i7iLtJexorGiq6qksm64Z61goZZ3kXaLdItnfm1ycnJybX9oiwhoi22XcqRypH6pi6+LopGglp9gdWdpbl4I9xiwFYuHjIiOiI6IjoqPi4+LjoyOjo2OjY6Lj4ubkJmXl5eWmZGbi4+LjoyOjo2OjY6LjwiLj4mOiY6IjYiNh4tzi3eCenp6eoJ3i3MIDov3XRWLko2Sj5GouK+utqW3pbqYvouci5yJnIgIm6cFjY6NjI+LjIuNi42JjYqOio+JjomOiY6KjomOiY6JjoqNioyKjomMiYuHi4qLiouLCHdnbVVjQ2NDbVV3Zwh9cgWJiIiJiIuJi36SdJiIjYmOi46LjY+UlJlvl3KcdJ90oHeie6WHkYmSi5IIsIsVqlq0Z711CKGzBXqXfpqCnoKdhp6LoIuikaCWn2B1Z2luXgj3GLAVi4eMiI6IjoiOio+Lj4uOjI6OjY6NjouPi5uQmZeXl5aZkZuLj4uOjI6OjY6NjouPCIuPiY6JjoiNiI2Hi3OLd4J6enp6gneLcwji+10VoLAFtI+wmK2hrqKnqKKvdq1wp2uhCJ2rBZ1/nHycepx6mHqWeY+EjYWLhIuEiYWHhIR/gH1+fG9qaXJmeWV5Y4Jhiwi53BXb9yQFjIKMg4uEi3CDc3x1fHV3fHOBCA6L1BWL90sFi5WPlJKSkpKTj5aLCNmLBZKPmJqepJaZlZeVlY+Qj5ONl42WjpeOmI+YkZWTk5OSk46Vi5uLmYiYhZiFlIGSfgiSfo55i3WLeYd5gXgIvosFn4uchJl8mn2Seot3i3qGfIJ9jYSLhYuEi3yIfoR+i4eLh4uHi3eGen99i3CDdnt8CHt8dYNwiwhmiwV5i3mNeY95kHeRc5N1k36Ph4sIOYsFgIuDjoSShJKHlIuVCLCdFYuGjIePiI+Hj4mQi5CLj42Pj46OjY+LkIuQiZCIjoePh42Gi4aLh4mHh4eIioaLhgjUeRWUiwWNi46Lj4qOi4+KjYqOi4+Kj4mQio6KjYqNio+Kj4mQio6KjIqzfquEpIsIrosFr4uemouri5CKkYqQkY6QkI6SjpKNkouSi5KJkoiRlZWQlouYi5CKkImRiZGJj4iOCJGMkI+PlI+UjZKLkouViJODk4SSgo+CiwgmiwWLlpCalJ6UnpCbi5aLnoiYhJSFlH+QeYuGhoeDiYCJf4h/h3+IfoWBg4KHh4SCgH4Ii4qIiYiGh4aIh4mIiIiIh4eGh4aHh4eHiIiHiIeHiIiHiIeKh4mIioiLCIKLi/tLBQ6L90sVi/dLBYuVj5OSk5KSk46WiwjdiwWPi5iPoZOkk6CRnZCdj56Nn4sIq4sFpougg5x8m3yTd4txCIuJBZd8kHuLd4uHi4eLh5J+jn6LfIuEi4SJhZR9kHyLeot3hHp8fH19eoR3iwhYiwWVeI95i3mLdIh6hH6EfoKBfoV+hX2He4uBi4OPg5KFkYaTh5SHlYiTipOKk4qTiJMIiZSIkYiPgZSBl4CaeKR+moSPCD2LBYCLg4+EkoSSh5SLlQiw9zgVi4aMh4+Ij4ePiZCLkIuPjY+Pjo6Nj4uQi5CJkIiOh4+HjYaLhouHiYeHh4iKhouGCNT7OBWUiwWOi46Kj4mPio+IjoiPh4+IjoePiI+Hj4aPho6HjoiNiI6Hj4aOho6Ii4qWfpKDj4YIk4ORgY5+j36OgI1/jYCPg5CGnYuXj5GUkpSOmYuei5aGmoKfgp6GmouWCPCLBZSLlI+SkpOTjpOLlYuSiZKHlIeUho+Fi46PjY+NkY2RjJCLkIuYhpaBlY6RjZKLkgiLkomSiJKIkoaQhY6MkIyRi5CLm4aXgpOBkn6Pe4sIZosFcotrhGN9iouIioaJh4qHiomKiYqIioaKh4mHioiKiYuHioiLh4qIi4mLCIKLi/tLBQ77lIv3txWLkpCPlo0I9yOgzPcWBY6SkI+RiwiL/BL7FUcFh4mHioiLh4uIjImOiY6KjouPi4yLjYyOCKP3IyPwBYaQiZCLjwgOi/fFFYu1l6yjoqOjrZe2i5aLl4mYh5eHloWWhJaElIWShZOEkoWShJKSkpGTkpKRlJGWkgiWkpaRl4+Yj5eNlou2i61/o3OjdJdqi2GLYXVgYGAI+0b7QAWHiIeJhouGi4eNh44I+0b3QAWJjYmNh4+IjoaRg5SElIWVhZSFlYaWh5mGmImYi5gIsIsVi2ucaa9oCPc6+zT3OvczBa+vnK2Lq4ubiZiHl4eXhpSFkoSSg5GCj4KQgo2CjYONgYuBi4KLgIl/hoCGgIWChAiBg4OFhISEhYaFhoaIhoaJhYuFi4aNiJCGkIaRhJGEkoORgZOCkoCRgJB/kICNgosIgYuBi4OJgomCiYKGgoeDhYSEhYSGgod/h3+Jfot7CA77JouyFYv4BAWLkY2Rj5GOkJCPko2PjY+Mj4sI98CLBY+Lj4qPiZGJkIePho+FjYWLhQiL/AQFi4SJhYeGh4aGh4WIiIqGioeLgYuEjoSRCPsS9w37EvsNBYSFg4iCi4eLh4uHjYSOho+IkIeQiZGLkgiwkxX3JvchpHL3DfsIi/f3+7iLi/v3BQ5ni8sVi/c5BYuSjpKQkJCQko6Siwj3VIuLwgWLrpippKSkpKmYrouvi6l+pHKkcpdti2gIi0IFi4aKhoeIh4eHiYaLCHmLBYaLh42Hj4eOipCLkAiL1AWLn4OcfZp9mXqSdot3i3qEfX18fIR6i3cIi1SniwWSi5KIkIaQho6Ei4QIi/s5BYuDiIWGhoaFhImEiwj7p4sFhIuEjYaRhpCIkYuTCA5njPe6FYyQkI6UjQj3I6DM9xYFj5KPj5GLkIuQh4+ECMv7FvcjdgWUiZCIjYaNhoiFhYUIIyak+yMFjIWKhomHiYiIiYaLiIuHjIeNCPsUz/sVRwWHiYeKiIuHi4eNiY6Jj4uQjJEIo/cjI/AFhZGJkY2QCPeB+z0VnILlW3rxiJ6ZmNTS+wydgpxe54v7pwUOZ4vCFYv3SwWLkI2Pjo+Pjo+NkIsI3osFkIuPiY6Ij4eNh4uGCIv7SwWLhomHh4eIh4eKhosIOIsFhouHjIePiI+Jj4uQCLCvFYuGjIePh46IkImQi5CLj42Pjo6PjY+LkIuQiZCIjoePh42Gi4aLhomIh4eIioaLhgjvZxWL90sFi5CNj46Oj4+PjZCLj4ySkJWWlZaVl5SXmJuVl5GRjo6OkI6RjZCNkIyPjI6MkY2TCIySjJGMj4yPjZCOkY6RjpCPjo6Pj42Qi5SLk4qSiZKJkYiPiJCIjoiPho6GjYeMhwiNh4yGjIaMhYuHi4iLiIuHi4eLg4uEiYSJhImFiYeJh4mFh4WLioqJiomJiIqJiokIi4qKiIqJCNqLBZqLmIWWgJaAkH+LfIt6hn2Af46DjYSLhIt9h36Cf4+Bi3+HgImAhYKEhI12hnmAfgh/fXiDcosIZosFfot+jHyOfI5/joOOg41/j32Qc5N8j4SMhouHjYiOh4+Jj4uQCA5ni/c5FYuGjYaOiI+Hj4mQiwjeiwWQi4+Njo+Pjo2Qi5AIi/dKBYuQiZCHjoiPh42Giwg4iwWGi4eJh4eIiImGi4YIi/tKBbD3JhWLkIyPj4+OjpCNkIuQi4+Jj4iOh42Hi4aLhomHiIeHh4eKhouGi4aMiI+Hj4qPi5AI7/snFYv3SwWLkI2Qj46Oj4+NkIuSi5qPo5OZkJePk46TjZeOmo6ajpiMmIsIsIsFpIueg5d9ln6Qeol1koSRgo2Aj4CLgIeAlH+Pfot9i4WJhIiCloCQfIt7i3yFfoGACICAfoZ8iwg8iwWMiIyJi4mMiYyJjYmMiIyKi4mPhI2GjYeNh42GjYOMhIyEi4SLhouHi4iLiYuGioYIioWKhomHioeJh4iGh4eIh4aIh4iFiISJhImDioKLhouHjYiPh4+Ij4iRiJGJkIqPCIqPipGKkomTipGKj4qOiZCJkYiQiJCIjoWSgZZ+nIKXgZaBloGWhJGHi4aLh42HjwiIjomQi48IDviUFPiUFYsMCgAAAAADAgABkAAFAAABTAFmAAAARwFMAWYAAAD1ABkAhAAAAAAAAAAAAAAAAAAAAAEQAAAAAAAAAAAAAAAAAAAAAEAAAPFlAeD/4P/gAeAAIAAAAAEAAAAAAAAAAAAAACAAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQAkAAAACAAIAAEAAAAAQAg5gXwBvAN8CPwLvBu8HDwivCX8JzxI/Fl//3//wAAAAAAIOYA8ATwDPAj8C7wbvBw8Ifwl/Cc8SPxZP/9//8AAf/jGgQQBhABD+wP4g+jD6IPjA+AD3wO9g62AAMAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAf//AA8AAQAAAAEAAJrVlLJfDzz1AAsCAAAAAADP/GODAAAAAM/8Y4MAAP/bAgAB2wAAAAgAAgAAAAAAAAABAAAB4P/gAAACAAAAAAACAAABAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAEAAAACAAAAAgAAAAIAAAACAAAAAgAAAAIAAAACAAAAAdwAAAHcAAACAAAjAZMAHwFJAAABbgAAAgAAAAIAAAACAAAAAgAAAAEAAAACAAAAAW4AAAHcAAAB3AABAdwAAAHcAAAAAFAAABwAAAAAAA4ArgABAAAAAAABAAwAAAABAAAAAAACAA4AQAABAAAAAAADAAwAIgABAAAAAAAEAAwATgABAAAAAAAFABYADAABAAAAAAAGAAYALgABAAAAAAAKADQAWgADAAEECQABAAwAAAADAAEECQACAA4AQAADAAEECQADAAwAIgADAAEECQAEAAwATgADAAEECQAFABYADAADAAEECQAGAAwANAADAAEECQAKADQAWgByAGEAdABpAG4AZwBWAGUAcgBzAGkAbwBuACAAMQAuADAAcgBhAHQAaQBuAGdyYXRpbmcAcgBhAHQAaQBuAGcAUgBlAGcAdQBsAGEAcgByAGEAdABpAG4AZwBGAG8AbgB0ACAAZwBlAG4AZQByAGEAdABlAGQAIABiAHkAIABJAGMAbwBNAG8AbwBuAC4AAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==) format('woff');\n  font-weight: 400;\n  font-style: normal;\n}\n.ui.rating .active.icon:before,\n.ui.rating .icon:before,\n.ui.star.rating .active.icon:before,\n.ui.star.rating .icon:before {\n  content: '\\f005';\n}\n.ui.star.rating .partial.icon:before {\n  content: '\\f006';\n}\n.ui.star.rating .partial.icon {\n  content: '\\f005';\n}\n.ui.heart.rating .active.icon:before,\n.ui.heart.rating .icon:before {\n  content: '\\f004';\n}\n.ui.search {\n  position: relative;\n}\n.ui.search>.prompt {\n  margin: 0;\n  outline: 0;\n  -webkit-appearance: none;\n  -webkit-tap-highlight-color: rgba(255,255,255,0);\n  text-shadow: none;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.2142em;\n  padding: .67861429em 1em;\n  font-size: 1em;\n  background: #FFF;\n  border: 1px solid rgba(34,36,38,.15);\n  color: rgba(0,0,0,.87);\n  box-shadow: 0 0 0 0 transparent inset;\n  -webkit-transition: background-color .1s ease,color .1s ease,box-shadow .1s ease,border-color .1s ease;\n  transition: background-color .1s ease,color .1s ease,box-shadow .1s ease,border-color .1s ease;\n}\n.ui.search .prompt {\n  border-radius: 500rem;\n}\n.ui.search .prompt~.search.icon {\n  cursor: pointer;\n}\n.ui.search>.results {\n  display: none;\n  position: absolute;\n  top: 100%;\n  left: 0;\n  -webkit-transform-origin: center top;\n  -ms-transform-origin: center top;\n  transform-origin: center top;\n  white-space: normal;\n  background: #FFF;\n  margin-top: .5em;\n  width: 18em;\n  border-radius: .28571429rem;\n  box-shadow: 0 2px 4px 0 rgba(34,36,38,.12),0 2px 10px 0 rgba(34,36,38,.15);\n  border: 1px solid #D4D4D5;\n  z-index: 998;\n}\n.ui.search>.results>:first-child {\n  border-radius: .28571429rem .28571429rem 0 0;\n}\n.ui.search>.results>:last-child {\n  border-radius: 0 0 .28571429rem .28571429rem;\n}\n.ui.search>.results .result {\n  cursor: pointer;\n  display: block;\n  overflow: hidden;\n  font-size: 1em;\n  padding: .85714286em 1.14285714em;\n  color: rgba(0,0,0,.87);\n  line-height: 1.33;\n  border-bottom: 1px solid rgba(34,36,38,.1);\n}\n.ui.search>.results .result:last-child {\n  border-bottom: none!important;\n}\n.ui.search>.results .result .image {\n  float: right;\n  overflow: hidden;\n  background: 0 0;\n  width: 5em;\n  height: 3em;\n  border-radius: .25em;\n}\n.ui.search>.results .result .image img {\n  display: block;\n  width: auto;\n  height: 100%;\n}\n.ui.search>.results .result .image+.content {\n  margin: 0 6em 0 0;\n}\n.ui.search>.results .result .title {\n  margin: -.14285em 0 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-weight: 700;\n  font-size: 1em;\n  color: rgba(0,0,0,.85);\n}\n.ui.search>.results .result .description {\n  margin-top: 0;\n  font-size: .92857143em;\n  color: rgba(0,0,0,.4);\n}\n.ui.search>.results .result .price {\n  float: right;\n  color: #21BA45;\n}\n.ui.search>.results>.message {\n  padding: 1em;\n}\n.ui.search>.results>.message .header {\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1rem;\n  font-weight: 700;\n  color: rgba(0,0,0,.87);\n}\n.ui.search>.results>.message .description {\n  margin-top: .25rem;\n  font-size: 1em;\n  color: rgba(0,0,0,.87);\n}\n.ui.search>.results>.action {\n  display: block;\n  border-top: none;\n  background: #F3F4F5;\n  padding: .92857143em 1em;\n  color: rgba(0,0,0,.87);\n  font-weight: 700;\n  text-align: center;\n}\n.ui.search>.prompt:focus {\n  border-color: rgba(34,36,38,.35);\n  background: #FFF;\n  color: rgba(0,0,0,.95);\n}\n.ui.loading.search .input>i.icon:before {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.1);\n}\n.ui.loading.search .input>i.icon:after {\n  position: absolute;\n  content: '';\n  top: 50%;\n  left: 50%;\n  margin: -.64285714em 0 0 -.64285714em;\n  width: 1.28571429em;\n  height: 1.28571429em;\n  -webkit-animation: button-spin .6s linear;\n  animation: button-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n}\n.ui.category.search>.results .category .result:hover,\n.ui.search>.results .result:hover {\n  background: #F9FAFB;\n}\n.ui.search .action:hover {\n  background: #E0E0E0;\n}\n.ui.category.search>.results .category.active {\n  background: #F3F4F5;\n}\n.ui.category.search>.results .category.active>.name {\n  color: rgba(0,0,0,.87);\n}\n.ui.category.search>.results .category .result.active,\n.ui.search>.results .result.active {\n  position: relative;\n  border-left-color: rgba(34,36,38,.1);\n  background: #F3F4F5;\n  box-shadow: none;\n}\n.ui.search>.results .result.active .description,\n.ui.search>.results .result.active .title {\n  color: rgba(0,0,0,.85);\n}\n.ui.search.selection .prompt {\n  border-radius: .28571429rem;\n}\n.ui.search.selection>.icon.input>.remove.icon {\n  pointer-events: none;\n  position: absolute;\n  left: auto;\n  opacity: 0;\n  color: '';\n  top: 0;\n  right: 0;\n  -webkit-transition: color .1s ease,opacity .1s ease;\n  transition: color .1s ease,opacity .1s ease;\n}\n.ui.search.selection>.icon.input>.active.remove.icon {\n  cursor: pointer;\n  opacity: .8;\n  pointer-events: auto;\n}\n.ui.search.selection>.icon.input:not([class*=\"left icon\"])>.icon~.remove.icon {\n  right: 1.85714em;\n}\n.ui.search.selection>.icon.input>.remove.icon:hover {\n  opacity: 1;\n  color: #DB2828;\n}\n.ui.category.search .results {\n  width: 28em;\n}\n.ui.category.search>.results .category {\n  background: #F3F4F5;\n  box-shadow: none;\n  border-bottom: 1px solid rgba(34,36,38,.1);\n  -webkit-transition: background .1s ease,border-color .1s ease;\n  transition: background .1s ease,border-color .1s ease;\n}\n.ui.category.search>.results .category:last-child {\n  border-bottom: none;\n}\n.ui.category.search>.results .category:first-child .name+.result {\n  border-radius: 0 .28571429rem 0 0;\n}\n.ui.category.search>.results .category .result {\n  background: #FFF;\n  margin-left: 100px;\n  border-left: 1px solid rgba(34,36,38,.15);\n  border-bottom: 1px solid rgba(34,36,38,.1);\n  -webkit-transition: background .1s ease,border-color .1s ease;\n  transition: background .1s ease,border-color .1s ease;\n  padding: .85714286em 1.14285714em;\n}\n.ui.category.search>.results .category:last-child .result:last-child {\n  border-radius: 0 0 .28571429rem;\n  border-bottom: none;\n}\n.ui.category.search>.results .category>.name {\n  width: 100px;\n  background: 0 0;\n  font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;\n  font-size: 1em;\n  float: 1em;\n  float: left;\n  padding: .4em 1em;\n  font-weight: 700;\n  color: rgba(0,0,0,.4);\n}\n.ui[class*=\"left aligned\"].search>.results {\n  right: auto;\n  left: 0;\n}\n.ui[class*=\"right aligned\"].search>.results {\n  right: 0;\n  left: auto;\n}\n.ui.fluid.search .results {\n  width: 100%;\n}\n.ui.mini.search {\n  font-size: .78571429em;\n}\n.ui.small.search {\n  font-size: .92857143em;\n}\n.ui.search {\n  font-size: 1em;\n}\n.ui.large.search {\n  font-size: 1.14285714em;\n}\n.ui.big.search {\n  font-size: 1.28571429em;\n}\n.ui.huge.search {\n  font-size: 1.42857143em;\n}\n.ui.massive.search {\n  font-size: 1.71428571em;\n}\n.ui.shape {\n  position: relative;\n  vertical-align: top;\n  display: inline-block;\n  -webkit-perspective: 2000px;\n  perspective: 2000px;\n  -webkit-transition: left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n  transition: left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n  transition: transform .6s ease-in-out,left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out;\n  transition: transform .6s ease-in-out,left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n}\n.ui.shape .sides {\n  -webkit-transform-style: preserve-3d;\n  transform-style: preserve-3d;\n}\n.ui.shape .side {\n  opacity: 1;\n  width: 100%;\n  margin: 0!important;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  display: none;\n}\n.ui.shape .side * {\n  -webkit-backface-visibility: visible!important;\n  backface-visibility: visible!important;\n}\n.ui.cube.shape .side {\n  min-width: 15em;\n  height: 15em;\n  padding: 2em;\n  background-color: #E6E6E6;\n  color: rgba(0,0,0,.87);\n  box-shadow: 0 0 2px rgba(0,0,0,.3);\n}\n.ui.cube.shape .side>.content {\n  width: 100%;\n  height: 100%;\n  display: table;\n  text-align: center;\n  -webkit-user-select: text;\n  -moz-user-select: text;\n  -ms-user-select: text;\n  user-select: text;\n}\n.ui.cube.shape .side>.content>div {\n  display: table-cell;\n  vertical-align: middle;\n  font-size: 2em;\n}\n.ui.text.shape.animating .sides {\n  position: static;\n}\n.ui.text.shape .side {\n  white-space: nowrap;\n}\n.ui.text.shape .side>* {\n  white-space: normal;\n}\n.ui.loading.shape {\n  position: absolute;\n  top: -9999px;\n  left: -9999px;\n}\n.ui.shape .animating.side {\n  position: absolute;\n  top: 0;\n  left: 0;\n  display: block;\n  z-index: 100;\n}\n.ui.shape .hidden.side {\n  opacity: .6;\n}\n.ui.shape.animating .sides {\n  position: absolute;\n  -webkit-transition: left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n  transition: left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n  transition: transform .6s ease-in-out,left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out;\n  transition: transform .6s ease-in-out,left .6s ease-in-out,width .6s ease-in-out,height .6s ease-in-out,-webkit-transform .6s ease-in-out;\n}\n.ui.shape.animating .side {\n  -webkit-transition: opacity .6s ease-in-out;\n  transition: opacity .6s ease-in-out;\n}\n.ui.shape .active.side {\n  display: block;\n}\n.ui.sidebar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  -webkit-transition: none;\n  transition: none;\n  will-change: transform;\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n  visibility: hidden;\n  -webkit-overflow-scrolling: touch;\n  height: 100%!important;\n  max-height: 100%;\n  border-radius: 0!important;\n  margin: 0!important;\n  overflow-y: auto!important;\n  z-index: 102;\n}\n.ui.sidebar>* {\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\n.ui.left.sidebar {\n  right: auto;\n  left: 0;\n  -webkit-transform: translate3d(-100%,0,0);\n  transform: translate3d(-100%,0,0);\n}\n.ui.right.sidebar {\n  right: 0!important;\n  left: auto!important;\n  -webkit-transform: translate3d(100%,0,0);\n  transform: translate3d(100%,0,0);\n}\n.ui.bottom.sidebar,\n.ui.top.sidebar {\n  width: 100%!important;\n  height: auto!important;\n}\n.ui.top.sidebar {\n  top: 0!important;\n  bottom: auto!important;\n  -webkit-transform: translate3d(0,-100%,0);\n  transform: translate3d(0,-100%,0);\n}\n.ui.bottom.sidebar {\n  top: auto!important;\n  bottom: 0!important;\n  -webkit-transform: translate3d(0,100%,0);\n  transform: translate3d(0,100%,0);\n}\n.pushable {\n  height: 100%;\n  overflow-x: hidden;\n  padding: 0!important;\n}\nbody.pushable {\n  background: #545454!important;\n}\n.pushable:not(body) {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.pushable:not(body)>.fixed,\n.pushable:not(body)>.pusher:after,\n.pushable:not(body)>.ui.sidebar {\n  position: absolute;\n}\n.pushable>.fixed {\n  position: fixed;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n  will-change: transform;\n  z-index: 101;\n}\nbody.pushable>.pusher {\n  background: #FFF;\n}\n.pushable>.pusher {\n  position: relative;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  overflow: hidden;\n  min-height: 100%;\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n  z-index: 2;\n  background: inherit;\n}\n.pushable>.pusher:after {\n  position: fixed;\n  top: 0;\n  right: 0;\n  content: '';\n  background-color: rgba(0,0,0,.4);\n  overflow: hidden;\n  opacity: 0;\n  -webkit-transition: opacity .5s;\n  transition: opacity .5s;\n  will-change: opacity;\n  z-index: 1000;\n}\n.ui.sidebar.menu .item {\n  border-radius: 0!important;\n}\n.pushable>.pusher.dimmed:after {\n  width: 100%!important;\n  height: 100%!important;\n  opacity: 1!important;\n}\n.ui.animating.sidebar {\n  visibility: visible;\n}\n.ui.visible.sidebar {\n  visibility: visible;\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.bottom.visible.sidebar,\n.ui.left.visible.sidebar,\n.ui.right.visible.sidebar,\n.ui.top.visible.sidebar {\n  box-shadow: 0 0 20px rgba(34,36,38,.15);\n}\n.ui.visible.left.sidebar~.fixed,\n.ui.visible.left.sidebar~.pusher {\n  -webkit-transform: translate3d(260px,0,0);\n  transform: translate3d(260px,0,0);\n}\n.ui.visible.right.sidebar~.fixed,\n.ui.visible.right.sidebar~.pusher {\n  -webkit-transform: translate3d(-260px,0,0);\n  transform: translate3d(-260px,0,0);\n}\n.ui.visible.top.sidebar~.fixed,\n.ui.visible.top.sidebar~.pusher {\n  -webkit-transform: translate3d(0,36px,0);\n  transform: translate3d(0,36px,0);\n}\n.ui.visible.bottom.sidebar~.fixed,\n.ui.visible.bottom.sidebar~.pusher {\n  -webkit-transform: translate3d(0,-36px,0);\n  transform: translate3d(0,-36px,0);\n}\n.ui.visible.left.sidebar~.ui.visible.right.sidebar~.fixed,\n.ui.visible.left.sidebar~.ui.visible.right.sidebar~.pusher,\n.ui.visible.right.sidebar~.ui.visible.left.sidebar~.fixed,\n.ui.visible.right.sidebar~.ui.visible.left.sidebar~.pusher {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\nhtml.ios {\n  overflow-x: hidden;\n  -webkit-overflow-scrolling: touch;\n}\nhtml.ios,\nhtml.ios body {\n  height: initial!important;\n}\n.ui.thin.left.sidebar,\n.ui.thin.right.sidebar {\n  width: 150px;\n}\n.ui[class*=\"very thin\"].left.sidebar,\n.ui[class*=\"very thin\"].right.sidebar {\n  width: 60px;\n}\n.ui.left.sidebar,\n.ui.right.sidebar {\n  width: 260px;\n}\n.ui.wide.left.sidebar,\n.ui.wide.right.sidebar {\n  width: 350px;\n}\n.ui[class*=\"very wide\"].left.sidebar,\n.ui[class*=\"very wide\"].right.sidebar {\n  width: 475px;\n}\n.ui.visible.thin.left.sidebar~.fixed,\n.ui.visible.thin.left.sidebar~.pusher {\n  -webkit-transform: translate3d(150px,0,0);\n  transform: translate3d(150px,0,0);\n}\n.ui.visible[class*=\"very thin\"].left.sidebar~.fixed,\n.ui.visible[class*=\"very thin\"].left.sidebar~.pusher {\n  -webkit-transform: translate3d(60px,0,0);\n  transform: translate3d(60px,0,0);\n}\n.ui.visible.wide.left.sidebar~.fixed,\n.ui.visible.wide.left.sidebar~.pusher {\n  -webkit-transform: translate3d(350px,0,0);\n  transform: translate3d(350px,0,0);\n}\n.ui.visible[class*=\"very wide\"].left.sidebar~.fixed,\n.ui.visible[class*=\"very wide\"].left.sidebar~.pusher {\n  -webkit-transform: translate3d(475px,0,0);\n  transform: translate3d(475px,0,0);\n}\n.ui.visible.thin.right.sidebar~.fixed,\n.ui.visible.thin.right.sidebar~.pusher {\n  -webkit-transform: translate3d(-150px,0,0);\n  transform: translate3d(-150px,0,0);\n}\n.ui.visible[class*=\"very thin\"].right.sidebar~.fixed,\n.ui.visible[class*=\"very thin\"].right.sidebar~.pusher {\n  -webkit-transform: translate3d(-60px,0,0);\n  transform: translate3d(-60px,0,0);\n}\n.ui.visible.wide.right.sidebar~.fixed,\n.ui.visible.wide.right.sidebar~.pusher {\n  -webkit-transform: translate3d(-350px,0,0);\n  transform: translate3d(-350px,0,0);\n}\n.ui.visible[class*=\"very wide\"].right.sidebar~.fixed,\n.ui.visible[class*=\"very wide\"].right.sidebar~.pusher {\n  -webkit-transform: translate3d(-475px,0,0);\n  transform: translate3d(-475px,0,0);\n}\n.ui.overlay.sidebar {\n  z-index: 102;\n}\n.ui.left.overlay.sidebar {\n  -webkit-transform: translate3d(-100%,0,0);\n  transform: translate3d(-100%,0,0);\n}\n.ui.right.overlay.sidebar {\n  -webkit-transform: translate3d(100%,0,0);\n  transform: translate3d(100%,0,0);\n}\n.ui.top.overlay.sidebar {\n  -webkit-transform: translate3d(0,-100%,0);\n  transform: translate3d(0,-100%,0);\n}\n.ui.bottom.overlay.sidebar {\n  -webkit-transform: translate3d(0,100%,0);\n  transform: translate3d(0,100%,0);\n}\n.animating.ui.overlay.sidebar,\n.ui.visible.overlay.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n}\n.ui.visible.bottom.overlay.sidebar,\n.ui.visible.left.overlay.sidebar,\n.ui.visible.right.overlay.sidebar,\n.ui.visible.top.overlay.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.visible.overlay.sidebar~.fixed,\n.ui.visible.overlay.sidebar~.pusher {\n  -webkit-transform: none!important;\n  -ms-transform: none!important;\n  transform: none!important;\n}\n.ui.push.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n  z-index: 102;\n}\n.ui.left.push.sidebar {\n  -webkit-transform: translate3d(-100%,0,0);\n  transform: translate3d(-100%,0,0);\n}\n.ui.right.push.sidebar {\n  -webkit-transform: translate3d(100%,0,0);\n  transform: translate3d(100%,0,0);\n}\n.ui.top.push.sidebar {\n  -webkit-transform: translate3d(0,-100%,0);\n  transform: translate3d(0,-100%,0);\n}\n.ui.bottom.push.sidebar {\n  -webkit-transform: translate3d(0,100%,0);\n  transform: translate3d(0,100%,0);\n}\n.ui.visible.push.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.uncover.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n  z-index: 1;\n}\n.ui.visible.uncover.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n}\n.ui.slide.along.sidebar {\n  z-index: 1;\n}\n.ui.left.slide.along.sidebar {\n  -webkit-transform: translate3d(-50%,0,0);\n  transform: translate3d(-50%,0,0);\n}\n.ui.right.slide.along.sidebar {\n  -webkit-transform: translate3d(50%,0,0);\n  transform: translate3d(50%,0,0);\n}\n.ui.top.slide.along.sidebar {\n  -webkit-transform: translate3d(0,-50%,0);\n  transform: translate3d(0,-50%,0);\n}\n.ui.bottom.slide.along.sidebar {\n  -webkit-transform: translate3d(0,50%,0);\n  transform: translate3d(0,50%,0);\n}\n.ui.animating.slide.along.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n}\n.ui.visible.slide.along.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.slide.out.sidebar {\n  z-index: 1;\n}\n.ui.left.slide.out.sidebar {\n  -webkit-transform: translate3d(50%,0,0);\n  transform: translate3d(50%,0,0);\n}\n.ui.right.slide.out.sidebar {\n  -webkit-transform: translate3d(-50%,0,0);\n  transform: translate3d(-50%,0,0);\n}\n.ui.top.slide.out.sidebar {\n  -webkit-transform: translate3d(0,50%,0);\n  transform: translate3d(0,50%,0);\n}\n.ui.bottom.slide.out.sidebar {\n  -webkit-transform: translate3d(0,-50%,0);\n  transform: translate3d(0,-50%,0);\n}\n.ui.animating.slide.out.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n}\n.ui.visible.slide.out.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.scale.down.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n  z-index: 102;\n}\n.ui.left.scale.down.sidebar {\n  -webkit-transform: translate3d(-100%,0,0);\n  transform: translate3d(-100%,0,0);\n}\n.ui.right.scale.down.sidebar {\n  -webkit-transform: translate3d(100%,0,0);\n  transform: translate3d(100%,0,0);\n}\n.ui.top.scale.down.sidebar {\n  -webkit-transform: translate3d(0,-100%,0);\n  transform: translate3d(0,-100%,0);\n}\n.ui.bottom.scale.down.sidebar {\n  -webkit-transform: translate3d(0,100%,0);\n  transform: translate3d(0,100%,0);\n}\n.ui.scale.down.left.sidebar~.pusher {\n  -webkit-transform-origin: 75% 50%;\n  -ms-transform-origin: 75% 50%;\n  transform-origin: 75% 50%;\n}\n.ui.scale.down.right.sidebar~.pusher {\n  -webkit-transform-origin: 25% 50%;\n  -ms-transform-origin: 25% 50%;\n  transform-origin: 25% 50%;\n}\n.ui.scale.down.top.sidebar~.pusher {\n  -webkit-transform-origin: 50% 75%;\n  -ms-transform-origin: 50% 75%;\n  transform-origin: 50% 75%;\n}\n.ui.scale.down.bottom.sidebar~.pusher {\n  -webkit-transform-origin: 50% 25%;\n  -ms-transform-origin: 50% 25%;\n  transform-origin: 50% 25%;\n}\n.ui.animating.scale.down>.visible.ui.sidebar {\n  -webkit-transition: -webkit-transform .5s ease;\n  transition: -webkit-transform .5s ease;\n  transition: transform .5s ease;\n  transition: transform .5s ease,-webkit-transform .5s ease;\n}\n.ui.animating.scale.down.sidebar~.pusher,\n.ui.visible.scale.down.sidebar~.pusher {\n  display: block!important;\n  width: 100%;\n  height: 100%;\n  overflow: hidden!important;\n}\n.ui.visible.scale.down.sidebar {\n  -webkit-transform: translate3d(0,0,0);\n  transform: translate3d(0,0,0);\n}\n.ui.visible.scale.down.sidebar~.pusher {\n  -webkit-transform: scale(.75);\n  -ms-transform: scale(.75);\n  transform: scale(.75);\n}\n.ui.sticky {\n  position: static;\n  -webkit-transition: none;\n  transition: none;\n  z-index: 800;\n}\n.ui.sticky.bound {\n  position: absolute;\n  left: auto;\n  right: auto;\n}\n.ui.sticky.fixed {\n  position: fixed;\n  left: auto;\n  right: auto;\n}\n.ui.sticky.bound.top,\n.ui.sticky.fixed.top {\n  top: 0;\n  bottom: auto;\n}\n.ui.sticky.bound.bottom,\n.ui.sticky.fixed.bottom {\n  top: auto;\n  bottom: 0;\n}\n.ui.native.sticky {\n  position: -webkit-sticky;\n  position: -moz-sticky;\n  position: -ms-sticky;\n  position: -o-sticky;\n  position: sticky;\n}\n.ui.tab {\n  display: none;\n}\n.ui.tab.active,\n.ui.tab.open {\n  display: block;\n}\n.ui.tab.loading {\n  position: relative;\n  overflow: hidden;\n  display: block;\n  min-height: 250px;\n}\n.ui.tab.loading * {\n  position: relative!important;\n  left: -10000px!important;\n}\n.ui.tab.loading.segment:before,\n.ui.tab.loading:before {\n  position: absolute;\n  content: '';\n  top: 100px;\n  left: 50%;\n  margin: -1.25em 0 0 -1.25em;\n  width: 2.5em;\n  height: 2.5em;\n  border-radius: 500rem;\n  border: .2em solid rgba(0,0,0,.1);\n}\n.ui.tab.loading.segment:after,\n.ui.tab.loading:after {\n  position: absolute;\n  content: '';\n  top: 100px;\n  left: 50%;\n  margin: -1.25em 0 0 -1.25em;\n  width: 2.5em;\n  height: 2.5em;\n  -webkit-animation: button-spin .6s linear;\n  animation: button-spin .6s linear;\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  border-radius: 500rem;\n  border-color: #767676 transparent transparent;\n  border-style: solid;\n  border-width: .2em;\n  box-shadow: 0 0 0 1px transparent;\n}\n.transition {\n  -webkit-animation-iteration-count: 1;\n  animation-iteration-count: 1;\n  -webkit-animation-duration: .3s;\n  animation-duration: .3s;\n  -webkit-animation-timing-function: ease;\n  animation-timing-function: ease;\n  -webkit-animation-fill-mode: both;\n  animation-fill-mode: both;\n}\n.animating.transition {\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  visibility: visible!important;\n}\n.loading.transition {\n  position: absolute;\n  top: -99999px;\n  left: -99999px;\n}\n.hidden.transition {\n  display: none;\n  visibility: hidden;\n}\n.visible.transition {\n  display: block!important;\n  visibility: visible!important;\n}\n.disabled.transition {\n  -webkit-animation-play-state: paused;\n  animation-play-state: paused;\n}\n.looping.transition {\n  -webkit-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n}\n.transition.browse {\n  -webkit-animation-duration: .5s;\n  animation-duration: .5s;\n}\n.transition.browse.in {\n  -webkit-animation-name: browseIn;\n  animation-name: browseIn;\n}\n.transition.browse.left.out,\n.transition.browse.out {\n  -webkit-animation-name: browseOutLeft;\n  animation-name: browseOutLeft;\n}\n.transition.browse.right.out {\n  -webkit-animation-name: browseOutRight;\n  animation-name: browseOutRight;\n}\n@-webkit-keyframes browseIn {\n  0% {\n    -webkit-transform: scale(.8) translateZ(0);\n    transform: scale(.8) translateZ(0);\n    z-index: -1;\n  }\n\n  10% {\n    -webkit-transform: scale(.8) translateZ(0);\n    transform: scale(.8) translateZ(0);\n    z-index: -1;\n    opacity: .7;\n  }\n\n  80% {\n    -webkit-transform: scale(1.05) translateZ(0);\n    transform: scale(1.05) translateZ(0);\n    opacity: 1;\n    z-index: 999;\n  }\n\n  100% {\n    -webkit-transform: scale(1) translateZ(0);\n    transform: scale(1) translateZ(0);\n    z-index: 999;\n  }\n}\n@keyframes browseIn {\n  0% {\n    -webkit-transform: scale(.8) translateZ(0);\n    transform: scale(.8) translateZ(0);\n    z-index: -1;\n  }\n\n  10% {\n    -webkit-transform: scale(.8) translateZ(0);\n    transform: scale(.8) translateZ(0);\n    z-index: -1;\n    opacity: .7;\n  }\n\n  80% {\n    -webkit-transform: scale(1.05) translateZ(0);\n    transform: scale(1.05) translateZ(0);\n    opacity: 1;\n    z-index: 999;\n  }\n\n  100% {\n    -webkit-transform: scale(1) translateZ(0);\n    transform: scale(1) translateZ(0);\n    z-index: 999;\n  }\n}\n@-webkit-keyframes browseOutLeft {\n  0% {\n    z-index: 999;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0);\n    transform: translateX(0) rotateY(0) rotateX(0);\n  }\n\n  50% {\n    z-index: -1;\n    -webkit-transform: translateX(-105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n    transform: translateX(-105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n  }\n\n  80% {\n    opacity: 1;\n  }\n\n  100% {\n    z-index: -1;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    opacity: 0;\n  }\n}\n@keyframes browseOutLeft {\n  0% {\n    z-index: 999;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0);\n    transform: translateX(0) rotateY(0) rotateX(0);\n  }\n\n  50% {\n    z-index: -1;\n    -webkit-transform: translateX(-105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n    transform: translateX(-105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n  }\n\n  80% {\n    opacity: 1;\n  }\n\n  100% {\n    z-index: -1;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    opacity: 0;\n  }\n}\n@-webkit-keyframes browseOutRight {\n  0% {\n    z-index: 999;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0);\n    transform: translateX(0) rotateY(0) rotateX(0);\n  }\n\n  50% {\n    z-index: 1;\n    -webkit-transform: translateX(105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n    transform: translateX(105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n  }\n\n  80% {\n    opacity: 1;\n  }\n\n  100% {\n    z-index: 1;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    opacity: 0;\n  }\n}\n@keyframes browseOutRight {\n  0% {\n    z-index: 999;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0);\n    transform: translateX(0) rotateY(0) rotateX(0);\n  }\n\n  50% {\n    z-index: 1;\n    -webkit-transform: translateX(105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n    transform: translateX(105%) rotateY(35deg) rotateX(10deg) translateZ(-10px);\n  }\n\n  80% {\n    opacity: 1;\n  }\n\n  100% {\n    z-index: 1;\n    -webkit-transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    transform: translateX(0) rotateY(0) rotateX(0) translateZ(-10px);\n    opacity: 0;\n  }\n}\n.drop.transition {\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n  -webkit-animation-duration: .4s;\n  animation-duration: .4s;\n  -webkit-animation-timing-function: cubic-bezier(.34,1.61,.7,1);\n  animation-timing-function: cubic-bezier(.34,1.61,.7,1);\n}\n.drop.transition.in {\n  -webkit-animation-name: dropIn;\n  animation-name: dropIn;\n}\n.drop.transition.out {\n  -webkit-animation-name: dropOut;\n  animation-name: dropOut;\n}\n@-webkit-keyframes dropIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n}\n@keyframes dropIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes dropOut {\n  0% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n}\n@keyframes dropOut {\n  0% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale(0);\n    transform: scale(0);\n  }\n}\n.transition.fade.in {\n  -webkit-animation-name: fadeIn;\n  animation-name: fadeIn;\n}\n.transition[class*=\"fade up\"].in {\n  -webkit-animation-name: fadeInUp;\n  animation-name: fadeInUp;\n}\n.transition[class*=\"fade down\"].in {\n  -webkit-animation-name: fadeInDown;\n  animation-name: fadeInDown;\n}\n.transition[class*=\"fade left\"].in {\n  -webkit-animation-name: fadeInLeft;\n  animation-name: fadeInLeft;\n}\n.transition[class*=\"fade right\"].in {\n  -webkit-animation-name: fadeInRight;\n  animation-name: fadeInRight;\n}\n.transition.fade.out {\n  -webkit-animation-name: fadeOut;\n  animation-name: fadeOut;\n}\n.transition[class*=\"fade up\"].out {\n  -webkit-animation-name: fadeOutUp;\n  animation-name: fadeOutUp;\n}\n.transition[class*=\"fade down\"].out {\n  -webkit-animation-name: fadeOutDown;\n  animation-name: fadeOutDown;\n}\n.transition[class*=\"fade left\"].out {\n  -webkit-animation-name: fadeOutLeft;\n  animation-name: fadeOutLeft;\n}\n.transition[class*=\"fade right\"].out {\n  -webkit-animation-name: fadeOutRight;\n  animation-name: fadeOutRight;\n}\n@-webkit-keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n@keyframes fadeIn {\n  0% {\n    opacity: 0;\n  }\n\n  100% {\n    opacity: 1;\n  }\n}\n@-webkit-keyframes fadeInUp {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(10%);\n    transform: translateY(10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n}\n@keyframes fadeInUp {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(10%);\n    transform: translateY(10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n}\n@-webkit-keyframes fadeInDown {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-10%);\n    transform: translateY(-10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n}\n@keyframes fadeInDown {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateY(-10%);\n    transform: translateY(-10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n}\n@-webkit-keyframes fadeInLeft {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateX(10%);\n    transform: translateX(10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n@keyframes fadeInLeft {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateX(10%);\n    transform: translateX(10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n@-webkit-keyframes fadeInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateX(-10%);\n    transform: translateX(-10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n@keyframes fadeInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translateX(-10%);\n    transform: translateX(-10%);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n}\n@-webkit-keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n\n  100% {\n    opacity: 0;\n  }\n}\n@keyframes fadeOut {\n  0% {\n    opacity: 1;\n  }\n\n  100% {\n    opacity: 0;\n  }\n}\n@-webkit-keyframes fadeOutUp {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(5%);\n    transform: translateY(5%);\n  }\n}\n@keyframes fadeOutUp {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(5%);\n    transform: translateY(5%);\n  }\n}\n@-webkit-keyframes fadeOutDown {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(-5%);\n    transform: translateY(-5%);\n  }\n}\n@keyframes fadeOutDown {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateY(-5%);\n    transform: translateY(-5%);\n  }\n}\n@-webkit-keyframes fadeOutLeft {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateX(5%);\n    transform: translateX(5%);\n  }\n}\n@keyframes fadeOutLeft {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateX(5%);\n    transform: translateX(5%);\n  }\n}\n@-webkit-keyframes fadeOutRight {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateX(-5%);\n    transform: translateX(-5%);\n  }\n}\n@keyframes fadeOutRight {\n  0% {\n    opacity: 1;\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translateX(-5%);\n    transform: translateX(-5%);\n  }\n}\n.flip.transition.in,\n.flip.transition.out {\n  -webkit-animation-duration: .6s;\n  animation-duration: .6s;\n}\n.horizontal.flip.transition.in {\n  -webkit-animation-name: horizontalFlipIn;\n  animation-name: horizontalFlipIn;\n}\n.horizontal.flip.transition.out {\n  -webkit-animation-name: horizontalFlipOut;\n  animation-name: horizontalFlipOut;\n}\n.vertical.flip.transition.in {\n  -webkit-animation-name: verticalFlipIn;\n  animation-name: verticalFlipIn;\n}\n.vertical.flip.transition.out {\n  -webkit-animation-name: verticalFlipOut;\n  animation-name: verticalFlipOut;\n}\n@-webkit-keyframes horizontalFlipIn {\n  0% {\n    -webkit-transform: perspective(2000px) rotateY(-90deg);\n    transform: perspective(2000px) rotateY(-90deg);\n    opacity: 0;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateY(0);\n    transform: perspective(2000px) rotateY(0);\n    opacity: 1;\n  }\n}\n@keyframes horizontalFlipIn {\n  0% {\n    -webkit-transform: perspective(2000px) rotateY(-90deg);\n    transform: perspective(2000px) rotateY(-90deg);\n    opacity: 0;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateY(0);\n    transform: perspective(2000px) rotateY(0);\n    opacity: 1;\n  }\n}\n@-webkit-keyframes verticalFlipIn {\n  0% {\n    -webkit-transform: perspective(2000px) rotateX(-90deg);\n    transform: perspective(2000px) rotateX(-90deg);\n    opacity: 0;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateX(0);\n    transform: perspective(2000px) rotateX(0);\n    opacity: 1;\n  }\n}\n@keyframes verticalFlipIn {\n  0% {\n    -webkit-transform: perspective(2000px) rotateX(-90deg);\n    transform: perspective(2000px) rotateX(-90deg);\n    opacity: 0;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateX(0);\n    transform: perspective(2000px) rotateX(0);\n    opacity: 1;\n  }\n}\n@-webkit-keyframes horizontalFlipOut {\n  0% {\n    -webkit-transform: perspective(2000px) rotateY(0);\n    transform: perspective(2000px) rotateY(0);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateY(90deg);\n    transform: perspective(2000px) rotateY(90deg);\n    opacity: 0;\n  }\n}\n@keyframes horizontalFlipOut {\n  0% {\n    -webkit-transform: perspective(2000px) rotateY(0);\n    transform: perspective(2000px) rotateY(0);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateY(90deg);\n    transform: perspective(2000px) rotateY(90deg);\n    opacity: 0;\n  }\n}\n@-webkit-keyframes verticalFlipOut {\n  0% {\n    -webkit-transform: perspective(2000px) rotateX(0);\n    transform: perspective(2000px) rotateX(0);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateX(-90deg);\n    transform: perspective(2000px) rotateX(-90deg);\n    opacity: 0;\n  }\n}\n@keyframes verticalFlipOut {\n  0% {\n    -webkit-transform: perspective(2000px) rotateX(0);\n    transform: perspective(2000px) rotateX(0);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(2000px) rotateX(-90deg);\n    transform: perspective(2000px) rotateX(-90deg);\n    opacity: 0;\n  }\n}\n.scale.transition.in {\n  -webkit-animation-name: scaleIn;\n  animation-name: scaleIn;\n}\n.scale.transition.out {\n  -webkit-animation-name: scaleOut;\n  animation-name: scaleOut;\n}\n@-webkit-keyframes scaleIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale(.8);\n    transform: scale(.8);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n}\n@keyframes scaleIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale(.8);\n    transform: scale(.8);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n}\n@-webkit-keyframes scaleOut {\n  0% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale(.9);\n    transform: scale(.9);\n  }\n}\n@keyframes scaleOut {\n  0% {\n    opacity: 1;\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale(.9);\n    transform: scale(.9);\n  }\n}\n.transition.fly {\n  -webkit-animation-duration: .6s;\n  animation-duration: .6s;\n  -webkit-transition-timing-function: cubic-bezier(.215,.61,.355,1);\n  transition-timing-function: cubic-bezier(.215,.61,.355,1);\n}\n.transition.fly.in {\n  -webkit-animation-name: flyIn;\n  animation-name: flyIn;\n}\n.transition[class*=\"fly up\"].in {\n  -webkit-animation-name: flyInUp;\n  animation-name: flyInUp;\n}\n.transition[class*=\"fly down\"].in {\n  -webkit-animation-name: flyInDown;\n  animation-name: flyInDown;\n}\n.transition[class*=\"fly left\"].in {\n  -webkit-animation-name: flyInLeft;\n  animation-name: flyInLeft;\n}\n.transition[class*=\"fly right\"].in {\n  -webkit-animation-name: flyInRight;\n  animation-name: flyInRight;\n}\n.transition.fly.out {\n  -webkit-animation-name: flyOut;\n  animation-name: flyOut;\n}\n.transition[class*=\"fly up\"].out {\n  -webkit-animation-name: flyOutUp;\n  animation-name: flyOutUp;\n}\n.transition[class*=\"fly down\"].out {\n  -webkit-animation-name: flyOutDown;\n  animation-name: flyOutDown;\n}\n.transition[class*=\"fly left\"].out {\n  -webkit-animation-name: flyOutLeft;\n  animation-name: flyOutLeft;\n}\n.transition[class*=\"fly right\"].out {\n  -webkit-animation-name: flyOutRight;\n  animation-name: flyOutRight;\n}\n@-webkit-keyframes flyIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3,.3,.3);\n    transform: scale3d(.3,.3,.3);\n  }\n\n  20% {\n    -webkit-transform: scale3d(1.1,1.1,1.1);\n    transform: scale3d(1.1,1.1,1.1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.9,.9,.9);\n    transform: scale3d(.9,.9,.9);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03,1.03,1.03);\n    transform: scale3d(1.03,1.03,1.03);\n  }\n\n  80% {\n    -webkit-transform: scale3d(.97,.97,.97);\n    transform: scale3d(.97,.97,.97);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale3d(1,1,1);\n    transform: scale3d(1,1,1);\n  }\n}\n@keyframes flyIn {\n  0% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3,.3,.3);\n    transform: scale3d(.3,.3,.3);\n  }\n\n  20% {\n    -webkit-transform: scale3d(1.1,1.1,1.1);\n    transform: scale3d(1.1,1.1,1.1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.9,.9,.9);\n    transform: scale3d(.9,.9,.9);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.03,1.03,1.03);\n    transform: scale3d(1.03,1.03,1.03);\n  }\n\n  80% {\n    -webkit-transform: scale3d(.97,.97,.97);\n    transform: scale3d(.97,.97,.97);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scale3d(1,1,1);\n    transform: scale3d(1,1,1);\n  }\n}\n@-webkit-keyframes flyInUp {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,1500px,0);\n    transform: translate3d(0,1500px,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,-20px,0);\n    transform: translate3d(0,-20px,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0,10px,0);\n    transform: translate3d(0,10px,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,-5px,0);\n    transform: translate3d(0,-5px,0);\n  }\n\n  100% {\n    -webkit-transform: translate3d(0,0,0);\n    transform: translate3d(0,0,0);\n  }\n}\n@keyframes flyInUp {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,1500px,0);\n    transform: translate3d(0,1500px,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,-20px,0);\n    transform: translate3d(0,-20px,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0,10px,0);\n    transform: translate3d(0,10px,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,-5px,0);\n    transform: translate3d(0,-5px,0);\n  }\n\n  100% {\n    -webkit-transform: translate3d(0,0,0);\n    transform: translate3d(0,0,0);\n  }\n}\n@-webkit-keyframes flyInDown {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,-1500px,0);\n    transform: translate3d(0,-1500px,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,25px,0);\n    transform: translate3d(0,25px,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0,-10px,0);\n    transform: translate3d(0,-10px,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,5px,0);\n    transform: translate3d(0,5px,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@keyframes flyInDown {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,-1500px,0);\n    transform: translate3d(0,-1500px,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,25px,0);\n    transform: translate3d(0,25px,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(0,-10px,0);\n    transform: translate3d(0,-10px,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(0,5px,0);\n    transform: translate3d(0,5px,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@-webkit-keyframes flyInLeft {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(1500px,0,0);\n    transform: translate3d(1500px,0,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(-25px,0,0);\n    transform: translate3d(-25px,0,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(10px,0,0);\n    transform: translate3d(10px,0,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(-5px,0,0);\n    transform: translate3d(-5px,0,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@keyframes flyInLeft {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(1500px,0,0);\n    transform: translate3d(1500px,0,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(-25px,0,0);\n    transform: translate3d(-25px,0,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(10px,0,0);\n    transform: translate3d(10px,0,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(-5px,0,0);\n    transform: translate3d(-5px,0,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@-webkit-keyframes flyInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(-1500px,0,0);\n    transform: translate3d(-1500px,0,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(25px,0,0);\n    transform: translate3d(25px,0,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-10px,0,0);\n    transform: translate3d(-10px,0,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(5px,0,0);\n    transform: translate3d(5px,0,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@keyframes flyInRight {\n  0% {\n    opacity: 0;\n    -webkit-transform: translate3d(-1500px,0,0);\n    transform: translate3d(-1500px,0,0);\n  }\n\n  60% {\n    opacity: 1;\n    -webkit-transform: translate3d(25px,0,0);\n    transform: translate3d(25px,0,0);\n  }\n\n  75% {\n    -webkit-transform: translate3d(-10px,0,0);\n    transform: translate3d(-10px,0,0);\n  }\n\n  90% {\n    -webkit-transform: translate3d(5px,0,0);\n    transform: translate3d(5px,0,0);\n  }\n\n  100% {\n    -webkit-transform: none;\n    transform: none;\n  }\n}\n@-webkit-keyframes flyOut {\n  20% {\n    -webkit-transform: scale3d(.9,.9,.9);\n    transform: scale3d(.9,.9,.9);\n  }\n\n  50%, 55% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.1,1.1,1.1);\n    transform: scale3d(1.1,1.1,1.1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3,.3,.3);\n    transform: scale3d(.3,.3,.3);\n  }\n}\n@keyframes flyOut {\n  20% {\n    -webkit-transform: scale3d(.9,.9,.9);\n    transform: scale3d(.9,.9,.9);\n  }\n\n  50%, 55% {\n    opacity: 1;\n    -webkit-transform: scale3d(1.1,1.1,1.1);\n    transform: scale3d(1.1,1.1,1.1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scale3d(.3,.3,.3);\n    transform: scale3d(.3,.3,.3);\n  }\n}\n@-webkit-keyframes flyOutUp {\n  20% {\n    -webkit-transform: translate3d(0,10px,0);\n    transform: translate3d(0,10px,0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,-20px,0);\n    transform: translate3d(0,-20px,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,2000px,0);\n    transform: translate3d(0,2000px,0);\n  }\n}\n@keyframes flyOutUp {\n  20% {\n    -webkit-transform: translate3d(0,10px,0);\n    transform: translate3d(0,10px,0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,-20px,0);\n    transform: translate3d(0,-20px,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,2000px,0);\n    transform: translate3d(0,2000px,0);\n  }\n}\n@-webkit-keyframes flyOutDown {\n  20% {\n    -webkit-transform: translate3d(0,-10px,0);\n    transform: translate3d(0,-10px,0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,20px,0);\n    transform: translate3d(0,20px,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,-2000px,0);\n    transform: translate3d(0,-2000px,0);\n  }\n}\n@keyframes flyOutDown {\n  20% {\n    -webkit-transform: translate3d(0,-10px,0);\n    transform: translate3d(0,-10px,0);\n  }\n\n  40%, 45% {\n    opacity: 1;\n    -webkit-transform: translate3d(0,20px,0);\n    transform: translate3d(0,20px,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(0,-2000px,0);\n    transform: translate3d(0,-2000px,0);\n  }\n}\n@-webkit-keyframes flyOutRight {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(20px,0,0);\n    transform: translate3d(20px,0,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px,0,0);\n    transform: translate3d(-2000px,0,0);\n  }\n}\n@keyframes flyOutRight {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(20px,0,0);\n    transform: translate3d(20px,0,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(-2000px,0,0);\n    transform: translate3d(-2000px,0,0);\n  }\n}\n@-webkit-keyframes flyOutLeft {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(-20px,0,0);\n    transform: translate3d(-20px,0,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px,0,0);\n    transform: translate3d(2000px,0,0);\n  }\n}\n@keyframes flyOutLeft {\n  20% {\n    opacity: 1;\n    -webkit-transform: translate3d(-20px,0,0);\n    transform: translate3d(-20px,0,0);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: translate3d(2000px,0,0);\n    transform: translate3d(2000px,0,0);\n  }\n}\n.transition.slide.in,\n.transition[class*=\"slide down\"].in {\n  -webkit-animation-name: slideInY;\n  animation-name: slideInY;\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n}\n.transition[class*=\"slide up\"].in {\n  -webkit-animation-name: slideInY;\n  animation-name: slideInY;\n  -webkit-transform-origin: bottom center;\n  -ms-transform-origin: bottom center;\n  transform-origin: bottom center;\n}\n.transition[class*=\"slide left\"].in {\n  -webkit-animation-name: slideInX;\n  animation-name: slideInX;\n  -webkit-transform-origin: center right;\n  -ms-transform-origin: center right;\n  transform-origin: center right;\n}\n.transition[class*=\"slide right\"].in {\n  -webkit-animation-name: slideInX;\n  animation-name: slideInX;\n  -webkit-transform-origin: center left;\n  -ms-transform-origin: center left;\n  transform-origin: center left;\n}\n.transition.slide.out,\n.transition[class*=\"slide down\"].out {\n  -webkit-animation-name: slideOutY;\n  animation-name: slideOutY;\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n}\n.transition[class*=\"slide up\"].out {\n  -webkit-animation-name: slideOutY;\n  animation-name: slideOutY;\n  -webkit-transform-origin: bottom center;\n  -ms-transform-origin: bottom center;\n  transform-origin: bottom center;\n}\n.transition[class*=\"slide left\"].out {\n  -webkit-animation-name: slideOutX;\n  animation-name: slideOutX;\n  -webkit-transform-origin: center right;\n  -ms-transform-origin: center right;\n  transform-origin: center right;\n}\n.transition[class*=\"slide right\"].out {\n  -webkit-animation-name: slideOutX;\n  animation-name: slideOutX;\n  -webkit-transform-origin: center left;\n  -ms-transform-origin: center left;\n  transform-origin: center left;\n}\n@-webkit-keyframes slideInY {\n  0% {\n    opacity: 0;\n    -webkit-transform: scaleY(0);\n    transform: scaleY(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scaleY(1);\n    transform: scaleY(1);\n  }\n}\n@keyframes slideInY {\n  0% {\n    opacity: 0;\n    -webkit-transform: scaleY(0);\n    transform: scaleY(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scaleY(1);\n    transform: scaleY(1);\n  }\n}\n@-webkit-keyframes slideInX {\n  0% {\n    opacity: 0;\n    -webkit-transform: scaleX(0);\n    transform: scaleX(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scaleX(1);\n    transform: scaleX(1);\n  }\n}\n@keyframes slideInX {\n  0% {\n    opacity: 0;\n    -webkit-transform: scaleX(0);\n    transform: scaleX(0);\n  }\n\n  100% {\n    opacity: 1;\n    -webkit-transform: scaleX(1);\n    transform: scaleX(1);\n  }\n}\n@-webkit-keyframes slideOutY {\n  0% {\n    opacity: 1;\n    -webkit-transform: scaleY(1);\n    transform: scaleY(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scaleY(0);\n    transform: scaleY(0);\n  }\n}\n@keyframes slideOutY {\n  0% {\n    opacity: 1;\n    -webkit-transform: scaleY(1);\n    transform: scaleY(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scaleY(0);\n    transform: scaleY(0);\n  }\n}\n@-webkit-keyframes slideOutX {\n  0% {\n    opacity: 1;\n    -webkit-transform: scaleX(1);\n    transform: scaleX(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scaleX(0);\n    transform: scaleX(0);\n  }\n}\n@keyframes slideOutX {\n  0% {\n    opacity: 1;\n    -webkit-transform: scaleX(1);\n    transform: scaleX(1);\n  }\n\n  100% {\n    opacity: 0;\n    -webkit-transform: scaleX(0);\n    transform: scaleX(0);\n  }\n}\n.transition.swing {\n  -webkit-animation-duration: .8s;\n  animation-duration: .8s;\n}\n.transition[class*=\"swing down\"].in {\n  -webkit-animation-name: swingInX;\n  animation-name: swingInX;\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n}\n.transition[class*=\"swing up\"].in {\n  -webkit-animation-name: swingInX;\n  animation-name: swingInX;\n  -webkit-transform-origin: bottom center;\n  -ms-transform-origin: bottom center;\n  transform-origin: bottom center;\n}\n.transition[class*=\"swing left\"].in {\n  -webkit-animation-name: swingInY;\n  animation-name: swingInY;\n  -webkit-transform-origin: center right;\n  -ms-transform-origin: center right;\n  transform-origin: center right;\n}\n.transition[class*=\"swing right\"].in {\n  -webkit-animation-name: swingInY;\n  animation-name: swingInY;\n  -webkit-transform-origin: center left;\n  -ms-transform-origin: center left;\n  transform-origin: center left;\n}\n.transition.swing.out,\n.transition[class*=\"swing down\"].out {\n  -webkit-animation-name: swingOutX;\n  animation-name: swingOutX;\n  -webkit-transform-origin: top center;\n  -ms-transform-origin: top center;\n  transform-origin: top center;\n}\n.transition[class*=\"swing up\"].out {\n  -webkit-animation-name: swingOutX;\n  animation-name: swingOutX;\n  -webkit-transform-origin: bottom center;\n  -ms-transform-origin: bottom center;\n  transform-origin: bottom center;\n}\n.transition[class*=\"swing left\"].out {\n  -webkit-animation-name: swingOutY;\n  animation-name: swingOutY;\n  -webkit-transform-origin: center right;\n  -ms-transform-origin: center right;\n  transform-origin: center right;\n}\n.transition[class*=\"swing right\"].out {\n  -webkit-animation-name: swingOutY;\n  animation-name: swingOutY;\n  -webkit-transform-origin: center left;\n  -ms-transform-origin: center left;\n  transform-origin: center left;\n}\n@-webkit-keyframes swingInX {\n  0% {\n    -webkit-transform: perspective(1000px) rotateX(90deg);\n    transform: perspective(1000px) rotateX(90deg);\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateX(-30deg);\n    transform: perspective(1000px) rotateX(-30deg);\n    opacity: 1;\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateX(15deg);\n    transform: perspective(1000px) rotateX(15deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateX(-7.5deg);\n    transform: perspective(1000px) rotateX(-7.5deg);\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateX(0);\n    transform: perspective(1000px) rotateX(0);\n  }\n}\n@keyframes swingInX {\n  0% {\n    -webkit-transform: perspective(1000px) rotateX(90deg);\n    transform: perspective(1000px) rotateX(90deg);\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateX(-30deg);\n    transform: perspective(1000px) rotateX(-30deg);\n    opacity: 1;\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateX(15deg);\n    transform: perspective(1000px) rotateX(15deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateX(-7.5deg);\n    transform: perspective(1000px) rotateX(-7.5deg);\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateX(0);\n    transform: perspective(1000px) rotateX(0);\n  }\n}\n@-webkit-keyframes swingInY {\n  0% {\n    -webkit-transform: perspective(1000px) rotateY(-90deg);\n    transform: perspective(1000px) rotateY(-90deg);\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateY(30deg);\n    transform: perspective(1000px) rotateY(30deg);\n    opacity: 1;\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateY(-17.5deg);\n    transform: perspective(1000px) rotateY(-17.5deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateY(7.5deg);\n    transform: perspective(1000px) rotateY(7.5deg);\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateY(0);\n    transform: perspective(1000px) rotateY(0);\n  }\n}\n@keyframes swingInY {\n  0% {\n    -webkit-transform: perspective(1000px) rotateY(-90deg);\n    transform: perspective(1000px) rotateY(-90deg);\n    opacity: 0;\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateY(30deg);\n    transform: perspective(1000px) rotateY(30deg);\n    opacity: 1;\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateY(-17.5deg);\n    transform: perspective(1000px) rotateY(-17.5deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateY(7.5deg);\n    transform: perspective(1000px) rotateY(7.5deg);\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateY(0);\n    transform: perspective(1000px) rotateY(0);\n  }\n}\n@-webkit-keyframes swingOutX {\n  0% {\n    -webkit-transform: perspective(1000px) rotateX(0);\n    transform: perspective(1000px) rotateX(0);\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateX(-7.5deg);\n    transform: perspective(1000px) rotateX(-7.5deg);\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateX(17.5deg);\n    transform: perspective(1000px) rotateX(17.5deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateX(-30deg);\n    transform: perspective(1000px) rotateX(-30deg);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateX(90deg);\n    transform: perspective(1000px) rotateX(90deg);\n    opacity: 0;\n  }\n}\n@keyframes swingOutX {\n  0% {\n    -webkit-transform: perspective(1000px) rotateX(0);\n    transform: perspective(1000px) rotateX(0);\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateX(-7.5deg);\n    transform: perspective(1000px) rotateX(-7.5deg);\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateX(17.5deg);\n    transform: perspective(1000px) rotateX(17.5deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateX(-30deg);\n    transform: perspective(1000px) rotateX(-30deg);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateX(90deg);\n    transform: perspective(1000px) rotateX(90deg);\n    opacity: 0;\n  }\n}\n@-webkit-keyframes swingOutY {\n  0% {\n    -webkit-transform: perspective(1000px) rotateY(0);\n    transform: perspective(1000px) rotateY(0);\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateY(7.5deg);\n    transform: perspective(1000px) rotateY(7.5deg);\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateY(-10deg);\n    transform: perspective(1000px) rotateY(-10deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateY(30deg);\n    transform: perspective(1000px) rotateY(30deg);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateY(-90deg);\n    transform: perspective(1000px) rotateY(-90deg);\n    opacity: 0;\n  }\n}\n@keyframes swingOutY {\n  0% {\n    -webkit-transform: perspective(1000px) rotateY(0);\n    transform: perspective(1000px) rotateY(0);\n  }\n\n  40% {\n    -webkit-transform: perspective(1000px) rotateY(7.5deg);\n    transform: perspective(1000px) rotateY(7.5deg);\n  }\n\n  60% {\n    -webkit-transform: perspective(1000px) rotateY(-10deg);\n    transform: perspective(1000px) rotateY(-10deg);\n  }\n\n  80% {\n    -webkit-transform: perspective(1000px) rotateY(30deg);\n    transform: perspective(1000px) rotateY(30deg);\n    opacity: 1;\n  }\n\n  100% {\n    -webkit-transform: perspective(1000px) rotateY(-90deg);\n    transform: perspective(1000px) rotateY(-90deg);\n    opacity: 0;\n  }\n}\n.flash.transition {\n  -webkit-animation-duration: 750ms;\n  animation-duration: 750ms;\n  -webkit-animation-name: flash;\n  animation-name: flash;\n}\n.shake.transition {\n  -webkit-animation-duration: 750ms;\n  animation-duration: 750ms;\n  -webkit-animation-name: shake;\n  animation-name: shake;\n}\n.bounce.transition {\n  -webkit-animation-duration: 750ms;\n  animation-duration: 750ms;\n  -webkit-animation-name: bounce;\n  animation-name: bounce;\n}\n.tada.transition {\n  -webkit-animation-duration: 750ms;\n  animation-duration: 750ms;\n  -webkit-animation-name: tada;\n  animation-name: tada;\n}\n.pulse.transition {\n  -webkit-animation-duration: .5s;\n  animation-duration: .5s;\n  -webkit-animation-name: pulse;\n  animation-name: pulse;\n}\n.jiggle.transition {\n  -webkit-animation-duration: 750ms;\n  animation-duration: 750ms;\n  -webkit-animation-name: jiggle;\n  animation-name: jiggle;\n}\n@-webkit-keyframes flash {\n  0%, 100%, 50% {\n    opacity: 1;\n  }\n\n  25%, 75% {\n    opacity: 0;\n  }\n}\n@keyframes flash {\n  0%, 100%, 50% {\n    opacity: 1;\n  }\n\n  25%, 75% {\n    opacity: 0;\n  }\n}\n@-webkit-keyframes shake {\n  0%, 100% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  10%, 30%, 50%, 70%, 90% {\n    -webkit-transform: translateX(-10px);\n    transform: translateX(-10px);\n  }\n\n  20%, 40%, 60%, 80% {\n    -webkit-transform: translateX(10px);\n    transform: translateX(10px);\n  }\n}\n@keyframes shake {\n  0%, 100% {\n    -webkit-transform: translateX(0);\n    transform: translateX(0);\n  }\n\n  10%, 30%, 50%, 70%, 90% {\n    -webkit-transform: translateX(-10px);\n    transform: translateX(-10px);\n  }\n\n  20%, 40%, 60%, 80% {\n    -webkit-transform: translateX(10px);\n    transform: translateX(10px);\n  }\n}\n@-webkit-keyframes bounce {\n  0%, 100%, 20%, 50%, 80% {\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  40% {\n    -webkit-transform: translateY(-30px);\n    transform: translateY(-30px);\n  }\n\n  60% {\n    -webkit-transform: translateY(-15px);\n    transform: translateY(-15px);\n  }\n}\n@keyframes bounce {\n  0%, 100%, 20%, 50%, 80% {\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n\n  40% {\n    -webkit-transform: translateY(-30px);\n    transform: translateY(-30px);\n  }\n\n  60% {\n    -webkit-transform: translateY(-15px);\n    transform: translateY(-15px);\n  }\n}\n@-webkit-keyframes tada {\n  0% {\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  10%, 20% {\n    -webkit-transform: scale(.9) rotate(-3deg);\n    transform: scale(.9) rotate(-3deg);\n  }\n\n  30%, 50%, 70%, 90% {\n    -webkit-transform: scale(1.1) rotate(3deg);\n    transform: scale(1.1) rotate(3deg);\n  }\n\n  40%, 60%, 80% {\n    -webkit-transform: scale(1.1) rotate(-3deg);\n    transform: scale(1.1) rotate(-3deg);\n  }\n\n  100% {\n    -webkit-transform: scale(1) rotate(0);\n    transform: scale(1) rotate(0);\n  }\n}\n@keyframes tada {\n  0% {\n    -webkit-transform: scale(1);\n    transform: scale(1);\n  }\n\n  10%, 20% {\n    -webkit-transform: scale(.9) rotate(-3deg);\n    transform: scale(.9) rotate(-3deg);\n  }\n\n  30%, 50%, 70%, 90% {\n    -webkit-transform: scale(1.1) rotate(3deg);\n    transform: scale(1.1) rotate(3deg);\n  }\n\n  40%, 60%, 80% {\n    -webkit-transform: scale(1.1) rotate(-3deg);\n    transform: scale(1.1) rotate(-3deg);\n  }\n\n  100% {\n    -webkit-transform: scale(1) rotate(0);\n    transform: scale(1) rotate(0);\n  }\n}\n@-webkit-keyframes pulse {\n  0%, 100% {\n    -webkit-transform: scale(1);\n    transform: scale(1);\n    opacity: 1;\n  }\n\n  50% {\n    -webkit-transform: scale(.9);\n    transform: scale(.9);\n    opacity: .7;\n  }\n}\n@keyframes pulse {\n  0%, 100% {\n    -webkit-transform: scale(1);\n    transform: scale(1);\n    opacity: 1;\n  }\n\n  50% {\n    -webkit-transform: scale(.9);\n    transform: scale(.9);\n    opacity: .7;\n  }\n}\n@-webkit-keyframes jiggle {\n  0%, 100% {\n    -webkit-transform: scale3d(1,1,1);\n    transform: scale3d(1,1,1);\n  }\n\n  30% {\n    -webkit-transform: scale3d(1.25,.75,1);\n    transform: scale3d(1.25,.75,1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.75,1.25,1);\n    transform: scale3d(.75,1.25,1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.15,.85,1);\n    transform: scale3d(1.15,.85,1);\n  }\n\n  65% {\n    -webkit-transform: scale3d(.95,1.05,1);\n    transform: scale3d(.95,1.05,1);\n  }\n\n  75% {\n    -webkit-transform: scale3d(1.05,.95,1);\n    transform: scale3d(1.05,.95,1);\n  }\n}\n@keyframes jiggle {\n  0%, 100% {\n    -webkit-transform: scale3d(1,1,1);\n    transform: scale3d(1,1,1);\n  }\n\n  30% {\n    -webkit-transform: scale3d(1.25,.75,1);\n    transform: scale3d(1.25,.75,1);\n  }\n\n  40% {\n    -webkit-transform: scale3d(.75,1.25,1);\n    transform: scale3d(.75,1.25,1);\n  }\n\n  50% {\n    -webkit-transform: scale3d(1.15,.85,1);\n    transform: scale3d(1.15,.85,1);\n  }\n\n  65% {\n    -webkit-transform: scale3d(.95,1.05,1);\n    transform: scale3d(.95,1.05,1);\n  }\n\n  75% {\n    -webkit-transform: scale3d(1.05,.95,1);\n    transform: scale3d(1.05,.95,1);\n  }\n}\nbody {\n  background-color: #fff;\n}\n"; (require("browserify-css").createStyle(css, { "href": "src/client/app.css" }, { "insertAt": "bottom" })); module.exports = css;
},{"browserify-css":1}],5:[function(require,module,exports){
'use strict';

require('./app.css');

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import ExclamationsViewer from './exclamations_viewer.vue';

// require('./app.css');
new _vue2.default({
  el: '#app-container',
  render: function render(createElement) {
    //return createElement(ExclamationsViewer);
  }
});

},{"./app.css":4,"vue":3}]},{},[5]);
