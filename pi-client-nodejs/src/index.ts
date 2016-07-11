import * as IO from 'socket.io-client';
import * as onoff from 'onoff';

// get args
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


// release the resource when exit processing
process.on('SIGINT', () => {
    led.unexport();
    button.unexport();
});