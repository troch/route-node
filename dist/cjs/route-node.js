'use strict';

var searchParams = require('search-params');
var pathParser = require('path-parser');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = Object.assign || function __assign(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
};

var getMetaFromSegments = function (segments) {
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
};
var buildStateFromMatch = function (match) {
    if (!match || !match.segments || !match.segments.length) {
        return null;
    }
    var name = match.segments
        .map(function (segment) { return segment.name; })
        .filter(function (name) { return name; })
        .join('.');
    var params = match.params;
    return {
        name: name,
        params: params,
        meta: getMetaFromSegments(match.segments)
    };
};
var buildPathFromSegments = function (segments, params, options) {
    if (params === void 0) { params = {}; }
    if (options === void 0) { options = {}; }
    if (!segments) {
        return null;
    }
    var _a = options.queryParamsMode, queryParamsMode = _a === void 0 ? 'default' : _a, _b = options.trailingSlashMode;
    var searchParams$$1 = [];
    var nonSearchParams = [];
    for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
        var segment = segments_1[_i];
        var parser = segment.parser;
        searchParams$$1.push.apply(searchParams$$1, parser.queryParams);
        nonSearchParams.push.apply(nonSearchParams, parser.urlParams);
        nonSearchParams.push.apply(nonSearchParams, parser.spatParams);
    }
    if (queryParamsMode === 'loose') {
        var extraParams = Object.keys(params).reduce(function (acc, p) {
            return searchParams$$1.indexOf(p) === -1 &&
                nonSearchParams.indexOf(p) === -1
                ? acc.concat(p)
                : acc;
        }, []);
        searchParams$$1.push.apply(searchParams$$1, extraParams);
    }
    var searchParamsObject = searchParams$$1.reduce(function (acc, paramName) {
        if (Object.keys(params).indexOf(paramName) !== -1) {
            acc[paramName] = params[paramName];
        }
        return acc;
    }, {});
    var searchPart = searchParams.build(searchParamsObject, options.queryParams);
    var path = segments
        .reduce(function (path, segment) {
        var segmentPath = segment.parser.build(params, {
            ignoreSearch: true,
            queryParams: options.queryParams
        });
        return segment.absolute ? segmentPath : path + segmentPath;
    }, '')
        .replace(/\/\/{1,}/g, '/');
    var finalPath = path;
    if (options.trailingSlashMode === 'always') {
        finalPath = /\/$/.test(path) ? path : path + "/";
    }
    else if (options.trailingSlashMode === 'never' && path !== '/') {
        finalPath = /\/$/.test(path) ? path.slice(0, -1) : path;
    }
    return finalPath + (searchPart ? '?' + searchPart : '');
};
var getPathFromSegments = function (segments) {
    return segments ? segments.map(function (segment) { return segment.path; }).join('') : null;
};

