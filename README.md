[![Build Status](https://travis-ci.org/troch/route-node.svg?branch=master)](https://travis-ci.org/troch/route-node)

# route-node

A package to create a tree (trie) of named routes. It is similar to [routington](https://www.npmjs.com/package/routington) except that nodes are not added by splitting path by segment ("/"). Instead the tree is built with the supplied nodes, meaning each node is a valid route.

**This module is being used for developing a router, API is subject to change without notice**

## Install

    $ npm install route-node --save

## Usage

Building your route tree:

```javascript
var RootNode = require('route-node');

// Create nodes
var usersNode = new RouteNode('users', '/users', [
    new RouteNode('list', '/list'),
    new RouteNode('view', '/view/:id')
]);

var ordersNode = new RouteNode('orders', '/orders', [
    new RouteNode('pending', '/pending'),
    new RouteNode('completed', '/completed'),
    new RouteNode('view', '/view/:id')
]);

// Creating a top node
var rootNode = new RouteNode('', '', [
    ordersNode,
    usersNode
]);

// Add nodes programmatically
rootNode.add(new RouteNode('home', '/home'));
```

And then build paths, or match your paths against your tree:

```javascript

rootNode.getPath('users.view');                // => "/users/view/:id"
rootNode.buildPath('users.view', {id: 1});     // => "/users/view/1"

rootNode.matchPath('/users/view/1');           // => {name: "users.view", params: {id: "1"}}
```

## Related packages

- [routington](https://www.npmjs.com/package/routington)

## Based on

- [parth-parser](https://www.npmjs.com/package/path-parser) for parsing, matching and building paths.