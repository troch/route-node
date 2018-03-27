import { Path } from 'path-parser';
export interface RouteDefinition {
    name: string;
    path: string;
    [key: string]: any;
}
export declare type Route = RouteNode | RouteDefinition;
export declare type Callback = (...args: any[]) => void;
export interface MatchOptions {
    strictTrailingSlash?: boolean;
    strictQueryParams?: boolean;
    strongMatching?: boolean;
}
export interface MatchResponse {
    segments: RouteNode[];
    params: object;
}
export interface RouteNodeStateMeta {
    [routeName: string]: {
        [routeParams: string]: 'query' | 'url';
    };
}
export interface RouteNodeState {
    name: string;
    params: object;
    meta: RouteNodeStateMeta;
}
export interface BuildOptions {
    useTrailingSlash?: boolean;
    strictQueryParams?: boolean;
}
export default class RouteNode {
    name: string;
    absolute: boolean;
    path: string;
    parser?: Path;
    children: RouteNode[];
    parent?: RouteNode;
    constructor(name?: string, path?: string, childRoutes?: Route[], cb?: Callback, parent?: RouteNode);
    getParentSegments(segments?: RouteNode[]): RouteNode[];
    setParent(parent: any): void;
    setPath(path?: string): void;
    add(route: Route | Route[], cb?: Callback): this;
    addNode(name: string, path: string): this;
    getPath(routeName: string): string;
    getNonAbsoluteChildren(): RouteNode[];
    buildPath(routeName: string, params?: object, opts?: BuildOptions): string;
    buildState(name: string, params?: object): RouteNodeState | null;
    matchPath(path: string, options: MatchOptions): RouteNodeState | null;
    private addRouteNode(route, cb?);
    private checkParents();
    private hasParentsParams();
    private findAbsoluteChildren();
    private findSlashChild();
    private getSegmentsByName(routeName);
    private getSegmentsMatchingPath(path, options);
}
