(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
  var autoCompleteHelper, component, dom, items, _ref;

  _ref = require('odojs'), component = _ref.component, dom = _ref.dom;

  autoCompleteHelper = require('odojs-autocomplete');

  items = ['Buildings', 'Shared Services', 'Control Systems', 'High Voltage', 'Other', 'Fluid Exchanger', 'Protection System', 'Steam Plant', 'Steam Turbines', 'Geo Wells', 'Therm Generators', 'Transformers', 'Transmission'];

  module.exports = function(state, params, hub) {
    var helper, isopen;
    console.log(params);
    if (params == null) {
      params = {};
    }
    if (params.value == null) {
      params.value = '';
    }
    if (params.isopen == null) {
      params.isopen = false;
    }
    if (params.selectedindex == null) {
      params.selectedindex = null;
    }
    if (params.items == null) {
      params.items = items;
    }
    helper = autoCompleteHelper(state, params, hub.child({
      update: function(p, cb) {
        p.items = items.filter(function(item) {
          return item.toLowerCase().indexOf(p.value.toLowerCase()) === 0;
        });
        if (p.items.length === 1) {
          if (p.items[0] === p.value) {
            p.items = items;
          } else if (p.isopen && (p.selectedindex == null)) {
            p.selectedindex = 0;
          }
        }
        console.log(p);
        hub.emit('update', {
          autocomplete: p
        });
        return cb();
      }
    }));
    isopen = params.isopen && params.items.length > 0;
    helper.inputparams.value = params.value;
    return dom(".metoceanview-selector" + (isopen ? '.open' : ''), [
      dom('div.selector-input-wrapper', [dom('input', helper.inputparams)]), isopen ? dom('div.list-container', [
        dom('ul', params.items.map(function(item, index) {
          var description, isselected, linkparams;
          description = dom('span', item);
          if (params.items.length !== items.length) {
            description = [dom('span.underline', item.substr(0, params.value.length)), dom('span', item.substr(params.value.length))];
          }
          isselected = index === params.selectedindex;
          linkparams = helper.linkparams(item, index);
          return dom("" + (isselected ? 'li.selected' : 'li'), dom('.item', linkparams, description));
        }))
      ]) : void 0
    ]);
  };

}).call(this);

},{"odojs":26,"odojs-autocomplete":19}],2:[function(require,module,exports){
(function() {
  var component, dom, exe, hub, odoql, relay, root, router, scene, selector, _ref;

  _ref = require('odojs'), component = _ref.component, hub = _ref.hub, dom = _ref.dom;

  relay = require('odo-relay');

  exe = require('odoql-exe');

  odoql = require('odoql/odojs');

  component.use(odoql);

  hub = hub();

  exe = exe({
    hub: hub
  });

  selector = require('./components/selector');

  router = component({
    render: function(state, params, hub) {
      console.log(params.siteDataSetSelector);
      return dom('#root.metoceanview-creatives-page.grid', [
        dom('div.example.selector-example', [
          dom('div', 'Selector component: '), selector(state, params.siteDataSetSelector, hub["new"]({
            update: function(m, cb) {
              hub.emit('update', {
                siteDataSetSelector: m.autocomplete
              });
              return cb();
            }
          }))
        ]), dom('div.example', 'need component here'), dom('div.example', 'need component here'), dom('div.example', 'need component here'), dom('div.example', 'need component here')
      ]);
    }
  });

  root = document.querySelector('#root');

  scene = relay(root, router, exe, {
    hub: hub
  });

  hub.every('update', function(p, cb) {
    scene.update(p);
    return cb();
  });

  scene.update({});

}).call(this);

},{"./components/selector":1,"odo-relay":3,"odojs":26,"odoql-exe":98,"odoql/odojs":116}],3:[function(require,module,exports){
(function() {
  var cache, extend, layers;

  extend = require('extend');

  layers = require('odo-layers');

  cache = require('odoql-exe/cache');

  module.exports = function(el, component, exe, options) {
    var Relay, log, update, _cache, _memory, _scene, _state;
    _scene = null;
    _memory = {};
    _state = layers();
    log = function() {};
    if ((options != null ? options.hub : void 0) != null) {
      log = function(message) {
        return options.hub.emit('[odo-relay] {message}', {
          message: message
        });
      };
    }
    update = function() {
      if (_scene == null) {
        log('mounting');
        return Relay.mount();
      }
      log('updating');
      return _scene.update(_state.get(), _memory, options != null ? options.hub : void 0);
    };
    _cache = cache(exe, options);
    _cache.on('ready', update);
    _cache.on('result', _state.apply);
    if ((options != null ? options.queries : void 0) != null) {
      _cache.apply(options.queries);
    }
    if ((options != null ? options.state : void 0) != null) {
      _state.apply(options.state);
    }
    Relay = {
      mount: function() {
        return _scene = component.mount(el, _state.get(), _memory, options != null ? options.hub : void 0, options);
      },
      update: function(params) {
        extend(_memory, params);
        return _cache.run(component.query(_memory));
      },
      layer: _state.layer,
      params: function() {
        return _memory;
      },
      hub: function() {
        return options != null ? options.hub : void 0;
      },
      state: function() {
        return _state.get();
      },
      unmount: function() {
        _scene.unmount();
        return _scene = null;
      },
      refreshQueries: function(queries) {
        var queriesDictionary, query, _i, _len;
        queriesDictionary = {};
        for (_i = 0, _len = queries.length; _i < _len; _i++) {
          query = queries[_i];
          queriesDictionary[query] = null;
        }
        return _cache.apply(queriesDictionary);
      }
    };
    return Relay;
  };

}).call(this);

},{"extend":4,"odo-layers":5,"odoql-exe/cache":8}],4:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var extend;

extend = require('extend');

module.exports = function(initialState) {
  var _layers, _state;
  _state = {};
  _layers = [];
  if (initialState != null) {
    extend(_state, initialState);
  }
  return {
    apply: function(diff) {
      return extend(_state, diff);
    },
    _state: function() {
      return _state;
    },
    clear: function() {
      return _state = {};
    },
    get: function() {
      var i, layer, len, result;
      result = {};
      extend(result, _state);
      for (i = 0, len = _layers.length; i < len; i++) {
        layer = _layers[i];
        extend(result, layer);
      }
      return result;
    },
    layer: function(layer) {
      _layers.push(layer);
      return {
        rollback: function() {
          var index;
          index = _layers.indexOf(layer);
          return _layers.splice(index, 1);
        },
        commit: function() {
          var index;
          index = _layers.indexOf(layer);
          _layers.splice(index, 1);
          return extend(_state, layer);
        }
      };
    }
  };
};

},{"extend":6}],6:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var undefined;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	'use strict';
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	'use strict';
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],7:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2

/*
Split queries into queries to execute together and queries that can complete independently.
 */
var hasoption;

hasoption = require('./hasoption');

module.exports = function(exe, queries) {
  var async, key, query, sync;
  sync = {};
  async = {};
  for (key in queries) {
    query = queries[key];
    if (hasoption(query, 'async')) {
      async[key] = query;
    } else {
      sync[key] = query;
    }
  }
  return {
    sync: sync,
    async: async
  };
};

},{"./hasoption":12}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2

/*
Maintain a cache of queries to reduce re-querying.
 */
var async, diff, optimise, parallelqueries;

async = require('odo-async');

diff = require('./diff');

optimise = require('./optimise');

parallelqueries = require('./parallelqueries');

module.exports = function(exe, options) {
  var _cached, _e, log, pq, res;
  log = function() {};
  if ((options != null ? options.hub : void 0) != null) {
    log = function(message) {
      return options.hub.emit('[odoql-exe] {message}', {
        message: message
      });
    };
  }
  if (options == null) {
    options = {};
  }
  if (options.maxparallelqueries == null) {
    options.maxparallelqueries = 5;
  }
  _cached = {};
  _e = {
    ready: [],
    result: [],
    error: []
  };
  pq = parallelqueries(options.maxparallelqueries, function(timings) {
    var e, i, len, ref, results1;
    ref = _e.ready;
    results1 = [];
    for (i = 0, len = ref.length; i < len; i++) {
      e = ref[i];
      results1.push(e(timings));
    }
    return results1;
  });
  res = function() {};
  res.apply = function(queries) {
    var _, key, results1;
    results1 = [];
    for (key in queries) {
      _ = queries[key];
      results1.push(_cached[key] = queries[key]);
    }
    return results1;
  };
  res.run = function(queries) {
    var fn, i, key, len, optimisedqueries, query;
    queries = diff(_cached, queries);
    if (Object.keys(_cached).length > 0) {
      log((Object.keys(_cached).join(', ')) + " in the cache");
    }
    if (Object.keys(queries).length > 0) {
      log((Object.keys(queries).join(', ')) + " new or changed");
    }
    for (key in queries) {
      query = queries[key];
      _cached[key] = query;
    }
    optimisedqueries = optimise(exe, queries);
    fn = function(query) {
      var callback, e, j, k, len1, len2, ref, ref1, update;
      if (query.isAsync) {
        update = {};
        ref = query.keys;
        for (j = 0, len1 = ref.length; j < len1; j++) {
          key = ref[j];
          update[key] = null;
        }
        ref1 = _e.result;
        for (k = 0, len2 = ref1.length; k < len2; k++) {
          e = ref1[k];
          e(update);
        }
      }
      callback = function(cb) {
        return query.query(function(errors, results) {
          var error, l, len3, ref2;
          if (errors != null) {
            log((Object.keys(errors).join(', ')) + " errored");
            for (key in errors) {
              error = errors[key];
              log(key + ": " + error);
            }
            ref2 = _e.error;
            for (l = 0, len3 = ref2.length; l < len3; l++) {
              e = ref2[l];
              e(errors);
            }
          }
          return cb(errors, function(keys) {
            var len4, len5, m, n, ref3, results1;
            log((keys.join(', ')) + " complete, caching");
            update = {};
            for (m = 0, len4 = keys.length; m < len4; m++) {
              key = keys[m];
              update[key] = results[key];
            }
            ref3 = _e.result;
            results1 = [];
            for (n = 0, len5 = ref3.length; n < len5; n++) {
              e = ref3[n];
              results1.push(e(update));
            }
            return results1;
          });
        });
      };
      return pq.add(query.isAsync, query.keys, callback);
    };
    for (i = 0, len = optimisedqueries.length; i < len; i++) {
      query = optimisedqueries[i];
      fn(query);
    }
    return async.delay(function() {
      return pq.exec();
    });
  };
  res.on = function(e, cb) {
    if (_e[e] == null) {
      _e[e] = [];
    }
    return _e[e].push(cb);
  };
  return res;
};

},{"./diff":10,"./optimise":16,"./parallelqueries":17,"odo-async":15}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var canexecute, isquery;

isquery = require('./isquery');

canexecute = function(exe, query) {
  var key, value;
  if (typeof query !== 'object') {
    return true;
  }
  if (isquery(query) && (exe.providers[query.__q] == null)) {
    return false;
  }
  for (key in query) {
    value = query[key];
    if (!canexecute(exe, value)) {
      return false;
    }
  }
  return true;
};

module.exports = canexecute;

},{"./isquery":13}],10:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var eq, hasoption;

eq = require('./eq');

hasoption = require('./hasoption');

module.exports = function(a, b) {
  var key, query, result;
  result = {};
  for (key in b) {
    query = b[key];
    if ((a[key] != null) && !hasoption(query, 'nocache') && eq(a[key], query)) {
      continue;
    }
    result[key] = query;
  }
  return result;
};

},{"./eq":11,"./hasoption":12}],11:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var eq;

