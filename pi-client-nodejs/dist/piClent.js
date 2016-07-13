"use strict";
const IO = require('socket.io-client');
const onoff = require('onoff');
const Pigpio = require('pigpio');
const messageManager_1 = require('./messageManager');
const events = require('events');
const nameSpace_js_1 = require('./nameSpace.js');
const eventType_js_1 = require('./eventType.js');
const Gpio = onoff.Gpio;
const PWMGpio = Pigpio.Gpio;
const MOTOR_MAX_PULSEWIDTH = 2500;
const MOTOR_MIN_PULSEWIDTH = 500;
const ROOM_NAME = 'design-thinking';
class PiClient {
    constructor(hostUrl, userName) {
        this._loginSuccess = false;
        this._playButton = new Gpio(27, 'in', 'both');
        this._sentButton = new Gpio(22, 'in', 'both');
        this._recordHandlerButton = new Gpio(18, 'in', 'both');
        this._motor = new PWMGpio(17, { mode: PWMGpio.OUTPUT });
        this._motorPulseWidth = 500;
        this._motorIncremental = 100;
        this._motorMoveTimeGap = 100;
        this.onConnect = () => {
            console.info('connected');
            this._socket.emit(eventType_js_1.LOGIN, {
                userName: this._userName,
                roomName: ROOM_NAME
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
                    if (value === 0) {
                        this._messageManager.readMessage();
                    }
                    else {
                        console.log(value);
                    }
                });
                this._sentButton.watch((err, value) => {
                    if (err)
                        throw err;
                    if (value === 0) {
                        this._messageManager.sendMesssage();
                    }
                    else {
                        console.log(value);
                    }
                });
                this._recordHandlerButton.watch((err, value) => {
                    if (err)
                        throw err;
                    if (value === 0) {
                        this._messageManager.recordMessage();
                    }
                    else {
                        console.log(`recordHandler ${value}`);
                    }
                });
            }
            else {
                console.warn(res.info);
            }
        };
        this.openFlower = () => {
            this._motorIncremental = this._motorIncremental > 0 ? this._motorIncremental : -this._motorIncremental;
            this._motorTimer = setInterval(() => {
                if (this._motorPulseWidth >= MOTOR_MAX_PULSEWIDTH) {
                    clearInterval(this._motorTimer);
                }
                else {
                    this._motorPulseWidth += this._motorIncremental;
                }
            }, this._motorMoveTimeGap);
        };
        this.closeFlower = () => {
            this._motorIncremental = this._motorIncremental < 0 ? this._motorIncremental : -this._motorIncremental;
            this._motorTimer = setInterval(() => {
                if (this._motorPulseWidth <= MOTOR_MIN_PULSEWIDTH) {
                    clearInterval(this._motorTimer);
                }
                else {
                    this._motorPulseWidth += this._motorIncremental;
                }
            }, this._motorMoveTimeGap);
        };
        this.clearAllGPIO = () => {
            this._playButton.unexport();
            this._sentButton.unexport();
            this._recordHandlerButton.unexport();
            this._motor.servoWrite(0);
        };
        this._userName = userName;
        this._socket = IO(`${hostUrl}${nameSpace_js_1.NS_VASE}`);
        this._eventManager = new events.EventEmitter();
        this._messageManager = new messageManager_1.default(this._socket, this._eventManager);
        this._socket.on(eventType_js_1.CONNECT, this.onConnect);
        this._socket.on(eventType_js_1.LOGIN_RESULT, this.onLoginRes);
        this._socket.on(eventType_js_1.MESSAGE, this.closeFlower);
        this._eventManager.on(PiClient.EMPTY_UNREAD_MESSAGE, this.closeFlower);
    }
}
PiClient.EMPTY_UNREAD_MESSAGE = 'EMPTY_UNREAD_MESSAGE';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PiClient;
//# sourceMappingURL=piClent.js.map