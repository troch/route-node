## [4.1.1](https://github.com/troch/route-node/compare/v4.1.0...v4.1.1) (2020-03-01)

### Bug Fixes

* Re-export `URLParamsEncodingType` from `path-parser` package

# [4.1.0](https://github.com/troch/route-node/compare/v4.0.0...v4.1.0) (2020-03-01)

### Bug Fixes

* Fix of previous release, an error is now thrown when calling `buildPath` with a non-existing node.

# [4.0.0](https://github.com/troch/route-node/compare/v3.4.2...v4.0.0) (2020-03-01)


### Features

* Maintain project and dependencies ([#28](https://github.com/troch/route-node/issues/28)) ([7637f06](https://github.com/troch/route-node/commit/7637f062e664b18573e0a727d45a2077636cc0e1))
* New match and build option `urlParamsEncoding` to choose how URL params are encoded and decoded (see README)


### BREAKING CHANGES

* Default export has been removed, use named import instead: `import { RouteNode } from 'route-node'`
* Constructor signature has changed to become: `new RouteNode(nodeName, path, children, options)`. See README.


<a name="3.4.2"></a>
## [3.4.2](https://github.com/troch/route-node/compare/v3.4.1...v3.4.2) (2018-10-16)


### Bug Fixes

* fix TypeError when there is no match for path ([338df8c](https://github.com/troch/route-node/commit/338df8c))



<a name="3.4.1"></a>
## [3.4.1](https://github.com/troch/route-node/compare/v3.4.0...v3.4.1) (2018-10-04)


### Bug Fixes

* fix path with a plus character not matched ([a3261e8](https://github.com/troch/route-node/commit/a3261e8))



<a name="3.4.0"></a>
# [3.4.0](https://github.com/troch/route-node/compare/v3.3.0...v3.4.0) (2018-08-06)


### Features

* add a method to sort all descendants ([1e2f4b7](https://github.com/troch/route-node/commit/1e2f4b7))


### Performance Improvements

* improve route addition performance by controlling when sorting is performed ([07430f0](https://github.com/troch/route-node/commit/07430f0))



<a name="3.3.0"></a>
# [3.3.0](https://github.com/troch/route-node/compare/v3.2.1...v3.3.0) (2018-07-11)


### Features

* update path-parser to v4.2.0 ([6044593](https://github.com/troch/route-node/commit/6044593))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/troch/route-node/compare/v3.2.0...v3.2.1) (2018-06-05)


### Bug Fixes

* pass query param options on partial tests ([068a146](https://github.com/troch/route-node/commit/068a146))
* update search-params and path-parser to decode unicode values when parsing ([7a1c0b9](https://github.com/troch/route-node/commit/7a1c0b9))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/troch/route-node/compare/v3.1.2...v3.2.0) (2018-05-14)



<a name="3.1.2"></a>
## [3.1.2](https://github.com/troch/route-node/compare/v3.1.1...v3.1.2) (2018-05-14)



<a name="3.1.1"></a>
## [3.1.1](https://github.com/troch/route-node/compare/v3.1.0...v3.1.1) (2018-05-01)


### Bug Fixes

* pass query params options to parse and build functions ([fea47d7](https://github.com/troch/route-node/commit/fea47d7))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/troch/route-node/compare/v3.0.3...v3.1.0) (2018-04-19)


### Features

* expose caseSensitive option from path-parser ([ff3fcb8](https://github.com/troch/route-node/commit/ff3fcb8))



<a name="3.0.3"></a>
## [3.0.3](https://github.com/troch/route-node/compare/v3.0.2...v3.0.3) (2018-04-09)


### Bug Fixes

* update version of path-parser to v4.0.4 (unencoded pipes in FF) ([81dc94a](https://github.com/troch/route-node/commit/81dc94a))



<a name="3.0.2"></a>
## [3.0.2](https://github.com/troch/route-node/compare/v3.0.1...v3.0.2) (2018-04-03)


### Bug Fixes

* update path-parser to v4.0.3 ([6c3a6ca](https://github.com/troch/route-node/commit/6c3a6ca))



<a name="3.0.1"></a>
## [3.0.1](https://github.com/troch/route-node/compare/v3.0.0...v3.0.1) (2018-04-03)


### Bug Fixes

* link typings to the right file ([59e2eef](https://github.com/troch/route-node/commit/59e2eef))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/troch/route-node/compare/v2.0.3...v3.0.0) (2018-04-02)

Version 3 is a refactoring of options: below is the gist, but make sure to read the docs!


### BREAKING CHANGES

* 'trailingSlash' has been renamed to 'strictTrailingSlash'
* 'useTrailingSlash' has been renamed to 'trailingSlashMode' with value being 'default', 'never' or 'always'
* 'strictQueryParams' has been renamed to 'queryParamsMode' with value being 'default', 'strict' or 'loose'



<a name="2.0.3"></a>
## [2.0.3](https://github.com/troch/route-node/compare/v2.0.2...v2.0.3) (2018-03-05)

* Ensure that order of routes that cannot be disambiguated is preserved ([6b58877](https://github.com/troch/route-node/commit/6b58877))



<a name="2.0.2"></a>
## [2.0.2](https://github.com/troch/route-node/compare/v2.0.1...v2.0.2) (2017-11-16)



<a name="2.0.1"></a>
## [2.0.1](https://github.com/troch/route-node/compare/v2.0.0...v2.0.1) (2017-11-16)



<a name="2.0.0"></a>
# [2.0.0](https://github.com/troch/route-node/compare/v1.11.0...v2.0.0) (2017-11-16)

### Breaking changes

* AMD build no longer provided, use UMD instead



<a name="1.11.0"></a>
# [1.11.0](https://github.com/troch/route-node/compare/v1.10.0...v1.11.0) (2017-11-08)


### Features

* update path-parser to latest version ([0a47563](https://github.com/troch/route-node/commit/0a47563))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/troch/route-node/compare/v1.9.0...v1.10.0) (2017-10-15)


### Bug Fixes

* strip content of regexes from path before sorting ([#14](https://github.com/troch/route-node/issues/14)) ([0166747](https://github.com/troch/route-node/commit/0166747))



<a name="1.9.0"></a>
# [1.9.0](https://github.com/troch/route-node/compare/v1.8.5...v1.9.0) (2017-10-05)


### Features

* treat repeating slashes as pathless paths ([#13](https://github.com/troch/route-node/issues/13)) ([4a8a41f](https://github.com/troch/route-node/commit/4a8a41f))



<a name="1.8.5"></a>
## [1.8.5](https://github.com/troch/route-node/compare/v1.8.4...v1.8.5) (2017-08-10)


### Bug Fixes

* prevent empty arrays to be serialised in search part ([af201c4](https://github.com/troch/route-node/commit/af201c4))



<a name="1.8.4"></a>
## [1.8.4](https://github.com/troch/route-node/compare/v1.8.3...v1.8.4) (2017-08-07)


### Bug Fixes

* don't remove trailing slash of `/` if `useTrailingSlash` is set to `false` ([61f4b21](https://github.com/troch/route-node/commit/61f4b21))



<a name="1.8.3"></a>
## [1.8.3](https://github.com/troch/route-node/compare/v1.8.2...v1.8.3) (2017-08-04)


### Bug Fixes

* build path correctly when 'trailingSlash' is set and with query params ([f7a18b0](https://github.com/troch/route-node/commit/f7a18b0))



<a name="1.8.2"></a>
## [1.8.2](https://github.com/troch/route-node/compare/v1.8.1...v1.8.2) (2017-04-08)


### Bug Fixes

* fix path matching when trailing slash and not strict query params ([717823d](https://github.com/troch/route-node/commit/717823d))



<a name="1.8.1"></a>
## [1.8.1](https://github.com/troch/route-node/compare/v1.8.0...v1.8.1) (2017-01-19)


### Bug Fixes

* avoid re-creating nodes to preserve absolute paths ([562eeb1](https://github.com/troch/route-node/commit/562eeb1))



<a name="1.8.0"></a>
# [1.8.0](https://github.com/troch/route-node/compare/v1.7.2...v1.8.0) (2017-01-13)


### Bug Fixes

* support strictQueryParams option when building paths ([0c45a50](https://github.com/troch/route-node/commit/0c45a50))



<a name="1.7.2"></a>
## [1.7.2](https://github.com/troch/route-node/compare/v1.7.1...v1.7.2) (2016-12-26)


### Bug Fixes

* callback with fully resolved route name (after adding a route) ([ca64573](https://github.com/troch/route-node/commit/ca64573))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/troch/route-node/compare/v1.7.0...v1.7.1) (2016-11-01)




<a name="1.7.0"></a>
# [1.7.0](https://github.com/troch/route-node/compare/v1.6.1...v1.7.0) (2016-10-13)


### Features

* support 'strongMatching' option ([ae1b7ff](https://github.com/troch/route-node/commit/ae1b7ff))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/troch/route-node/compare/v1.6.0...v1.6.1) (2016-10-13)


### Bug Fixes

* update path-parser version ([5cf8265](https://github.com/troch/route-node/commit/5cf8265))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/troch/route-node/compare/v1.5.2...v1.6.0) (2016-10-12)


### Features

* update to v2.0.0 of path-parser ([f299327](https://github.com/troch/route-node/commit/f299327))



<a name="1.5.2"></a>
## [1.5.2](https://github.com/troch/route-node/compare/v1.5.1...v1.5.2) (2016-10-04)


### Bug Fixes

* fix code syntax issue, causing issue when not matching on IE ([4e82d0f](https://github.com/troch/route-node/commit/4e82d0f))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/troch/route-node/compare/v1.5.0...v1.5.1) (2016-10-04)


### Bug Fixes

* match deeply nested '/' paths with query parameters ([9810cfd](https://github.com/troch/route-node/commit/9810cfd))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/troch/route-node/compare/v1.4.7...v1.5.0) (2016-10-02)


### Features

* automatically match deep routes with path = '/' ([c78227d](https://github.com/troch/route-node/commit/c78227d))
* support absolute paths for nested routes ([f117c57](https://github.com/troch/route-node/commit/f117c57))



<a name="1.4.7"></a>
## [1.4.7](https://github.com/troch/route-node/compare/v1.4.6...v1.4.7) (2016-09-11)


### Bug Fixes

* update to next version of search-params, fix issue with undefined or null query params ([1207804](https://github.com/troch/route-node/commit/1207804))



<a name="1.4.6"></a>
## [1.4.6](https://github.com/troch/route-node/compare/v1.4.5...v1.4.6) (2016-08-09)




<a name="1.4.5"></a>
## [1.4.5](https://github.com/troch/route-node/compare/v1.4.4...v1.4.5) (2016-08-08)


### Bug Fixes

* in non strictQueryParams mode, serialise extra query params to returned matched  ([c8c7de3](https://github.com/troch/route-node/commit/c8c7de3))



<a name="1.4.4"></a>
## [1.4.4](https://github.com/troch/route-node/compare/v1.4.3...v1.4.4) (2016-08-08)


### Bug Fixes

* don't consider matching resolved when on the root node ([55e614a](https://github.com/troch/route-node/commit/55e614a)), closes [router5/router5-persistent-params#1](https://github.com/router5/router5-persistent-params/issues/1)



<a name="1.4.3"></a>
## [1.4.3](https://github.com/troch/route-node/compare/v1.4.2...v1.4.3) (2016-07-21)


### Bug Fixes

* make sure query params are encoded ([dc24062](https://github.com/troch/route-node/commit/dc24062))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/troch/route-node/compare/v1.4.1...v1.4.2) (2016-07-20)


### Bug Fixes

* pass route registration callback when adding children routes ([5f58852](https://github.com/troch/route-node/commit/5f58852))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/troch/route-node/compare/v1.4.0...v1.4.1) (2016-03-29)


### Bug Fixes

* remove console.log ([7e2a664](https://github.com/troch/route-node/commit/7e2a664))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/troch/route-node/compare/v1.3.4...v1.4.0) (2016-03-29)


### Bug Fixes

* ordering of siblings routes for matching ([6719d2e](https://github.com/troch/route-node/commit/6719d2e))



<a name="1.3.4"></a>
## [1.3.4](https://github.com/troch/route-node/compare/v1.3.3...v1.3.4) (2016-02-18)




<a name="1.3.3"></a>
## [1.3.3](https://github.com/troch/route-node/compare/v1.3.2...v1.3.3) (2016-02-17)


### Bug Fixes

* computing remaining search parameters when multiple values ([2d3bbc5](https://github.com/troch/route-node/commit/2d3bbc5))



<a name="1.3.2"></a>
## [1.3.2](https://github.com/troch/route-node/compare/v1.3.1...v1.3.2) (2016-01-27)


### Bug Fixes

* properly check for duplicated route names and paths ([bfc843b](https://github.com/troch/route-node/commit/bfc843b))



<a name="1.3.1"></a>
## [1.3.1](https://github.com/troch/route-node/compare/v1.3.0...v1.3.1) (2016-01-26)


### Bug Fixes

* don't allow match on root unamed node ([b60b5ea](https://github.com/troch/route-node/commit/b60b5ea))



<a name="1.3.0"></a>
# [1.3.0](https://github.com/troch/route-node/compare/v1.2.1...v1.3.0) (2016-01-18)


### Features

* add setPath method ([853d297](https://github.com/troch/route-node/commit/853d297))



<a name="1.2.1"></a>
## [1.2.1](https://github.com/troch/route-node/compare/v1.2.0...v1.2.1) (2016-01-18)


### Bug Fixes

* fix issue with building state and paths for non-empty root nodes ([07a48e8](https://github.com/troch/route-node/commit/07a48e8))



<a name="1.2.0"></a>
# [1.2.0](https://github.com/troch/route-node/compare/v1.1.0...v1.2.0) (2016-01-15)


### Features

* support path for root node ([a834d0f](https://github.com/troch/route-node/commit/a834d0f))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/troch/route-node/compare/v1.0.1...v1.1.0) (2016-01-07)


### Bug Fixes

* fix ordering of children when matching routes ([c917f6f](https://github.com/troch/route-node/commit/c917f6f))

### Features

* support callbacks for successfully added routes (requested by router5) ([f71f4a5](https://github.com/troch/route-node/commit/f71f4a5))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/troch/route-node/compare/v1.0.1...v1.0.2) (2016-01-06)


### Bug Fixes

* fix ordering of children when matching routes ([c917f6f](https://github.com/troch/route-node/commit/c917f6f))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/troch/route-node/compare/v1.0.0...v1.0.1) (2016-01-05)




<a name="1.0.0"></a>
# [1.0.0](https://github.com/troch/route-node/compare/v0.6.0...v1.0.0) (2016-01-05)


### Features

* support query parameters with square brackets ([781470f](https://github.com/troch/route-node/commit/781470f))



<a name="0.6.0"></a>
# 0.6.0 (2016-01-01)


### Features

* add support for non strict query parameters ([9fc326b](https://github.com/troch/route-node/commit/9fc326b))



<a name="0.5.2"></a>
## 0.5.2 (2015-12-01)


### Bug Fixes

* use full names in meta data to avoid collisions ([038fa1e](https://github.com/troch/route-node/commit/038fa1e))



<a name="0.5.1"></a>
## 0.5.1 (2015-11-30)


### Features

* add buildState function ([6378331](https://github.com/troch/route-node/commit/6378331))



<a name="0.5.0"></a>
# 0.5.0 (2015-11-30)


### Features

* add meta data about parameters and their position in match object ([d95fb92](https://github.com/troch/route-node/commit/d95fb92))



<a name="0.4.3"></a>
## 0.4.3 (2015-11-24)


### Bug Fixes

* encode and decode query parameters special characters ([6ac4196](https://github.com/troch/route-node/commit/6ac4196))



<a name="0.4.2"></a>
## 0.4.2 (2015-10-18)


### Bug Fixes

* don't use array destructuring to avoid the use of Symbol ([f9dfd57](https://github.com/troch/route-node/commit/f9dfd57))



<a name="0.4.1"></a>
## 0.4.1 (2015-10-11)




<a name="0.4.0"></a>
# 0.4.0 (2015-10-11)


### Features

* add support for arrays in query parameters (path-parser 0.4.x) ([951f8ae](https://github.com/troch/route-node/commit/951f8ae))



<a name="0.3.2"></a>
## 0.3.2 (2015-09-04)


### Bug Fixes

* don't try to build a path out of a null list of segments ([d1817c3](https://github.com/troch/route-node/commit/d1817c3))



<a name="0.3.1"></a>
## 0.3.1 (2015-09-04)




<a name="0.3.0"></a>
# 0.3.0 (2015-09-04)


### Features

* allow nested query parameters ([e072d8b](https://github.com/troch/route-node/commit/e072d8b))
* build paths with nested query parameters ([99965a1](https://github.com/troch/route-node/commit/99965a1))



<a name="0.2.3"></a>
## 0.2.3 (2015-09-01)




<a name="0.2.2"></a>
## 0.2.2 (2015-08-20)




<a name="0.2.1"></a>
## 0.2.1 (2015-08-19)




<a name="0.2.0"></a>
# 0.2.0 (2015-08-19)


### Features

* support optional trailing slashes when matching ([f9dcad6](https://github.com/troch/route-node/commit/f9dcad6))



<a name="0.1.5"></a>
## 0.1.5 (2015-07-29)


### Bug Fixes

* improve matching order of node children ([4f4aa47](https://github.com/troch/route-node/commit/4f4aa47))



<a name="0.1.4"></a>
## 0.1.4 (2015-07-24)


### Bug Fixes

* don't return booleans in comparison function (IE) ([58a786a](https://github.com/troch/route-node/commit/58a786a))



<a name="0.1.3"></a>
## 0.1.3 (2015-07-23)


### Features

* improve matching by sorting routes by path length ([37165bd](https://github.com/troch/route-node/commit/37165bd))



<a name="0.1.2"></a>
## 0.1.2 (2015-07-22)




<a name="0.1.1"></a>
## 0.1.1 (2015-07-08)


### Bug Fixes

* ordering of paths by param type ([2921f63](https://github.com/troch/route-node/commit/2921f63))



<a name="0.1.0"></a>
# 0.1.0 (2015-07-06)




<a name="0.0.8"></a>
## 0.0.8 (2015-07-02)


### Features

* add addNode method and constructor / methods chaining ([6dedab2](https://github.com/troch/route-node/commit/6dedab2))



<a name="0.0.7"></a>
## 0.0.7 (2015-07-01)




<a name="0.0.6"></a>
## 0.0.6 (2015-07-01)


### Bug Fixes

* bug when matching path of node with children ([525b79e](https://github.com/troch/route-node/commit/525b79e))



<a name="0.0.5"></a>
## 0.0.5 (2015-06-30)




<a name="0.0.4"></a>
## 0.0.4 (2015-06-30)




<a name="0.0.3"></a>
## 0.0.3 (2015-06-29)


### Features

* split API functions in 'get segments' + 'extract info from segments' to suit rou ([3d81b06](https://github.com/troch/route-node/commit/3d81b06))



<a name="0.0.2"></a>
## 0.0.2 (2015-06-28)


### Features

* add full path matching against tree ([b65fb06](https://github.com/troch/route-node/commit/b65fb06))
* include path-parser npm module ([8034208](https://github.com/troch/route-node/commit/8034208))
* include this node in matching if it has a parser ([4547126](https://github.com/troch/route-node/commit/4547126))
* push splats to the end of a children list ([1c5e498](https://github.com/troch/route-node/commit/1c5e498))