eq = function(a, b) {
  var aarray, akeys, barray, bkeys, i, j, key, ref, value;
  if (a === b) {
    return true;
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }
  if (a === null || b === null) {
    return false;
  }
  aarray = a instanceof Array;
  barray = b instanceof Array;
  if (aarray !== barray) {
    return false;
  }
  if (aarray) {
    if (a.length !== b.length) {
      return false;
    }
    for (i = j = 0, ref = a.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
      if (!eq(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  akeys = Object.keys(a);
  bkeys = Object.keys(b);
  if (akeys.length !== bkeys.length) {
    return false;
  }
  for (key in a) {
    value = a[key];
    if (!eq(value, b[key])) {
      return false;
    }
  }
  return true;
};

module.exports = eq;

},{}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
module.exports = function(q, option) {
  return (q != null ? q.__q : void 0) === 'options' && ((q != null ? q.__p[option] : void 0) != null);
};

},{}],13:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
module.exports = function(q) {
  if (typeof q !== 'object') {
    return false;
  }
  return (q != null ? q.__q : void 0) != null;
};

},{}],14:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var isquery, missingproviders;

isquery = require('./isquery');

missingproviders = function(exe, query) {
  var key, res, value;
  if (typeof query !== 'object') {
    return [];
  }
  if (isquery(query) && (exe.providers[query.__q] == null)) {
    return [query.__q];
  }
  res = [];
  for (key in query) {
    value = query[key];
    res = res.concat(missingproviders(exe, value));
  }
  return res;
};

module.exports = missingproviders;

},{"./isquery":13}],15:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var bind;

bind = function() {
  var delay;
  delay = typeof setImmediate === 'function' ? function(fn) {
    return setImmediate(fn);
  } : function(fn) {
    return setTimeout(fn, 0);
  };
  return {
    series: function(tasks, callback) {
      var next, result;
      tasks = tasks.slice(0);
      next = function(cb) {
        var task;
        if (tasks.length === 0) {
          return cb();
        }
        task = tasks.shift();
        return task(function() {
          return delay(function() {
            return next(cb);
          });
        });
      };
      result = function(cb) {
        return next(cb);
      };
      if (callback != null) {
        result(callback);
      }
      return result;
    },
    parallel: function(tasks, callback) {
      var count, result;
      count = tasks.length;
      result = function(cb) {
        var i, len, results, task;
        if (count === 0) {
          return cb();
        }
        results = [];
        for (i = 0, len = tasks.length; i < len; i++) {
          task = tasks[i];
          results.push(task(function() {
            count--;
            if (count === 0) {
              return cb();
            }
          }));
        }
        return results;
      };
      if (callback != null) {
        result(callback);
      }
      return result;
    },
    delay: delay
  };
};

if (typeof define !== "undefined" && define !== null) {
  define([], bind);
} else if (typeof module !== "undefined" && module !== null) {
  module.exports = bind();
} else {
  window.async = bind();
}

},{}],16:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var asyncsplit, split;

split = require('./split');

asyncsplit = require('./asyncsplit');

module.exports = function(exe, queries) {
  var build, result;
  result = [];
  build = function(isAsync, queries) {
    var fn, key, keys, query, ref;
    ref = queries.local;
    fn = function(key, query) {
      query = exe.build(query);
      return result.push({
        isAsync: isAsync,
        keys: [key],
        query: function(cb) {
          return query(function(err, res) {
            var returnresult;
            if (err != null) {
              returnresult = {};
              returnresult[key] = err;
              return cb(returnresult);
            }
            returnresult = {};
            returnresult[key] = res;
            return cb(null, returnresult);
          });
        }
      });
    };
    for (key in ref) {
      query = ref[key];
      fn(key, query);
    }
    keys = Object.keys(queries.remote);
    if (keys.length !== 0) {
      return result.push({
        isAsync: isAsync,
        keys: keys,
        query: exe.providers.__dynamic(exe, {
          __q: '__dynamic',
          __p: keys,
          __s: queries.remote
        })
      });
    }
  };
  queries = asyncsplit(exe, queries);
  queries = {
    sync: split(exe, queries.sync),
    async: split(exe, queries.async)
  };
  build(false, queries.sync);
  build(true, queries.async);
  return result;
};

},{"./asyncsplit":7,"./split":18}],17:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
module.exports = function(max, idle) {
  var _batch, _queued, _running, next, result, start;
  _batch = {};
  _running = [];
  _queued = [];
  start = function(entry) {
    var cancel;
    _running.push(entry);
    entry.startedAt = new Date().getTime();
    cancel = entry.task(function(err, cb) {
      var fin, i, index, key, len, ref;
      index = _running.indexOf(entry);
      _running.splice(index, 1);
      if (err == null) {
        fin = new Date().getTime();
        ref = entry.keys;
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          _batch[key] = fin - entry.startedAt;
        }
        cb(entry.keys);
      }
      return next();
    });
    if (_running.indexOf(entry) === -1) {
      return;
    }
    if (typeof cancel !== 'function') {
      cancel = function() {};
    }
    entry.cancel = cancel;
    return next();
  };
  next = function() {
    var queuedCount, runningCount;
    if (idle != null) {
      runningCount = _running.filter(function(r) {
        return !r.isAsync;
      }).length;
      queuedCount = _queued.filter(function(r) {
        return !r.isAsync;
      }).length;
      if (runningCount === 0 && queuedCount === 0) {
        idle(_batch);
        _batch = {};
      }
    }
    if (_queued.length === 0) {
      return;
    }
    if (_running.length >= max) {
      return;
    }
    return start(_queued.shift());
  };
  return result = {
    cancel: function(keys) {
      _queued = _queued.filter(function(entry) {
        entry.keys = entry.keys.filter(function(key) {
          return keys.indexOf(key) === -1;
        });
        if (entry.keys.length !== 0) {
          return true;
        }
        return false;
      });
      return _running = _running.filter(function(entry) {
        entry.keys = entry.keys.filter(function(key) {
          return keys.indexOf(key) === -1;
        });
        if (entry.keys.length !== 0) {
          return true;
        }
        entry.cancel();
        return false;
      });
    },
    add: function(isAsync, keys, task) {
      var entry;
      entry = {
        keys: keys,
        task: task,
        isAsync: isAsync
      };
      result.cancel(keys);
      return _queued.push(entry);
    },
    exec: function() {
      return next();
    }
  };
};

},{}],18:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1

/*
Given an execution environment (exe) create a list of
queries that can execute locally, and another list of
queries to execute somewhere else.
 */
var canexecute, missingproviders;

canexecute = require('./canexecute');

missingproviders = require('./missingproviders');

module.exports = function(exe, queries) {
  var key, local, missing, query, remote;
  local = {};
  remote = {};
  missing = {};
  for (key in queries) {
    query = queries[key];
    if (canexecute(exe, query)) {
      local[key] = query;
    } else {
      remote[key] = query;
      missing[key] = missingproviders(exe, query);
    }
  }
  return {
    local: local,
    remote: remote,
    missing: missing
  };
};

},{"./canexecute":9,"./missingproviders":14}],19:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var debounce, keys, mod;

debounce = require('debounce');

keys = {
  13: 'enter',
  27: 'esc',
  38: 'up',
  40: 'down'
};

mod = function(m, p) {
  return ((m % p) + p) % p;
};

module.exports = function(state, params, hub) {
  var clickingonitem, options, ref, ref1, update, updatevalue;
  options = (ref = params.options) != null ? ref : {};
  update = function(obj) {
    var key, value;
    if (obj) {
      for (key in obj) {
        value = obj[key];
        params[key] = value;
      }
    }
    return hub.emit('update', params);
  };
  updatevalue = function(value) {
    return update({
      value: value,
      isopen: true,
      selectedindex: null
    });
  };
  clickingonitem = false;
  return {
    options: options,
    keys: keys,
    update: update,
    updatevalue: updatevalue,
    updatevalue: debounce(updatevalue, (ref1 = options.debounce) != null ? ref1 : 200),
    inputparams: {
      onkeydown: function(e) {
        var delta, key;
        key = keys[e.which];
        if (key == null) {
          return;
        }
        if (key === 'esc') {
          e.preventDefault();
          if (params.isopen) {
            update({
              isopen: false,
              selectedindex: null
            });
          } else {
            update({
              value: '',
              selectedindex: null
            });
          }
          return;
        }
        if (key === 'up' || key === 'down') {
          e.preventDefault();
          if (params.isopen) {
            delta = key === 'up' ? -1 : 1;
            if (params.selectedindex != null) {
              params.selectedindex += delta;
              params.selectedindex = mod(params.selectedindex, params.items.length);
            } else {
              params.selectedindex = 0;
            }
            update();
          } else {
            update({
              isopen: true,
              selectedindex: 0
            });
          }
          return;
        }
        if (key === 'enter' && params.isopen && (params.selectedindex != null)) {
          e.preventDefault();
          return update({
            isopen: false,
            selectedindex: null,
            value: params.items[params.selectedindex]
          });
        }
      },
      onkeyup: function(e) {
        var key;
        key = keys[e.which];
        if (key != null) {
          return;
        }
        return updatevalue(e.target.value);
      },
      onfocus: function(e) {
        return update({
          isopen: true
        });
      },
      onblur: function(e) {
        if (clickingonitem) {
          return;
        }
        return update({
          isopen: false
        });
      }
    },
    linkparams: function(item, index) {
      return {
        onmouseenter: function(e) {
          return update({
            selectedindex: index
          });
        },
        onmouseleave: function(e) {
          return update({
            selectedindex: null
          });
        },
        onmousedown: function(e) {
          return clickingonitem = true;
        },
        onclick: function(e) {
          e.preventDefault();
          return update({
            isopen: false,
            selectedindex: null,
            value: item
          });
        }
      };
    }
  };
};

},{"debounce":20}],20:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":21}],21:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],22:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var component, extend;

extend = require('extend');

component = function(spec) {
  var Component, i, len, plugin, ref;
  spec = extend({}, spec);
  Component = function(state, params, hub) {
    return spec.render.call(spec, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, spec);
  };
  ref = component.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

component.plugins = [];

component.use = function(plugin) {
  return component.plugins.push(plugin);
};

module.exports = component;

},{"extend":28}],23:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var VText, create, diff, patch, raf, removeContentEditable, virtualize;

raf = require('raf');

create = require('virtual-dom/create-element');

diff = require('virtual-dom/diff');

patch = require('virtual-dom/patch');

VText = require('virtual-dom/vnode/vtext');

virtualize = require('vdom-virtualize');

removeContentEditable = function(vnode) {
  var i, len, node, ref, ref1, results;
  if ((ref = vnode.properties) != null) {
    delete ref.contentEditable;
  }
  if (!vnode.children) {
    return;
  }
  ref1 = vnode.children;
  results = [];
  for (i = 0, len = ref1.length; i < len; i++) {
    node = ref1[i];
    results.push(removeContentEditable(node));
  }
  return results;
};

module.exports = function(component, state, params, hub, parent, options) {
  var apply, payload, status, target, time, tree;
  time = function(description, cb) {
    return cb();
  };
  if ((options != null ? options.hub : void 0) != null) {
    time = function(description, cb) {
      var endedAt, startedAt;
      startedAt = new Date().getTime();
      cb();
      endedAt = new Date().getTime();
      return options.hub.emit('Odo.js {description} in {duration}ms', {
        description: description,
        startedAt: startedAt,
        endedAt: endedAt,
        duration: endedAt - startedAt
      });
    };
  }
  status = 'init';
  tree = null;
  target = null;
  time('scene created', function() {
    return tree = component(state, params, hub);
  });
  status = 'idle';
  apply = function(state, params, hub) {
    if (status === 'rendering') {
      throw new Error('Mutant rampage');
    }
    status = 'rendering';
    time('scene updated', function() {
      var newTree, patches;
      newTree = component(state, params, hub);
      patches = diff(tree, newTree);
      target = patch(target, patches);
      return tree = newTree;
    });
    return status = 'idle';
  };
  payload = null;
  return {
    target: function() {
      return target;
    },
    status: function() {
      return status;
    },
    mount: function() {
      var existing, patches;
      existing = virtualize(parent);
      removeContentEditable(existing);
      patches = diff(existing, tree);
      return target = patch(parent, patches);
    },
    update: function(state, params, hub) {
      if (status === 'rendering') {
        throw new Error('Mutant rampage');
      }
      if (status === 'pending') {
        payload = {
          state: state,
          params: params,
          hub: hub
        };
        return;
      }
      if (status === 'idle') {
        status = 'pending';
        payload = {
          state: state,
          params: params,
          hub: hub
        };
        return raf(function() {
          if (payload === null) {
            return;
          }
          apply(payload.state, payload.params, payload.hub);
          return payload = null;
        });
      }
    },
    apply: apply,
    unmount: function() {
      return patch(target, diff(tree, new VText('')));
    }
  };
};

},{"raf":31,"vdom-virtualize":50,"virtual-dom/create-element":58,"virtual-dom/diff":59,"virtual-dom/patch":68,"virtual-dom/vnode/vtext":91}],24:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var Hook, compose, create, dom, extend, hook;

