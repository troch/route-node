import Path from 'path-parser'

export default class RouteNode {
    constructor(name = '', path = '', childRoutes = []) {
        this.name     = name
        this.path     = path
        this.parser   = path ? new Path(path) : {}
        this.children = []

        this.add(childRoutes)
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

        this.children.push(route)
            // Push greedy splats to the bottom of the pile
        this.children.sort((childA, childB) => childA.hasSplatParam ? -1 : 1)
    }

    _findRouteByName(routeName) {
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

        return matched ? segments : []
    }

    matchPath(path) {
        let segments = []

        let matchChildren = (node, pathSegment, matched) => {
            // for (child of node.children) {
            for (let i in node.children) {
                let child = node.children[i]
                // Partially match path
                let match = child.parser.partialMatch(pathSegment)
                if (match) {
                    // Append name and extend params
                    matched.name += (matched.name ? '.' : '') + child.name
                    Object.keys(match).forEach(p => matched.params[p] = match[p])
                    // Remove consumed segment from path
                    let remainingPath = pathSegment.replace(child.parser.build(match), '')
                    // If fully matched
                    if (!remainingPath.length && !child.children.length) {
                        return matched
                    }
                    // If no children to match against but unmatched path left
                    if (!child.children.length) {
                        return false
                    }
                    // Else: remaining path and children
                    return matchChildren(child, remainingPath, matched);
                }
            }
            return false;
        }

        return matchChildren(this, path, {name: '', params: {}})
    }

    getPath(routeName) {
        let segments = this._findRouteByName(routeName)

        return segments.map(segment => segment.path).join('')
    }

    buildPath(routeName, params = {}) {
        let segments = this._findRouteByName(routeName)

        return segments.map(segment => segment.parser.build(params)).join('')
    }
}
