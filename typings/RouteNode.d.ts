import { Path } from 'path-parser';
import { IOptions as QueryParamsOptions } from 'search-params';
export interface RouteDefinition {
    name: string;
    path: string;
    [key: string]: any;
}
export declare type Route = RouteNode | RouteDefinition;
export declare type Callback = (...args: any[]) => void;
export declare type TrailingSlashMode = 'default' | 'never' | 'always';
export declare type QueryParamsMode = 'default' | 'strict' | 'loose';
export interface BuildOptions {
    trailingSlashMode?: TrailingSlashMode;
    queryParamsMode?: QueryParamsMode;
    queryParams?: QueryParamsOptions;
}
export interface MatchOptions {
    trailingSlashMode?: TrailingSlashMode;
    queryParamsMode?: QueryParamsMode;
    queryParams?: QueryParamsOptions;
    strictTrailingSlash?: boolean;
    strongMatching?: boolean;
    caseSensitive?: boolean;
}
export { QueryParamsOptions };
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
export default class RouteNode {
    name: string;
    absolute: boolean;
    path: string;
    parser: Path | null;
    children: RouteNode[];
    parent?: RouteNode;
    constructor(name?: string, path?: string, childRoutes?: Route[], cb?: Callback, parent?: RouteNode, finalSort?: boolean, sort?: boolean);
    getParentSegments(segments?: RouteNode[]): RouteNode[];
    setParent(parent: any): void;
    setPath(path?: string): void;
    add(route: Route | Route[], cb?: Callback, sort?: boolean): this;
    addNode(name: string, path: string): this;
    getPath(routeName: string): string;
    getNonAbsoluteChildren(): RouteNode[];
    sortChildren(): void;
    sortDescendants(): void;
    buildPath(routeName: string, params?: object, options?: BuildOptions): string;
    buildState(name: string, params?: object): RouteNodeState | null;
    matchPath(path: string, options?: MatchOptions): RouteNodeState | null;
    private addRouteNode(route, sort?);
    private checkParents();
    private hasParentsParams();
    private findAbsoluteChildren();
    private findSlashChild();
    private getSegmentsByName(routeName);
    private getSegmentsMatchingPath(path, options);
}
