// import * as IO from 'socket.io-client';
import * as fs from 'fs';
import * as PlaySound from 'node-aplay';
import * as RecordSound from 'node-arecord';
import * as events from 'events';
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
    static EMPTY_UNREAD_MESSAGE: string = 'EMPTY_UNREAD_MESSAGE';

    private _eventManager: NodeJS.EventEmitter;
    private _socket: SocketIOClient.Socket;

    private _unReadMessage: Array<Message>;
    private _receivedMessageFileList: Array<string>;
    private _sentMessageFileList: Array<string>;

    private _isPlaying: boolean = false;
    private _isRecording: boolean = false;
    private _recordTimeoutGap: number = 1500;
    private _recordTimer: NodeJS.Timer;
    private _recordSound: Sound;

    constructor(socket: SocketIOClient.Socket, eventManager: NodeJS.EventEmitter) {
        this._socket = socket;
        this._eventManager = eventManager;

        this._unReadMessage = [];
        // init received message files
        fs.readdir(RECEIVED_MESSAGE_PATH, (err, files) => {
            this._receivedMessageFileList = files.filter(file => file !== '.gitkeep').map(file => `${RECEIVED_MESSAGE_PATH}/${file}`);
        });
        // init sent message files
        fs.readdir(SENT_MESSAGE_PATH, (err, files) => {
            this._sentMessageFileList = files.filter(file => file !== '.gitkeep').map(file => `${SENT_MESSAGE_PATH}/${file}`);
        });
        this._socket.on(MESSAGE, this.receiveMessage);
        this._socket.on(PUSH_UNREAD_MESSAGE, this.receiveUnreadMessages);
    }

    public recordMessage = (begin = true) => {
        this._isRecording = begin;
        if (this._isRecording) {
            clearTimeout(this._recordTimer);
            if (this._recordSound) return;
            this._recordSound = new RecordSound({
                destination_folder: SENT_MESSAGE_PATH,
                filename: TEMP_RECORD_FILE
            });
            this._recordSound.on('complete', () => {
                this._recordSound = null;
                console.info('finish recording');
            });
            console.info('ready to record');
            this._recordSound.record();
            console.info('begin to record');
        } else {
            this._recordTimer = setTimeout(() => {
                if (!this._recordSound) return;
                this._recordSound.stop();
            }, this._recordTimeoutGap);
        }
    }

    public sendMesssage = () => {
        if (this._isPlaying) return;
        fs.access(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, err => {
            if (err) {
                if (this._sentMessageFileList.length === 0) return;
                const fileName = this._sentMessageFileList.shift();
                const sound = new PlaySound(fileName);
                this._isPlaying = true;
                sound.play();
                sound.on('complete', () => {
                    this._isPlaying = false;
                });
                this._sentMessageFileList.push(fileName);
            } else {
                const fileName = `${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`;
                fs.readFile(fileName, (err, file) => {
                    if (err) throw err;
                    try {
                        const newFileName = `${SENT_MESSAGE_PATH}/sm${this._sentMessageFileList.length}.wav`;
                        this._sentMessageFileList.push(newFileName);
                        console.log('now we want to send a file');
                        console.log(file.length);
                        this._socket.emit(SEND_MESSAGE, { content: '', buffer: file });
                        fs.rename(fileName, newFileName);
                    } catch (renameErr) {
                        console.error(renameErr);
                    }
                });
            }
        });
    }

    private receiveMessage = (message: RawMessage) => {
        if (message.id) {
            this._unReadMessage.push({
                id: message.id,
                content: message.content
            });
            const fileName = `${RECEIVED_MESSAGE_PATH}/${message.id}-unread.wav`;
            fs.writeFile(fileName, message.buffer, err => {
                if (err) throw err;
                this._receivedMessageFileList.push(fileName);
            });
        }
    }

    private receiveUnreadMessages = (messages: Array<RawMessage>) => {
        if (!messages) return;
        messages.forEach(this.receiveMessage);
    }

    public readMessage = () => {
        if (this._isPlaying) return;
        console.log('unread message');
        console.log(this._unReadMessage);

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
            if (this._unReadMessage.length === 0) {
                console.info('emit empty unread_message');
                this._eventManager.emit(MessageManager.EMPTY_UNREAD_MESSAGE);
            }
        } else {
            console.log(this._receivedMessageFileList);
            if (this._receivedMessageFileList.length === 0) return;
            const fileName = this._receivedMessageFileList.shift();
            const sound = new PlaySound(fileName);
            this._isPlaying = true;
            sound.play();
            sound.on('complete', () => {
                this._isPlaying = false;
                console.info('complete playing');
            });
            this._receivedMessageFileList.push(fileName);
        }
    }
}
