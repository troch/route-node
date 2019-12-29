import { build } from 'search-params'
import {
  BuildOptions,
  MatchResponse,
  RouteNode,
  RouteNodeState,
  RouteNodeStateMeta
} from './RouteNode'

export const getMetaFromSegments = (
  segments: RouteNode[]
): RouteNodeStateMeta => {
  let accName = ''

  return segments.reduce<RouteNodeStateMeta>((meta, segment) => {
    const urlParams =
      segment.parser?.urlParams.reduce<Record<string, any>>((params, p) => {
        params[p] = 'url'
        return params
      }, {}) ?? {}

    const allParams =
      segment.parser?.queryParams.reduce<Record<string, any>>((params, p) => {
        params[p] = 'query'
        return params
      }, urlParams) ?? {}

    if (segment.name !== undefined) {
      accName = accName ? accName + '.' + segment.name : segment.name
      meta[accName] = allParams
    }
    return meta
  }, {})
}

export const buildStateFromMatch = (
  match: MatchResponse
): RouteNodeState | null => {
  if (!match || !match.segments || !match.segments.length) {
    return null
  }

  const name = match.segments
    .map(segment => segment.name)
    .filter(name => name)
    .join('.')
  const params = match.params

  return {
    name,
    params,
    meta: getMetaFromSegments(match.segments)
  }
}

export const buildPathFromSegments = (
  segments: RouteNode[],
  params: Record<string, any> = {},
  options: BuildOptions = {}
) => {
  const { queryParamsMode = 'default', trailingSlashMode = 'default' } = options
  const searchParams: string[] = []
  const nonSearchParams: string[] = []

  for (const segment of segments) {
    const { parser } = segment

    if (parser) {
      searchParams.push(...parser.queryParams)
      nonSearchParams.push(...parser.urlParams)
      nonSearchParams.push(...parser.spatParams)
    }
  }

  if (queryParamsMode === 'loose') {
    const extraParams = Object.keys(params).reduce<string[]>(
      (acc, p) =>
        searchParams.indexOf(p) === -1 && nonSearchParams.indexOf(p) === -1
          ? acc.concat(p)
          : acc,
      []
    )
    searchParams.push(...extraParams)
  }

  const searchParamsObject = searchParams.reduce<Record<string, any>>(
    (acc, paramName) => {
      if (Object.keys(params).indexOf(paramName) !== -1) {
        acc[paramName] = params[paramName]
      }

      return acc
    },
    {}
  )

  const searchPart = build(searchParamsObject, options.queryParams)

  const path = segments
    .reduce<string>((path, segment) => {
      const segmentPath =
        segment.parser?.build(params, {
          ignoreSearch: true,
          queryParams: options.queryParams
        }) ?? ''

      return segment.absolute ? segmentPath : path + segmentPath
    }, '')
    // remove repeated slashes
    .replace(/\/\/{1,}/g, '/')

  let finalPath = path

  if (options.trailingSlashMode === 'always') {
    finalPath = /\/$/.test(path) ? path : `${path}/`
  } else if (options.trailingSlashMode === 'never' && path !== '/') {
    finalPath = /\/$/.test(path) ? path.slice(0, -1) : path
  }

  return finalPath + (searchPart ? '?' + searchPart : '')
}

export const getPathFromSegments = (segments: RouteNode[]): string | null =>
  segments ? segments.map(segment => segment.path).join('') : null
