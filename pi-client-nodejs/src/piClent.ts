import * as IO from 'socket.io-client';
import * as onoff from 'onoff';
import * as Pigpio from 'pigpio';
import MessageManager from './messageManager';
import * as RecordSound from 'node-arecord';
import * as events from 'events';

import { NS_VASE } from './nameSpace.js';
import {
    CONNECT,
    LOGIN_RESULT,
    LOGIN,
    TEST_PI,
    MESSAGE,
} from './eventType.js';

interface LoginResult {
    state: boolean;
    info: string;
    userType?: string;
}

const Gpio = onoff.Gpio;
const PWMGpio = Pigpio.Gpio;
const MOTOR_MAX_PULSEWIDTH = 2500;
const MOTOR_MIN_PULSEWIDTH = 500;
const ROOM_NAME = 'design-thinking';

class PiClient {
    /*
    Event:
        from socket-
            #CONNECT -> emit login
            #LOGIN_RESULT -> not emit
            #MESSAGE -> store
        from GPIO:
            #Press Play button
            #Press Sent button
    */

    static EMPTY_UNREAD_MESSAGE: string = 'EMPTY_UNREAD_MESSAGE';

    private _userName: string;
    private _userType: string;
    private _loginSuccess: boolean = false;
    private _socket: SocketIOClient.Socket;
    private _messageManager: MessageManager;
    private _eventManager: NodeJS.EventEmitter;

    private _playButton = new Gpio(27, 'in', 'both');
    private _sentButton = new Gpio(22, 'in', 'both');
    private _recordHandlerButton = new Gpio(18, 'in', 'both');
    private _motor = new PWMGpio(17, { mode: PWMGpio.OUTPUT });
    private _motorPulseWidth: number = 500;
    private _motorIncremental: number = 100;
    private _motorMoveTimeGap: number = 100;
    private _motorTimer: NodeJS.Timer;

    constructor(hostUrl, userName) {
        this._userName = userName;
        this._socket = IO(`${hostUrl}${NS_VASE}`);
        this._eventManager = new events.EventEmitter();
        this._messageManager = new MessageManager(this._socket, this._eventManager);

        this._socket.on(CONNECT, this.onConnect);
        this._socket.on(LOGIN_RESULT, this.onLoginRes);
        this._socket.on(MESSAGE, this.closeFlower);

        this._eventManager.on(PiClient.EMPTY_UNREAD_MESSAGE, this.closeFlower);
    }



    private onConnect = () => {
        console.info('connected');
        this._socket.emit(LOGIN, {
            userName: this._userName,
            roomName: ROOM_NAME
        });
    }

    private onLoginRes = (res: LoginResult) => {
        if (res.state) {
            this._userType = res.userType;
            this._loginSuccess = true;
            console.log('loginSuccess');

            this._socket.on(TEST_PI, msg => console.log(msg));
            // regist buttons
            this._playButton.watch((err, value) => {
                if (err) throw err;
                if (value === 0) {
                    this._messageManager.readMessage();
                } else {
                    console.log(value);
                }
            });

            this._sentButton.watch((err, value) => {
                if (err) throw err;
                if (value === 0) { // TODO it should be 0
                    this._messageManager.sendMesssage();
                } else {
                    console.log(value);
                }
            });

            this._recordHandlerButton.watch((err, value) => {
                if (err) throw err;
                if (value === 0) {
                    this._messageManager.recordMessage();
                } else {
                    console.log(`recordHandler ${value}`);
                }
            });
        } else {
            console.warn(res.info);
        }
    }

    private openFlower = () => {
        // from 500 to 2500
        this._motorIncremental = this._motorIncremental > 0 ? this._motorIncremental : -this._motorIncremental;
        this._motorTimer = setInterval(() => {
            if (this._motorPulseWidth >= MOTOR_MAX_PULSEWIDTH) {
                clearInterval(this._motorTimer);
            } else {
                this._motorPulseWidth += this._motorIncremental;
            }
        }, this._motorMoveTimeGap);
    }

    private closeFlower = () => {
        // from 2500 to 500
        this._motorIncremental = this._motorIncremental < 0 ? this._motorIncremental : -this._motorIncremental;
        this._motorTimer = setInterval(() => {
            if (this._motorPulseWidth <= MOTOR_MIN_PULSEWIDTH) {
                clearInterval(this._motorTimer);
            } else {
                this._motorPulseWidth += this._motorIncremental;
            }
        }, this._motorMoveTimeGap);
    }

    public clearAllGPIO = () => {
        this._playButton.unexport();
        this._sentButton.unexport();
        this._recordHandlerButton.unexport();
        this._motor.servoWrite(0);
    }
}

export default PiClient;