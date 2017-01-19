import Path from 'path-parser';
import { getSearch, getPath, omit, withoutBrackets, parse } from 'search-params';

const noop = () => {};

export default class RouteNode {
    constructor(name = '', path = '', childRoutes = [], cb, parent) {
        this.name     = name;
        this.absolute = /^~/.test(path);
        this.path     = this.absolute ? path.slice(1) : path;
        this.parser   = this.path ? new Path(this.path) : null;
        this.children = [];
        this.parent   = parent;

        this.checkParents();

        this.add(childRoutes, cb);

        return this;
    }

    checkParents() {
        if (this.absolute && this.hasParentsParams()) {
            throw new Error('[RouteNode] A RouteNode with an abolute path cannot have parents with route parameters');
        }
    }

    hasParentsParams() {
        if (this.parent && this.parent.parser) {
            const parser = this.parent.parser;
            const hasParams = parser.hasUrlParams || parser.hasSpatParam || parser.hasMatrixParams || parser.hasQueryParams;

            return hasParams || this.parent.hasParentsParams();
        }

        return false;
    }

    getNonAbsoluteChildren() {
        return this.children.filter((child) => !child.absolute);
    }

    findAbsoluteChildren() {
        return this.children.reduce((absoluteChildren, child) =>
            absoluteChildren
                .concat(child.absolute ? child : [])
                .concat(child.findAbsoluteChildren()),
            []
        );
    }

    findSlashChild() {
        const slashChildren = this.getNonAbsoluteChildren()
            .filter((child) => child.parser && /^\/(\?|$)/.test(child.parser.path));

        return slashChildren[0];
    }

    getParentSegments(segments = []) {
        return this.parent && this.parent.parser
            ? this.parent.getParentSegments(segments.concat(this.parent))
            : segments.reverse();
    }

