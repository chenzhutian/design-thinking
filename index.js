"use strict";
// set env
const args = process.argv.slice(2);
if (args[0] === '-production')
    process.env.NODE_ENV = 'production';
/**
 * Module dependencies.
 */
const http = require('http');
const socket_1 = require('./server/socket');
const express_1 = require('./server/express');
// const http = require('http');
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }
    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '18888');
express_1.default.set('port', port);
/**
 * Create HTTP server.
 */
const server = http.createServer(express_1.default);
socket_1.attachIO(server);
/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
/**
 * Event listener for HTTP server "error" event.
 */
server.on('error', error => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;
    // handle specific listen errors with friendly messages
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
/**
 * Event listener for HTTP server "listening" event.
 */
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `port ${addr.port}`;
    console.info(`Listening on ${bind}`);
});
//# sourceMappingURL=index.js.map