create = require('virtual-dom/create-element');

compose = require('./compose');

extend = require('extend');

dom = require('virtual-dom/h');

require('setimmediate');

Hook = (function() {
  function Hook(component1, spec1, state1, params1, hub1) {
    this.component = component1;
    this.spec = spec1;
    this.state = state1;
    this.params = params1;
    this.hub = hub1;
    if (this.spec.enter == null) {
      this.spec.enter = function(item) {
        return this.item.mount();
      };
    }
    if (this.spec.exit == null) {
      this.spec.exit = function(item) {
        return this.item.unmount();
      };
    }
    if (this.spec.transition == null) {
      this.spec.transition = function(olditem, newitem) {
        olditem.unmount();
        return item.mount();
      };
    }
  }

  Hook.prototype.type = 'Widget';

  Hook.prototype.render = function() {
    if (this.spec.render != null) {
      return this.spec.render.call(this.spec, this.component, this.state, this.params, this.hub);
    } else {
      return dom('div.hook', this.component);
    }
  };

  Hook.prototype.create = function() {
    this.item = compose(this.component, this.state, this.params, this.hub, this.el);
    return this.spec.enter.call(this.spec, this.item, this.state, this.params, this.hub);
  };

  Hook.prototype.remove = function() {
    return this.spec.exit.call(this.spec, this.item, this.state, this.params, this.hub);
  };

  Hook.prototype.init = function() {
    var el;
    el = null;
    if (this.spec.init != null) {
      el = this.spec.init.call(this.spec, this.state, this.params, this.hub);
    } else {
      el = dom('div.hook');
    }
    this.el = create(el);
    setImmediate((function(_this) {
      return function() {
        return _this.create();
      };
    })(this));
    return this.el;
  };

  Hook.prototype.update = function(prev, el) {
    var olditem;
    this.el = prev.el, this.item = prev.item;
    if (prev.component === this.component) {
      if (this.component == null) {
        return el;
      }
      this.item.update(this.state, this.params, this.hub);
      return el;
    }
    if (prev.component == null) {
      this.create();
      return el;
    }
    if (this.component == null) {
      this.remove();
      return el;
    }
    olditem = this.item;
    this.item = compose(this.component, this.state, this.params, this.hub, el);
    this.spec.transition.call(this.spec, olditem, this.item, this.state, this.params, this.hub);
    return el;
  };

  Hook.prototype.destroy = function() {
    return this.remove();
  };

  return Hook;

})();

hook = function(spec) {
  var Component, i, len, plugin, ref;
  spec = extend({}, spec);
  Component = function(component, state, params, hub) {
    return new Hook(component, spec, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, spec);
  };
  ref = hook.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

hook.plugins = [];

hook.use = function(plugin) {
  return hook.plugins.push(plugin);
};

module.exports = hook;

},{"./compose":23,"extend":28,"setimmediate":33,"virtual-dom/create-element":58,"virtual-dom/h":60}],25:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var async, hub, template;

async = require('odo-async');

template = require('odo-template');

hub = function(defaultbindings) {
  var all, cb, events, every, listeners, none, once, result;
  listeners = {};
  all = [];
  none = [];
  every = function(e, cb) {
    if (listeners[e] == null) {
      listeners[e] = [];
    }
    listeners[e].push(cb);
    return {
      off: function() {
        var index;
        index = listeners[e].indexOf(cb);
        if (index !== -1) {
          return listeners[e].splice(index, 1);
        }
      }
    };
  };
  once = function(e, cb) {
    var binding;
    binding = every(e, function(payload, callback) {
      binding.off();
      return cb(payload, callback);
    });
    return {
      off: function() {
        return binding.off();
      }
    };
  };
  if (defaultbindings != null) {
    for (events in defaultbindings) {
      cb = defaultbindings[events];
      every(events, cb);
    }
  }
  result = {};
  result["new"] = function(defaultbindings) {
    return hub(defaultbindings);
  };
  result.child = function(defaultbindings) {
    var res;
    res = hub();
    res.none(function(e, description, m, cb) {
      return result.emit(e, m, cb);
    });
    if (defaultbindings != null) {
      for (events in defaultbindings) {
        cb = defaultbindings[events];
        res.every(events, cb);
      }
    }
    return res;
  };
  result.every = function(events, cb) {
    var bindings, e, i, len;
    if (!(events instanceof Array)) {
      events = [events];
    }
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        results.push({
          event: e
        });
      }
      return results;
    })();
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = every(e.event, cb);
    }
    return {
      off: function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = bindings.length; j < len1; j++) {
          e = bindings[j];
          results.push(e.binding.off());
        }
        return results;
      }
    };
  };
  result.once = function(events, cb) {
    var bindings, count, e, i, len;
    if (!(events instanceof Array)) {
      events = [events];
    }
    count = 0;
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        count++;
        results.push({
          event: e,
          complete: false
        });
      }
      return results;
    })();
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = once(e.event, function(m, callback) {
        count--;
        e.complete = true;
        if (count === 0) {
          return cb(m, callback);
        } else {
          return callback();
        }
      });
    }
    return {
      off: function() {
        var j, len1, results;
        results = [];
        for (j = 0, len1 = bindings.length; j < len1; j++) {
          e = bindings[j];
          results.push(e.binding.off());
        }
        return results;
      }
    };
  };
  result.any = function(events, cb) {
    var bindings, e, i, len, unbind;
    bindings = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = events.length; i < len; i++) {
        e = events[i];
        results.push({
          event: e
        });
      }
      return results;
    })();
    unbind = function() {
      var i, len, results;
      results = [];
      for (i = 0, len = bindings.length; i < len; i++) {
        e = bindings[i];
        results.push(e.binding.off());
      }
      return results;
    };
    for (i = 0, len = bindings.length; i < len; i++) {
      e = bindings[i];
      e.binding = once(e.event, function() {
        unbind();
        return cb();
      });
    }
    return {
      off: unbind
    };
  };
  result.all = function(cb) {
    all.push(cb);
    return {
      off: function() {
        var index;
        index = all.indexOf(cb);
        if (index !== -1) {
          return all.splice(index, 1);
        }
      }
    };
  };
  result.none = function(cb) {
    none.push(cb);
    return {
      off: function() {
        var index;
        index = none.indexOf(cb);
        if (index !== -1) {
          return none.splice(index, 1);
        }
      }
    };
  };
  result.emit = function(e, m, ecb) {
    var description, fn, fn1, fn2, i, j, k, len, len1, len2, listener, ref, tasks;
    description = "" + (template(e, m));
    tasks = [];
    fn = function(listener) {
      return tasks.push(function(cb) {
        return async.delay(function() {
          return listener(e, description, m, cb);
        });
      });
    };
    for (i = 0, len = all.length; i < len; i++) {
      listener = all[i];
      fn(listener);
    }
    if (listeners[e] != null) {
      ref = listeners[e].slice();
      fn1 = function(listener) {
        return tasks.push(function(cb) {
          return async.delay(function() {
            return listener(m, cb);
          });
        });
      };
      for (j = 0, len1 = ref.length; j < len1; j++) {
        listener = ref[j];
        fn1(listener);
      }
    } else {
      fn2 = function(listener) {
        return tasks.push(function(cb) {
          return async.delay(function() {
            return listener(e, description, m, cb);
          });
        });
      };
      for (k = 0, len2 = none.length; k < len2; k++) {
        listener = none[k];
        fn2(listener);
      }
    }
    return async.parallel(tasks, function() {
      if (ecb != null) {
        return ecb();
      }
    });
  };
  return result;
};

module.exports = hub;

},{"odo-async":29,"odo-template":30}],26:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var component, mount, stringify, widget;

component = require('./component');

widget = require('./widget');

mount = require('./mount');

stringify = require('./stringify');

component.use(mount);

component.use(stringify);

module.exports = {
  component: component,
  widget: widget,
  dom: require('virtual-dom/h'),
  svg: require('virtual-dom/virtual-hyperscript/svg'),
  partial: require('vdom-thunk'),
  compose: require('./compose'),
  hook: require('./hook'),
  hub: require('./hub'),
  thunk: require('./thunk')
};

},{"./component":22,"./compose":23,"./hook":24,"./hub":25,"./mount":27,"./stringify":94,"./thunk":95,"./widget":96,"vdom-thunk":35,"virtual-dom/h":60,"virtual-dom/virtual-hyperscript/svg":81}],27:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var compose;

compose = require('./compose');

module.exports = function(component, spec) {
  return component.mount = function(el, state, params, hub, options) {
    var scene;
    scene = compose(component, state, params, hub, el, options);
    scene.mount();
    return {
      update: function(state, params, hub) {
        return scene.update(state, params, hub);
      },
      apply: function(state, params, hub) {
        return scene.apply(state, params, hub);
      },
      unmount: function() {
        return scene.unmount();
      }
    };
  };
};

},{"./compose":23}],28:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],29:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],30:[function(require,module,exports){
// Generated by CoffeeScript 1.8.0
var bind;

bind = function() {
  return function(string, payload) {
    if (payload == null) {
      return string;
    }
    return string.replace(/{([^{}]+)}/g, function(original, key) {
      if (payload[key] == null) {
        return original;
      }
      return payload[key];
    });
  };
};

module.exports = bind();

},{}],31:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":32}],32:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*

