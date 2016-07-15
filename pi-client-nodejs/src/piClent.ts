import * as IO from 'socket.io-client';
import * as onoff from 'onoff';
import * as Pigpio from 'pigpio';
import MessageManager from './messageManager';
import * as RecordSound from 'node-arecord';
import * as events from 'events';

import { NS_VASE } from './nameSpace.js';
import {
    CONNECT,
    DISCONNECT,
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
const MOTOR_MAX_PULSEWIDTH = 2000;
const MOTOR_MIN_PULSEWIDTH = 900;
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



    private _userName: string;
    private _userType: string;
    private _loginSuccess: boolean = false;
    private _socket: SocketIOClient.Socket;
    private _messageManager: MessageManager;
    private _eventManager: NodeJS.EventEmitter;

    private _sendOrPlayButton = new Gpio(22, 'in', 'falling');
    private _recordHandlerButton = new Gpio(27, 'in', 'both');
    private _motor = new PWMGpio(23, { mode: PWMGpio.OUTPUT });
    private _motorPulseWidth: number = 1100;
    private _motorIncremental: number = 50;
    private _motorMoveTimeGap: number = 200;
    private _motorTimer: NodeJS.Timer;

    constructor(hostUrl, userName) {
        this._userName = userName;
        this._socket = IO(`${hostUrl}${NS_VASE}`);
        this._eventManager = new events.EventEmitter();
        this._messageManager = new MessageManager(this._socket, this._eventManager);

        this._socket.on(CONNECT, this.onConnect);
        this._socket.on(DISCONNECT, this.onDisconnect);
        this._socket.on(LOGIN_RESULT, this.onLoginRes);
        this._socket.on(MESSAGE, this.closeFlower);

        this._eventManager.on(MessageManager.EMPTY_UNREAD_MESSAGE, this.openFlower);
    }

    private onDisconnect = ()=>{
        console.info('disconnect');
        this._socket.off(TEST_PI);
        this._sendOrPlayButton.unwatch();
        this._recordHandlerButton.unwatch();
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
            // regist buttons
            this._sendOrPlayButton.watch((err, value) => {
                if (err) {
                    console.log(err);
                    return ;
                }
                console.log(`sentButton ${value}`);
                if (value === 0) {
                    this._messageManager.sendOrPlayMesssage();
                }
            });

            this._recordHandlerButton.watch((err, value) => {
                if (err){
                    console.log(err);
                    return;
                }
                console.log(`recordHandler ${value}`);
                if (value === 0) {
                    this._messageManager.recordMessage(true);
                }else{
                    this._messageManager.recordMessage(false);
                }
            });
        } else {
            console.warn(res.info);
        }
    }

    private openFlower = () => {
        // from 900 to 2000
        this._motorIncremental = this._motorIncremental > 0 ? this._motorIncremental : -this._motorIncremental;
        this._motorTimer = setInterval(() => {
            if (this._motorPulseWidth >= MOTOR_MAX_PULSEWIDTH) {
                clearInterval(this._motorTimer);
            } else {
                console.log(this._motorPulseWidth);
                this._motorPulseWidth += this._motorIncremental;
                this._motor.servoWrite(this._motorPulseWidth);
            }
        }, this._motorMoveTimeGap);
    }

    private closeFlower = () => {
        // from 2000 to 900
        console.log('try close the flower');
        this._motorIncremental = this._motorIncremental < 0 ? this._motorIncremental : -this._motorIncremental;

        this._motorTimer = setInterval(() => {
            if (this._motorPulseWidth <= MOTOR_MIN_PULSEWIDTH) {
                clearInterval(this._motorTimer);
            } else {
                console.log(this._motorPulseWidth);
                this._motorPulseWidth += this._motorIncremental;
                this._motor.servoWrite(this._motorPulseWidth);
            }
        }, this._motorMoveTimeGap);
    }

    public clearAllGPIO = () => {
        this._sendOrPlayButton.unexport();
        this._recordHandlerButton.unexport();
        this._motor.servoWrite(0);
    }
}

export default PiClient;