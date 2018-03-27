import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'

export default ['umd', 'es', 'cjs'].map(format => ({
    input: 'modules/RouteNode.ts',
    plugins: [
        nodeResolve({ module: true, jsnext: true }),
        typescript({
            useTsconfigDeclarationDir: true,
            clean: true
        })
    ].filter(Boolean),
    external:
        format === 'umd'
            ? []
            : Object.keys(require('./package.json').dependencies),
    output: {
        name: 'RouteNode',
        format,
        file: `dist/${format}/route-node.js`
    }
}))
