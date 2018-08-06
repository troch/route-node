import { Path } from 'path-parser'
import { build, IOptions as QueryParamsOptions } from 'search-params'

import {
    buildPathFromSegments,
    buildStateFromMatch,
    getMetaFromSegments,
    getPathFromSegments
} from './helpers'
import matchChildren from './matchChildren'
import sortChildren from './sortChildren'

export interface RouteDefinition {
    name: string
    path: string
    [key: string]: any
}
export type Route = RouteNode | RouteDefinition
export type Callback = (...args: any[]) => void
export type TrailingSlashMode = 'default' | 'never' | 'always'
export type QueryParamsMode = 'default' | 'strict' | 'loose'

const defaultBuildOptions = {
    queryParamsMode: 'default',
    trailingSlashMode: 'default'
}
export interface BuildOptions {
    trailingSlashMode?: TrailingSlashMode
    queryParamsMode?: QueryParamsMode
    queryParams?: QueryParamsOptions
}
const defaultMatchOptions = {
    ...defaultBuildOptions,
    strongMatching: true
}
export interface MatchOptions {
    trailingSlashMode?: TrailingSlashMode
    queryParamsMode?: QueryParamsMode
    queryParams?: QueryParamsOptions
    strictTrailingSlash?: boolean
    strongMatching?: boolean
    caseSensitive?: boolean
}
export { QueryParamsOptions }

export interface MatchResponse {
    segments: RouteNode[]
    params: object
}

export interface RouteNodeStateMeta {
    [routeName: string]: {
        [routeParams: string]: 'query' | 'url'
    }
}

export interface RouteNodeState {
    name: string
    params: object
    meta: RouteNodeStateMeta
}

export default class RouteNode {
    public name: string
    public absolute: boolean
    public path: string
    public parser: Path | null
    public children: RouteNode[]
    public parent?: RouteNode

    constructor(
        name: string = '',
        path: string = '',
        childRoutes: Route[] = [],
        cb?: Callback,
        parent?: RouteNode,
        finalSort: boolean = true,
        sort?: boolean
    ) {
        this.name = name
        this.absolute = /^~/.test(path)
        this.path = this.absolute ? path.slice(1) : path
        this.parser = this.path ? new Path(this.path) : null
        this.children = []
        this.parent = parent

        this.checkParents()

        this.add(childRoutes, cb, finalSort ? false : sort !== false)

        if (finalSort) {
            this.sortDescendants()
        }

        return this
    }

    public getParentSegments(segments: RouteNode[] = []): RouteNode[] {
        return this.parent && this.parent.parser
            ? this.parent.getParentSegments(segments.concat(this.parent))
            : segments.reverse()
    }

    public setParent(parent) {
        this.parent = parent
        this.checkParents()
    }

    public setPath(path: string = '') {
        this.path = path
        this.parser = path ? new Path(path) : null
    }

    public add(
        route: Route | Route[],
        cb?: Callback,
        sort: boolean = true
    ): this {
        if (route === undefined || route === null) {
            return
        }

        if (route instanceof Array) {
            route.forEach(r => this.add(r, cb, sort))
            return
        }

        if (!(route instanceof RouteNode) && !(route instanceof Object)) {
            throw new Error(
                'RouteNode.add() expects routes to be an Object or an instance of RouteNode.'
            )
        } else if (route instanceof RouteNode) {
            route.setParent(this)
            this.addRouteNode(route, sort)
        } else {
            if (!route.name || !route.path) {
                throw new Error(
                    'RouteNode.add() expects routes to have a name and a path defined.'
                )
            }

            const routeNode = new RouteNode(
                route.name,
                route.path,
                route.children,
                cb,
                this,
                false,
                sort
            )
            const fullName = routeNode
                .getParentSegments([routeNode])
                .map(_ => _.name)
                .join('.')
            if (cb) {
                cb({
                    ...route,
                    name: fullName
                })
            }
            this.addRouteNode(routeNode, sort)
        }

        return this
    }

    public addNode(name: string, path: string) {
        this.add(new RouteNode(name, path))
        return this
    }

    public getPath(routeName: string): string {
        return getPathFromSegments(this.getSegmentsByName(routeName))
    }

    public getNonAbsoluteChildren(): RouteNode[] {
        return this.children.filter(child => !child.absolute)
    }

    public sortChildren() {
        if (this.children.length) {
            sortChildren(this.children)
        }
    }

    public sortDescendants() {
        this.sortChildren()
        this.children.forEach(child => child.sortDescendants())
    }

