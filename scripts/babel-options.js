module.exports = {
    resolveModuleSource: function (source, filename) {
        return source.replace(/\/(es6|modules)\/.*$/, '');
    }
}
