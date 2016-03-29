'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _pathParser = require('path-parser');

var _pathParser2 = _interopRequireDefault(_pathParser);

var _searchParams = require('search-params');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noop = function noop() {};

var RouteNode = (function () {
    function RouteNode() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var childRoutes = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
        var cb = arguments[3];

        _classCallCheck(this, RouteNode);

        this.name = name;
        this.path = path;
        this.parser = path ? new _pathParser2.default(path) : null;
        this.children = [];

        this.add(childRoutes, cb);

        return this;
    }

    _createClass(RouteNode, [{
        key: 'setPath',
        value: function setPath() {
            var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            this.path = path;
            this.parser = path ? new _pathParser2.default(path) : null;
        }
    }, {
        key: 'add',
        value: function add(route) {
            var _this = this;

            var cb = arguments.length <= 1 || arguments[1] === undefined ? noop : arguments[1];

            var originalRoute = undefined;
            if (route === undefined || route === null) return;

            if (route instanceof Array) {
                route.forEach(function (r) {
                    return _this.add(r, cb);
                });
                return;
            }

            if (!(route instanceof RouteNode) && !(route instanceof Object)) {
                throw new Error('RouteNode.add() expects routes to be an Object or an instance of RouteNode.');
            }
            if (route instanceof Object) {
                if (!route.name || !route.path) {
                    throw new Error('RouteNode.add() expects routes to have a name and a path defined.');
                }
                originalRoute = route;
                route = new RouteNode(route.name, route.path, route.children);
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
                console.log(this.children.map(function (c) {
                    return c.path;
                }));
            } else {
                // Locate parent node
                var segments = this.getSegmentsByName(names.slice(0, -1).join('.'));
                if (segments) {
                    segments[segments.length - 1].add(new RouteNode(names[names.length - 1], route.path, route.children));
                } else {
                    throw new Error('Could not add route named \'' + route.name + '\', parent is missing.');
                }
            }

            if (originalRoute) cb(originalRoute);

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
            var trailingSlash = options.trailingSlash;
            var strictQueryParams = options.strictQueryParams;

            var matchChildren = function matchChildren(nodes, pathSegment, segments) {
                var _loop = function _loop(i) {
                    var child = nodes[i];
                    // Partially match path
                    var match = child.parser.partialMatch(pathSegment);
                    var remainingPath = undefined;

                    if (!match && trailingSlash) {
                        // Try with optional trailing slash
                        match = child.parser.match(pathSegment, true);
                        remainingPath = '';
                    } else if (match) {
                        // Remove consumed segment from path
                        var consumedPath = child.parser.build(match, { ignoreSearch: true });
                        remainingPath = pathSegment.replace(consumedPath, '');
                        var search = (0, _searchParams.omit)((0, _searchParams.getSearch)(pathSegment.replace(consumedPath, '')), child.parser.queryParams.concat(child.parser.queryParamsBr));
                        remainingPath = (0, _searchParams.getPath)(remainingPath) + (search ? '?' + search : '');

                        if (trailingSlash && remainingPath === '/' && !/\/$/.test(consumedPath)) {
                            remainingPath = '';
                        }
                    }

                    if (match) {
                        segments.push(child);
                        Object.keys(match).forEach(function (param) {
                            return segments.params[param] = match[param];
                        });

                        if (!remainingPath.length || // fully matched
                        !strictQueryParams && remainingPath.indexOf('?') === 0 // unmatched queryParams in non strict mode
                        ) {
                                return {
                                    v: segments
                                };
                            }
                        // If no children to match against but unmatched path left
                        if (!child.children.length) {
                            return {
                                v: null
                            };
                        }
                        // Else: remaining path and children
                        return {
                            v: matchChildren(child.children, remainingPath, segments)
                        };
                    }
                };

                // for (child of node.children) {
                for (var i in nodes) {
                    var _ret = _loop(i);

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
                return null;
            };

            var startingNodes = this.parser ? [this] : this.children;
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
            var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            if (!segments) return null;

            var searchParams = segments.filter(function (s) {
                return s.parser.hasQueryParams;
            }).reduce(function (params, s) {
                return params.concat(s.parser.queryParams).concat(s.parser.queryParamsBr.map(function (p) {
                    return p + '[]';
                }));
            }, []);

            var searchPart = !searchParams.length ? null : searchParams.filter(function (p) {
                return Object.keys(params).indexOf((0, _searchParams.withoutBrackets)(p)) !== -1;
            }).map(function (p) {
                return _pathParser2.default.serialise(p, params[(0, _searchParams.withoutBrackets)(p)]);
            }).join('&');

            return segments.map(function (segment) {
                return segment.parser.build(params, { ignoreSearch: true });
            }).join('') + (searchPart ? '?' + searchPart : '');
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
            var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            return this.buildPathFromSegments(this.getSegmentsByName(routeName), params);
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
            var params = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
            var defaultOptions = { trailingSlash: false, strictQueryParams: true };
            options = _extends({}, defaultOptions, options);
            return this.buildStateFromSegments(this.getSegmentsMatchingPath(path, options));
        }
    }]);

    return RouteNode;
})();

exports.default = RouteNode;
module.exports = exports['default'];
