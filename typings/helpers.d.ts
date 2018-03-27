import RouteNode, { BuildOptions, MatchResponse, RouteNodeState, RouteNodeStateMeta } from './RouteNode';
export declare const getMetaFromSegments: (segments: RouteNode[]) => RouteNodeStateMeta;
export declare const buildStateFromMatch: (match: MatchResponse) => RouteNodeState;
export declare const buildPathFromSegments: (segments?: RouteNode[], params?: object, options?: BuildOptions) => string;
export declare const getPathFromSegments: (segments: RouteNode[]) => string;
