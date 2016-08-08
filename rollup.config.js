import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import { argv } from 'yargs';

const babelOptions = {
    presets: [ 'es2015-rollup' ],
    plugins: [
        'transform-object-rest-spread',
        'transform-class-properties',
        'transform-export-extensions'
    ],
    babelrc: false
};

const format = argv.format || 'umd';
const dest = {
    amd:  'dist/amd/route-node.js',
    umd:  'dist/umd/route-node.js'
}[format];

export default {
    entry: 'modules/RouteNode.js',
    format,
    plugins: [ nodeResolve({ jsnext: true }), babel(babelOptions) ],
    moduleName: 'RouteNode',
    moduleId: 'RouteNode',
    dest
};
