import Path from 'path-parser';
import { getSearch, getPath, omit, withoutBrackets, parse, toObject } from 'search-params';

const noop = () => {};

export default class RouteNode {
    constructor(name = '', path = '', childRoutes = [], cb) {
        this.name     = name;
        this.path     = path;
        this.parser   = path ? new Path(path) : null;
        this.children = [];

        this.add(childRoutes, cb);

        return this;
    }

    setPath(path = '') {
        this.path = path;
        this.parser = path ? new Path(path) : null;
    }

    add(route, cb = noop) {
        let originalRoute;
        if (route === undefined || route === null) return;

        if (route instanceof Array) {
            route.forEach(r => this.add(r, cb));
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

        let names = route.name.split('.');

        if (names.length === 1) {
            // Check duplicated routes
            if (this.children.map(child => child.name).indexOf(route.name) !== -1) {
                throw new Error(`Alias "${route.name}" is already defined in route node`);
            }

            // Check duplicated paths
            if (this.children.map(child => child.path).indexOf(route.path) !== -1) {
                throw new Error(`Path "${route.path}" is already defined in route node`);
            }

            this.children.push(route);
            // Push greedy spats to the bottom of the pile
            this.children.sort((left, right) => {
                const leftPath = left.path.split('?')[0];
                const rightPath = right.path.split('?')[0];
                // '/' last
                if (leftPath === '/') return 1;
                if (rightPath === '/') return -1;
                let leftHasParams = left.parser.hasUrlParams || left.parser.hasSpatParam;
                let rightHasParams = right.parser.hasUrlParams || right.parser.hasSpatParam;
                // No params first, sort by length descending
                if (!leftHasParams && !rightHasParams) {
                    return leftPath && rightPath ? (leftPath.length < rightPath.length ? 1 : -1) : 0;
                }
                // Params last
                if (leftHasParams && !rightHasParams) return 1;
                if (!leftHasParams && rightHasParams) return -1;
                // Spat params last
                if (!left.parser.hasSpatParam && right.parser.hasSpatParam) return -1;
                if (!right.parser.hasSpatParam && left.parser.hasSpatParam) return 1;
                // Sort by number of segments descending
                let leftSegments = (leftPath.match(/\//g) || []).length;
                let rightSegments = (rightPath.match(/\//g) || []).length;
                if (leftSegments < rightSegments) return 1;
                return 0;
            });
        } else {
            // Locate parent node
            let segments = this.getSegmentsByName(names.slice(0, -1).join('.'));
            if (segments) {
                segments[segments.length - 1].add(new RouteNode(names[names.length - 1], route.path, route.children));
            } else {
                throw new Error(`Could not add route named '${route.name}', parent is missing.`);
            }
        }

        if (originalRoute) cb(originalRoute);

        return this;
    }

    addNode(name, params) {
        this.add(new RouteNode(name, params));
        return this;
    }

    getSegmentsByName(routeName) {
        let findSegmentByName = (name, routes) => {
            let filteredRoutes = routes.filter(r => r.name === name);
            return filteredRoutes.length ? filteredRoutes[0] : undefined;
        };
        let segments = [];
        let routes = this.parser ? [ this ] : this.children;
        let names = ( this.parser ? [''] : [] ).concat(routeName.split('.'));

        let matched = names.every(name => {
            let segment = findSegmentByName(name, routes);
            if (segment) {
                routes = segment.children;
                segments.push(segment);
                return true;
            }
            return false;
        });

        return matched ? segments : null;
    }

    getSegmentsMatchingPath(path, options) {
        const { trailingSlash, strictQueryParams } = options;
        let matchChildren = (nodes, pathSegment, segments) => {
            // for (child of node.children) {
            for (let i in nodes) {
                let child = nodes[i];
                // Partially match path
                let match = child.parser.partialMatch(pathSegment);
                let remainingPath;

                if (!match && trailingSlash) {
                    // Try with optional trailing slash
                    match = child.parser.match(pathSegment, true);
                    remainingPath = '';
                } else if (match) {
                    // Remove consumed segment from path
                    const consumedPath = child.parser.build(match, {ignoreSearch: true});
                    remainingPath = pathSegment.replace(consumedPath, '');
                    const search = omit(
                        getSearch(pathSegment.replace(consumedPath, '')),
                        child.parser.queryParams.concat(child.parser.queryParamsBr)
                    );
                    remainingPath = getPath(remainingPath) + (search ? `?${search}` : '');

                    if (trailingSlash && remainingPath === '/' && !/\/$/.test(consumedPath)) {
                        remainingPath = '';
                    }
                }

                if (match) {
                    segments.push(child);
                    Object.keys(match).forEach(param => segments.params[param] = match[param]);

                    if (!remainingPath.length || // fully matched
                        !strictQueryParams && remainingPath.indexOf('?') === 0 // unmatched queryParams in non strict mode
                    ) {
                      return segments;
                    }
                    // If no children to match against but unmatched path left
                    if (!child.children.length) {
                        return null;
                    }
                    // Else: remaining path and children
                    return matchChildren(child.children, remainingPath, segments);
                }
            }
            return null;
        };

        let startingNodes = this.parser ? [this] : this.children;
        let segments = [];
        segments.params = {};

        const matched = matchChildren(startingNodes, path, segments);
        if (matched && matched.length === 1 && matched[0].name === '') return null;

        return matched;
    }

    getPathFromSegments(segments) {
        return segments ? segments.map(segment => segment.path).join('') : null;
    }

    getPath(routeName) {
        return this.getPathFromSegments(this.getSegmentsByName(routeName));
    }

    buildPathFromSegments(segments, params = {}) {
        if (!segments) return null;

        const searchParams = segments
            .filter(s => s.parser.hasQueryParams)
            .reduce(
                (params, s) => params
                    .concat(s.parser.queryParams)
                    .concat(s.parser.queryParamsBr.map(p => p + '[]')),
                []
            );

        const searchPart = !searchParams.length ? null : searchParams
            .filter(p => Object.keys(params).indexOf(withoutBrackets(p)) !== -1)
            .map(p => Path.serialise(p, params[withoutBrackets(p)]))
            .join('&');

        return segments
            .map(segment => segment.parser.build(params, {ignoreSearch: true}))
            .join('') + (searchPart ? '?' + searchPart : '');
    }

    getMetaFromSegments(segments) {
        let accName = '';

        return segments.reduce((meta, segment) => {
            const urlParams = segment.parser.urlParams.reduce((params, p) => {
                params[p] = 'url';
                return params;
            }, {});

            const allParams = segment.parser.queryParams.reduce((params, p) => {
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

    buildPath(routeName, params = {}) {
        return this.buildPathFromSegments(this.getSegmentsByName(routeName), params);
    }

    buildStateFromSegments(segments) {
        if (!segments || !segments.length) return null;

        const name = segments
            .map(segment => segment.name)
            .filter(name => name)
            .join('.');
        const params = segments.params;

        return {
            name,
            params,
            _meta: this.getMetaFromSegments(segments)
        };
    }

    buildState(name, params = {}) {
        const segments = this.getSegmentsByName(name);
        if (!segments || !segments.length) return null;

        return {
            name,
            params,
            _meta: this.getMetaFromSegments(segments)
        };
    }

    matchPath(path, options) {
        const defaultOptions = { trailingSlash: false, strictQueryParams: true };
        options = { ...defaultOptions, ...options };
        return this.buildStateFromSegments(this.getSegmentsMatchingPath(path, options));
    }
}
