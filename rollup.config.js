import babel from 'rollup-plugin-babel';
import npm from 'rollup-plugin-npm';
import { argv } from 'yargs';

const format = argv.format || 'umd';
const dest = {
    amd:  'dist/amd/route-node.js',
    umd:  'dist/umd/route-node.js'
}[format];

export default {
    entry: 'modules/RouteNode.js',
    format,
    plugins: [ babel(), npm({ jsnext: true }) ],
    moduleName: 'RouteNode',
    moduleId: 'RouteNode',
    dest
};