*/

}).call(this,require('_process'))
},{"_process":118}],33:[function(require,module,exports){
(function (process,global){
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":118}],34:[function(require,module,exports){
function Thunk(fn, args, key, eqArgs) {
    this.fn = fn;
    this.args = args;
    this.key = key;
    this.eqArgs = eqArgs;
}

Thunk.prototype.type = 'Thunk';
Thunk.prototype.render = render;
module.exports = Thunk;

function shouldUpdate(current, previous) {
    if (!current || !previous || current.fn !== previous.fn) {
        return true;
    }

    var cargs = current.args;
    var pargs = previous.args;

    return !current.eqArgs(cargs, pargs);
}

function render(previous) {
    if (shouldUpdate(this, previous)) {
        return this.fn.apply(null, this.args);
    } else {
        return previous.vnode;
    }
}

},{}],35:[function(require,module,exports){
var Partial = require('./partial');

module.exports = Partial();

},{"./partial":36}],36:[function(require,module,exports){
var shallowEq = require('./shallow-eq');
var Thunk = require('./immutable-thunk');

module.exports = createPartial;

function createPartial(eq) {
    return function partial(fn) {
        var args = copyOver(arguments, 1);
        var firstArg = args[0];
        var key;

        var eqArgs = eq || shallowEq;

        if (typeof firstArg === 'object' && firstArg !== null) {
            if ('key' in firstArg) {
                key = firstArg.key;
            } else if ('id' in firstArg) {
                key = firstArg.id;
            }
        }

        return new Thunk(fn, args, key, eqArgs);
    };
}

function copyOver(list, offset) {
    var newList = [];
    for (var i = list.length - 1; i >= offset; i--) {
        newList[i - offset] = list[i];
    }
    return newList;
}

},{"./immutable-thunk":34,"./shallow-eq":37}],37:[function(require,module,exports){
module.exports = shallowEq;

function shallowEq(currentArgs, previousArgs) {
    if (currentArgs.length === 0 && previousArgs.length === 0) {
        return true;
    }

    if (currentArgs.length !== previousArgs.length) {
        return false;
    }

    var len = currentArgs.length;

    for (var i = 0; i < len; i++) {
        if (currentArgs[i] !== previousArgs[i]) {
            return false;
        }
    }

    return true;
}

},{}],38:[function(require,module,exports){
var escape = require('escape-html');
var propConfig = require('./property-config');
var types = propConfig.attributeTypes;
var properties = propConfig.properties;
var attributeNames = propConfig.attributeNames;

var prefixAttribute = memoizeString(function (name) {
  return escape(name) + '="';
});

module.exports = createAttribute;

/**
 * Create attribute string.
 *
 * @param {String} name The name of the property or attribute
 * @param {*} value The value
 * @param {Boolean} [isAttribute] Denotes whether `name` is an attribute.
 * @return {?String} Attribute string || null if not a valid property or custom attribute.
 */

function createAttribute(name, value, isAttribute) {
  if (properties.hasOwnProperty(name)) {
    if (shouldSkip(name, value)) return '';
    name = (attributeNames[name] || name).toLowerCase();
    var attrType = properties[name];
    // for BOOLEAN `value` only has to be truthy
    // for OVERLOADED_BOOLEAN `value` has to be === true
    if ((attrType === types.BOOLEAN) ||
        (attrType === types.OVERLOADED_BOOLEAN && value === true)) {
      return escape(name);
    }
    return prefixAttribute(name) + escape(value) + '"';
  } else if (isAttribute) {
    if (value == null) return '';
    return prefixAttribute(name) + escape(value) + '"';
  }
  // return null if `name` is neither a valid property nor an attribute
  return null;
}

/**
 * Should skip false boolean attributes.
 */

function shouldSkip(name, value) {
  var attrType = properties[name];
  return value == null ||
    (attrType === types.BOOLEAN && !value) ||
    (attrType === types.OVERLOADED_BOOLEAN && value === false);
}

/**
 * Memoizes the return value of a function that accepts one string argument.
 *
 * @param {function} callback
 * @return {function}
 */

function memoizeString(callback) {
  var cache = {};
  return function(string) {
    if (cache.hasOwnProperty(string)) {
      return cache[string];
    } else {
      return cache[string] = callback.call(this, string);
    }
  };
}
},{"./property-config":48,"escape-html":40}],39:[function(require,module,exports){
var escape = require('escape-html');
var extend = require('xtend');
var isVNode = require('virtual-dom/vnode/is-vnode');
var isVText = require('virtual-dom/vnode/is-vtext');
var isThunk = require('virtual-dom/vnode/is-thunk');
var isWidget = require('virtual-dom/vnode/is-widget');
var softHook = require('virtual-dom/virtual-hyperscript/hooks/soft-set-hook');
var attrHook = require('virtual-dom/virtual-hyperscript/hooks/attribute-hook');
var paramCase = require('param-case');
var createAttribute = require('./create-attribute');
var voidElements = require('./void-elements');

module.exports = toHTML;

function toHTML(node, parent) {
  if (!node) return '';

  if (isThunk(node)) {
    node = node.render();
  }

  if (isWidget(node) && node.render) {
    node = node.render();
  }

  if (isVNode(node)) {
    return openTag(node) + tagContent(node) + closeTag(node);
  } else if (isVText(node)) {
    if (parent && parent.tagName.toLowerCase() === 'script') return String(node.text);
    return escape(String(node.text));
  }

  return '';
}

function openTag(node) {
  var props = node.properties;
  var ret = '<' + node.tagName.toLowerCase();

  for (var name in props) {
    var value = props[name];
    if (value == null) continue;

    if (name == 'attributes') {
      value = extend({}, value);
      for (var attrProp in value) {
        ret += ' ' + createAttribute(attrProp, value[attrProp], true);
      }
      continue;
    }

    if (name == 'style') {
      var css = '';
      value = extend({}, value);
      for (var styleProp in value) {
        css += paramCase(styleProp) + ': ' + value[styleProp] + '; ';
      }
      value = css.trim();
    }

    if (value instanceof softHook || value instanceof attrHook) {
      ret += ' ' + createAttribute(name, value.value, true);
      continue;
    }

    var attr = createAttribute(name, value);
    if (attr) ret += ' ' + attr;
  }

  return ret + '>';
}

function tagContent(node) {
  var innerHTML = node.properties.innerHTML;
  if (innerHTML != null) return innerHTML;
  else {
    var ret = '';
    if (node.children && node.children.length) {
      for (var i = 0, l = node.children.length; i<l; i++) {
        var child = node.children[i];
        ret += toHTML(child, node);
      }
    }
    return ret;
  }
}

function closeTag(node) {
  var tag = node.tagName.toLowerCase();
  return voidElements[tag] ? '' : '</' + tag + '>';
}
},{"./create-attribute":38,"./void-elements":49,"escape-html":40,"param-case":46,"virtual-dom/virtual-hyperscript/hooks/attribute-hook":75,"virtual-dom/virtual-hyperscript/hooks/soft-set-hook":77,"virtual-dom/vnode/is-thunk":83,"virtual-dom/vnode/is-vnode":85,"virtual-dom/vnode/is-vtext":86,"virtual-dom/vnode/is-widget":87,"xtend":47}],40:[function(require,module,exports){
/*!
 * escape-html
 * Copyright(c) 2012-2013 TJ Holowaychuk
 * Copyright(c) 2015 Andreas Lubbe
 * Copyright(c) 2015 Tiancheng "Timothy" Gu
 * MIT Licensed
 */

'use strict';

/**
 * Module variables.
 * @private
 */

var matchHtmlRegExp = /["'&<>]/;

/**
 * Module exports.
 * @public
 */

module.exports = escapeHtml;

/**
 * Escape special characters in the given string of html.
 *
 * @param  {string} string The string to escape for inserting into HTML
 * @return {string}
 * @public
 */

function escapeHtml(string) {
  var str = '' + string;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index
    ? html + str.substring(lastIndex, index)
    : html;
}

},{}],41:[function(require,module,exports){
/**
 * Special language-specific overrides.
 *
 * Source: ftp://ftp.unicode.org/Public/UCD/latest/ucd/SpecialCasing.txt
 *
 * @type {Object}
 */
var LANGUAGES = {
  tr: {
    regexp: /\u0130|\u0049|\u0049\u0307/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  az: {
    regexp: /[\u0130]/g,
    map: {
      '\u0130': '\u0069',
      '\u0049': '\u0131',
      '\u0049\u0307': '\u0069'
    }
  },
  lt: {
    regexp: /[\u0049\u004A\u012E\u00CC\u00CD\u0128]/g,
    map: {
      '\u0049': '\u0069\u0307',
      '\u004A': '\u006A\u0307',
      '\u012E': '\u012F\u0307',
      '\u00CC': '\u0069\u0307\u0300',
      '\u00CD': '\u0069\u0307\u0301',
      '\u0128': '\u0069\u0307\u0303'
    }
  }
}

/**
 * Lowercase a string.
 *
 * @param  {String} str
 * @return {String}
 */
module.exports = function (str, locale) {
  var lang = LANGUAGES[locale]

  str = str == null ? '' : String(str)

  if (lang) {
    str = str.replace(lang.regexp, function (m) { return lang.map[m] })
  }

  return str.toLowerCase()
}

},{}],42:[function(require,module,exports){
var lowerCase = require('lower-case')

var NON_WORD_REGEXP = require('./vendor/non-word-regexp')
var CAMEL_CASE_REGEXP = require('./vendor/camel-case-regexp')
var TRAILING_DIGIT_REGEXP = require('./vendor/trailing-digit-regexp')

/**
 * Sentence case a string.
 *
 * @param  {String} str
 * @param  {String} locale
 * @param  {String} replacement
 * @return {String}
 */
module.exports = function (str, locale, replacement) {
  if (str == null) {
    return ''
  }

  replacement = replacement || ' '

  function replace (match, index, string) {
    if (index === 0 || index === (string.length - match.length)) {
      return ''
    }

    return replacement
  }

  str = String(str)
    // Support camel case ("camelCase" -> "camel Case").
    .replace(CAMEL_CASE_REGEXP, '$1 $2')
    // Support digit groups ("test2012" -> "test 2012").
    .replace(TRAILING_DIGIT_REGEXP, '$1 $2')
    // Remove all non-word characters and replace with a single space.
    .replace(NON_WORD_REGEXP, replace)

  // Lower case the entire string.
  return lowerCase(str, locale)
}

},{"./vendor/camel-case-regexp":43,"./vendor/non-word-regexp":44,"./vendor/trailing-digit-regexp":45,"lower-case":41}],43:[function(require,module,exports){
module.exports = /([\u0061-\u007A\u00B5\u00DF-\u00F6\u00F8-\u00FF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0561-\u0587\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7FA\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A])([\u0041-\u005A\u00C0-\u00D6\u00D8-\u00DE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178\u0179\u017B\u017D\u0181\u0182\u0184\u0186\u0187\u0189-\u018B\u018E-\u0191\u0193\u0194\u0196-\u0198\u019C\u019D\u019F\u01A0\u01A2\u01A4\u01A6\u01A7\u01A9\u01AC\u01AE\u01AF\u01B1-\u01B3\u01B5\u01B7\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A\u023B\u023D\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u0386\u0388-\u038A\u038C\u038E\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA\uFF21-\uFF3A\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],44:[function(require,module,exports){
module.exports = /[^\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+/g

},{}],45:[function(require,module,exports){
module.exports = /([\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])([^\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19])/g

},{}],46:[function(require,module,exports){
var sentenceCase = require('sentence-case')

/**
 * Param case a string.
 *
 * @param  {String} string
 * @param  {String} [locale]
 * @return {String}
 */
module.exports = function (string, locale) {
  return sentenceCase(string, locale, '-')
}

},{"sentence-case":42}],47:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],48:[function(require,module,exports){
/**
 * Attribute types.
 */

var types = {
  BOOLEAN: 1,
  OVERLOADED_BOOLEAN: 2
};

/**
 * Properties.
 *
 * Taken from https://github.com/facebook/react/blob/847357e42e5267b04dd6e297219eaa125ab2f9f4/src/browser/ui/dom/HTMLDOMPropertyConfig.js
 *
 */

var properties = {
  /**
   * Standard Properties
   */
  accept: true,
  acceptCharset: true,
  accessKey: true,
  action: true,
  allowFullScreen: types.BOOLEAN,
  allowTransparency: true,
  alt: true,
  async: types.BOOLEAN,
  autocomplete: true,
  autofocus: types.BOOLEAN,
  autoplay: types.BOOLEAN,
  cellPadding: true,
  cellSpacing: true,
  charset: true,
  checked: types.BOOLEAN,
  classID: true,
  className: true,
  cols: true,
  colSpan: true,
  content: true,
  contentEditable: true,
  contextMenu: true,
  controls: types.BOOLEAN,
  coords: true,
  crossOrigin: true,
  data: true, // For `<object />` acts as `src`.
  dateTime: true,
  defer: types.BOOLEAN,
  dir: true,
  disabled: types.BOOLEAN,
  download: types.OVERLOADED_BOOLEAN,
  draggable: true,
  enctype: true,
  form: true,
  formAction: true,
  formEncType: true,
  formMethod: true,
  formNoValidate: types.BOOLEAN,
  formTarget: true,
  frameBorder: true,
  headers: true,
  height: true,
  hidden: types.BOOLEAN,
  href: true,
  hreflang: true,
  htmlFor: true,
  httpEquiv: true,
  icon: true,
  id: true,
  label: true,
  lang: true,
  list: true,
  loop: types.BOOLEAN,
  manifest: true,
  marginHeight: true,
  marginWidth: true,
  max: true,
  maxLength: true,
  media: true,
  mediaGroup: true,
  method: true,
  min: true,
  multiple: types.BOOLEAN,
  muted: types.BOOLEAN,
  name: true,
  noValidate: types.BOOLEAN,
  open: true,
  pattern: true,
  placeholder: true,
  poster: true,
  preload: true,
  radiogroup: true,
  readOnly: types.BOOLEAN,
  rel: true,
  required: types.BOOLEAN,
  role: true,
  rows: true,
  rowSpan: true,
  sandbox: true,
  scope: true,
  scrolling: true,
  seamless: types.BOOLEAN,
  selected: types.BOOLEAN,
  shape: true,
  size: true,
  sizes: true,
  span: true,
  spellcheck: true,
  src: true,
  srcdoc: true,
  srcset: true,
  start: true,
  step: true,
  style: true,
  tabIndex: true,
  target: true,
  title: true,
  type: true,
  useMap: true,
  value: true,
  width: true,
  wmode: true,

  /**
   * Non-standard Properties
   */
  // autoCapitalize and autoCorrect are supported in Mobile Safari for
  // keyboard hints.
  autocapitalize: true,
  autocorrect: true,
  // itemProp, itemScope, itemType are for Microdata support. See
  // http://schema.org/docs/gs.html
  itemProp: true,
  itemScope: types.BOOLEAN,
  itemType: true,
  // property is supported for OpenGraph in meta tags.
  property: true
};

/**
 * Properties to attributes mapping.
 *
 * The ones not here are simply converted to lower case.
 */

var attributeNames = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv'
};

/**
 * Exports.
 */

module.exports = {
  attributeTypes: types,
  properties: properties,
  attributeNames: attributeNames
};
},{}],49:[function(require,module,exports){

/**
 * Void elements.
 *
 * https://github.com/facebook/react/blob/v0.12.0/src/browser/ui/ReactDOMComponent.js#L99
 */

module.exports = {
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'embed': true,
  'hr': true,
  'img': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true
};
},{}],50:[function(require,module,exports){
/*!
* vdom-virtualize
* Copyright 2014 by Marcel Klehr <mklehr@gmx.net>
*
* (MIT LICENSE)
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
var VNode = require("virtual-dom/vnode/vnode")
  , VText = require("virtual-dom/vnode/vtext")

module.exports = createVNode

function createVNode(domNode, key) {
  key = key || null // XXX: Leave out `key` for now... merely used for (re-)ordering

  if(domNode.nodeType == 1) return createFromElement(domNode, key)
  if(domNode.nodeType == 3) return createFromTextNode(domNode, key)
  return
}

createVNode.fromHTML = function(html, key) {
  var domNode = document.createElement('div'); // create container
  domNode.innerHTML = html; // browser parses HTML into DOM tree
  domNode = domNode.children[0] || domNode; // select first node in tree
  return createVNode(domNode, key);
};

function createFromTextNode(tNode) {
  return new VText(tNode.nodeValue)
}


function createFromElement(el) {
  var tagName = el.tagName
  , namespace = el.namespaceURI == 'http://www.w3.org/1999/xhtml'? null : el.namespaceURI
  , properties = getElementProperties(el)
  , children = []

  for (var i = 0; i < el.childNodes.length; i++) {
    children.push(createVNode(el.childNodes[i]/*, i*/))
  }

  return new VNode(tagName, properties, children, null, namespace)
}


function getElementProperties(el) {
  var obj = {}

  props.forEach(function(propName) {
    if(!el[propName]) return

    // Special case: style
    // .style is a DOMStyleDeclaration, thus we need to iterate over all
    // rules to create a hash of applied css properties.
    //
    // You can directly set a specific .style[prop] = value so patching with vdom
    // is possible.
    if("style" == propName) {
      var css = {}
        , styleProp
      for(var i=0; i<el.style.length; i++) {
        styleProp = el.style[i]
        css[styleProp] = el.style.getPropertyValue(styleProp) // XXX: add support for "!important" via getPropertyPriority()!
      }

      obj[propName] = css
      return
    }

    // Special case: dataset
    // we can iterate over .dataset with a simple for..in loop.
    // The all-time foo with data-* attribs is the dash-snake to camelCase
    // conversion.
    // However, I'm not sure if this is compatible with h()
    //
    // .dataset properties are directly accessible as transparent getters/setters, so
    // patching with vdom is possible.
    if("dataset" == propName) {
      var data = {}
      for(var p in el.dataset) {
        data[p] = el.dataset[p]
      }

      obj[propName] = data
      return
    }

    // Special case: attributes
    // some properties are only accessible via .attributes, so
    // that's what we'd do, if vdom-create-element could handle this.
    if("attributes" == propName) return
    if("tabIndex" == propName && el.tabIndex === -1) return


    // default: just copy the property
    obj[propName] = el[propName]
    return
  })

  return obj
}

/**
 * DOMNode property white list
 * Taken from https://github.com/Raynos/react/blob/dom-property-config/src/browser/ui/dom/DefaultDOMPropertyConfig.js
 */
var props =

module.exports.properties = [
 "accept"
,"accessKey"
,"action"
,"alt"
,"async"
,"autoComplete"
,"autoPlay"
,"cellPadding"
,"cellSpacing"
,"checked"
,"className"
,"colSpan"
,"content"
,"contentEditable"
,"controls"
,"crossOrigin"
,"data"
,"dataset"
,"defer"
,"dir"
,"download"
,"draggable"
,"encType"
,"formNoValidate"
,"href"
,"hrefLang"
,"htmlFor"
,"httpEquiv"
,"icon"
,"id"
,"label"
,"lang"
,"list"
,"loop"
,"max"
,"mediaGroup"
,"method"
,"min"
,"multiple"
,"muted"
,"name"
,"noValidate"
,"pattern"
,"placeholder"
,"poster"
,"preload"
,"radioGroup"
,"readOnly"
,"rel"
,"required"
,"rowSpan"
,"sandbox"
,"scope"
,"scrollLeft"
,"scrolling"
,"scrollTop"
,"selected"
,"span"
,"spellCheck"
,"src"
,"srcDoc"
,"srcSet"
,"start"
,"step"
,"style"
,"tabIndex"
,"target"
,"title"
,"type"
,"value"

// Non-standard Properties
,"autoCapitalize"
,"autoCorrect"
,"property"

, "attributes"
]

var attrs =
module.exports.attrs = [
 "allowFullScreen"
,"allowTransparency"
,"charSet"
,"cols"
,"contextMenu"
,"dateTime"
,"disabled"
,"form"
,"frameBorder"
,"height"
,"hidden"
,"maxLength"
,"role"
,"rows"
,"seamless"
,"size"
,"width"
,"wmode"

// SVG Properties
,"cx"
,"cy"
,"d"
,"dx"
,"dy"
,"fill"
,"fx"
,"fy"
,"gradientTransform"
,"gradientUnits"
,"offset"
,"points"
,"r"
,"rx"
,"ry"
,"spreadMethod"
,"stopColor"
,"stopOpacity"
,"stroke"
,"strokeLinecap"
,"strokeWidth"
,"textAnchor"
,"transform"
,"version"
,"viewBox"
,"x1"
,"x2"
,"x"
,"y1"
,"y2"
,"y"
]

},{"virtual-dom/vnode/vnode":56,"virtual-dom/vnode/vtext":57}],51:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],52:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],53:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":55}],54:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],55:[function(require,module,exports){
module.exports = "2"

},{}],56:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":51,"./is-vhook":52,"./is-vnode":53,"./is-widget":54,"./version":55}],57:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":55}],58:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":70}],59:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":93}],60:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":78}],61:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],62:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":64}],63:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],64:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":63}],65:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":117}],66:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],67:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],68:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":73}],69:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":84,"is-object":66}],70:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":82,"../vnode/is-vnode.js":85,"../vnode/is-vtext.js":86,"../vnode/is-widget.js":87,"./apply-properties":69,"global/document":65}],71:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],72:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":87,"../vnode/vpatch.js":90,"./apply-properties":69,"./update-widget":74}],73:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":70,"./dom-index":71,"./patch-op":72,"global/document":65,"x-is-array":67}],74:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":87}],75:[function(require,module,exports){
'use strict';

module.exports = AttributeHook;

function AttributeHook(namespace, value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value);
    }

    this.namespace = namespace;
    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'AttributeHook' &&
        prev.value === this.value &&
        prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' &&
        next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],76:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":62}],77:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],78:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":83,"../vnode/is-vhook":84,"../vnode/is-vnode":85,"../vnode/is-vtext":86,"../vnode/is-widget":87,"../vnode/vnode.js":89,"../vnode/vtext.js":91,"./hooks/ev-hook.js":76,"./hooks/soft-set-hook.js":77,"./parse-tag.js":79,"x-is-array":67}],79:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":61}],80:[function(require,module,exports){