var getPath = function (path) { return path.split('?')[0]; };
var getSearch = function (path) { return path.split('?')[1] || ''; };
var matchChildren = function (nodes, pathSegment, currentMatch, options, consumedBefore) {
    if (options === void 0) { options = {}; }
    var _a = options.queryParamsMode, queryParamsMode = _a === void 0 ? 'default' : _a, _b = options.strictTrailingSlash, strictTrailingSlash = _b === void 0 ? false : _b, _c = options.strongMatching, strongMatching = _c === void 0 ? true : _c, _d = options.caseSensitive, caseSensitive = _d === void 0 ? false : _d;
    var isRoot = nodes.length === 1 && nodes[0].name === '';
    var _loop_1 = function (child) {
        // Partially match path
        var match;
        var remainingPath = void 0;
        var segment = pathSegment;
        if (consumedBefore === '/' && child.path === '/') {
            // when we encounter repeating slashes we add the slash
            // back to the URL to make it de facto pathless
            segment = '/' + pathSegment;
        }
        if (!child.children.length) {
            match = child.parser.test(segment, {
                caseSensitive: caseSensitive,
                strictTrailingSlash: strictTrailingSlash,
                queryParams: options.queryParams
            });
        }
        if (!match) {
            match = child.parser.partialTest(segment, {
                delimited: strongMatching,
                caseSensitive: caseSensitive,
                queryParams: options.queryParams
            });
        }
        if (match) {
            // Remove consumed segment from path
            var consumedPath = child.parser.build(match, {
                ignoreSearch: true
            });
            if (!strictTrailingSlash && !child.children.length) {
                consumedPath = consumedPath.replace(/\/$/, '');
            }
            // Can't create a regexp from the path because it might contain a
            // regexp character.
            if (segment.toLowerCase().indexOf(consumedPath.toLowerCase()) === 0) {
                remainingPath = segment.slice(consumedPath.length);
            }
            else {
                remainingPath = segment;
            }
            if (!strictTrailingSlash && !child.children.length) {
                remainingPath = remainingPath.replace(/^\/\?/, '?');
            }
            var querystring = searchParams.omit(getSearch(segment.replace(consumedPath, '')), child.parser.queryParams, options.queryParams).querystring;
            remainingPath =
                getPath(remainingPath) + (querystring ? "?" + querystring : '');
            if (!strictTrailingSlash &&
                !isRoot &&
                remainingPath === '/' &&
                !/\/$/.test(consumedPath)) {
                remainingPath = '';
            }
            currentMatch.segments.push(child);
            Object.keys(match).forEach(function (param) { return (currentMatch.params[param] = match[param]); });
            if (!isRoot && !remainingPath.length) {
                return { value: currentMatch };
            }
            if (!isRoot &&
                queryParamsMode !== 'strict' &&
                remainingPath.indexOf('?') === 0) {
                // unmatched queryParams in non strict mode
                var remainingQueryParams_1 = searchParams.parse(remainingPath.slice(1), options.queryParams);
                Object.keys(remainingQueryParams_1).forEach(function (name) {
                    return (currentMatch.params[name] = remainingQueryParams_1[name]);
                });
                return { value: currentMatch };
            }
            // Continue matching on non absolute children
            var children = child.getNonAbsoluteChildren();
            // If no children to match against but unmatched path left
            if (!children.length) {
                return { value: null };
            }
            return { value: matchChildren(children, remainingPath, currentMatch, options, consumedPath) };
        }
    };
    // for (child of node.children) {
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var child = nodes_1[_i];
        var state_1 = _loop_1(child);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return null;
};

