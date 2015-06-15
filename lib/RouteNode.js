export default class RouteNode {
    constructor(name = '', path = '', childRoutes = []) {
        this.name    = name
        this.path     = path
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

        // if (this.nameMap[route.name]) {
        //     throw new Error(`Alias $route.name is already defined in route node`)
        // }

        // if (this.pathMap[route.name]) {
        //     throw new Error(`Path $route.path is already defined in route node`)
        // }
        this.children.push(route)
    }

    findRoute(path) {

    }

    findRouteByName(routeName) {
        var findSegmentByName = (name, routes) => {
            var filteredRoutes = routes.filter(r => r.name === name)
            return filteredRoutes.length ? filteredRoutes[0] : undefined
        }
        var segments = []
        var names = routeName.split('.');
        var routes = this.children

        var matched = names.every(name => {
            var segment = findSegmentByName(name, routes)
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
        var segments = this.findRouteByName(routeName)

        return segments.map(segment => segment.path).join('')
    }
}