'use strict';

var DEFAULT_NAMESPACE = null;
var EV_NAMESPACE = 'http://www.w3.org/2001/xml-events';
var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';

// http://www.w3.org/TR/SVGTiny12/attributeTable.html
// http://www.w3.org/TR/SVG/attindex.html
var SVG_PROPERTIES = {
    'about': DEFAULT_NAMESPACE,
    'accent-height': DEFAULT_NAMESPACE,
    'accumulate': DEFAULT_NAMESPACE,
    'additive': DEFAULT_NAMESPACE,
    'alignment-baseline': DEFAULT_NAMESPACE,
    'alphabetic': DEFAULT_NAMESPACE,
    'amplitude': DEFAULT_NAMESPACE,
    'arabic-form': DEFAULT_NAMESPACE,
    'ascent': DEFAULT_NAMESPACE,
    'attributeName': DEFAULT_NAMESPACE,
    'attributeType': DEFAULT_NAMESPACE,
    'azimuth': DEFAULT_NAMESPACE,
    'bandwidth': DEFAULT_NAMESPACE,
    'baseFrequency': DEFAULT_NAMESPACE,
    'baseProfile': DEFAULT_NAMESPACE,
    'baseline-shift': DEFAULT_NAMESPACE,
    'bbox': DEFAULT_NAMESPACE,
    'begin': DEFAULT_NAMESPACE,
    'bias': DEFAULT_NAMESPACE,
    'by': DEFAULT_NAMESPACE,
    'calcMode': DEFAULT_NAMESPACE,
    'cap-height': DEFAULT_NAMESPACE,
    'class': DEFAULT_NAMESPACE,
    'clip': DEFAULT_NAMESPACE,
    'clip-path': DEFAULT_NAMESPACE,
    'clip-rule': DEFAULT_NAMESPACE,
    'clipPathUnits': DEFAULT_NAMESPACE,
    'color': DEFAULT_NAMESPACE,
    'color-interpolation': DEFAULT_NAMESPACE,
    'color-interpolation-filters': DEFAULT_NAMESPACE,
    'color-profile': DEFAULT_NAMESPACE,
    'color-rendering': DEFAULT_NAMESPACE,
    'content': DEFAULT_NAMESPACE,
    'contentScriptType': DEFAULT_NAMESPACE,
    'contentStyleType': DEFAULT_NAMESPACE,
    'cursor': DEFAULT_NAMESPACE,
    'cx': DEFAULT_NAMESPACE,
    'cy': DEFAULT_NAMESPACE,
    'd': DEFAULT_NAMESPACE,
    'datatype': DEFAULT_NAMESPACE,
    'defaultAction': DEFAULT_NAMESPACE,
    'descent': DEFAULT_NAMESPACE,
    'diffuseConstant': DEFAULT_NAMESPACE,
    'direction': DEFAULT_NAMESPACE,
    'display': DEFAULT_NAMESPACE,
    'divisor': DEFAULT_NAMESPACE,
    'dominant-baseline': DEFAULT_NAMESPACE,
    'dur': DEFAULT_NAMESPACE,
    'dx': DEFAULT_NAMESPACE,
    'dy': DEFAULT_NAMESPACE,
    'edgeMode': DEFAULT_NAMESPACE,
    'editable': DEFAULT_NAMESPACE,
    'elevation': DEFAULT_NAMESPACE,
    'enable-background': DEFAULT_NAMESPACE,
    'end': DEFAULT_NAMESPACE,
    'ev:event': EV_NAMESPACE,
    'event': DEFAULT_NAMESPACE,
    'exponent': DEFAULT_NAMESPACE,
    'externalResourcesRequired': DEFAULT_NAMESPACE,
    'fill': DEFAULT_NAMESPACE,
    'fill-opacity': DEFAULT_NAMESPACE,
    'fill-rule': DEFAULT_NAMESPACE,
    'filter': DEFAULT_NAMESPACE,
    'filterRes': DEFAULT_NAMESPACE,
    'filterUnits': DEFAULT_NAMESPACE,
    'flood-color': DEFAULT_NAMESPACE,
    'flood-opacity': DEFAULT_NAMESPACE,
    'focusHighlight': DEFAULT_NAMESPACE,
    'focusable': DEFAULT_NAMESPACE,
    'font-family': DEFAULT_NAMESPACE,
    'font-size': DEFAULT_NAMESPACE,
    'font-size-adjust': DEFAULT_NAMESPACE,
    'font-stretch': DEFAULT_NAMESPACE,
    'font-style': DEFAULT_NAMESPACE,
    'font-variant': DEFAULT_NAMESPACE,
    'font-weight': DEFAULT_NAMESPACE,
    'format': DEFAULT_NAMESPACE,
    'from': DEFAULT_NAMESPACE,
    'fx': DEFAULT_NAMESPACE,
    'fy': DEFAULT_NAMESPACE,
    'g1': DEFAULT_NAMESPACE,
    'g2': DEFAULT_NAMESPACE,
    'glyph-name': DEFAULT_NAMESPACE,
    'glyph-orientation-horizontal': DEFAULT_NAMESPACE,
    'glyph-orientation-vertical': DEFAULT_NAMESPACE,
    'glyphRef': DEFAULT_NAMESPACE,
    'gradientTransform': DEFAULT_NAMESPACE,
    'gradientUnits': DEFAULT_NAMESPACE,
    'handler': DEFAULT_NAMESPACE,
    'hanging': DEFAULT_NAMESPACE,
    'height': DEFAULT_NAMESPACE,
    'horiz-adv-x': DEFAULT_NAMESPACE,
    'horiz-origin-x': DEFAULT_NAMESPACE,
    'horiz-origin-y': DEFAULT_NAMESPACE,
    'id': DEFAULT_NAMESPACE,
    'ideographic': DEFAULT_NAMESPACE,
    'image-rendering': DEFAULT_NAMESPACE,
    'in': DEFAULT_NAMESPACE,
    'in2': DEFAULT_NAMESPACE,
    'initialVisibility': DEFAULT_NAMESPACE,
    'intercept': DEFAULT_NAMESPACE,
    'k': DEFAULT_NAMESPACE,
    'k1': DEFAULT_NAMESPACE,
    'k2': DEFAULT_NAMESPACE,
    'k3': DEFAULT_NAMESPACE,
    'k4': DEFAULT_NAMESPACE,
    'kernelMatrix': DEFAULT_NAMESPACE,
    'kernelUnitLength': DEFAULT_NAMESPACE,
    'kerning': DEFAULT_NAMESPACE,
    'keyPoints': DEFAULT_NAMESPACE,
    'keySplines': DEFAULT_NAMESPACE,
    'keyTimes': DEFAULT_NAMESPACE,
    'lang': DEFAULT_NAMESPACE,
    'lengthAdjust': DEFAULT_NAMESPACE,
    'letter-spacing': DEFAULT_NAMESPACE,
    'lighting-color': DEFAULT_NAMESPACE,
    'limitingConeAngle': DEFAULT_NAMESPACE,
    'local': DEFAULT_NAMESPACE,
    'marker-end': DEFAULT_NAMESPACE,
    'marker-mid': DEFAULT_NAMESPACE,
    'marker-start': DEFAULT_NAMESPACE,
    'markerHeight': DEFAULT_NAMESPACE,
    'markerUnits': DEFAULT_NAMESPACE,
    'markerWidth': DEFAULT_NAMESPACE,
    'mask': DEFAULT_NAMESPACE,
    'maskContentUnits': DEFAULT_NAMESPACE,
    'maskUnits': DEFAULT_NAMESPACE,
    'mathematical': DEFAULT_NAMESPACE,
    'max': DEFAULT_NAMESPACE,
    'media': DEFAULT_NAMESPACE,
    'mediaCharacterEncoding': DEFAULT_NAMESPACE,
    'mediaContentEncodings': DEFAULT_NAMESPACE,
    'mediaSize': DEFAULT_NAMESPACE,
    'mediaTime': DEFAULT_NAMESPACE,
    'method': DEFAULT_NAMESPACE,
    'min': DEFAULT_NAMESPACE,
    'mode': DEFAULT_NAMESPACE,
    'name': DEFAULT_NAMESPACE,
    'nav-down': DEFAULT_NAMESPACE,
    'nav-down-left': DEFAULT_NAMESPACE,
    'nav-down-right': DEFAULT_NAMESPACE,
    'nav-left': DEFAULT_NAMESPACE,
    'nav-next': DEFAULT_NAMESPACE,
    'nav-prev': DEFAULT_NAMESPACE,
    'nav-right': DEFAULT_NAMESPACE,
    'nav-up': DEFAULT_NAMESPACE,
    'nav-up-left': DEFAULT_NAMESPACE,
    'nav-up-right': DEFAULT_NAMESPACE,
    'numOctaves': DEFAULT_NAMESPACE,
    'observer': DEFAULT_NAMESPACE,
    'offset': DEFAULT_NAMESPACE,
    'opacity': DEFAULT_NAMESPACE,
    'operator': DEFAULT_NAMESPACE,
    'order': DEFAULT_NAMESPACE,
    'orient': DEFAULT_NAMESPACE,
    'orientation': DEFAULT_NAMESPACE,
    'origin': DEFAULT_NAMESPACE,
    'overflow': DEFAULT_NAMESPACE,
    'overlay': DEFAULT_NAMESPACE,
    'overline-position': DEFAULT_NAMESPACE,
    'overline-thickness': DEFAULT_NAMESPACE,
    'panose-1': DEFAULT_NAMESPACE,
    'path': DEFAULT_NAMESPACE,
    'pathLength': DEFAULT_NAMESPACE,
    'patternContentUnits': DEFAULT_NAMESPACE,
    'patternTransform': DEFAULT_NAMESPACE,
    'patternUnits': DEFAULT_NAMESPACE,
    'phase': DEFAULT_NAMESPACE,
    'playbackOrder': DEFAULT_NAMESPACE,
    'pointer-events': DEFAULT_NAMESPACE,
    'points': DEFAULT_NAMESPACE,
    'pointsAtX': DEFAULT_NAMESPACE,
    'pointsAtY': DEFAULT_NAMESPACE,
    'pointsAtZ': DEFAULT_NAMESPACE,
    'preserveAlpha': DEFAULT_NAMESPACE,
    'preserveAspectRatio': DEFAULT_NAMESPACE,
    'primitiveUnits': DEFAULT_NAMESPACE,
    'propagate': DEFAULT_NAMESPACE,
    'property': DEFAULT_NAMESPACE,
    'r': DEFAULT_NAMESPACE,
    'radius': DEFAULT_NAMESPACE,
    'refX': DEFAULT_NAMESPACE,
    'refY': DEFAULT_NAMESPACE,
    'rel': DEFAULT_NAMESPACE,
    'rendering-intent': DEFAULT_NAMESPACE,
    'repeatCount': DEFAULT_NAMESPACE,
    'repeatDur': DEFAULT_NAMESPACE,
    'requiredExtensions': DEFAULT_NAMESPACE,
    'requiredFeatures': DEFAULT_NAMESPACE,
    'requiredFonts': DEFAULT_NAMESPACE,
    'requiredFormats': DEFAULT_NAMESPACE,
    'resource': DEFAULT_NAMESPACE,
    'restart': DEFAULT_NAMESPACE,
    'result': DEFAULT_NAMESPACE,
    'rev': DEFAULT_NAMESPACE,
    'role': DEFAULT_NAMESPACE,
    'rotate': DEFAULT_NAMESPACE,
    'rx': DEFAULT_NAMESPACE,
    'ry': DEFAULT_NAMESPACE,
    'scale': DEFAULT_NAMESPACE,
    'seed': DEFAULT_NAMESPACE,
    'shape-rendering': DEFAULT_NAMESPACE,
    'slope': DEFAULT_NAMESPACE,
    'snapshotTime': DEFAULT_NAMESPACE,
    'spacing': DEFAULT_NAMESPACE,
    'specularConstant': DEFAULT_NAMESPACE,
    'specularExponent': DEFAULT_NAMESPACE,
    'spreadMethod': DEFAULT_NAMESPACE,
    'startOffset': DEFAULT_NAMESPACE,
    'stdDeviation': DEFAULT_NAMESPACE,
    'stemh': DEFAULT_NAMESPACE,
    'stemv': DEFAULT_NAMESPACE,
    'stitchTiles': DEFAULT_NAMESPACE,
    'stop-color': DEFAULT_NAMESPACE,
    'stop-opacity': DEFAULT_NAMESPACE,
    'strikethrough-position': DEFAULT_NAMESPACE,
    'strikethrough-thickness': DEFAULT_NAMESPACE,
    'string': DEFAULT_NAMESPACE,
    'stroke': DEFAULT_NAMESPACE,
    'stroke-dasharray': DEFAULT_NAMESPACE,
    'stroke-dashoffset': DEFAULT_NAMESPACE,
    'stroke-linecap': DEFAULT_NAMESPACE,
    'stroke-linejoin': DEFAULT_NAMESPACE,
    'stroke-miterlimit': DEFAULT_NAMESPACE,
    'stroke-opacity': DEFAULT_NAMESPACE,
    'stroke-width': DEFAULT_NAMESPACE,
    'surfaceScale': DEFAULT_NAMESPACE,
    'syncBehavior': DEFAULT_NAMESPACE,
    'syncBehaviorDefault': DEFAULT_NAMESPACE,
    'syncMaster': DEFAULT_NAMESPACE,
    'syncTolerance': DEFAULT_NAMESPACE,
    'syncToleranceDefault': DEFAULT_NAMESPACE,
    'systemLanguage': DEFAULT_NAMESPACE,
    'tableValues': DEFAULT_NAMESPACE,
    'target': DEFAULT_NAMESPACE,
    'targetX': DEFAULT_NAMESPACE,
    'targetY': DEFAULT_NAMESPACE,
    'text-anchor': DEFAULT_NAMESPACE,
    'text-decoration': DEFAULT_NAMESPACE,
    'text-rendering': DEFAULT_NAMESPACE,
    'textLength': DEFAULT_NAMESPACE,
    'timelineBegin': DEFAULT_NAMESPACE,
    'title': DEFAULT_NAMESPACE,
    'to': DEFAULT_NAMESPACE,
    'transform': DEFAULT_NAMESPACE,
    'transformBehavior': DEFAULT_NAMESPACE,
    'type': DEFAULT_NAMESPACE,
    'typeof': DEFAULT_NAMESPACE,
    'u1': DEFAULT_NAMESPACE,
    'u2': DEFAULT_NAMESPACE,
    'underline-position': DEFAULT_NAMESPACE,
    'underline-thickness': DEFAULT_NAMESPACE,
    'unicode': DEFAULT_NAMESPACE,
    'unicode-bidi': DEFAULT_NAMESPACE,
    'unicode-range': DEFAULT_NAMESPACE,
    'units-per-em': DEFAULT_NAMESPACE,
    'v-alphabetic': DEFAULT_NAMESPACE,
    'v-hanging': DEFAULT_NAMESPACE,
    'v-ideographic': DEFAULT_NAMESPACE,
    'v-mathematical': DEFAULT_NAMESPACE,
    'values': DEFAULT_NAMESPACE,
    'version': DEFAULT_NAMESPACE,
    'vert-adv-y': DEFAULT_NAMESPACE,
    'vert-origin-x': DEFAULT_NAMESPACE,
    'vert-origin-y': DEFAULT_NAMESPACE,
    'viewBox': DEFAULT_NAMESPACE,
    'viewTarget': DEFAULT_NAMESPACE,
    'visibility': DEFAULT_NAMESPACE,
    'width': DEFAULT_NAMESPACE,
    'widths': DEFAULT_NAMESPACE,
    'word-spacing': DEFAULT_NAMESPACE,
    'writing-mode': DEFAULT_NAMESPACE,
    'x': DEFAULT_NAMESPACE,
    'x-height': DEFAULT_NAMESPACE,
    'x1': DEFAULT_NAMESPACE,
    'x2': DEFAULT_NAMESPACE,
    'xChannelSelector': DEFAULT_NAMESPACE,
    'xlink:actuate': XLINK_NAMESPACE,
    'xlink:arcrole': XLINK_NAMESPACE,
    'xlink:href': XLINK_NAMESPACE,
    'xlink:role': XLINK_NAMESPACE,
    'xlink:show': XLINK_NAMESPACE,
    'xlink:title': XLINK_NAMESPACE,
    'xlink:type': XLINK_NAMESPACE,
    'xml:base': XML_NAMESPACE,
    'xml:id': XML_NAMESPACE,
    'xml:lang': XML_NAMESPACE,
    'xml:space': XML_NAMESPACE,
    'y': DEFAULT_NAMESPACE,
    'y1': DEFAULT_NAMESPACE,
    'y2': DEFAULT_NAMESPACE,
    'yChannelSelector': DEFAULT_NAMESPACE,
    'z': DEFAULT_NAMESPACE,
    'zoomAndPan': DEFAULT_NAMESPACE
};

