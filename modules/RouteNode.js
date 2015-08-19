import Path from 'path-parser/modules/Path'

export default class RouteNode {
    constructor(name = '', path = '', childRoutes = []) {
        this.name     = name
        this.path     = path
        this.parser   = path ? new Path(path) : null
        this.children = []

        this.add(childRoutes)

        return this
    }

    add(route) {
        if (route instanceof Array) {
            route.forEach(r => this.add(r))
            return
        }

        if (!(route instanceof RouteNode) && !(route instanceof Object)) {
            throw new Error('Route constructor expects routes to be an Object or an instance of Route.')
        }
        if (route instanceof Object) {
            if (!route.name || !route.path) {
                throw new Error('Route constructor expects routes to have an name and a path defined.')
            }
            route = new RouteNode(route.name, route.path, route.children)
        }
        // Check duplicated routes
        if (this.children.map(child => child.name).indexOf(route.name) !== -1) {
            throw new Error(`Alias "${route.name}" is already defined in route node`)
        }
        // Check duplicated paths
        if (this.children.map(child => child.path).indexOf(route.path) !== -1) {
            throw new Error(`Path "${route.path}" is already defined in route node`)
        }

        let names = route.name.split('.')

        if (names.length === 1) {
            this.children.push(route)
            // Push greedy spats to the bottom of the pile
            this.children.sort((a, b) => {
                // '/' last
                if (a.path === '/') return 1;
                if (b.path === '/') return -1;
                let aHasParams = a.parser.hasUrlParams || a.parser.hasSpatParam
                let bHasParams = b.parser.hasUrlParams || b.parser.hasSpatParam
                // No params first, sort by length descending
                if (!aHasParams && !bHasParams) {
                    return a.path && b.path ? (a.path.length < b.path.length ? 1 : -1) : 0
                }
                // Params last
                if (aHasParams && !bHasParams) return 1
                if (!aHasParams && bHasParams) return -1
                // Spat params last
                if (!a.parser.hasSpatParam && b.parser.hasSpatParam) return -1
                if (!b.parser.hasSpatParam && a.parser.hasSpatParam) return 1
                // Sort by number of segments descending
                let aSegments = (a.path.match(/\//g) || []).length
                let bSegments = (b.path.match(/\//g) || []).length
                if (aSegments < bSegments) return 1
                return 0
            })
        } else {
            // Locate parent node
            let segments = this.getSegmentsByName(names.slice(0, -1).join('.'))
            if (segments) {
                segments[segments.length - 1].add(new RouteNode(names[names.length - 1], route.path, route.children))
            } else {
                throw new Error(`Could not add route named '${route.name}', parent is missing.`)
            }
        }

        return this
    }

    addNode(name, params) {
        this.add(new RouteNode(name, params))
        return this
    }

    getSegmentsByName(routeName) {
        let findSegmentByName = (name, routes) => {
            let filteredRoutes = routes.filter(r => r.name === name)
            return filteredRoutes.length ? filteredRoutes[0] : undefined
        }
        let segments = []
        let names = routeName.split('.');
        let routes = this.children

        let matched = names.every(name => {
            let segment = findSegmentByName(name, routes)
            if (segment) {
                routes = segment.children
                segments.push(segment)
                return true
            }
            return false
        })

        return matched ? segments : null
    }

    getSegmentsMatchingPath(path, trailingSlash = false) {
        let matchChildren = (nodes, pathSegment, segments) => {
            // for (child of node.children) {
            for (let i in nodes) {
                let child = nodes[i]
                // Partially match path
                let match = child.parser.partialMatch(pathSegment)
                let remainingPath

                if (!match && trailingSlash) {
                    // Try with optional trailing slash
                    match = child.parser.match(pathSegment, true)
                    remainingPath = ''
                } else if (match) {
                    // Remove consumed segment from path
                    let consumedPath = child.parser.build(match)
                    remainingPath = pathSegment.replace(consumedPath, '')
                    if (trailingSlash && remainingPath === '/' && !/\/$/.test(consumedPath)) {
                        remainingPath = ''
                    }
                }

                if (match) {
                    segments.push(child)
                    Object.keys(match).forEach(param => segments.params[param] = match[param])
                    // If fully matched
                    if (!remainingPath.length) {
                        return segments
                    }
                    // If no children to match against but unmatched path left
                    if (!child.children.length) {
                        return null
                    }
                    // Else: remaining path and children
                    return matchChildren(child.children, remainingPath, segments);
                }
            }
            return null;
        }

        let startingNodes = this.parser ? [this] : this.children
        let segments = []
        segments.params = {}

        return matchChildren(startingNodes, path, segments)
    }

    getPathFromSegments(segments) {
        return segments ? segments.map(segment => segment.path).join('') : null
    }

    getPath(routeName) {
        return this.getPathFromSegments(this.getSegmentsByName(routeName))
    }

    buildPathFromSegments(segments, params = {}) {
        return segments ? segments.map(segment => segment.parser.build(params)).join('') : null
    }

    buildPath(routeName, params = {}) {
        return this.buildPathFromSegments(this.getSegmentsByName(routeName), params)
    }

    getMatchPathFromSegments(segments) {
        if (!segments || !segments.length) return null

        let name = segments.map(segment => segment.name).join('.')
        let params = segments.params

        return {name, params}
    }

    matchPath(path, trailingSlash = false) {
        return this.getMatchPathFromSegments(this.getSegmentsMatchingPath(path, trailingSlash))
    }
}
