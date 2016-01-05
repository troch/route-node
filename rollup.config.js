import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
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
    plugins: [ babel(babelOptions), npm({ jsnext: true }) ],
    moduleName: 'RouteNode',
    moduleId: 'RouteNode',
    dest
};