module.exports = SVGAttributeNamespace;

function SVGAttributeNamespace(value) {
  if (SVG_PROPERTIES.hasOwnProperty(value)) {
    return SVG_PROPERTIES[value];
  }
}

},{}],81:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var h = require('./index.js');


var SVGAttributeNamespace = require('./svg-attribute-namespace');
var attributeHook = require('./hooks/attribute-hook');

var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

module.exports = svg;

function svg(tagName, properties, children) {
    if (!children && isChildren(properties)) {
        children = properties;
        properties = {};
    }

    properties = properties || {};

    // set namespace for svg
    properties.namespace = SVG_NAMESPACE;

    var attributes = properties.attributes || (properties.attributes = {});

    for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
            continue;
        }

        var namespace = SVGAttributeNamespace(key);

        if (namespace === undefined) { // not a svg attribute
            continue;
        }

        var value = properties[key];

        if (typeof value !== 'string' &&
            typeof value !== 'number' &&
            typeof value !== 'boolean'
        ) {
            continue;
        }

        if (namespace !== null) { // namespaced attribute
            properties[key] = attributeHook(namespace, value);
            continue;
        }

        attributes[key] = value
        properties[key] = undefined
    }

    return h(tagName, properties, children);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x);
}

},{"./hooks/attribute-hook":75,"./index.js":78,"./svg-attribute-namespace":80,"x-is-array":67}],82:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":83,"./is-vnode":85,"./is-vtext":86,"./is-widget":87}],83:[function(require,module,exports){
arguments[4][51][0].apply(exports,arguments)
},{"dup":51}],84:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"dup":52}],85:[function(require,module,exports){
arguments[4][53][0].apply(exports,arguments)
},{"./version":88,"dup":53}],86:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":88}],87:[function(require,module,exports){
arguments[4][54][0].apply(exports,arguments)
},{"dup":54}],88:[function(require,module,exports){
arguments[4][55][0].apply(exports,arguments)
},{"dup":55}],89:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"./is-thunk":83,"./is-vhook":84,"./is-vnode":85,"./is-widget":87,"./version":88,"dup":56}],90:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":88}],91:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"./version":88,"dup":57}],92:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":84,"is-object":66}],93:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":82,"../vnode/is-thunk":83,"../vnode/is-vnode":85,"../vnode/is-vtext":86,"../vnode/is-widget":87,"../vnode/vpatch":90,"./diff-props":92,"x-is-array":67}],94:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var stringify;

