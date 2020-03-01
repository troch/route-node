import { RouteNode } from '../src'

function withoutMeta(obj: Record<string, any> | null) {
  if (!obj) {
    return obj
  }

  const { meta, ...rest } = obj

  return rest
}

describe('RouteNode', function() {
  it('should instanciate an empty RouteNode if no routes are specified in constructor', function() {
    const node = new RouteNode()

    expect(node.children.length).toBe(0)
  })

  it('should throw an error when RouteNode is not used as a constructor', function() {
    expect(function() {
      // @ts-ignore
      RouteNode('', '', [{ name: 'home' }])
    }).toThrow()
  })

  it('should instanciate a RouteNode object from plain objects', function() {
    const node = new RouteNode('', '', [
      { name: 'home', path: '/home' },
      { name: 'profile', path: '/profile' }
    ])

    expect(node.children.length).toBe(2)
  })

  it('should callback for each route from a POJO', function() {
    const routeA = { name: 'home', path: '/home', extra: 'extra' }
    const routeB = { name: 'profile', path: '/profile', extra: 'extra' }

    const routes = [routeA, routeB]
    let node = new RouteNode()
    let i = 0

    node.add(routes, function(route) {
      i = i + 1
      if (i === 1) expect(route).toEqual(routeA)
      if (i === 2) expect(route).toEqual(routeB)
    })

    expect(i).not.toBe(0)

    i = 0

    node = new RouteNode('', '', routes, {
      onAdd: route => {
        i = i + 1
        if (i === 1) expect(route).toEqual(routeA)
        if (i === 2) expect(route).toEqual(routeB)
      }
    })

    expect(i).not.toBe(0)
  })

  it('should perform a final sort all routes after adding them', () => {
    const routes = [...Array(10)].map((_, index) => ({
      name: `r${index}`,
      path: `/${index}`,
      children: [...Array(500)].map((_, childIndex) => ({
        name: `r${childIndex}`,
        path: `/${childIndex}`
      }))
    }))
    new RouteNode('', '', routes, {
      finalSort: true
    })
    // No assertion here, if final sort functionality is broken
    // the test will exceed the 2s timeout and fail
  })

  it('should throw an error when trying to instanciate a RouteNode object with plain objects missing `name` or `path` properties', function() {
    expect(function() {
      // @ts-ignore
      new RouteNode('', '', [{ name: 'home' }])
    }).toThrow()
    expect(function() {
      // @ts-ignore
      new RouteNode('', '', [{ path: '/profile' }])
    }).toThrow()
  })

  it('should throw an error when trying to add a node which is not an instance of RouteNode or Object', function() {
    const rootNode = new RouteNode('', '')
    expect(function() {
      // @ts-ignore
      rootNode.add('users')
    }).toThrow()
  })

  it('should throw an error when trying to add a route to a node with an already existing alias or path', function() {
    const root = new RouteNode('', '', [{ name: 'home', path: '/home' }])

    expect(function() {
      root.add({ name: 'home', path: '/profile' })
    }).toThrow('Alias "home" is already defined in route node')
    expect(function() {
      root.add({ name: 'profile', path: '/home' })
    }).toThrow('Path "/home" is already defined in route node')
    expect(function() {
      root.add({ name: 'home.profile', path: '/home' })
    }).not.toThrow()
    expect(function() {
      root.add({ name: 'home.profile', path: '/profile' })
    }).toThrow()
  })

  it("should throw an error when trying to add a route which parent doesn't exist", function() {
    const root = new RouteNode('', '', [{ name: 'home', path: '/home' }])
    expect(function() {
      root.add({ name: 'nested.route', path: '/route' })
    }).toThrow()
  })

  it('should instanciate a RouteNode object from RouteNode objects', function() {
    const node = new RouteNode('', '', [
      new RouteNode('home', '/home'),
      new RouteNode('profile', '/profile')
    ])

    expect(node.children.length).toBe(2)
  })

  it('should find a nested route by name', function() {
    const node = getRoutes()

    expect(node.getPath('home')).toBe('/home')
    expect(node.getPath('users')).toBe('/users')
    expect(node.getPath('users.list')).toBe('/users/list')
    expect(node.getPath('users.view')).toBe('/users/view/:id')
  })

  it('should find a nested route by name', function() {
    const node = getRoutes()

    expect(node.getPath('users.manage')).toBeNull()
  })

  it('should build the path of a nested route', function() {
    const node = getRoutes()
    // Building paths
    expect(node.buildPath('home')).toBe('/home')
    expect(node.buildPath('users')).toBe('/users')
    expect(node.buildPath('users.list')).toBe('/users/list')
    expect(node.buildPath('users.view', { id: 1 })).toBe('/users/view/1')
    // Missing parameters
    expect(function() {
      node.buildPath('users.view')
    }).toThrow()
  })

  it('should build the state object of a nested route', function() {
    const node = getRoutes()
    // Building paths
    expect(node.buildState('home')).toEqual({
      meta: { home: {} },
      name: 'home',
      params: {}
    })

    expect(node.buildState('users.view', { id: 1 })).toEqual({
      meta: {
        users: {},
        'users.view': {
          id: 'url'
        }
      },
      name: 'users.view',
      params: { id: 1 }
    })
  })

  it('should find a nested route by matching a path', function() {
    const node = getRoutes()
    // Building paths
    expect(withoutMeta(node.matchPath('/users'))).toEqual({
      name: 'users',
      params: {}
    })

    expect(node.matchPath('/users/view/1')).toEqual({
      meta: {
        users: {},
        'users.view': {
          id: 'url'
        }
      },
      name: 'users.view',
      params: { id: '1' }
    })

    expect(node.matchPath('/users/profile/1')).toBeNull()
    expect(node.matchPath('/users/view/profile/1')).toBeNull()
  })

  it('should match and build paths with nested query parameters', function() {
    const node = new RouteNode('', '', [
      new RouteNode('grandParent', '/grand-parent?nickname', [
        new RouteNode('parent', '/parent?name', [
          new RouteNode('child', '/child?age')
        ])
      ])
    ])

    // Building
    expect(node.buildPath('grandParent', { nickname: 'gran' })).toBe(
      '/grand-parent?nickname=gran'
    )
    expect(
      node.buildPath('grandParent.parent', {
        nickname: 'gran gran',
        name: 'maman'
      })
    ).toBe('/grand-parent/parent?nickname=gran%20gran&name=maman')
    expect(node.buildPath('grandParent.parent', { nickname: 'gran' })).toBe(
      '/grand-parent/parent?nickname=gran'
    )
    expect(node.buildPath('grandParent.parent', { name: 'maman' })).toBe(
      '/grand-parent/parent?name=maman'
    )
    expect(
      node.buildPath('grandParent.parent.child', { name: 'maman', age: 3 })
    ).toBe('/grand-parent/parent/child?name=maman&age=3')
    expect(node.buildPath('grandParent.parent.child', {})).toBe(
      '/grand-parent/parent/child'
    )
    expect(
      node.buildPath('grandParent.parent.child', {
        nickname: ['gran', 'granny']
      })
    ).toBe('/grand-parent/parent/child?nickname=gran&nickname=granny')
    expect(
      node.buildPath('grandParent.parent.child', { nickname: undefined })
    ).toBe('/grand-parent/parent/child')

    // Matching
    expect(withoutMeta(node.matchPath('/grand-parent'))).toEqual({
      name: 'grandParent',
      params: {}
    })

    expect(node.matchPath('/grand-parent?nickname=gran')).toEqual({
      meta: {
        grandParent: {
          nickname: 'query'
        }
      },
      name: 'grandParent',
      params: { nickname: 'gran' }
    })

    expect(
      withoutMeta(
        node.matchPath('/grand-parent/parent?nickname=gran&name=maman%20man')
      )
    ).toEqual({
      name: 'grandParent.parent',
      params: { nickname: 'gran', name: 'maman man' }
    })
    expect(
      withoutMeta(
        node.matchPath('/grand-parent/parent/child?nickname=gran&name=maman')
      )
    ).toEqual({
      name: 'grandParent.parent.child',
      params: { nickname: 'gran', name: 'maman' }
    })
    expect(
      withoutMeta(
        node.matchPath(
          '/grand-parent/parent/child?nickname=gran&name=maman&age=3'
        )
      )
    ).toEqual({
      name: 'grandParent.parent.child',
      params: { nickname: 'gran', name: 'maman', age: '3' }
    })
    expect(
      withoutMeta(
        node.matchPath(
          '/grand-parent/parent/child?nickname=gran&nickname=granny&name=maman&age=3'
        )
      )
    ).toEqual({
      name: 'grandParent.parent.child',
      params: { nickname: ['gran', 'granny'], name: 'maman', age: '3' }
    })

    // still matching remainingPath only consist of unknown qsParams
    expect(
      node.matchPath('/grand-parent?nickname=gran&name=papa', {
        queryParamsMode: 'default'
      })
    ).toEqual({
      meta: {
        grandParent: {
          nickname: 'query'
        }
      },
      name: 'grandParent',
      params: { nickname: 'gran', name: 'papa' }
    })
    expect(
      node.matchPath(
        '/grand-parent/parent/child?nickname=gran&names=papa-maman',
        {
          queryParamsMode: 'default'
        }
      )
    ).toEqual({
      meta: {
        grandParent: {
          nickname: 'query'
        },
        'grandParent.parent': {
          name: 'query'
        },
        'grandParent.parent.child': {
          age: 'query'
        }
      },
      name: 'grandParent.parent.child',
      params: { nickname: 'gran', names: 'papa-maman' }
    })
  })

  it('should find a nested route by matching a path with a splat', function() {
    const node = getRoutesWithSplat()
    // Building paths
    expect(withoutMeta(node.matchPath('/users/view/1'))).toEqual({
      name: 'users.view',
      params: { id: '1' }
    })
    expect(withoutMeta(node.matchPath('/users/profile/1'))).toEqual({
      name: 'users.splat',
      params: { id: 'profile/1' }
    })
    expect(node.matchPath('/users/view/profile/1')).toBeNull()
  })

  it('should work on a tree without a root node', function() {
    const usersNode = new RouteNode('users', '/users', [
      new RouteNode('list', '/list'),
      new RouteNode('view', '/view/:id')
    ])

    expect(withoutMeta(usersNode.matchPath('/users/view/1'))).toEqual({
      name: 'users.view',
      params: { id: '1' }
    })
    expect(withoutMeta(usersNode.matchPath('/users/list'))).toEqual({
      name: 'users.list',
      params: {}
    })
  })

  it('should be able to add deep nodes', function() {
    const rootNode = new RouteNode('', '')
      .addNode('users', '/users')
      .addNode('users.view', '/view/:id')
      .addNode('users.list', '/list')

    expect(
      rootNode.buildPath('users.view', { id: 1 }, { queryParamsMode: 'strict' })
    ).toBe('/users/view/1')
    expect(
      rootNode.buildPath('users.list', { id: 1 }, { queryParamsMode: 'strict' })
    ).toBe('/users/list')
  })

  it('should sort paths by length', function() {
    const rootNode = new RouteNode('', '')
      .addNode('personList', '/persons/')
      .addNode('personDetail', '/persons/:personId')
      .addNode('section', '/section/:id?a')
      .addNode('index', '/?queryparamOfexceptionalLength')
      .addNode('id', '/:id?rrrr')
      .addNode('abo', '/abo')
      .addNode('about', '/about?hello')
      .addNode('users', '/users-tab')
      .addNode('user', '/users/:id')
      .addNode('postNew', '/blogs/:blogId/posts/new')
      .addNode('postDetail', '/blogs/:blogId/posts/:postId')

    expect(withoutMeta(rootNode.matchPath('/'))).toEqual({
      name: 'index',
      params: {}
    })
    expect(withoutMeta(rootNode.matchPath('/abo'))).toEqual({
      name: 'abo',
      params: {}
    })
    expect(withoutMeta(rootNode.matchPath('/about'))).toEqual({
      name: 'about',
      params: {}
    })
    expect(withoutMeta(rootNode.matchPath('/abc'))).toEqual({
      name: 'id',
      params: { id: 'abc' }
    })
    expect(withoutMeta(rootNode.matchPath('/section/abc'))).toEqual({
      name: 'section',
      params: { id: 'abc' }
    })
    expect(withoutMeta(rootNode.matchPath('/persons/jwoudenberg'))).toEqual({
      name: 'personDetail',
      params: { personId: 'jwoudenberg' }
    })
    expect(withoutMeta(rootNode.matchPath('/users-tab'))).toEqual({
      name: 'users',
      params: {}
    })
    expect(withoutMeta(rootNode.matchPath('/users/thomas'))).toEqual({
      name: 'user',
      params: { id: 'thomas' }
    })
    expect(withoutMeta(rootNode.matchPath('/blogs/123/posts/new'))).toEqual({
      name: 'postNew',
      params: { blogId: '123' }
    })
    expect(withoutMeta(rootNode.matchPath('/blogs/123/posts/456'))).toEqual({
      name: 'postDetail',
      params: { blogId: '123', postId: '456' }
    })
  })

  it('should match paths with optional trailing slashes', function() {
    let rootNode = getRoutes()
    expect(
      rootNode.matchPath('/users/list/', { strictTrailingSlash: true })
    ).toBeNull()
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list', { strictTrailingSlash: false })
      )
    ).toEqual({ name: 'users.list', params: {} })
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list', { strictTrailingSlash: true })
      )
    ).toEqual({ name: 'users.list', params: {} })
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list/', { strictTrailingSlash: false })
      )
    ).toEqual({ name: 'users.list', params: {} })

    rootNode = getRoutes(true)
    expect(
      rootNode.matchPath('/users/list', { strictTrailingSlash: true })
    ).toBeNull()
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list', { strictTrailingSlash: false })
      )
    ).toEqual({ name: 'users.list', params: {} })
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list/', { strictTrailingSlash: false })
      )
    ).toEqual({ name: 'users.list', params: {} })
    expect(
      withoutMeta(
        rootNode.matchPath('/users/list/', { strictTrailingSlash: true })
      )
    ).toEqual({ name: 'users.list', params: {} })
    expect(withoutMeta(rootNode.matchPath('/'))).toEqual({
      name: 'default',
      params: {}
    })
    expect(
      withoutMeta(rootNode.matchPath('', { strictTrailingSlash: false }))
    ).toEqual({ name: 'default', params: {} })
    expect(rootNode.matchPath('', { strictTrailingSlash: true })).toBeNull()
  })

  it('should match paths with optional trailing slashes and a non-empty root node', function() {
    const rootNode = new RouteNode('', '?c&d', [new RouteNode('a', '/')])

    const state = { name: 'a', params: {} }

    expect(
      withoutMeta(rootNode.matchPath('/', { strictTrailingSlash: true }))
    ).toEqual(state)
    expect(
      withoutMeta(rootNode.matchPath('/', { strictTrailingSlash: false }))
    ).toEqual(state)
    expect(
      withoutMeta(rootNode.matchPath('', { strictTrailingSlash: false }))
    ).toEqual(state)
  })

  it('should support query parameters with square brackets', function() {
    const node = new RouteNode('', '', [
      new RouteNode('route', '/route?arr', [
        new RouteNode('deep', '/deep?arr2')
      ])
    ])

    // node.buildPath('route.deep', { arr: [1, 2], arr2: [3] })).toBe('/route/deep?arr=1&arr=2&arr2=3');
    expect(
      withoutMeta(node.matchPath('/route/deep?arr=1&arr=2&arr2=3&arr2=4'))
    ).toEqual({
      name: 'route.deep',
      params: { arr: ['1', '2'], arr2: ['3', '4'] }
    })
  })

  it('should support query parameters in the root node', function() {
    const node = new RouteNode('', '?a', [new RouteNode('route', '/path?b')])
    expect(node.matchPath('/path?a=1&b=2')).toEqual({
      meta: {
        '': { a: 'query' },
        route: { b: 'query' }
      },
      name: 'route',
      params: { a: '1', b: '2' }
    })

    expect(node.buildState('route', { b: '1' })).toEqual({
      meta: {
        '': { a: 'query' },
        route: { b: 'query' }
      },
      name: 'route',
      params: { b: '1' }
    })

    expect(node.buildState('route', { a: '1', b: '1' })).toEqual({
      meta: {
        '': { a: 'query' },
        route: { b: 'query' }
      },
      name: 'route',
      params: { a: '1', b: '1' }
    })

    expect(node.buildPath('route', { b: '2' })).toBe('/path?b=2')
    expect(node.buildPath('route', { a: '1', b: '2' })).toBe('/path?a=1&b=2')
  })

  it('should be able to modify a path', function() {
    const node = new RouteNode('', '', [new RouteNode('route', '/path')])

    expect(node.buildPath('route')).toBe('/path')
    expect(node.buildPath('route', { param: '1' })).toBe('/path')
    node.setPath('?param')
    expect(node.buildPath('route', { param: '1' })).toBe('/path?param=1')
  })

  it('should serialise extra search parameters', function() {
    const node = new RouteNode('', '', [new RouteNode('route', '/path')])

    expect(
      withoutMeta(
        node.matchPath('/path?a=1&b=2&c=3&d', {
          queryParamsMode: 'default'
        })
      )
    ).toEqual({
      name: 'route',
      params: { a: '1', b: '2', c: '3', d: null }
    })
  })

  it('should throw an error when adding an absolute path below nodes with params', () => {
    function createNode() {
      return new RouteNode('', '', [
        new RouteNode('path', '/path/:path', [
          new RouteNode('absolute', '~/absolute')
        ])
      ])
    }

    expect(createNode).toThrow()
  })

  it('should build absolute paths', function() {
    const node = new RouteNode('', '', [
      new RouteNode('path', '/path', [
        new RouteNode('relative', '/relative'),
        new RouteNode('absolute', '~/absolute')
      ])
    ])

    expect(node.buildPath('path.relative')).toBe('/path/relative')
    expect(node.buildPath('path.absolute')).toBe('/absolute')
  })

  it('should match absolute paths', function() {
    const absolute = new RouteNode('absolute', '~/absolute')

    const node = new RouteNode('', '', [
      new RouteNode('path', '/path', [
        new RouteNode('relative', '/relative'),
        absolute
      ])
    ])

    expect(withoutMeta(node.matchPath('/path/relative'))).toEqual({
      name: 'path.relative',
      params: {}
    })
    expect(node.matchPath('/path/absolute')).toBeDefined()
    expect(withoutMeta(node.matchPath('/absolute'))).toEqual({
      name: 'path.absolute',
      params: {}
    })
  })

  it('should automatically match deep nested "/" children', () => {
    const node = new RouteNode('', '', [
      new RouteNode('section', '/section', [
        new RouteNode('top', '/?withParam'),
        new RouteNode('part', '/:part')
      ])
    ])

    expect(withoutMeta(node.matchPath('/section'))).toEqual({
      name: 'section.top',
      params: {}
    })
    expect(node.buildPath('section.top')).toEqual('/section/')
    expect(
      node.buildPath('section.top', {}, { trailingSlashMode: 'never' })
    ).toEqual('/section')
  })

  it('should match deep nested "/" children with query params', () => {
    const node = new RouteNode('', '', [
      new RouteNode('app', '?:showVersion', [
        new RouteNode('admin', '/admin', [
          new RouteNode('users', '/?:sort?:page')
        ])
      ])
    ])

    expect(withoutMeta(node.matchPath('/admin/?page=1'))).toEqual({
      name: 'app.admin.users',
      params: { page: '1' }
    })
    expect(withoutMeta(node.matchPath('/admin/'))).toEqual({
      name: 'app.admin.users',
      params: {}
    })
  })

  it('should fully match route nodes who have no children', () => {
    const node = new RouteNode('', '', [
      new RouteNode('home', '/home'),
      new RouteNode('section', '/:section')
    ])

    expect(withoutMeta(node.matchPath('/homeland'))).toEqual({
      name: 'section',
      params: { section: 'homeland' }
    })
    expect(withoutMeta(node.matchPath('/hom'))).toEqual({
      name: 'section',
      params: { section: 'hom' }
    })
  })

  describe('when queryParamsMode is loose', () => {
    it('should serialise extra params to search part', () => {
      const node = new RouteNode('', '', [new RouteNode('home', '/home')])

      expect(
        node.buildPath(
          'home',
          { extra: 1, more: 2 },
          { queryParamsMode: 'loose' }
        )
      ).toBe('/home?extra=1&more=2')
    })
  })

  describe('when strictQueryParams is falsy and strictTrailingSlash is falsy', () => {
    it('should match extra query params', () => {
      const node = new RouteNode('', '', [
        { name: 'root', path: '/' },
        { name: 'home', path: '/home' }
      ])
      const opts = {
        queryParamsMode: 'default',
        strictTrailingSlash: false
      } as const

      const match1 = node.matchPath('/?s=3', opts)
      const match2 = node.matchPath('/home/?s=3', opts)

      expect(withoutMeta(match1)).toEqual({
        name: 'root',
        params: { s: '3' }
      })
      expect(withoutMeta(match2)).toEqual({
        name: 'home',
        params: { s: '3' }
      })
    })
  })

  it('should trim trailing slashes when building paths', () => {
    const node = new RouteNode('', '', [
      new RouteNode('a', '/a', [new RouteNode('b', '/?c')]),
      new RouteNode('c', '/?c')
    ])

    expect(node.buildPath('a.b', {}, { trailingSlashMode: 'never' })).toEqual(
      '/a'
    )
    expect(
      node.buildPath('a.b', { c: 1 }, { trailingSlashMode: 'never' })
    ).toEqual('/a?c=1')
    expect(
      node.buildPath('c', { c: 1 }, { trailingSlashMode: 'never' })
    ).toEqual('/?c=1')
  })

  it('should remove repeated slashes when building paths', () => {
    const node = new RouteNode('', '', [
      new RouteNode('a', '/', [
        new RouteNode('b', '/', [new RouteNode('c', '/')])
      ])
    ])

    expect(node.buildPath('a.b', {})).toEqual('/')
    expect(node.buildPath('a.b.c', {})).toEqual('/')
  })

  it('should match paths with repeating slashes', () => {
    const node = new RouteNode('', '', [
      new RouteNode('a', '/', [
        new RouteNode('b', '/', [new RouteNode('c', ':bar')])
      ])
    ])

    expect(withoutMeta(node.matchPath('/'))).toEqual({
      name: 'a.b',
      params: {}
    })
    expect(withoutMeta(node.matchPath('/foo'))).toEqual({
      name: 'a.b.c',
      params: { bar: 'foo' }
    })
  })

  it('should sort path with complex regexes correctly', () => {
    const node = new RouteNode('', '', [
      new RouteNode('a', '/:path<foo|bar(?:baz?)>/:bar'),
      new RouteNode('b', '/:foo')
    ])

    expect(withoutMeta(node.matchPath('/foo/bar'))).toEqual({
      name: 'a',
      params: { path: 'foo', bar: 'bar' }
    })
  })

  it('should be case insensitive by default', () => {
    const node = new RouteNode('', '', [new RouteNode('a', '/a')])

    expect(node.matchPath('/a')?.name).toBe('a')
    expect(node.matchPath('/A', { caseSensitive: false })?.name).toBe('a')
    expect(node.matchPath('/A', { caseSensitive: true })).toBeNull()
  })

  it('should pass query parameters options to path-parser', () => {
    const node = new RouteNode('', '', [new RouteNode('a', '/a?b&c')])

    expect(
      node.matchPath('/a?b=true&c[]=1', {
        queryParams: {
          booleanFormat: 'string',
          arrayFormat: 'brackets'
        }
      })?.params
    ).toEqual({
      b: true,
      c: ['1']
    })
  })

  it('should match path with a plus character', () => {
    const routes = [
      {
        name: 'page',
        path: '/:name<.+>/:id<(\\w{2}[0-9]{4})>.html'
      }
    ]
    const options = {
      trailingSlashMode: 'never',
      queryParamsMode: 'loose',
      queryParams: { nullFormat: 'hidden' }
    } as const
    const node = new RouteNode('', '', routes)
    expect(node.matchPath('/foo+bar/AB1234.html', options)?.params).toEqual({
      id: 'AB1234',
      name: 'foo+bar'
    })
  })

  it('should return null if there is no match', () => {
    const routes = [
      {
        name: 'page',
        path: '/:name<.+>'
      }
    ]
    const node = new RouteNode('', '', routes)
    expect(node.matchPath('/foobar%24')).toBeNull()
  })

  describe('uri encoding', () => {
    const routeNode = new RouteNode('', '', [
      {
        name: 'route',
        path: '/:param'
      }
    ])

    it('should build with correct encoding', () => {
      expect(
        routeNode.buildPath(
          'route',
          {
            param: 'test$@'
          },
          {
            urlParamsEncoding: 'uriComponent'
          }
        )
      ).toBe('/test%24%40')
    })

    it('should match with correct decoding', () => {
      expect(
        withoutMeta(
          routeNode.matchPath('/test%24%40', {
            urlParamsEncoding: 'uriComponent'
          })
        )
      ).toEqual({
        name: 'route',
        params: {
          param: 'test$@'
        }
      })
    })
  })
})

function getRoutes(trailingSlash?: boolean) {
  const suffix = trailingSlash ? '/' : ''
  const usersNode = new RouteNode('users', '/users', [
    new RouteNode('list', '/list' + suffix),
    new RouteNode('view', '/view/:id' + suffix)
  ])

  return new RouteNode('', '', [
    new RouteNode('home', '/home' + suffix),
    new RouteNode('default', '/'),
    usersNode
  ])
}

function getRoutesWithSplat() {
  const usersNode = new RouteNode('users', '/users', [
    new RouteNode('splat', '/*id'),
    new RouteNode('view', '/view/:id'),
    new RouteNode('list', '/list')
  ])

  return new RouteNode('', '', [usersNode])
}
