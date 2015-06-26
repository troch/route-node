import Path from 'path-parser'

export default class RouteNode {
    constructor(name = '', path = '', childRoutes = []) {
        this.name     = name
        this.path     = path
        if (path) {
            this.parser   = new Path(path)
        }
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
    }

    findRouteByPath(path) {

    }

    findRouteByName(routeName) {
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

    getPath(routeName) {
        let segments = this.findRouteByName(routeName)

        return segments.map(segment => segment.path).join('')
    }

    buildPath(routeName, params = {}) {
        let segments = this.findRouteByName(routeName)

        return segments.map(segment => segment.parser.build(params)).join('')
    }
}
