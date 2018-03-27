import RouteNode, { MatchOptions, MatchResponse } from './RouteNode';
declare const matchChildren: (nodes: RouteNode[], pathSegment: string, currentMatch: MatchResponse, options?: MatchOptions, consumedBefore?: string) => any;
export default matchChildren;
