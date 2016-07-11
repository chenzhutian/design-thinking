// import * as IO from 'socket.io-client';
import * as fs from 'fs';
import {Sound as PlaySound } from 'node-aplay';
import {Sound as RecordSound} from 'node-arecord';
import {
    MESSAGE,
    PUSH_UNREAD_MESSAGE,
    READ_MESSAGE,
    SEND_MESSAGE,
} from './eventType.js';

/**
 * MessageManager
 */
interface Message {
    id: string;
    content: string;
}

interface RawMessage extends Message {
    buffer: Buffer;
}

const SENT_MESSAGE_PATH = './resource/sent';
const RECEIVED_MESSAGE_PATH = './resource/received';
const TEMP_RECORD_FILE = 'temp.wav';
export default class MessageManager {
    private _unReadMessage: Array<Message>;
    private _receivedMessageFileList: Array<string>;
    private _sentMessageFileList: Array<string>;
    private _socket: SocketIOClient.Socket;
    private _isPlaying: boolean = false;

    private _isRecording: boolean = false;
    private _recordTimeoutGap: number = 500;
    private _recordTimer: NodeJS.Timer;
    private _recordSound: RecordSound;

    constructor(socket: SocketIOClient.Socket) {
        // init received message files
        fs.readdir(RECEIVED_MESSAGE_PATH, (err, files) => {
            this._receivedMessageFileList = files;
        });
        // init sent message files
        fs.readdir(SENT_MESSAGE_PATH, (err, files) => {
            this._sentMessageFileList = files;
        });

        this._socket = socket;
        this._socket.on(MESSAGE, this.receiveMessage);
        this._socket.on(PUSH_UNREAD_MESSAGE, this.receiveUnreadMessages);
    }

    public recordMessage = () => {
        if (this._isRecording) {
            // +0.5s
            clearTimeout(this._recordTimer);
        } else {
            if (this._recordSound) {
                throw new Error('record sound should be null');
            }
            this._recordSound = new RecordSound({
                destination_folder: SENT_MESSAGE_PATH,
                filename: TEMP_RECORD_FILE
            });
            this._recordSound.record();
            this._isRecording = true;
        }
        this._recordTimer = setTimeout(() => {
            this._recordSound = null;
            this._isRecording = false;
        }, this._recordTimeoutGap);
    }

    public sendMesssage = () => {
        if (this._isPlaying) return;
        if (fs.exists(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`)) {
            fs.readFile(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, (err, file) => {
                if (err) throw err;
                this._socket.emit(SEND_MESSAGE, file);
                const newFileName = `${SENT_MESSAGE_PATH}/sm${this._sentMessageFileList.length}.wav`;
                fs.rename(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, newFileName);
                this._sentMessageFileList.push(newFileName);
            });
        } else {
            const fileName = this._sentMessageFileList.shift();
            const sound = new PlaySound(fileName);
            this._isPlaying = true;
            sound.play();
            sound.on('complete', () => {
                this._isPlaying = false;
            });
            this._sentMessageFileList.push(fileName);
        }
    }

    private receiveMessage = (message: RawMessage) => {
        if (message.id) {
            this._unReadMessage.push({
                id: message.id,
                content: message.content
            });
            fs.writeFile(`${RECEIVED_MESSAGE_PATH}/${message.id}-unread.wav`, message.buffer, err => {
                if (err) throw err;
                this._receivedMessageFileList.push(`${message.id}-unread.wav`);
            });
        }
    }

    private receiveUnreadMessages = (messages: Array<RawMessage>) => {
        if (!messages) return;
        messages.forEach(this.receiveMessage);
    }

    public readMessage = () => {
        if (this._isPlaying) return;
        if (this._unReadMessage.length) {
            const msg = this._unReadMessage.shift();
            const fileName = `${RECEIVED_MESSAGE_PATH}/${msg.id}-unread.wav`;
            const sound = new PlaySound(fileName);
            this._isPlaying = true;
            sound.play();
            sound.on('complete', () => {
                // rename
                const newFileName = `${RECEIVED_MESSAGE_PATH}/${msg.id}.wav`;
                const fileIdx = this._receivedMessageFileList.indexOf(fileName);
                this._receivedMessageFileList[fileIdx] = newFileName;
                fs.rename(fileName, newFileName);
                this._isPlaying = false;
            });
            this._socket.emit(READ_MESSAGE, msg.id);
        } else {
            const fileName = this._receivedMessageFileList.shift();
            const sound = new PlaySound(fileName);
            this._isPlaying = true;
            sound.play();
            sound.on('complete', () => {
                this._isPlaying = false;
            });
            this._receivedMessageFileList.push(fileName);
        }
    }
}
