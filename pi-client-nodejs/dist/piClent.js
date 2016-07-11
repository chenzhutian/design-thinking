"use strict";
const IO = require('socket.io-client');
const onoff = require('onoff');
const messageManager_1 = require('./messageManager');
const nameSpace_js_1 = require('./nameSpace.js');
const eventType_js_1 = require('./eventType.js');
const Gpio = onoff.Gpio;
class PiClient {
    constructor(hostUrl, userName) {
        this._loginSuccess = false;
        this._playButton = new Gpio(14, 'in', 'both');
        this._sentButton = new Gpio(15, 'in', 'falling');
        this.onConnect = () => {
            console.info('connected');
            this._socket.emit(eventType_js_1.LOGIN, {
                userName: this._userName,
                roomName: 'design-thinking'
            });
        };
        this.onLoginRes = (res) => {
            if (res.state) {
                this._userType = res.userType;
                this._loginSuccess = true;
                console.log('loginSuccess');
                this._socket.on(eventType_js_1.TEST_PI, msg => console.log(msg));
                this._playButton.watch((err, value) => {
                    if (err)
                        throw err;
                    if (value === 1) {
                        this._messageManager.readMessage();
                    }
                    else {
                        console.log(value);
                    }
                });
            }
            else {
                console.warn(res.info);
            }
        };
        this._userName = userName;
        this._socket = IO(`${hostUrl}${nameSpace_js_1.NS_VASE}`);
        this._messageManager = new messageManager_1.default(this._socket);
        this._socket.on(eventType_js_1.CONNECT, this.onConnect);
        this._socket.on(eventType_js_1.LOGIN_RESULT, this.onLoginRes);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PiClient;
//# sourceMappingURL=piClent.js.map