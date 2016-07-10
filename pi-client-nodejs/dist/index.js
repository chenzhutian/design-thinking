"use strict";
const IO = require('socket.io-client');
const onoff = require('onoff');
const messageManager_ts_1 = require('./messageManager.ts');
const args = process.argv.slice(2);
const userName = args[0];
const __DEVELOPMENT__ = args[1] === "-production" ? false : true;
const hostUrl = __DEVELOPMENT__ ? 'http://localhost:18888' : 'http://115.159.30.68';
if (userName !== 'daddy' && userName !== 'boy') {
    throw new Error('wrong user Name!');
}
const Gpio = onoff.Gpio;
const led = new Gpio(16, 'out');
const button = new Gpio(12, 'in', 'both');
let userType;
let loginSuccess = false;
const socket = IO(`${hostUrl}/VASE`);
socket.on('connect', () => {
    console.log('connect');
    socket.emit('login', {
        userName: userName,
        roomName: 'design-thinking',
    });
});
socket.on('login_res', res => {
    if (res.state) {
        userType = res.userType;
        loginSuccess = true;
        console.log('loginSuccess');
        button.watch((err, value) => {
            if (value === 0) {
                led.writeSync(1);
                console.log('yes from nodejs');
            }
            else {
                led.writeSync(0);
            }
        });
    }
    else {
        console.warn(res.info);
    }
});
const messageManager = new messageManager_ts_1.default(socket);
process.on('SIGINT', () => {
    led.unexport();
    button.unexport();
});
//# sourceMappingURL=index.js.map