    setParent(parent) {
        this.parent = parent;
        this.checkParents();
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
        } else if (route instanceof RouteNode) {
            route.setParent(this);
        } else {
            if (!route.name || !route.path) {
                throw new Error('RouteNode.add() expects routes to have a name and a path defined.');
            }
            originalRoute = route;
            route = new RouteNode(route.name, route.path, route.children, cb, this);
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
                const leftPath = left.path.split('?')[0].replace(/(.+)\/$/, '$1');
                const rightPath = right.path.split('?')[0].replace(/(.+)\/$/, '$1');
                // '/' last
                if (leftPath === '/') return 1;
                if (rightPath === '/') return -1;
                // Spat params last
                if (left.parser.hasSpatParam) return 1;
                if (right.parser.hasSpatParam) return -1;
                // No spat, number of segments (less segments last)
                const leftSegments = (leftPath.match(/\//g) || []).length;
                const rightSegments = (rightPath.match(/\//g) || []).length;
                if (leftSegments < rightSegments) return 1;
                if (leftSegments > rightSegments) return -1;
                // Same number of segments, number of URL params ascending
                const leftParamsCount = left.parser.urlParams.length;
                const rightParamsCount = right.parser.urlParams.length;
                if (leftParamsCount < rightParamsCount) return -1;
                if (leftParamsCount > rightParamsCount) return 1;
                // Same number of segments and params, last segment length descending
                const leftParamLength = (leftPath.split('/').slice(-1)[0] || '').length;
                const rightParamLength = (rightPath.split('/').slice(-1)[0] || '').length;
                if (leftParamLength < rightParamLength) return 1;
                if (leftParamLength > rightParamLength) return -1;
                // Same last segment length, preserve definition order
                return 0;
            });
        } else {
            // Locate parent node
            let segments = this.getSegmentsByName(names.slice(0, -1).join('.'));
            if (segments) {
                route.name = names[names.length - 1];
                segments[segments.length - 1].add(route);
            } else {
                throw new Error(`Could not add route named '${route.name}', parent is missing.`);
            }
        }

        if (originalRoute) {
            const fullName = route.getParentSegments([ route ]).map((_) => _.name).join('.');
            cb({
                ...originalRoute,
                name: fullName
            });
        }

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
        const { trailingSlash, strictQueryParams, strongMatching } = options;
        let matchChildren = (nodes, pathSegment, segments) => {
            const isRoot = nodes.length === 1 && nodes[0].name === '';
            // for (child of node.children) {
            for (let i = 0; i < nodes.length; i += 1) {
                const child = nodes[i];

                // Partially match path
                let match;
                let remainingPath;

                if (!child.children.length) {
                    match = child.parser.test(pathSegment, { trailingSlash });
                }

                if (!match) {
                    match = child.parser.partialTest(pathSegment, { delimiter: strongMatching });
                }

                if (match) {
                    // Remove consumed segment from path
                    let consumedPath = child.parser.build(match, {ignoreSearch: true});
                    if (trailingSlash && !child.children.length) {
                        consumedPath = consumedPath.replace(/\/$/, '');
                    }
                    remainingPath = pathSegment.replace(consumedPath, '');
                    const search = omit(
                        getSearch(pathSegment.replace(consumedPath, '')),
                        child.parser.queryParams.concat(child.parser.queryParamsBr)
                    );
                    remainingPath = getPath(remainingPath) + (search ? `?${search}` : '');
                    if (trailingSlash && !isRoot && remainingPath === '/' && !/\/$/.test(consumedPath)) {
                        remainingPath = '';
                    }

                    segments.push(child);
                    Object.keys(match).forEach(param => segments.params[param] = match[param]);

                    if (!isRoot && !remainingPath.length) { // fully matched
                        return segments;
                    }
                    if (!isRoot && !strictQueryParams && remainingPath.indexOf('?') === 0) { // unmatched queryParams in non strict mode
                        const remainingQueryParams = parse(remainingPath.slice(1));

                        remainingQueryParams.forEach(({ name, value} ) => segments.params[name] = value);
                        return segments;
                    }
                    // Continue matching on non absolute children
                    const children = child.getNonAbsoluteChildren();
                    // If no children to match against but unmatched path left
                    if (!children.length) {
                        return null;
                    }
                    // Else: remaining path and children
                    return matchChildren(children, remainingPath, segments);
                }
            }

            return null;
        };

        const topLevelNodes = this.parser ? [ this ] : this.children;
        const startingNodes = topLevelNodes.reduce(
            (nodes, node) => nodes.concat(node, node.findAbsoluteChildren()),
            []
        );

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

    buildPathFromSegments(segments, params = {}, options = {}) {
        if (!segments) return null;

        let searchParams = [];
        let nonSearchParams = [];

        for (let i = 0; i < segments.length; i += 1) {
            const parser = segments[i].parser;
            searchParams.push(...parser.queryParams);
            searchParams.push(...parser.queryParamsBr);
            nonSearchParams.push(...parser.urlParams);
            nonSearchParams.push(...parser.spatParams);
        }

        if (!options.strictQueryParams) {
            const extraParams = Object.keys(params).reduce(
                (acc, p) => searchParams.indexOf(p) === -1 && nonSearchParams.indexOf(p) === -1
                    ? acc.concat(p)
                    : acc
            , []);
            searchParams.push(...extraParams);
        }

        const searchPart = !searchParams.length ? null : searchParams
            .filter(p => {
                if (Object.keys(params).indexOf(withoutBrackets(p)) === -1) {
                    return false;
                }

                const val = params[withoutBrackets(p)];

                return val !== undefined && val !== null;
            })
            .map(p => {
                const val = params[withoutBrackets(p)];
                const encodedVal = Array.isArray(val)
                        ? val.map(encodeURIComponent)
                        : encodeURIComponent(val);

                return Path.serialise(p, encodedVal);
            })
            .join('&');

        const path = segments
            .reduce((path, segment) => {
                const segmentPath = segment.parser.build(params, {ignoreSearch: true});

                return segment.absolute ? segmentPath : path + segmentPath;
            }, '');

        return path + (searchPart ? '?' + searchPart : '');
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

    buildPath(routeName, params = {}, opts = {}) {
        const defaultOptions = { strictQueryParams: true };
        const options = { ...defaultOptions, ...opts };
        const path = this.buildPathFromSegments(this.getSegmentsByName(routeName), params, options);

        if (options.trailingSlash === true) {
            return /\/$/.test(path) ? path : `${path}/`;
        } else if (options.trailingSlash === false) {
            return /\/$/.test(path) ? path.slice(0, -1) : path;
        }

        return path;
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
        const defaultOptions = { trailingSlash: false, strictQueryParams: true, strongMatching: true };
        const opts = { ...defaultOptions, ...options };
        let matchedSegments = this.getSegmentsMatchingPath(path, opts);

        if (matchedSegments) {
            if (matchedSegments[0].absolute) {
                const firstSegmentParams = matchedSegments[0].getParentSegments();

                matchedSegments.reverse();
                matchedSegments.push(...firstSegmentParams);
                matchedSegments.reverse();
            }

            const lastSegment = matchedSegments[matchedSegments.length - 1];
            const lastSegmentSlashChild = lastSegment.findSlashChild();

            if (lastSegmentSlashChild) {
                matchedSegments.push(lastSegmentSlashChild);
            }
        }

        return this.buildStateFromSegments(matchedSegments);
    }
}
