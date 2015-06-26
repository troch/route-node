'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _pathParser = require('path-parser');

var _pathParser2 = _interopRequireDefault(_pathParser);

var RouteNode = (function () {
    function RouteNode() {
        var name = arguments[0] === undefined ? '' : arguments[0];
        var path = arguments[1] === undefined ? '' : arguments[1];
        var childRoutes = arguments[2] === undefined ? [] : arguments[2];

        _classCallCheck(this, RouteNode);

        this.name = name;
        this.path = path;
        if (path) {
            this.parser = new _pathParser2['default'](path);
        }
        this.children = [];

        this.add(childRoutes);
    }

    _createClass(RouteNode, [{
        key: 'add',
        value: function add(route) {
            var _this = this;

            if (route instanceof Array) {
                route.forEach(function (r) {
                    return _this.add(r);
                });
                return;
            }

            if (!(route instanceof RouteNode) && !(route instanceof Object)) {
                throw new Error('Route constructor expects routes to be an Object or an instance of Route.');
            }
            if (route instanceof Object) {
                if (!route.name || !route.path) {
                    throw new Error('Route constructor expects routes to have an name and a path defined.');
                }
                route = new RouteNode(route.name, route.path, route.children);
            }
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
        }
    }, {
        key: 'findRouteByPath',
        value: function findRouteByPath(path) {}
    }, {
        key: 'findRouteByName',
        value: function findRouteByName(routeName) {
            var findSegmentByName = function findSegmentByName(name, routes) {
                var filteredRoutes = routes.filter(function (r) {
                    return r.name === name;
                });
                return filteredRoutes.length ? filteredRoutes[0] : undefined;
            };
            var segments = [];
            var names = routeName.split('.');
            var routes = this.children;

            var matched = names.every(function (name) {
                var segment = findSegmentByName(name, routes);
                if (segment) {
                    routes = segment.children;
                    segments.push(segment);
                    return true;
                }
                return false;
            });

            return matched ? segments : [];
        }
    }, {
        key: 'getPath',
        value: function getPath(routeName) {
            var segments = this.findRouteByName(routeName);

            return segments.map(function (segment) {
                return segment.path;
            }).join('');
        }
    }, {
        key: 'buildPath',
        value: function buildPath(routeName) {
            var params = arguments[1] === undefined ? {} : arguments[1];

            var segments = this.findRouteByName(routeName);

            return segments.map(function (segment) {
                return segment.parser.build(params);
            }).join('');
        }
    }]);

    return RouteNode;
})();

exports['default'] = RouteNode;
module.exports = exports['default'];

