'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pathParser = require('path-parser');

var _pathParser2 = _interopRequireDefault(_pathParser);

var _searchParams = require('search-params');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var noop = function noop() {};

var RouteNode = function () {
    function RouteNode() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        var childRoutes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var cb = arguments[3];
        var parent = arguments[4];

        _classCallCheck(this, RouteNode);

        this.name = name;
        this.absolute = /^~/.test(path);
        this.path = this.absolute ? path.slice(1) : path;
        this.parser = this.path ? new _pathParser2.default(this.path) : null;
        this.children = [];
        this.parent = parent;

        this.checkParents();

        this.add(childRoutes, cb);

        return this;
    }

    _createClass(RouteNode, [{
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
            this.parser = path ? new _pathParser2.default(path) : null;
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
                        var search = (0, _searchParams.omit)((0, _searchParams.getSearch)(pathSegment.replace(consumedPath, '')), child.parser.queryParams.concat(child.parser.queryParamsBr));
                        remainingPath = (0, _searchParams.getPath)(remainingPath) + (search ? '?' + search : '');
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
                            var remainingQueryParams = (0, _searchParams.parse)(remainingPath.slice(1));

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
                searchParams.push.apply(searchParams, _toConsumableArray(parser.queryParams));
                searchParams.push.apply(searchParams, _toConsumableArray(parser.queryParamsBr));
                nonSearchParams.push.apply(nonSearchParams, _toConsumableArray(parser.urlParams));
                nonSearchParams.push.apply(nonSearchParams, _toConsumableArray(parser.spatParams));
            }

            if (!options.strictQueryParams) {
                var extraParams = Object.keys(params).reduce(function (acc, p) {
                    return searchParams.indexOf(p) === -1 && nonSearchParams.indexOf(p) === -1 ? acc.concat(p) : acc;
                }, []);
                searchParams.push.apply(searchParams, _toConsumableArray(extraParams));
            }

            var searchPart = !searchParams.length ? null : searchParams.filter(function (p) {
                if (Object.keys(params).indexOf((0, _searchParams.withoutBrackets)(p)) === -1) {
                    return false;
                }

                var val = params[(0, _searchParams.withoutBrackets)(p)];

                return val !== undefined && val !== null;
            }).map(function (p) {
                var val = params[(0, _searchParams.withoutBrackets)(p)];
                var encodedVal = Array.isArray(val) ? val.map(encodeURIComponent) : encodeURIComponent(val);

                return _pathParser2.default.serialise(p, encodedVal);
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
                    matchedSegments.push.apply(matchedSegments, _toConsumableArray(firstSegmentParams));
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

exports.default = RouteNode;
module.exports = exports['default'];
