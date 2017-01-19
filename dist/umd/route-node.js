(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('RouteNode', factory) :
  (global.RouteNode = factory());
}(this, (function () { 'use strict';

// Split path
var getPath = function getPath(path) {
    return path.split('?')[0];
};
var getSearch = function getSearch(path) {
    return path.split('?')[1];
};

// Search param name
var bracketTest = /\[\]$/;
var hasBrackets = function hasBrackets(paramName) {
    return bracketTest.test(paramName);
};
var withoutBrackets = function withoutBrackets(paramName) {
    return paramName.replace(bracketTest, '');
};

/**
 * Parse a querystring and return a list of params (Objects with name and value properties)
 * @param  {String} querystring The querystring to parse
 * @return {Array[Object]}      The list of params
 */
var parse = function parse(querystring) {
    return querystring.split('&').reduce(function (params, param) {
        var split = param.split('=');
        var name = split[0];
        var value = split[1];

        return params.concat(split.length === 1 ? { name: name, value: true } : { name: name, value: decodeURIComponent(value) });
    }, []);
};

/**
 * Reduce a list of parameters (returned by `.parse()``) to an object (key-value pairs)
 * @param  {Array} paramList The list of parameters returned by `.parse()`
 * @return {Object}          The object of parameters (key-value pairs)
 */
var toObject = function toObject(paramList) {
    return paramList.reduce(function (params, _ref) {
        var name = _ref.name;
        var value = _ref.value;

        var isArray = hasBrackets(name);
        var currentValue = params[withoutBrackets(name)];

        if (currentValue === undefined) {
            params[withoutBrackets(name)] = isArray ? [value] : value;
        } else {
            params[withoutBrackets(name)] = [].concat(currentValue, value);
        }

        return params;
    }, {});
};

/**
 * Build a querystring from a list of parameters
 * @param  {Array} paramList The list of parameters (see `.parse()`)
 * @return {String}          The querystring
 */
var build = function build(paramList) {
    return paramList.filter(function (_ref2) {
        var value = _ref2.value;
        return value !== undefined && value !== null;
    }).map(function (_ref3) {
        var name = _ref3.name;
        var value = _ref3.value;
        return value === true ? name : name + '=' + encodeURIComponent(value);
    }).join('&');
};

/**
 * Remove a list of parameters from a querystring
 * @param  {String} querystring  The original querystring
 * @param  {Array}  paramsToOmit The parameters to omit
 * @return {String}              The querystring
 */
var omit = function omit(querystring, paramsToOmit) {
    if (!querystring) return '';

    var remainingQueryParams = parse(querystring).filter(function (_ref4) {
        var name = _ref4.name;
        return paramsToOmit.indexOf(withoutBrackets(name)) === -1;
    });
    var remainingQueryString = build(remainingQueryParams);

    return remainingQueryString || '';
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var defaultOrConstrained = function defaultOrConstrained(match) {
    return '(' + (match ? match.replace(/(^<|>$)/g, '') : '[a-zA-Z0-9-_.~%\':]+') + ')';
};

var rules = [{
    // An URL can contain a parameter :paramName
    // - and _ are allowed but not in last position
    name: 'url-parameter',
    pattern: /^:([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})(<(.+?)>)?/,
    regex: function regex(match) {
        return new RegExp(defaultOrConstrained(match[2]));
    }
}, {
    // Url parameter (splat)
    name: 'url-parameter-splat',
    pattern: /^\*([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})/,
    regex: /([^\?]*)/
}, {
    name: 'url-parameter-matrix',
    pattern: /^\;([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})(<(.+?)>)?/,
    regex: function regex(match) {
        return new RegExp(';' + match[1] + '=' + defaultOrConstrained(match[2]));
    }
}, {
    // Query parameter: ?param1&param2
    //                   ?:param1&:param2
    name: 'query-parameter-bracket',
    pattern: /^(?:\?|&)(?:\:)?([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})(?:\[\])/
}, {
    // Query parameter: ?param1&param2
    //                   ?:param1&:param2
    name: 'query-parameter',
    pattern: /^(?:\?|&)(?:\:)?([a-zA-Z0-9-_]*[a-zA-Z0-9]{1})/
}, {
    // Delimiter /
    name: 'delimiter',
    pattern: /^(\/|\?)/,
    regex: function regex(match) {
        return new RegExp('\\' + match[0]);
    }
}, {
    // Sub delimiters
    name: 'sub-delimiter',
    pattern: /^(\!|\&|\-|_|\.|;)/,
    regex: function regex(match) {
        return new RegExp(match[0]);
    }
}, {
    // Unmatched fragment (until delimiter is found)
    name: 'fragment',
    pattern: /^([0-9a-zA-Z]+)/,
    regex: function regex(match) {
        return new RegExp(match[0]);
    }
}];

var exists = function exists(val) {
    return val !== undefined && val !== null;
};

var tokenise = function tokenise(str) {
    var tokens = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    // Look for a matching rule
    var matched = rules.some(function (rule) {
        var match = str.match(rule.pattern);
        if (!match) return false;

        tokens.push({
            type: rule.name,
            match: match[0],
            val: match.slice(1, 2),
            otherVal: match.slice(2),
            regex: rule.regex instanceof Function ? rule.regex(match) : rule.regex
        });

        if (match[0].length < str.length) tokens = tokenise(str.substr(match[0].length), tokens);
        return true;
    });

    // If no rules matched, throw an error (possible malformed path)
    if (!matched) {
        throw new Error('Could not parse path.');
    }
    // Return tokens
    return tokens;
};

var optTrailingSlash = function optTrailingSlash(source, trailingSlash) {
    if (!trailingSlash) return source;
    return source.replace(/\\\/$/, '') + '(?:\\/)?';
};

var upToDelimiter = function upToDelimiter(source, delimiter) {
    if (!delimiter) return source;

    return (/(\/)$/.test(source) ? source : source + '(\\/|\\?|\\.|;|$)'
    );
};

var appendQueryParam = function appendQueryParam(params, param) {
    var val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

    if (/\[\]$/.test(param)) {
        param = withoutBrackets(param);
        val = [val];
    }
    var existingVal = params[param];

    if (existingVal === undefined) params[param] = val;else params[param] = Array.isArray(existingVal) ? existingVal.concat(val) : [existingVal, val];

    return params;
};

var parseQueryParams = function parseQueryParams(path) {
    var searchPart = getSearch(path);
    if (!searchPart) return {};

    return toObject(parse(searchPart));
};

function _serialise(key, val) {
    if (Array.isArray(val)) {
        return val.map(function (v) {
            return _serialise(key, v);
        }).join('&');
    }

    if (val === true) {
        return key;
    }

    return key + '=' + val;
}

var Path = function () {
    createClass(Path, null, [{
        key: 'createPath',
        value: function createPath(path) {
            return new Path(path);
        }
    }, {
        key: 'serialise',
        value: function serialise(key, val) {
            return _serialise(key, val);
        }
    }]);

    function Path(path) {
        classCallCheck(this, Path);

        if (!path) throw new Error('Please supply a path');
        this.path = path;
        this.tokens = tokenise(path);

        this.hasUrlParams = this.tokens.filter(function (t) {
            return (/^url-parameter/.test(t.type)
            );
        }).length > 0;
        this.hasSpatParam = this.tokens.filter(function (t) {
            return (/splat$/.test(t.type)
            );
        }).length > 0;
        this.hasMatrixParams = this.tokens.filter(function (t) {
            return (/matrix$/.test(t.type)
            );
        }).length > 0;
        this.hasQueryParams = this.tokens.filter(function (t) {
            return (/^query-parameter/.test(t.type)
            );
        }).length > 0;
        // Extract named parameters from tokens
        this.spatParams = this._getParams('url-parameter-splat');
        this.urlParams = this._getParams(/^url-parameter/);
        // Query params
        this.queryParams = this._getParams('query-parameter');
        this.queryParamsBr = this._getParams('query-parameter-bracket');
        // All params
        this.params = this.urlParams.concat(this.queryParams).concat(this.queryParamsBr);
        // Check if hasQueryParams
        // Regular expressions for url part only (full and partial match)
        this.source = this.tokens.filter(function (t) {
            return t.regex !== undefined;
        }).map(function (r) {
            return r.regex.source;
        }).join('');
    }

    createClass(Path, [{
        key: '_getParams',
        value: function _getParams(type) {
            var predicate = type instanceof RegExp ? function (t) {
                return type.test(t.type);
            } : function (t) {
                return t.type === type;
            };

            return this.tokens.filter(predicate).map(function (t) {
                return t.val[0];
            });
        }
    }, {
        key: '_isQueryParam',
        value: function _isQueryParam(name) {
            return this.queryParams.indexOf(name) !== -1 || this.queryParamsBr.indexOf(name) !== -1;
        }
    }, {
        key: '_urlTest',
        value: function _urlTest(path, regex) {
            var _this = this;

            var match = path.match(regex);
            if (!match) return null;else if (!this.urlParams.length) return {};
            // Reduce named params to key-value pairs
            return match.slice(1, this.urlParams.length + 1).reduce(function (params, m, i) {
                params[_this.urlParams[i]] = decodeURIComponent(m);
                return params;
            }, {});
        }
    }, {
        key: 'test',
        value: function test(path, opts) {
            var _this2 = this;

            var options = _extends({ trailingSlash: false }, opts);
            // trailingSlash: falsy => non optional, truthy => optional
            var source = optTrailingSlash(this.source, options.trailingSlash);
            // Check if exact match
            var matched = this._urlTest(path, new RegExp('^' + source + (this.hasQueryParams ? '(\\?.*$|$)' : '$')));
            // If no match, or no query params, no need to go further
            if (!matched || !this.hasQueryParams) return matched;
            // Extract query params
            var queryParams = parseQueryParams(path);
            var unexpectedQueryParams = Object.keys(queryParams).filter(function (p) {
                return _this2.queryParams.concat(_this2.queryParamsBr).indexOf(p) === -1;
            });

            if (unexpectedQueryParams.length === 0) {
                // Extend url match
                Object.keys(queryParams).forEach(function (p) {
                    return matched[p] = queryParams[p];
                });

                return matched;
            }

            return null;
        }
    }, {
        key: 'partialTest',
        value: function partialTest(path, opts) {
            var _this3 = this;

            var options = _extends({ delimited: true }, opts);
            // Check if partial match (start of given path matches regex)
            // trailingSlash: falsy => non optional, truthy => optional
            var source = upToDelimiter(this.source, options.delimited);
            var match = this._urlTest(path, new RegExp('^' + source));

            if (!match) return match;

            if (!this.hasQueryParams) return match;

            var queryParams = parseQueryParams(path);

            Object.keys(queryParams).filter(function (p) {
                return _this3.queryParams.concat(_this3.queryParamsBr).indexOf(p) >= 0;
            }).forEach(function (p) {
                return appendQueryParam(match, p, queryParams[p]);
            });

            return match;
        }
    }, {
        key: 'build',
        value: function build() {
            var _this4 = this;

            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var options = _extends({ ignoreConstraints: false, ignoreSearch: false }, opts);
            var encodedParams = Object.keys(params).reduce(function (acc, key) {
                if (!exists(params[key])) {
                    return acc;
                }

                var val = params[key];
                var encode = _this4._isQueryParam(key) ? encodeURIComponent : encodeURI;

                if (typeof val === 'boolean') {
                    acc[key] = val;
                } else if (Array.isArray(val)) {
                    acc[key] = val.map(encode);
                } else {
                    acc[key] = encode(val);
                }

                return acc;
            }, {});

            // Check all params are provided (not search parameters which are optional)
            if (this.urlParams.some(function (p) {
                return !exists(encodedParams[p]);
            })) throw new Error('Missing parameters');

            // Check constraints
            if (!options.ignoreConstraints) {
                var constraintsPassed = this.tokens.filter(function (t) {
                    return (/^url-parameter/.test(t.type) && !/-splat$/.test(t.type)
                    );
                }).every(function (t) {
                    return new RegExp('^' + defaultOrConstrained(t.otherVal[0]) + '$').test(encodedParams[t.val]);
                });

                if (!constraintsPassed) throw new Error('Some parameters are of invalid format');
            }

            var base = this.tokens.filter(function (t) {
                return (/^query-parameter/.test(t.type) === false
                );
            }).map(function (t) {
                if (t.type === 'url-parameter-matrix') return ';' + t.val + '=' + encodedParams[t.val[0]];
                return (/^url-parameter/.test(t.type) ? encodedParams[t.val[0]] : t.match
                );
            }).join('');

            if (options.ignoreSearch) return base;

            var queryParams = this.queryParams.concat(this.queryParamsBr.map(function (p) {
                return p + '[]';
            }));

            var searchPart = queryParams.filter(function (p) {
                return Object.keys(encodedParams).indexOf(withoutBrackets(p)) !== -1;
            }).map(function (p) {
                return _serialise(p, encodedParams[withoutBrackets(p)]);
            }).join('&');

            return base + (searchPart ? '?' + searchPart : '');
        }
    }]);
    return Path;
}();

var noop = function noop() {};

var RouteNode = function () {
    function RouteNode() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var childRoutes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var cb = arguments[3];
        var parent = arguments[4];
        classCallCheck(this, RouteNode);

        this.name = name;
        this.absolute = /^~/.test(path);
        this.path = this.absolute ? path.slice(1) : path;
        this.parser = this.path ? new Path(this.path) : null;
        this.children = [];
        this.parent = parent;

        this.checkParents();

        this.add(childRoutes, cb);

        return this;
    }

    createClass(RouteNode, [{
        key: 'checkParents',
        value: function checkParents() {
            if (this.absolute && this.hasParentsParams()) {
                throw new Error('[RouteNode] A RouteNode with an abolute path cannot have parents with route parameters');
            }
        }
    }, {
        key: 'hasParentsParams',
        value: function hasParentsParams() {
            if (this.parent && this.parent.parser) {
                var parser = this.parent.parser;
                var hasParams = parser.hasUrlParams || parser.hasSpatParam || parser.hasMatrixParams || parser.hasQueryParams;

                return hasParams || this.parent.hasParentsParams();
            }

            return false;
        }
    }, {
        key: 'getNonAbsoluteChildren',
        value: function getNonAbsoluteChildren() {
            return this.children.filter(function (child) {
                return !child.absolute;
            });
        }
    }, {
        key: 'findAbsoluteChildren',
        value: function findAbsoluteChildren() {
            return this.children.reduce(function (absoluteChildren, child) {
                return absoluteChildren.concat(child.absolute ? child : []).concat(child.findAbsoluteChildren());
            }, []);
        }
    }, {
        key: 'findSlashChild',
        value: function findSlashChild() {
            var slashChildren = this.getNonAbsoluteChildren().filter(function (child) {
                return child.parser && /^\/(\?|$)/.test(child.parser.path);
            });

            return slashChildren[0];
        }
    }, {
        key: 'getParentSegments',
        value: function getParentSegments() {
            var segments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            return this.parent && this.parent.parser ? this.parent.getParentSegments(segments.concat(this.parent)) : segments.reverse();
        }
    }, {
        key: 'setParent',
        value: function setParent(parent) {
            this.parent = parent;
            this.checkParents();
        }
    }, {
        key: 'setPath',
        value: function setPath() {
            var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            this.path = path;
            this.parser = path ? new Path(path) : null;
        }
    }, {
        key: 'add',
        value: function add(route) {
            var _this = this;

            var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

            var originalRoute = void 0;
            if (route === undefined || route === null) return;

            if (route instanceof Array) {
                route.forEach(function (r) {
                    return _this.add(r, cb);
                });
                return;
            }

            if (!(route instanceof RouteNode) && !(route instanceof Object)) {
                throw new Error('RouteNode.add() expects routes to be an Object or an instance of RouteNode.');
            } else if (route instanceof RouteNode) {
                route.setParent(this);
            } else {
                if (!route.name || !route.path) {
                    throw new Error('RouteNode.add() expects routes to have a name and a path defined.');
                }
                originalRoute = route;
                route = new RouteNode(route.name, route.path, route.children, cb, this);
            }

            var names = route.name.split('.');

            if (names.length === 1) {
                // Check duplicated routes
                if (this.children.map(function (child) {
                    return child.name;
                }).indexOf(route.name) !== -1) {
                    throw new Error('Alias "' + route.name + '" is already defined in route node');
                }

                // Check duplicated paths
                if (this.children.map(function (child) {
                    return child.path;
                }).indexOf(route.path) !== -1) {
                    throw new Error('Path "' + route.path + '" is already defined in route node');
                }

                this.children.push(route);
                // Push greedy spats to the bottom of the pile
                this.children.sort(function (left, right) {
                    var leftPath = left.path.split('?')[0].replace(/(.+)\/$/, '$1');
                    var rightPath = right.path.split('?')[0].replace(/(.+)\/$/, '$1');
                    // '/' last
                    if (leftPath === '/') return 1;
                    if (rightPath === '/') return -1;
                    // Spat params last
                    if (left.parser.hasSpatParam) return 1;
                    if (right.parser.hasSpatParam) return -1;
                    // No spat, number of segments (less segments last)
                    var leftSegments = (leftPath.match(/\//g) || []).length;
                    var rightSegments = (rightPath.match(/\//g) || []).length;
                    if (leftSegments < rightSegments) return 1;
                    if (leftSegments > rightSegments) return -1;
                    // Same number of segments, number of URL params ascending
                    var leftParamsCount = left.parser.urlParams.length;
                    var rightParamsCount = right.parser.urlParams.length;
                    if (leftParamsCount < rightParamsCount) return -1;
                    if (leftParamsCount > rightParamsCount) return 1;
                    // Same number of segments and params, last segment length descending
                    var leftParamLength = (leftPath.split('/').slice(-1)[0] || '').length;
                    var rightParamLength = (rightPath.split('/').slice(-1)[0] || '').length;
                    if (leftParamLength < rightParamLength) return 1;
                    if (leftParamLength > rightParamLength) return -1;
                    // Same last segment length, preserve definition order
                    return 0;
                });
            } else {
                // Locate parent node
                var segments = this.getSegmentsByName(names.slice(0, -1).join('.'));
                if (segments) {
                    route.name = names[names.length - 1];
                    segments[segments.length - 1].add(route);
                } else {
                    throw new Error('Could not add route named \'' + route.name + '\', parent is missing.');
                }
            }

            if (originalRoute) {
                var fullName = route.getParentSegments([route]).map(function (_) {
                    return _.name;
                }).join('.');
                cb(_extends({}, originalRoute, {
                    name: fullName
                }));
            }

            return this;
        }
    }, {
        key: 'addNode',
        value: function addNode(name, params) {
            this.add(new RouteNode(name, params));
            return this;
        }
    }, {
        key: 'getSegmentsByName',
        value: function getSegmentsByName(routeName) {
            var findSegmentByName = function findSegmentByName(name, routes) {
                var filteredRoutes = routes.filter(function (r) {
                    return r.name === name;
                });
                return filteredRoutes.length ? filteredRoutes[0] : undefined;
            };
            var segments = [];
            var routes = this.parser ? [this] : this.children;
            var names = (this.parser ? [''] : []).concat(routeName.split('.'));

            var matched = names.every(function (name) {
                var segment = findSegmentByName(name, routes);
                if (segment) {
                    routes = segment.children;
                    segments.push(segment);
                    return true;
                }
                return false;
            });

            return matched ? segments : null;
        }
    }, {
        key: 'getSegmentsMatchingPath',
        value: function getSegmentsMatchingPath(path, options) {
            var trailingSlash = options.trailingSlash,
                strictQueryParams = options.strictQueryParams,
                strongMatching = options.strongMatching;

            var matchChildren = function matchChildren(nodes, pathSegment, segments) {
                var isRoot = nodes.length === 1 && nodes[0].name === '';
                // for (child of node.children) {

                var _loop = function _loop(i) {
                    var child = nodes[i];

                    // Partially match path
                    var match = void 0;
                    var remainingPath = void 0;

                    if (!child.children.length) {
                        match = child.parser.test(pathSegment, { trailingSlash: trailingSlash });
                    }

                    if (!match) {
                        match = child.parser.partialTest(pathSegment, { delimiter: strongMatching });
                    }

                    if (match) {
                        // Remove consumed segment from path
                        var consumedPath = child.parser.build(match, { ignoreSearch: true });
                        if (trailingSlash && !child.children.length) {
                            consumedPath = consumedPath.replace(/\/$/, '');
                        }
                        remainingPath = pathSegment.replace(consumedPath, '');
                        var search = omit(getSearch(pathSegment.replace(consumedPath, '')), child.parser.queryParams.concat(child.parser.queryParamsBr));
                        remainingPath = getPath(remainingPath) + (search ? '?' + search : '');
                        if (trailingSlash && !isRoot && remainingPath === '/' && !/\/$/.test(consumedPath)) {
                            remainingPath = '';
                        }

                        segments.push(child);
                        Object.keys(match).forEach(function (param) {
                            return segments.params[param] = match[param];
                        });

                        if (!isRoot && !remainingPath.length) {
                            // fully matched
                            return {
                                v: segments
                            };
                        }
                        if (!isRoot && !strictQueryParams && remainingPath.indexOf('?') === 0) {
                            // unmatched queryParams in non strict mode
                            var remainingQueryParams = parse(remainingPath.slice(1));

                            remainingQueryParams.forEach(function (_ref) {
                                var name = _ref.name,
                                    value = _ref.value;
                                return segments.params[name] = value;
                            });
                            return {
                                v: segments
                            };
                        }
                        // Continue matching on non absolute children
                        var children = child.getNonAbsoluteChildren();
                        // If no children to match against but unmatched path left
                        if (!children.length) {
                            return {
                                v: null
                            };
                        }
                        // Else: remaining path and children
                        return {
                            v: matchChildren(children, remainingPath, segments)
                        };
                    }
                };

                for (var i = 0; i < nodes.length; i += 1) {
                    var _ret = _loop(i);

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }

                return null;
            };

            var topLevelNodes = this.parser ? [this] : this.children;
            var startingNodes = topLevelNodes.reduce(function (nodes, node) {
                return nodes.concat(node, node.findAbsoluteChildren());
            }, []);

            var segments = [];
            segments.params = {};

            var matched = matchChildren(startingNodes, path, segments);
            if (matched && matched.length === 1 && matched[0].name === '') return null;
            return matched;
        }
    }, {
        key: 'getPathFromSegments',
        value: function getPathFromSegments(segments) {
            return segments ? segments.map(function (segment) {
                return segment.path;
            }).join('') : null;
        }
    }, {
        key: 'getPath',
        value: function getPath(routeName) {
            return this.getPathFromSegments(this.getSegmentsByName(routeName));
        }
    }, {
        key: 'buildPathFromSegments',
        value: function buildPathFromSegments(segments) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (!segments) return null;

            var searchParams = [];
            var nonSearchParams = [];

            for (var i = 0; i < segments.length; i += 1) {
                var parser = segments[i].parser;
                searchParams.push.apply(searchParams, toConsumableArray(parser.queryParams));
                searchParams.push.apply(searchParams, toConsumableArray(parser.queryParamsBr));
                nonSearchParams.push.apply(nonSearchParams, toConsumableArray(parser.urlParams));
                nonSearchParams.push.apply(nonSearchParams, toConsumableArray(parser.spatParams));
            }

            if (!options.strictQueryParams) {
                var extraParams = Object.keys(params).reduce(function (acc, p) {
                    return searchParams.indexOf(p) === -1 && nonSearchParams.indexOf(p) === -1 ? acc.concat(p) : acc;
                }, []);
                searchParams.push.apply(searchParams, toConsumableArray(extraParams));
            }

            var searchPart = !searchParams.length ? null : searchParams.filter(function (p) {
                if (Object.keys(params).indexOf(withoutBrackets(p)) === -1) {
                    return false;
                }

                var val = params[withoutBrackets(p)];

                return val !== undefined && val !== null;
            }).map(function (p) {
                var val = params[withoutBrackets(p)];
                var encodedVal = Array.isArray(val) ? val.map(encodeURIComponent) : encodeURIComponent(val);

                return Path.serialise(p, encodedVal);
            }).join('&');

            var path = segments.reduce(function (path, segment) {
                var segmentPath = segment.parser.build(params, { ignoreSearch: true });

                return segment.absolute ? segmentPath : path + segmentPath;
            }, '');

            return path + (searchPart ? '?' + searchPart : '');
        }
    }, {
        key: 'getMetaFromSegments',
        value: function getMetaFromSegments(segments) {
            var accName = '';

            return segments.reduce(function (meta, segment) {
                var urlParams = segment.parser.urlParams.reduce(function (params, p) {
                    params[p] = 'url';
                    return params;
                }, {});

                var allParams = segment.parser.queryParams.reduce(function (params, p) {
                    params[p] = 'query';
                    return params;
                }, urlParams);

                if (segment.name !== undefined) {
                    accName = accName ? accName + '.' + segment.name : segment.name;
                    meta[accName] = allParams;
                }
                return meta;
            }, {});
        }
    }, {
        key: 'buildPath',
        value: function buildPath(routeName) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var defaultOptions = { strictQueryParams: true };
            var options = _extends({}, defaultOptions, opts);
            var path = this.buildPathFromSegments(this.getSegmentsByName(routeName), params, options);

            if (options.trailingSlash === true) {
                return (/\/$/.test(path) ? path : path + '/'
                );
            } else if (options.trailingSlash === false) {
                return (/\/$/.test(path) ? path.slice(0, -1) : path
                );
            }

            return path;
        }
    }, {
        key: 'buildStateFromSegments',
        value: function buildStateFromSegments(segments) {
            if (!segments || !segments.length) return null;

            var name = segments.map(function (segment) {
                return segment.name;
            }).filter(function (name) {
                return name;
            }).join('.');
            var params = segments.params;

            return {
                name: name,
                params: params,
                _meta: this.getMetaFromSegments(segments)
            };
        }
    }, {
        key: 'buildState',
        value: function buildState(name) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var segments = this.getSegmentsByName(name);
            if (!segments || !segments.length) return null;

            return {
                name: name,
                params: params,
                _meta: this.getMetaFromSegments(segments)
            };
        }
    }, {
        key: 'matchPath',
        value: function matchPath(path, options) {
            var defaultOptions = { trailingSlash: false, strictQueryParams: true, strongMatching: true };
            var opts = _extends({}, defaultOptions, options);
            var matchedSegments = this.getSegmentsMatchingPath(path, opts);

            if (matchedSegments) {
                if (matchedSegments[0].absolute) {
                    var firstSegmentParams = matchedSegments[0].getParentSegments();

                    matchedSegments.reverse();
                    matchedSegments.push.apply(matchedSegments, toConsumableArray(firstSegmentParams));
                    matchedSegments.reverse();
                }

                var lastSegment = matchedSegments[matchedSegments.length - 1];
                var lastSegmentSlashChild = lastSegment.findSlashChild();

                if (lastSegmentSlashChild) {
                    matchedSegments.push(lastSegmentSlashChild);
                }
            }

            return this.buildStateFromSegments(matchedSegments);
        }
    }]);
    return RouteNode;
}();

return RouteNode;

})));