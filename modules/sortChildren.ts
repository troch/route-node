import RouteNode from './RouteNode'

export default function sortChildren(children: RouteNode[]) {
    const originalChildren = children.slice(0)

    return children.sort(sortPredicate(originalChildren))
}

const sortPredicate = (originalChildren: RouteNode[]) => (
    left: RouteNode,
    right: RouteNode
): number => {
    const leftPath = left.path
        .replace(/<.*?>/g, '')
        .split('?')[0]
        .replace(/(.+)\/$/, '$1')
    const rightPath = right.path
        .replace(/<.*?>/g, '')
        .split('?')[0]
        .replace(/(.+)\/$/, '$1')

    // '/' last
    if (leftPath === '/') {
        return 1
    }
    if (rightPath === '/') {
        return -1
    }
    // Spat params last
    if (left.parser.hasSpatParam) {
        return 1
    }
    if (right.parser.hasSpatParam) {
        return -1
    }
    // No spat, number of segments (less segments last)
    const leftSegments = (leftPath.match(/\//g) || []).length
    const rightSegments = (rightPath.match(/\//g) || []).length
    if (leftSegments < rightSegments) {
        return 1
    }
    if (leftSegments > rightSegments) {
        return -1
    }
    // Same number of segments, number of URL params ascending
    const leftParamsCount = left.parser.urlParams.length
    const rightParamsCount = right.parser.urlParams.length
    if (leftParamsCount < rightParamsCount) {
        return -1
    }
    if (leftParamsCount > rightParamsCount) {
        return 1
    }
    // Same number of segments and params, last segment length descending
    const leftParamLength = (leftPath.split('/').slice(-1)[0] || '').length
    const rightParamLength = (rightPath.split('/').slice(-1)[0] || '').length
    if (leftParamLength < rightParamLength) {
        return 1
    }
    if (leftParamLength > rightParamLength) {
        return -1
    }
    // Same last segment length, preserve definition order. Note that we
    // cannot just return 0, as sort is not guaranteed to be a stable sort.
    return originalChildren.indexOf(left) - originalChildren.indexOf(right)
}