    public buildPath(
        routeName: string,
        params: object = {},
        options: BuildOptions = {}
    ): string {
        const path = buildPathFromSegments(
            this.getSegmentsByName(routeName),
            params,
            options
        )

        return path
    }

    public buildState(
        name: string,
        params: object = {}
    ): RouteNodeState | null {
        const segments = this.getSegmentsByName(name)

        if (!segments || !segments.length) {
            return null
        }

        return {
            name,
            params,
            meta: getMetaFromSegments(segments)
        }
    }

    public matchPath(
        path: string,
        options: MatchOptions = {}
    ): RouteNodeState | null {
        if (path === '' && !options.strictTrailingSlash) {
            path = '/'
        }

        const match = this.getSegmentsMatchingPath(path, options)

        if (match) {
            const matchedSegments = match.segments

            if (matchedSegments[0].absolute) {
                const firstSegmentParams = matchedSegments[0].getParentSegments()

                matchedSegments.reverse()
                matchedSegments.push(...firstSegmentParams)
                matchedSegments.reverse()
            }

            const lastSegment = matchedSegments[matchedSegments.length - 1]
            const lastSegmentSlashChild = lastSegment.findSlashChild()

            if (lastSegmentSlashChild) {
                matchedSegments.push(lastSegmentSlashChild)
            }
        }

        return buildStateFromMatch(match)
    }

    private addRouteNode(route: RouteNode, sort: boolean = true): this {
        const names = route.name.split('.')

        if (names.length === 1) {
            // Check duplicated routes
            if (
                this.children.map(child => child.name).indexOf(route.name) !==
                -1
            ) {
                throw new Error(
                    `Alias "${route.name}" is already defined in route node`
                )
            }

            // Check duplicated paths
            if (
                this.children.map(child => child.path).indexOf(route.path) !==
                -1
            ) {
                throw new Error(
                    `Path "${route.path}" is already defined in route node`
                )
            }

            this.children.push(route)

            if (sort) {
                this.sortChildren()
            }
        } else {
            // Locate parent node
            const segments = this.getSegmentsByName(
                names.slice(0, -1).join('.')
            )
            if (segments) {
                route.name = names[names.length - 1]
                segments[segments.length - 1].add(route)
            } else {
                throw new Error(
                    `Could not add route named '${
                        route.name
                    }', parent is missing.`
                )
            }
        }

        return this
    }

    private checkParents() {
        if (this.absolute && this.hasParentsParams()) {
            throw new Error(
                '[RouteNode] A RouteNode with an abolute path cannot have parents with route parameters'
            )
        }
    }

    private hasParentsParams(): boolean {
        if (this.parent && this.parent.parser) {
            const parser = this.parent.parser
            const hasParams =
                parser.hasUrlParams ||
                parser.hasSpatParam ||
                parser.hasMatrixParams ||
                parser.hasQueryParams

            return hasParams || this.parent.hasParentsParams()
        }

        return false
    }

    private findAbsoluteChildren(): RouteNode[] {
        return this.children.reduce(
            (absoluteChildren, child) =>
                absoluteChildren
                    .concat(child.absolute ? child : [])
                    .concat(child.findAbsoluteChildren()),
            []
        )
    }

    private findSlashChild(): RouteNode | undefined {
        const slashChildren = this.getNonAbsoluteChildren().filter(
            child => child.parser && /^\/(\?|$)/.test(child.parser.path)
        )

        return slashChildren[0]
    }

    private getSegmentsByName(routeName: string): RouteNode[] | null {
        const findSegmentByName = (name, routes) => {
            const filteredRoutes = routes.filter(r => r.name === name)
            return filteredRoutes.length ? filteredRoutes[0] : undefined
        }
        const segments = []
        let routes = this.parser ? [this] : this.children
        const names = (this.parser ? [''] : []).concat(routeName.split('.'))

        const matched = names.every(name => {
            const segment = findSegmentByName(name, routes)
            if (segment) {
                routes = segment.children
                segments.push(segment)
                return true
            }
            return false
        })

        return matched ? segments : null
    }

    private getSegmentsMatchingPath(
        path: string,
        options: MatchOptions
    ): MatchResponse {
        const topLevelNodes = this.parser ? [this] : this.children
        const startingNodes = topLevelNodes.reduce(
            (nodes, node) => nodes.concat(node, node.findAbsoluteChildren()),
            []
        )

        const currentMatch = {
            segments: [],
            params: {}
        }

        const finalMatch = matchChildren(
            startingNodes,
            path,
            currentMatch,
            options
        )
        if (
            finalMatch &&
            finalMatch.segments.length === 1 &&
            finalMatch.segments[0].name === ''
        ) {
            return null
        }

        return finalMatch
    }
}
