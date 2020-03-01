[![npm version](https://badge.fury.io/js/route-node.svg)](http://badge.fury.io/js/route-node)
[![Build Status](https://travis-ci.org/troch/route-node.svg?branch=master)](https://travis-ci.org/troch/route-node)
[![Coverage Status](https://coveralls.io/repos/troch/route-node/badge.svg?branch=master)](https://coveralls.io/r/troch/route-node?branch=master)

# route-node

A package to create a tree (trie) of named routes, allowing you to build and match routes.

```sh
$ npm install route-node --save
```

## Creating your tree

To read about how to define paths, look at [path-parser README](https://www.npmjs.com/package/path-parser)

```javascript
import rootNode from 'route-node'

// Create nodes
const usersNode = new RouteNode('users', '/users', [
  new RouteNode('list', '/list'),
  new RouteNode('view', '/view/:id')
])

// You can also use plain objects
const ordersNode = new RouteNode('orders', '/orders', [
  { name: 'pending', path: '/pending' },
  { name: 'completed', path: '/completed' },
  { name: 'view', path: '/view/:id' }
])

// Creating a top root node
const rootNode = new RouteNode('', '', [ordersNode, usersNode])

// Add nodes programmatically
rootNode.add(new RouteNode('home', '/home'))
```

**`/` paths (empty paths)**

When using a deeply nested `/` path, it will automatically be matched when its parent is matched.

```js
const tree = new RouteNode('', '', [
  new RouteNode('admin', '/admin', [
    new RouteNode('home', '/'),
    new RouteNode('users', '/users')
  ])
])

tree.matchPath('/admin') // => { name: 'admin.home', params: {} }
tree.buildPath('admin.home', {}, { trailingSlashMode: 'never' }) // => '/admin'
```

**Options**

```js
const node = new RouteNode('admin', '/admin', [], options)
```

Where options can contain:

- `onAdd`: a callback called when adding routes (with contructor or `.add`), you can pass a callback which will be executed for each route added successfully to the tree.
- `parent`: the node parent
- `finalSort`: to sort children (matching order) after having added all children routes (rather than on each add)
- `sort`: whether to sort on each add or not (default to true, overriden by `finalSort`)

## Building and matching routes

**node.buildPath(routeName: string, params?: object, options?: BuildOptions): string**

```javascript
rootNode.buildPath('users.view', { id: 1 }) // => "/users/view/1"
```

**Performance**

Node children need to be sorted for matching purposes. By default this operation happens after having added all routes.

**matchPath(path: string, options?: MatchOptions): RouteNodeState | null**

```js
rootNode.matchPath('/users/view/1')
// => {name: "users.view", params: {id: "1"}}
```

## Options

Options available:

- `'urlParamsEncoding`, to specify how URL parameters are encoded and decoded:
  - `'default'`: `encodeURIComponent` and `decodeURIComponent` are used but some characters to encode and decode URL parameters, but some characters are preserved when encoding (sub-delimiters:`+`,`:`,`'`,`!`,`,`,`;`,`*`).
  - `'uriComponent'`: use `encodeURIComponent` and `decodeURIComponent`
    for encoding and decoding URL parameters.
  - `'uri'`: use `encodeURI` and `decodeURI for encoding amd decoding
    URL parameters.
  - `'none'`: no encoding or decoding is performed
  - `'legacy'`: the approach for version 5.x and below (not recommended)
- `trailingSlashMode`:
  - `'default'`: building follows path definitions
  - `'never'`: when building, trailing slash is removed
  - `'always'`: when building, trailing slash is added
- `queryParamsMode`:
  - `'default'`: a path will match with any query parameters added, but when building, extra parameters won't appear in the returned path.
  - `'strict'`: a path with query parameters which were not listed in node definition will cause a match to be unsuccessful. When building, extra parameters won't appear in the returned path.
  - `'loose'`: a path will match with any query parameters added, and when building, extra parameters will appear in the returned path.
- `queryParams`: [options for query parameters](https://github.com/troch/search-params#options)
- `caseSensitive`: whether path matching is case sensitive or not (default to `false`)