stringify = require('vdom-to-html');

module.exports = function(component, spec) {
  return component.stringify = function(state, params, hub) {
    return stringify(spec.render.call(spec, state, params, hub));
  };
};

},{"vdom-to-html":39}],95:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var Thunk, thunk;

Thunk = (function() {
  function Thunk(render1, state1, params1, hub1) {
    this.render = render1;
    this.state = state1;
    this.params = params1;
    this.hub = hub1;
  }

  Thunk.prototype.type = 'Thunk';

  Thunk.prototype.render = function(previous) {
    return this.render.call(this, previous, this.state, this.params, this.hub);
  };

  return Thunk;

})();

thunk = function(render) {
  var Component, i, len, plugin, ref;
  Component = function(state, params, hub) {
    return new Thunk(render, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, render);
  };
  ref = thunk.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

thunk.plugins = [];

thunk.use = function(plugin) {
  return thunk.plugins.push(plugin);
};

thunk.Thunk = Thunk;

module.exports = thunk;

},{}],96:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var Widget, create, extend, widget;

create = require('virtual-dom/create-element');

extend = require('extend');

require('setimmediate');

Widget = (function() {
  function Widget(spec1, state1, params1, hub1) {
    this.spec = spec1;
    this.state = state1;
    this.params = params1;
    this.hub = hub1;
    this.el = this.spec.render.call(this, this.state, this.params, this.hub);
  }

  Widget.prototype.type = 'Widget';

  Widget.prototype.render = function() {
    return this.el;
  };

  Widget.prototype.init = function() {
    var dom;
    dom = create(this.el);
    if (dom !== null) {
      this.el = dom;
    }
    setImmediate((function(_this) {
      return function() {
        if (_this.spec.afterMount != null) {
          return _this.spec.afterMount.call(_this, _this.el, _this.state, _this.params, _this.hub);
        }
      };
    })(this));
    return this.el;
  };

  Widget.prototype.update = function(prev, el) {
    var dom, k, result, v;
    for (k in prev) {
      v = prev[k];
      if (this[k] === void 0) {
        this[k] = v;
      }
    }
    result = el;
    if (this.spec.update != null) {
      result = this.spec.update.call(this, el, this.state, this.params, this.hub, prev);
      if (result !== null) {
        dom = create(result);
        if (dom !== null) {
          result = dom;
        }
      }
    }
    if (this.spec.onUpdate != null) {
      this.spec.onUpdate.call(this, result, this.state, this.params, this.hub, prev);
    }
    return result;
  };

  Widget.prototype.destroy = function(el) {
    if (this.spec.beforeUnmount != null) {
      return this.spec.beforeUnmount.call(this, el, this.state, this.params, this.hub);
    }
  };

  return Widget;

})();

widget = function(spec) {
  var Component, i, len, plugin, ref;
  spec = extend({}, spec);
  Component = function(state, params, hub) {
    return new Widget(spec, state, params, hub);
  };
  Component.use = function(plugin) {
    return plugin(Component, spec);
  };
  ref = widget.plugins;
  for (i = 0, len = ref.length; i < len; i++) {
    plugin = ref[i];
    Component.use(plugin);
  }
  return Component;
};

widget.plugins = [];

widget.use = function(plugin) {
  return widget.plugins.push(plugin);
};

widget.Widget = Widget;

module.exports = widget;

},{"extend":28,"setimmediate":33,"virtual-dom/create-element":58}],97:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
module.exports = {
  binary: function(exe, params, callback) {
    var getleft, getright;
    getleft = exe.build(params.__l);
    getright = exe.build(params.__r);
    return function(cb) {
      return getleft(function(err, left) {
        if (err != null) {
          return cb(err);
        }
        return getright(function(err, right) {
          if (err != null) {
            return cb(err);
          }
          return cb(null, callback(left, right));
        });
      });
    };
  },
  unary: function(exe, params, callback) {
    var getsource;
    getsource = exe.build(params.__s);
    return function(cb) {
      return getsource(function(err, source) {
        if (err != null) {
          return cb(err);
        }
        return cb(null, callback(source));
      });
    };
  },
  params: function(exe, params, callback) {
    var getparams, getsource;
    getparams = exe.build(params.__p);
    getsource = exe.build(params.__s);
    return function(cb) {
      return getparams(function(err, params) {
        if (err != null) {
          return cb(err);
        }
        return getsource(function(err, source) {
          if (err != null) {
            return cb(err);
          }
          return cb(null, callback(params, source));
        });
      });
    };
  }
};

},{}],98:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var isquery, literal, ops;

isquery = require('./isquery');

ops = require('./ops');

literal = function(exe, value) {
  if (isquery(value)) {
    return function(cb) {
      return cb(null, value.__s);
    };
  } else {
    return function(cb) {
      return cb(null, value);
    };
  }
};

module.exports = function(options) {
  var def, i, len, providers, res;
  providers = {
    literal: literal
  };
  res = {
    providers: providers,
    clear: function() {
      return providers = {
        literal: literal
      };
    },
    use: function(def) {
      var _, d, fn, i, len, name, optype;
      if (def instanceof Array) {
        for (i = 0, len = def.length; i < len; i++) {
          d = def[i];
          res.use(def);
        }
        return res;
      }
      for (_ in def) {
        optype = def[_];
        for (name in optype) {
          fn = optype[name];
          providers[name] = fn;
        }
      }
      return res;
    },
    build: function(q) {
      if (!isquery(q)) {
        return res.providers.literal(res, q);
      }
      if (res.providers[q.__q] == null) {
        throw new Error(q.__q + " not found");
      }
      return res.providers[q.__q](res, q);
    }
  };
  for (i = 0, len = ops.length; i < len; i++) {
    def = ops[i];
    res.use(def);
  }
  return res;
};

},{"./isquery":99,"./ops":104}],99:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"dup":13}],100:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],101:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],102:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var decimalAdjust;

decimalAdjust = function(type, value, exp) {
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math[type](value);
  }
  value = +value;
  exp = +exp;
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  value = value.toString().split('e');
  value = Math[type](+(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp)));
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? +value[1] + exp : exp));
};

module.exports = {
  round10: function(value, exp) {
    return decimalAdjust('round', value, exp);
  },
  floor10: function(value, exp) {
    return decimalAdjust('floor', value, exp);
  },
  ceil10: function(value, exp) {
    return decimalAdjust('ceil', value, exp);
  }
};

},{}],103:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"dup":30}],104:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
module.exports = [require('./ops/boolean'), require('./ops/conditional'), require('./ops/maths'), require('./ops/transform'), require('./ops/fill'), require('./ops/filter'), require('./ops/strings'), require('./ops/assign'), require('./ops/types'), require('./ops/json')];

},{"./ops/assign":105,"./ops/boolean":106,"./ops/conditional":107,"./ops/fill":108,"./ops/filter":109,"./ops/json":110,"./ops/maths":111,"./ops/strings":112,"./ops/transform":113,"./ops/types":114}],105:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var async, extend, visit;

extend = require('extend');

async = require('odo-async');

visit = require('../visit');

module.exports = {
  params: {
    assign: function(exe, params) {
      var getsource;
      getsource = exe.build(params.__s);
      return function(callback) {
        return getsource(function(err, source) {
          var assi, d, def, i, len, prop, ref, ref1, tasks;
          if (err != null) {
            return callback(err);
          }
          assi = function(data, prop, def) {
            return function(fincb) {
              var fillrefs;
              fillrefs = function(node, cb) {
                var getref;
                if ((node.__q == null) || node.__q !== 'ref') {
                  return cb();
                }
                getref = exe.build(node.__s);
                return getref(function(err, res) {
                  var ref;
                  if (err != null) {
                    throw new Error(err);
                  }
                  return cb((ref = data[res]) != null ? ref : null);
                });
              };
              def = extend(true, {}, def);
              return visit(def, fillrefs, function(filled) {
                var getref;
                getref = exe.build(filled);
                return getref(function(err, value) {
                  if (err != null) {
                    return callback(err);
                  }
                  data[prop] = value;
                  return fincb();
                });
              });
            };
          };
          tasks = [];
          if (source instanceof Array) {
            for (i = 0, len = source.length; i < len; i++) {
              d = source[i];
              ref = params.__p;
              for (prop in ref) {
                def = ref[prop];
                tasks.push(assi(d, prop, def));
              }
            }
          } else {
            ref1 = params.__p;
            for (prop in ref1) {
              def = ref1[prop];
              tasks.push(assi(source, prop, def));
            }
          }
          return async.series(tasks, function() {
            return callback(null, source);
          });
        });
      };
    }
  }
};

},{"../visit":115,"extend":100,"odo-async":101}],106:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var helpers;

helpers = require('../helpers');

