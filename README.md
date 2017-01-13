[![npm version](https://badge.fury.io/js/route-node.svg)](http://badge.fury.io/js/route-node)
[![Build Status](https://travis-ci.org/troch/route-node.svg?branch=master)](https://travis-ci.org/troch/route-node)
[![Coverage Status](https://coveralls.io/repos/troch/route-node/badge.svg?branch=master)](https://coveralls.io/r/troch/route-node?branch=master)


# route-node

A package to create a tree (trie) of named routes, allowing you to build and match routes.


## Install

```sh
$ npm install route-node --save
```

## Usage

__Building your tree:__

```javascript
import rootNode from 'route-node';

// Create nodes
const usersNode = new RouteNode('users', '/users', [
    new RouteNode('list', '/list'),
    new RouteNode('view', '/view/:id')
]);

// You can also use plain objects
const ordersNode = new RouteNode('orders', '/orders', [
    {name: 'pending',   path: '/pending'},
    {name: 'completed', path: '/completed'},
    {name: 'view',      path: '/view/:id'}
]);

// Creating a top root node
const rootNode = new RouteNode('', '', [
    ordersNode,
    usersNode
]);

// Add nodes programmatically
rootNode.add(new RouteNode('home', '/home'));
```
You can chain constructor with `add` and `addNode` functions, making the example above shorter:

```javascript
const rootNode = new RouteNode()
    .addNode('users',            '/users'))
    .addNode('users.view',       '/view/:id')
    .addNode('users.list',       '/list')
    .addNode('orders',           '/orders')
    .addNode('orders.pending',   '/pending')
    .addNode('orders.completed', '/completed')
    .addNode('orders.view',      '/view/:id')
```

And then build paths, or match your paths against your tree:

```javascript

rootNode.getPath('users.view');                // => "/users/view/:id"
rootNode.buildPath('users.view', {id: 1});     // => "/users/view/1"

rootNode.matchPath('/users/view/1');           // => {name: "users.view", params: {id: "1"}}
```

__Trailing slashes can be optional__

When using `matchPath`, you can pass a `trailingSlash` option for non-strict matching on trailing slashes.

```javascript
rootNode.matchPath('/users/view/1');           // => {name: "users.view", params: {id: "1"}}
rootNode.matchPath('/users/view/1/');          // => null

rootNode.matchPath('/users/view/1/', { trailingSlash: true });
// => {name: "users.view", params: {id: "1"}}
```

`buildPath` also accepts a `trailingSlash` and `strictQueryParams` option. When `trailingSlash` is set to `true`, it will force a trailing slash on built paths. When set to `false`, it will remove trailing slashes. When `strictQueryParams` is set to `false` (default `true`) additional parameters will be serialised as query parameters.

Query parameters are optional, however a match will fail if the URL contains non-expected query parameters. This can be prevented by setting `strictQueryParams` to false.

__`/` paths__

When using a deeply nested `/` path, it will automatically be matched when its parent is matched.

```js
const tree = new RouteNode('', '', [
    new RouteNode('admin', '/admin', [
        new RouteNode('home', '/'),
        new RouteNode('users', '/users')
    ])
]);

tree.matchPath('/admin'); // => { name: 'admin.home', params: {} }
tree.buildPath('admin.home', {}, { trailingSlash: false }); // => '/admin'
```

__Other options__

When matching paths, you can use two other options: `ignoreSearch` for not taking query parameters into account, and `strongMatching` (default `true`) for enforcing strong partial matching (making sure matches are well delimited).

## Callbacks

When adding routes (with contructor or `.add`), you can pass a callback which will be executed for each route added successfully to the tree.


## Based on

- [path-parser](https://www.npmjs.com/package/path-parser) for parsing, matching and building paths.
