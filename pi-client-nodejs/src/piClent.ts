import * as IO from 'socket.io-client';
import * as onoff from 'onoff';
import MessageManager from './messageManager';
import { Sound as RecordSound } from 'node-arecord';

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

    private _playButton = new Gpio(14, 'in', 'both');
    private _sentButton = new Gpio(15, 'in', 'falling');

    constructor(hostUrl, userName) {
        this._userName = userName;
        this._socket = IO(`${hostUrl}${NS_VASE}`);
        this._messageManager = new MessageManager(this._socket);

        this._socket.on(CONNECT, this.onConnect);
        this._socket.on(LOGIN_RESULT, this.onLoginRes);
    }

    private onConnect = () => {
        console.info('connected');
        this._socket.emit(LOGIN, {
            userName: this._userName,
            roomName: 'design-thinking'
        });
    }

    private onLoginRes = (res: LoginResult) => {
        if (res.state) {
            this._userType = res.userType;
            this._loginSuccess = true;
            console.log('loginSuccess');

            this._socket.on(TEST_PI, msg => console.log(msg));
            // regist the button
            this._playButton.watch((err, value) => {
                if (err) throw err;

                if (value === 0) {
                    this._messageManager.readMessage();
                } else {
                    console.log(value);

                }
            });
        } else {
            console.warn(res.info);
        }
    }
}

export default PiClient;