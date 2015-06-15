'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var RouteNode = (function () {
    function RouteNode() {
        var name = arguments[0] === undefined ? '' : arguments[0];
        var path = arguments[1] === undefined ? '' : arguments[1];
        var childRoutes = arguments[2] === undefined ? [] : arguments[2];

        _classCallCheck(this, RouteNode);

        this.name = name;
        this.path = path;
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

            // if (this.nameMap[route.name]) {
            //     throw new Error(`Alias $route.name is already defined in route node`)
            // }

            // if (this.pathMap[route.name]) {
            //     throw new Error(`Path $route.path is already defined in route node`)
            // }
            this.children.push(route);
        }
    }, {
        key: 'findRoute',
        value: function findRoute(path) {}
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
    }]);

    return RouteNode;
})();

exports['default'] = RouteNode;
module.exports = exports['default'];

