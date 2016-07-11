const shelljs = require('shelljs');
const namespaceFile = 'nameSpace.js';
const eventTypeFile = 'eventType.js';
const piClientSrcPath = '../pi-client-nodejs/src/'
const serverSrcPath = '../server/src/';
const webClientSrcPath = '../web-client/src/';

shelljs.cp(eventTypeFile, piClientSrcPath);
shelljs.cp(eventTypeFile, webClientSrcPath);
shelljs.cp(eventTypeFile, serverSrcPath);

shelljs.cp(namespaceFile, piClientSrcPath);
shelljs.cp(namespaceFile, webClientSrcPath);
shelljs.cp(namespaceFile, serverSrcPath);