module.exports = {
  binary: {
    or: function(exe, params) {
      var getleft, getright;
      getleft = exe.build(params.__l);
      getright = exe.build(params.__r);
      return function(cb) {
        return getleft(function(err, left) {
          if (err != null) {
            return cb(err);
          }
          if (left === true) {
            return cb(null, true);
          }
          return getright(function(err, right) {
            if (err != null) {
              return cb(err);
            }
            return cb(null, right);
          });
        });
      };
    },
    and: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left && right;
      });
    },
    gt: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left > right;
      });
    },
    gte: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left >= right;
      });
    },
    lt: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left < right;
      });
    },
    lte: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left <= right;
      });
    },
    eq: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left === right;
      });
    }
  },
  unary: {
    not: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return !source;
      });
    }
  }
};

},{"../helpers":97}],107:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
module.exports = {
  trinary: {
    "if": function(exe, params) {
      var getleft, getparams, getright;
      getparams = exe.build(params.__p);
      getleft = exe.build(params.__l);
      getright = exe.build(params.__r);
      return function(cb) {
        return getparams(function(err, params) {
          if (err != null) {
            return cb(err);
          }
          if (params) {
            return getleft(function(err, left) {
              if (err != null) {
                return cb(err);
              }
              return cb(null, left);
            });
          } else {
            return getright(function(err, right) {
              if (err != null) {
                return cb(err);
              }
              return cb(null, right);
            });
          }
        });
      };
    },
    unless: function(exe, params) {
      var getleft, getparams, getright;
      getparams = exe.build(params.__p);
      getleft = exe.build(params.__l);
      getright = exe.build(params.__r);
      return function(cb) {
        return getparams(function(err, params) {
          if (err != null) {
            return cb(err);
          }
          if (!params) {
            return getleft(function(err, left) {
              if (err != null) {
                return cb(err);
              }
              return cb(null, left);
            });
          } else {
            return getright(function(err, right) {
              if (err != null) {
                return cb(err);
              }
              return cb(null, right);
            });
          }
        });
      };
    }
  }
};

},{}],108:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var extend, visit;

extend = require('extend');

visit = require('../visit');

module.exports = {
  unary: {
    param: function(exe, params) {
      throw new Error('Parameters should not be executed');
    }
  },
  params: {
    fill: function(exe, params) {
      var getparams;
      getparams = exe.build(params.__p);
      return function(callback) {
        return getparams(function(err, properties) {
          var fillparams;
          if (err != null) {
            return callback(err);
          }
          fillparams = function(node, cb) {
            var getref;
            if ((node.__q == null) || node.__q !== 'param') {
              return cb();
            }
            getref = exe.build(node.__s);
            return getref(function(err, res) {
              if (err != null) {
                throw new Error(err);
              }
              if (properties[res] != null) {
                return cb(properties[res]);
              }
              return cb();
            });
          };
          return visit(params.__s, fillparams, function(filled) {
            var getref;
            getref = exe.build(filled);
            return getref(function(err, result) {
              if (err != null) {
                return callback(err);
              }
              return callback(null, result);
            });
          });
        });
      };
    }
  }
};

},{"../visit":115,"extend":100}],109:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var async, extend, visit;

extend = require('extend');

async = require('odo-async');

visit = require('../visit');

module.exports = {
  params: {
    filter: function(exe, params) {
      var getsource;
      getsource = exe.build(params.__s);
      return function(callback) {
        return getsource(function(err, source) {
          var data, fn, i, index, len, results, tasks;
          if (err != null) {
            return callback(err);
          }
          if (!(source instanceof Array)) {
            throw new Error('Not an array');
          }
          results = [];
          tasks = [];
          fn = function(data, index) {
            return tasks.push(function(cb) {
              var def, fillrefs;
              fillrefs = function(node, cb) {
                var getref;
                if ((node.__q == null) || node.__q !== 'ref') {
                  return cb();
                }
                getref = exe.build(node.__s);
                return getref(function(err, res) {
                  var ref;
                  if (err != null) {
                    throw new Error(err);
                  }
                  return cb((ref = data[res]) != null ? ref : '');
                });
              };
              def = extend(true, {}, params.__p);
              return visit(def, fillrefs, function(filled) {
                var getref;
                getref = exe.build(filled);
                return getref(function(err, value) {
                  if (err != null) {
                    return callback(err);
                  }
                  results[index] = value;
                  return cb();
                });
              });
            });
          };
          for (index = i = 0, len = source.length; i < len; index = ++i) {
            data = source[index];
            fn(data, index);
          }
          return async.series(tasks, function() {
            var j, len1, result, should;
            result = [];
            for (index = j = 0, len1 = results.length; j < len1; index = ++j) {
              should = results[index];
              if (should) {
                result.push(source[index]);
              }
            }
            return callback(null, result);
          });
        });
      };
    }
  }
};

},{"../visit":115,"extend":100,"odo-async":101}],110:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
module.exports = {
  unary: {
    json: function(exe, params) {
      var getsource;
      getsource = exe.build(params.__s);
      return function(cb) {
        return getsource(function(err, source) {
          var e;
          if (err != null) {
            return cb(err);
          }
          try {
            return cb(null, JSON.parse(source));
          } catch (_error) {
            e = _error;
            return cb(e);
          }
        });
      };
    }
  }
};

},{}],111:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var binarymath, fn, fn1, fn2, helpers, i, j, k, len, len1, len2, math, op, paramsmath, res, uniarymath;

helpers = require('../helpers');

math = require('odo-math');

res = {
  binary: {
    add: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left + right;
      });
    },
    sub: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left - right;
      });
    },
    div: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left / right;
      });
    },
    mult: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left * right;
      });
    },
    mod: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return left % right;
      });
    }
  },
  unary: {},
  params: {
    interpolate_linear: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        var input, output, x1, x2, y1, y2;
        if (Object.keys(params).length === 0) {
          return null;
        }
        x1 = -Infinity;
        x2 = +Infinity;
        for (input in params) {
          output = params[input];
          input = +input;
          if (input === source) {
            return output;
          }
          if (input < source && input > x1) {
            x1 = input;
          }
          if (input > source && input < x2) {
            x2 = input;
          }
        }
        if (x1 === -Infinity || x2 === +Infinity) {
          return null;
        }
        y1 = params[x1];
        y2 = params[x2];
        return y1 + (y2 - y1) * ((source - x1) / (x2 - x1));
      });
    },
    toFixed: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        return source.toFixed(params);
      });
    }
  }
};

binarymath = ['pow', 'atan2'];

fn = function(op) {
  var operation;
  operation = Math[op];
  return res.binary[op] = function(exe, params) {
    return helpers.binary(exe, params, function(left, right) {
      return operation(left, right);
    });
  };
};
for (i = 0, len = binarymath.length; i < len; i++) {
  op = binarymath[i];
  fn(op);
}

uniarymath = ['abs', 'acos', 'asin', 'atan', 'ceil', 'cos', 'exp', 'floor', 'log', 'round', 'sin', 'sqrt', 'tan'];

fn1 = function(op) {
  var operation;
  operation = Math[op];
  return res.unary[op] = function(exe, params) {
    return helpers.unary(exe, params, function(source) {
      return operation(source);
    });
  };
};
for (j = 0, len1 = uniarymath.length; j < len1; j++) {
  op = uniarymath[j];
  fn1(op);
}

paramsmath = ['round10', 'floor10', 'ceil10'];

fn2 = function(op) {
  var operation;
  operation = math[op];
  return res.params[op] = function(exe, params) {
    return helpers.params(exe, params, function(params, source) {
      return operation(source, params);
    });
  };
};
for (k = 0, len2 = paramsmath.length; k < len2; k++) {
  op = paramsmath[k];
  fn2(op);
}

module.exports = res;

},{"../helpers":97,"odo-math":102}],112:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var helpers, template;

helpers = require('../helpers');

template = require('odo-template');

module.exports = {
  params: {
    findandreplace: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        if (typeof source !== 'string') {
          throw new Error('Expecting string for findandreplace');
        }
        return source.replace(new RegExp(params.find, params.flags), params.replace);
      });
    },
    template: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        if (typeof source !== 'string') {
          throw new Error('Expecting string for findandreplace');
        }
        return template(source, params);
      });
    }
  },
  unary: {
    uppercase: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return source.toUpperCase();
      });
    },
    lowercase: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return source.toLowerCase();
      });
    },
    toString: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return source.toString();
      });
    }
  },
  binary: {
    concat: function(exe, params) {
      return helpers.binary(exe, params, function(left, right) {
        return "" + left + right;
      });
    }
  },
  trinary: {
    substr: function(exe, params) {
      var getleft, getparams, getright;
      getparams = exe.build(params.__p);
      getleft = exe.build(params.__l);
      getright = exe.build(params.__r);
      return function(cb) {
        return getparams(function(err, params) {
          if (err != null) {
            return cb(err);
          }
          return getleft(function(err, left) {
            if (err != null) {
              return cb(err);
            }
            return getright(function(err, right) {
              if (err != null) {
                return cb(err);
              }
              return cb(null, params.substr(left, right));
            });
          });
        });
      };
    }
  }
};

},{"../helpers":97,"odo-template":103}],113:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var helpers;

helpers = require('../helpers');

module.exports = {
  params: {
    options: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return source;
      });
    },
    pluck: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        var plu;
        plu = function(d) {
          return d[params];
        };
        if (source instanceof Array) {
          return source.map(plu);
        } else {
          return plu(source);
        }
      });
    },
    remove: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        var rem;
        rem = function(d) {
          var _, target;
          for (target in params) {
            _ = params[target];
            delete d[target];
          }
          return d;
        };
        if (source instanceof Array) {
          return source.map(rem);
        } else {
          return rem(source);
        }
      });
    },
    shape: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        var sha;
        sha = function(d) {
          var _, res, target;
          res = {};
          for (target in params) {
            _ = params[target];
            res[target] = d[target];
          }
          return res;
        };
        if (source instanceof Array) {
          return source.map(sha);
        } else {
          return sha(source);
        }
      });
    },
    rename: function(exe, params) {
      return helpers.params(exe, params, function(params, source) {
        var trans;
        trans = function(d) {
          var target, value;
          for (target in params) {
            source = params[target];
            value = d[source];
            delete d[source];
            d[target] = value;
          }
          return d;
        };
        if (source instanceof Array) {
          return source.map(trans);
        } else {
          return trans(source);
        }
      });
    }
  },
  unary: {
    ref: function(exe, params) {
      throw new Error('References should not be executed');
    },
    count: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        if (!(source instanceof Array)) {
          throw new Error('Not an array');
        }
        return source.length;
      });
    },
    one: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        if (!(source instanceof Array)) {
          throw new Error('Not an array');
        }
        if (source.length !== 1) {
          throw new Error('No single item');
        }
        return source.pop();
      });
    },
    oneornone: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        if (!(source instanceof Array)) {
          throw new Error('Not an array');
        }
        if (source.length === 0) {
          return null;
        }
        if (source.length === 1) {
          return source.pop();
        }
        throw new Error('More than one item');
      });
    }
  }
};

},{"../helpers":97}],114:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var helpers;

helpers = require('../helpers');

module.exports = {
  unary: {
    asInt: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return parseInt(source);
      });
    },
    asFloat: function(exe, params) {
      return helpers.unary(exe, params, function(source) {
        return parseFloat(source);
      });
    }
  }
};

},{"../helpers":97}],115:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
var async, visit;

async = require('odo-async');

visit = function(node, nodecb, fincb) {
  if (typeof node !== 'object') {
    return fincb(node);
  }
  return nodecb(node, function(replacement) {
    var fn, key, tasks, value;
    if (replacement !== void 0) {
      return fincb(replacement);
    }
    tasks = [];
    fn = function(key, value) {
      return tasks.push(function(cb) {
        return visit(value, nodecb, function(replacement) {
          node[key] = replacement;
          return cb();
        });
      });
    };
    for (key in node) {
      value = node[key];
      fn(key, value);
    }
    return async.series(tasks, function() {
      return fincb(node);
    });
  });
};

module.exports = visit;

},{"odo-async":101}],116:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
module.exports = function(component, spec) {
  if (spec.query == null) {
    return component.query = function() {
      return {};
    };
  }
  return component.query = function(params) {
    return spec.query.call(component, params);
  };
};

},{}],117:[function(require,module,exports){

},{}],118:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
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
    var timeout = setTimeout(cleanUpNextTick);
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
    clearTimeout(timeout);
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
        setTimeout(drainQueue, 0);
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

},{}]},{},[2]);
