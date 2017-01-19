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



