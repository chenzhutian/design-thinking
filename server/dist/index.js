"use strict";
const args = process.argv.slice(2);
if (args[0] === '-production')
    process.env.NODE_ENV = 'production';
const http = require('http');
const socket_1 = require('./server/socket');
const express_1 = require('./server/express');
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
const port = normalizePort(process.env.PORT || '18888');
express_1.default.set('port', port);
const server = http.createServer(express_1.default);
socket_1.attachIO(server);
server.listen(port);
server.on('error', error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
});
//# sourceMappingURL=index.js.map