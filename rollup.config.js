import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

const babelOptions = {
    presets: [[ 'env', { modules: false }]],
    plugins: [
        'transform-object-rest-spread',
        'transform-class-properties',
        'transform-export-extensions'
    ],
    babelrc: false
};

export default ['umd', 'es', 'cjs'].map(format => ({
    input: 'modules/RouteNode.js',
    plugins: [ nodeResolve({ jsnext: true }), babel(babelOptions) ],
    name: 'RouteNode',
    moduleId: 'RouteNode',
    output: {
        format,
        file: `dist/${format}/route-node.js`
    }
}));
