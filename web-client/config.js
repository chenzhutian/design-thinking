// see http://vuejs-templates.github.io/webpack for documentation.
const path = require('path');

module.exports = {
    assetsSubDirectory: 'static',
    build: {
        index: path.resolve(__dirname, '../better-data-play-ground-server/public/index.html'),
        assetsRoot: path.resolve(__dirname, '../better-data-play-ground-server/public'),
        assetsPublicPath: '/vc-playground/',
        productionSourceMap: true,
    },
    dev: {
        port: 8080,
        assetsRoot: path.resolve(__dirname, 'dist'),
        assetsPublicPath: '/',
        proxyTable: {},
    },
};
