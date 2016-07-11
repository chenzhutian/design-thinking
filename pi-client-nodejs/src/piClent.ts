import * as IO from 'socket.io-client';
import * as onoff from 'onoff';
import MessageManager from './messageManager';

import { NS_VASE } from '../../nameSpcae.js';


interface LoginRes {
    state: boolean;
    info: string;
    userType?: string;
}

class PiClient {
    /*

    Event:
        from socket-
            #connect
            #loginResult
        from GPIO:
    */
    private _userName: string;
    private _userType: string;
    private _loginSuccess: boolean = false;
    private _socket: SocketIOClient.Socket;
    private _messageManager: MessageManager;

    constructor(hostUrl, userName) {
        this._userName = userName;
        this._socket = IO(`${hostUrl}${NS_VASE}`);
        this._messageManager = new MessageManager(this._socket);

        this._socket.on('connect', this.onConnect);
        this._socket.on('loginResult', this.onLoginRes);
    }

    private onConnect() {
        console.info('connected');
        this._socket.emit('login', {
            userName: this._userName,
            roomName: 'design-thinking'
        });
    }

    private onLoginRes(res: LoginRes) {
        if (res.state) {
            this._userType = res.userType;
            this._loginSuccess = true;
            console.log('loginSuccess');

            this._socket.on('test_pi', msg => console.log(msg));
            // regist the button
            // button.watch((err, value) => {
            //     if (value === 0) {
            //         led.writeSync(1);
            //         console.log('yes from nodejs');
            //     } else {
            //         led.writeSync(0);
            //     }
            // });
        } else {
            console.warn(res.info);
        }
    }
}

export default PiClient;