function sortChildren(children) {
    var originalChildren = children.slice(0);
    return children.sort(sortPredicate(originalChildren));
}
var sortPredicate = function (originalChildren) { return function (left, right) {
    var leftPath = left.path
        .replace(/<.*?>/g, '')
        .split('?')[0]
        .replace(/(.+)\/$/, '$1');
    var rightPath = right.path
        .replace(/<.*?>/g, '')
        .split('?')[0]
        .replace(/(.+)\/$/, '$1');
    // '/' last
    if (leftPath === '/') {
        return 1;
    }
    if (rightPath === '/') {
        return -1;
    }
    // Spat params last
    if (left.parser.hasSpatParam) {
        return 1;
    }
    if (right.parser.hasSpatParam) {
        return -1;
    }
    // No spat, number of segments (less segments last)
    var leftSegments = (leftPath.match(/\//g) || []).length;
    var rightSegments = (rightPath.match(/\//g) || []).length;
    if (leftSegments < rightSegments) {
        return 1;
    }
    if (leftSegments > rightSegments) {
        return -1;
    }
    // Same number of segments, number of URL params ascending
    var leftParamsCount = left.parser.urlParams.length;
    var rightParamsCount = right.parser.urlParams.length;
    if (leftParamsCount < rightParamsCount) {
        return -1;
    }
    if (leftParamsCount > rightParamsCount) {
        return 1;
    }
    // Same number of segments and params, last segment length descending
    var leftParamLength = (leftPath.split('/').slice(-1)[0] || '').length;
    var rightParamLength = (rightPath.split('/').slice(-1)[0] || '').length;
    if (leftParamLength < rightParamLength) {
        return 1;
    }
    if (leftParamLength > rightParamLength) {
        return -1;
    }
    // Same last segment length, preserve definition order. Note that we
    // cannot just return 0, as sort is not guaranteed to be a stable sort.
    return originalChildren.indexOf(left) - originalChildren.indexOf(right);
}; };

var defaultBuildOptions = {
    queryParamsMode: 'default',
    trailingSlashMode: 'default'
};
var defaultMatchOptions = __assign({}, defaultBuildOptions, { strongMatching: true });
var RouteNode = /** @class */ (function () {
    function RouteNode(name, path, childRoutes, cb, parent, finalSort, sort) {
        if (name === void 0) { name = ''; }
        if (path === void 0) { path = ''; }
        if (childRoutes === void 0) { childRoutes = []; }
        if (finalSort === void 0) { finalSort = true; }
        this.name = name;
        this.absolute = /^~/.test(path);
        this.path = this.absolute ? path.slice(1) : path;
        this.parser = this.path ? new pathParser.Path(this.path) : null;
        this.children = [];
        this.parent = parent;
        this.checkParents();
        this.add(childRoutes, cb, finalSort ? false : sort !== false);
        if (finalSort) {
            this.sortDescendants();
        }
        return this;
    }
    RouteNode.prototype.getParentSegments = function (segments) {
        if (segments === void 0) { segments = []; }
        return this.parent && this.parent.parser
            ? this.parent.getParentSegments(segments.concat(this.parent))
            : segments.reverse();
    };
    RouteNode.prototype.setParent = function (parent) {
        this.parent = parent;
        this.checkParents();
    };
    RouteNode.prototype.setPath = function (path) {
        if (path === void 0) { path = ''; }
        this.path = path;
        this.parser = path ? new pathParser.Path(path) : null;
    };
    RouteNode.prototype.add = function (route, cb, sort) {
        var _this = this;
        if (sort === void 0) { sort = true; }
        if (route === undefined || route === null) {
            return;
        }
        if (route instanceof Array) {
            route.forEach(function (r) { return _this.add(r, cb, sort); });
            return;
        }
        if (!(route instanceof RouteNode) && !(route instanceof Object)) {
            throw new Error('RouteNode.add() expects routes to be an Object or an instance of RouteNode.');
        }
        else if (route instanceof RouteNode) {
            route.setParent(this);
            this.addRouteNode(route, sort);
        }
        else {
            if (!route.name || !route.path) {
                throw new Error('RouteNode.add() expects routes to have a name and a path defined.');
            }
            var routeNode = new RouteNode(route.name, route.path, route.children, cb, this, false, sort);
            var fullName = routeNode
                .getParentSegments([routeNode])
                .map(function (_) { return _.name; })
                .join('.');
            if (cb) {
                cb(__assign({}, route, { name: fullName }));
            }
            this.addRouteNode(routeNode, sort);
        }
        return this;
    };
    RouteNode.prototype.addNode = function (name, path) {
        this.add(new RouteNode(name, path));
        return this;
    };
    RouteNode.prototype.getPath = function (routeName) {
        return getPathFromSegments(this.getSegmentsByName(routeName));
    };
    RouteNode.prototype.getNonAbsoluteChildren = function () {
        return this.children.filter(function (child) { return !child.absolute; });
    };
    RouteNode.prototype.sortChildren = function () {
        if (this.children.length) {
            sortChildren(this.children);
        }
    };
    RouteNode.prototype.sortDescendants = function () {
        this.sortChildren();
        this.children.forEach(function (child) { return child.sortDescendants(); });
    };
    RouteNode.prototype.buildPath = function (routeName, params, options) {
        if (params === void 0) { params = {}; }
        if (options === void 0) { options = {}; }
        var path = buildPathFromSegments(this.getSegmentsByName(routeName), params, options);
        return path;
    };
    RouteNode.prototype.buildState = function (name, params) {
        if (params === void 0) { params = {}; }
        var segments = this.getSegmentsByName(name);
        if (!segments || !segments.length) {
            return null;
        }
        return {
            name: name,
            params: params,
            meta: getMetaFromSegments(segments)
        };
    };
    RouteNode.prototype.matchPath = function (path, options) {
        if (options === void 0) { options = {}; }
        if (path === '' && !options.strictTrailingSlash) {
            path = '/';
        }
        var match = this.getSegmentsMatchingPath(path, options);
        if (match) {
            var matchedSegments = match.segments;
            if (matchedSegments[0].absolute) {
                var firstSegmentParams = matchedSegments[0].getParentSegments();
                matchedSegments.reverse();
                matchedSegments.push.apply(matchedSegments, firstSegmentParams);
                matchedSegments.reverse();
            }
            var lastSegment = matchedSegments[matchedSegments.length - 1];
            var lastSegmentSlashChild = lastSegment.findSlashChild();
            if (lastSegmentSlashChild) {
                matchedSegments.push(lastSegmentSlashChild);
            }
        }
        return buildStateFromMatch(match);
    };
    RouteNode.prototype.addRouteNode = function (route, sort) {
        if (sort === void 0) { sort = true; }
        var names = route.name.split('.');
        if (names.length === 1) {
            // Check duplicated routes
            if (this.children.map(function (child) { return child.name; }).indexOf(route.name) !==
                -1) {
                throw new Error("Alias \"" + route.name + "\" is already defined in route node");
            }
            // Check duplicated paths
            if (this.children.map(function (child) { return child.path; }).indexOf(route.path) !==
                -1) {
                throw new Error("Path \"" + route.path + "\" is already defined in route node");
            }
            this.children.push(route);
            if (sort) {
                this.sortChildren();
            }
        }
        else {
            // Locate parent node
            var segments = this.getSegmentsByName(names.slice(0, -1).join('.'));
            if (segments) {
                route.name = names[names.length - 1];
                segments[segments.length - 1].add(route);
            }
            else {
                throw new Error("Could not add route named '" + route.name + "', parent is missing.");
            }
        }
        return this;
    };
    RouteNode.prototype.checkParents = function () {
        if (this.absolute && this.hasParentsParams()) {
            throw new Error('[RouteNode] A RouteNode with an abolute path cannot have parents with route parameters');
        }
    };
    RouteNode.prototype.hasParentsParams = function () {
        if (this.parent && this.parent.parser) {
            var parser = this.parent.parser;
            var hasParams = parser.hasUrlParams ||
                parser.hasSpatParam ||
                parser.hasMatrixParams ||
                parser.hasQueryParams;
            return hasParams || this.parent.hasParentsParams();
        }
        return false;
    };
    RouteNode.prototype.findAbsoluteChildren = function () {
        return this.children.reduce(function (absoluteChildren, child) {
            return absoluteChildren
                .concat(child.absolute ? child : [])
                .concat(child.findAbsoluteChildren());
        }, []);
    };
    RouteNode.prototype.findSlashChild = function () {
        var slashChildren = this.getNonAbsoluteChildren().filter(function (child) { return child.parser && /^\/(\?|$)/.test(child.parser.path); });
        return slashChildren[0];
    };
    RouteNode.prototype.getSegmentsByName = function (routeName) {
        var findSegmentByName = function (name, routes) {
            var filteredRoutes = routes.filter(function (r) { return r.name === name; });
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
    };
    RouteNode.prototype.getSegmentsMatchingPath = function (path, options) {
        var topLevelNodes = this.parser ? [this] : this.children;
        var startingNodes = topLevelNodes.reduce(function (nodes, node) { return nodes.concat(node, node.findAbsoluteChildren()); }, []);
        var currentMatch = {
            segments: [],
            params: {}
        };
        var finalMatch = matchChildren(startingNodes, path, currentMatch, options);
        if (finalMatch &&
            finalMatch.segments.length === 1 &&
            finalMatch.segments[0].name === '') {
            return null;
        }
        return finalMatch;
    };
    return RouteNode;
}());

module.exports = RouteNode;
