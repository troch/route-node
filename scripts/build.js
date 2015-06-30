var babel       = require('babel');
var path        = require('path');
var fs          = require('fs');
var options     = require('./babel-options');

options.modules = 'common';

babel.transformFile(path.join(__dirname, '../modules/RouteNode.js'), options, function (err, result) {
    if (!err) {
        fs.writeFile(path.join(__dirname, '../index.js'), result.code, function () {
            process.exit();
        });
    } else {
        process.exit(1);
    }
});
