import { omit, parse } from 'search-params'
import { MatchOptions, MatchResponse, RouteNode } from './RouteNode'
import { TestMatch } from 'path-parser'

const getPath = (path: string): string => path.split('?')[0]

const getSearch = (path: string): string => path.split('?')[1] || ''

const matchChildren = (
  nodes: RouteNode[],
  pathSegment: string,
  currentMatch: MatchResponse,
  options: MatchOptions = {},
  consumedBefore?: string
): MatchResponse | null => {
  const {
    queryParamsMode = 'default',
    strictTrailingSlash = false,
    strongMatching = true,
    caseSensitive = false
  } = options
  const isRoot = nodes.length === 1 && nodes[0].name === ''
  // for (child of node.children) {
  for (const child of nodes) {
    // Partially match path
    let match: TestMatch | null = null
    let remainingPath
    let segment = pathSegment

    if (consumedBefore === '/' && child.path[0] === '/') {
      // when we encounter repeating slashes we add the slash
      // back to the URL to make it de facto pathless
      segment = '/' + pathSegment
    }

    if (!child.children.length) {
      match = child.parser!.test(segment, {
        caseSensitive,
        strictTrailingSlash,
        queryParams: options.queryParams,
        urlParamsEncoding: options.urlParamsEncoding
      })
    }

    if (!match) {
      match = child.parser!.partialTest(segment, {
        delimited: strongMatching,
        caseSensitive,
        queryParams: options.queryParams,
        urlParamsEncoding: options.urlParamsEncoding
      })
    }

    if (match) {
      // Remove consumed segment from path
      let consumedPath = child.parser!.build(match, {
        ignoreSearch: true,
        urlParamsEncoding: options.urlParamsEncoding
      })

      if (!strictTrailingSlash && !child.children.length) {
        consumedPath = consumedPath.replace(/\/$/, '')
      }

      // Can't create a regexp from the path because it might contain a
      // regexp character.
      if (segment.toLowerCase().indexOf(consumedPath.toLowerCase()) === 0) {
        remainingPath = segment.slice(consumedPath.length)
      } else {
        remainingPath = segment
      }

      if (!strictTrailingSlash && !child.children.length) {
        remainingPath = remainingPath.replace(/^\/\?/, '?')
      }

      const { querystring } = omit(
        getSearch(segment.replace(consumedPath, '')),
        child.parser!.queryParams,
        options.queryParams
      )
      remainingPath =
        getPath(remainingPath) + (querystring ? `?${querystring}` : '')
      if (
        !strictTrailingSlash &&
        !isRoot &&
        remainingPath === '/' &&
        !/\/$/.test(consumedPath)
      ) {
        remainingPath = ''
      }

      currentMatch.segments.push(child)
      Object.keys(match).forEach(
        param => (currentMatch.params[param] = match![param])
      )

      if (!isRoot && !remainingPath.length) {
        // fully matched
        return currentMatch
      }
      if (
        !isRoot &&
        queryParamsMode !== 'strict' &&
        remainingPath.indexOf('?') === 0
      ) {
        // unmatched queryParams in non strict mode
        const remainingQueryParams = parse(
          remainingPath.slice(1),
          options.queryParams
        ) as any

        Object.keys(remainingQueryParams).forEach(
          name => (currentMatch.params[name] = remainingQueryParams[name])
        )
        return currentMatch
      }
      // Continue matching on non absolute children
      const children = child.getNonAbsoluteChildren()
      // If no children to match against but unmatched path left
      if (!children.length) {
        return null
      }
      // Else: remaining path and children
      return matchChildren(
        children,
        remainingPath,
        currentMatch,
        options,
        consumedPath
      )
    }
  }

  return null
}

export default matchChildren
