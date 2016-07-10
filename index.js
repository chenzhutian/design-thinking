"use strict";
const IO = require('socket.io-client');
const args = process.argv.slice(2);
const userName = args[0];
const __DEVELOPMENT__ = args[1] === "-production" ? false : true;
if (userName !== 'daddy' && userName !== 'boy') {
    throw new Error('wrong user Name!');
}
let userType;
let loginSuccess = false;
const hostUrl = __DEVELOPMENT__ ? 'http://localhost:18888' : 'http://115.159.30.68';
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
    }
    else {
        console.warn(res.info);
    }
});
for (let i = 0; i < 10; ++i)
    console.log(i);
//# sourceMappingURL=index.js.map