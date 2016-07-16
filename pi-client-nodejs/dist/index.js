"use strict";
const piClent_1 = require('./piClent');
const args = process.argv.slice(2);
const userName = args[0];
const __DEVELOPMENT__ = args[1] === "-production" ? false : true;
const hostUrl = __DEVELOPMENT__ ? 'http://localhost:18888' : 'http://192.168.43.2:18888';
if (userName !== 'daddy' && userName !== 'boy') {
    throw new Error('wrong user Name!');
}
const piClent = new piClent_1.default(hostUrl, userName);
process.on('SIGINT', piClent.clearAllGPIO);
//# sourceMappingURL=index.js.map