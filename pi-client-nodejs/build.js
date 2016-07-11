'use strict';
// https://github.com/shelljs/shelljs
const shelljs = require('shelljs');
shelljs.env.NODE_ENV = 'production';
console.log(
    '  Tip:\n' +
    '  Built files are meant to be served over an HTTP server.\n' +
    '  Opening index.html over file:// won\'t work.\n'
);


const assetsPath = './dist/';
shelljs.rm('-rf', assetsPath);
shelljs.mkdir('-p', assetsPath);
shelljs.cp('-R', 'src/resource/', assetsPath);
shelljs.cp('package.json',assetsPath);
