'use strict';

var path      = require('path');
var pkg       = require('../package.json');
var RouteNode = require(path.join(__dirname, '..', pkg.main));
var should    = require('should');

require('mocha');

describe('RouteNode', function () {
    it('should instanciate an empty RouteNode if no routes are specified in constructor', function () {
        var node = new RouteNode();

        node.children.length.should.equal(0);
    });

    it('should throw an error when RouteNode is not used as a constructor', function () {
        (function () {
            RouteNode('', '', [
                {name: 'home'}
            ]);
        }).should.throw();
    });

    it('should instanciate a RouteNode object from plain objects', function () {
        var node = new RouteNode('', '', [
            {name: 'home', path: '/home'},
            {name: 'profile', path: '/profile'}
        ]);

        node.children.length.should.equal(2);
    });

    it('should throw an error when trying to instanciate a RouteNode object with plain objects missing `name` or `path` properties', function () {
        (function () {
            new RouteNode('', '', [
                {name: 'home'}
            ]);
        }).should.throw();

        (function () {
            new RouteNode('', '', [
                {path: '/profile'}
            ]);
        }).should.throw();
    });

    it('should throw an error when trying to add a node which is not an instance of RouteNode or Object', function () {
        var rootNode = new RouteNode('', '');

        (function () {
            rootNode.add('users');
        }).should.throw();
    });

    it('should throw an error when trying to add a route to a node with an already existing alias or path', function () {
        var root = new RouteNode('', '', [
            {name: 'home', path: '/home'}
        ]);

        (function () {
            root.add({name: 'home', path: '/profile'})
        }).should.throw('Alias "home" is already defined in route node');

        (function () {
            root.add({name: 'profile', path: '/home'})
        }).should.throw('Path "/home" is already defined in route node');
    });

    it('should throw an error when trying to add a route which parent doesn\'t exist', function () {
        var root = new RouteNode('', '', [
            {name: 'home', path: '/home'}
        ]);

        (function () {
            root.add({name: 'nested.route', path: '/route'})
        }).should.throw();
    });

    it('should instanciate a RouteNode object from RouteNode objects', function () {
        var node = new RouteNode('', '', [
            new RouteNode('home', '/home'),
            new RouteNode('profile', '/profile')
        ]);

        node.children.length.should.equal(2);
    });

    it('should find a nested route by name', function () {
        var node = getRoutes();

        node.getPath('home').should.equal('/home');
        node.getPath('users').should.equal('/users');
        node.getPath('users.list').should.equal('/users/list');
        node.getPath('users.view').should.equal('/users/view/:id');
    });

    it('should find a nested route by name', function () {
        var node = getRoutes();

        should.not.exists(node.getPath('users.manage'));
    });

    it('should build the path of a nested route', function () {
        var node = getRoutes();
        // Building paths
        node.buildPath('home').should.equal('/home');
        node.buildPath('users').should.equal('/users');
        node.buildPath('users.list').should.equal('/users/list');
        node.buildPath('users.view', {id: 1}).should.equal('/users/view/1');
        // Missing parameters
        (function () {
            node.buildPath('users.view');
        }).should.throw();
    });

    it('should find a nested route by matching a path', function () {
        var node = getRoutes();
        // Building paths
        node.matchPath('/users').should.eql({name: 'users', params: {}});
        node.matchPath('/users/view/1').should.eql({name: 'users.view', params: {id: '1'}});
        should.not.exists(node.matchPath('/users/profile/1'));
        should.not.exists(node.matchPath('/users/view/profile/1'));
    });

    it('should find a nested route by matching a path with a splat', function () {
        var node = getRoutesWithSplat();
        // Building paths
        node.matchPath('/users/view/1').should.eql({name: 'users.view', params: {id: '1'}});
        node.matchPath('/users/profile/1').should.eql({name: 'users.splat', params: {id: 'profile/1'}});
        should.not.exists(node.matchPath('/users/view/profile/1'));
    });

    it('should work on a tree without a root node', function () {
        var usersNode = new RouteNode('users', '/users', [
            new RouteNode('list', '/list'),
            new RouteNode('view', '/view/:id')
        ]);

        usersNode.matchPath('/users/view/1').should.eql({name: 'users.view', params: {id: '1'}});
        usersNode.matchPath('/users/list').should.eql({name: 'users.list', params: {}});
    })

    it('should be able to add deep nodes', function () {
        var rootNode = new RouteNode('', '')
            .addNode('users', '/users')
            .addNode('users.view', '/view/:id')
            .addNode('users.list', '/list');

        rootNode.buildPath('users.view', {id: 1}).should.equal('/users/view/1');
        rootNode.buildPath('users.list', {id: 1}).should.equal('/users/list');
    });

    it('should sort paths by length', function () {
        var rootNode = new RouteNode('', '')
            .addNode('section', '/section/:id')
            .addNode('index', '/')
            .addNode('id', '/:id')
            .addNode('abo', '/abo')
            .addNode('about', '/about');

        rootNode.matchPath('/').should.eql({name: 'index', params: {}});
        rootNode.matchPath('/abo').should.eql({name: 'abo', params: {}});
        rootNode.matchPath('/about').should.eql({name: 'about', params: {}});
        rootNode.matchPath('/abc').should.eql({name: 'id', params: {id: 'abc'}});
        rootNode.matchPath('/section/abc').should.eql({name: 'section', params: {id: 'abc'}});
    });

    it('should match paths with optional trailing slashes', function () {
        var rootNode = getRoutes();
        should.not.exists(rootNode.matchPath('/users/list/'));
        rootNode.matchPath('/users/list', true).should.eql({name: 'users.list', params: {}});
        rootNode.matchPath('/users/list').should.eql({name: 'users.list', params: {}});
        rootNode.matchPath('/users/list/', true).should.eql({name: 'users.list', params: {}});
        should.not.exists(rootNode.matchPath('/users/list//', true));

        var rootNode = getRoutes(true);
        should.not.exists(rootNode.matchPath('/users/list'));
        rootNode.matchPath('/users/list', true).should.eql({name: 'users.list', params: {}});
        rootNode.matchPath('/users/list/', true).should.eql({name: 'users.list', params: {}});
        rootNode.matchPath('/users/list/').should.eql({name: 'users.list', params: {}});
        rootNode.matchPath('/').should.eql({name: 'default', params: {}});
        rootNode.matchPath('', true).should.eql({name: 'default', params: {}});
        should.not.exists(rootNode.matchPath('/users/list//', true));
    });
});


function getRoutes(trailingSlash) {
    var suffix = trailingSlash ? '/' : '';
    var usersNode = new RouteNode('users', '/users', [
        new RouteNode('list', '/list' + suffix),
        new RouteNode('view', '/view/:id' + suffix)
    ]);

    return new RouteNode('', '', [
        new RouteNode('home', '/home' + suffix),
        new RouteNode('default', '/'),
        usersNode
    ]);
}

function getRoutesWithSplat() {
    var usersNode = new RouteNode('users', '/users', [
        new RouteNode('splat', '/*id'),
        new RouteNode('view', '/view/:id'),
        new RouteNode('list', '/list')
    ]);

    return new RouteNode('', '', [
        usersNode
    ]);
}
