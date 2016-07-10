import * as IO from 'socket.io-client';
import * as onoff from 'onoff';
import * as fs from 'fs';

// get args
const args = process.argv.slice(2);
const userName = args[0];
const __DEVELOPMENT__ = args[1] === "-production" ? false : true;
const hostUrl = __DEVELOPMENT__ ? 'http://localhost:18888' : 'http://115.159.30.68';
if (userName !== 'daddy' && userName !== 'boy') {
    throw new Error('wrong user Name!');
}

let userType;
let loginSuccess = false;
const socket = IO(`${hostUrl}/VASE`);
socket.on('connect', () => {
    console.log('connect');
    socket.emit('login', {
        userName,
        roomName: 'design-thinking',
    });
});
socket.on('login_res', res => {
    if (res.state) {
        userType = res.userType;
        loginSuccess = true;
        console.log('loginSuccess');
    } else {
        console.warn(res.info);
    }
});


const Gpio = onoff.Gpio;
const led = new Gpio(16, 'out');
const button = new Gpio(12, 'in', 'both');
button.watch((err, value) => {
    if (value === 0) {
        led.writeSync(1);
        console.log('yes from nodejs');
    } else {
        led.writeSync(0);
    }

});