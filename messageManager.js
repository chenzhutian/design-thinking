"use strict";
const fs = require('fs');
const PlaySound = require('node-aplay');
const RecordSound = require('node-arecord');
const eventType_js_1 = require('./eventType.js');
const SENT_MESSAGE_PATH = './resource/sent';
const RECEIVED_MESSAGE_PATH = './resource/received';
const TEMP_RECORD_FILE = 'temp.wav';
class MessageManager {
    constructor(socket, eventManager) {
        this._isPlaying = false;
        this._isRecording = false;
        this._recordTimeoutGap = 500;
        this.recordMessage = () => {
            if (this._isRecording) {
                clearTimeout(this._recordTimer);
            }
            else {
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
        };
        this.sendMesssage = () => {
            if (this._isPlaying)
                return;
            fs.access(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, err => {
                if (err) {
                    const fileName = this._sentMessageFileList.shift();
                    const sound = new PlaySound(fileName);
                    this._isPlaying = true;
                    sound.play();
                    sound.on('complete', () => {
                        this._isPlaying = false;
                    });
                    this._sentMessageFileList.push(fileName);
                }
                else {
                    fs.readFile(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, (err, file) => {
                        if (err)
                            throw err;
                        this._socket.emit(eventType_js_1.SEND_MESSAGE, { content: '', buffer: file });
                        const newFileName = `${SENT_MESSAGE_PATH}/sm${this._sentMessageFileList.length}.wav`;
                        fs.rename(`${SENT_MESSAGE_PATH}/${TEMP_RECORD_FILE}`, newFileName);
                        this._sentMessageFileList.push(newFileName);
                    });
                }
            });
        };
        this.receiveMessage = (message) => {
            if (message.id) {
                this._unReadMessage.push({
                    id: message.id,
                    content: message.content
                });
                fs.writeFile(`${RECEIVED_MESSAGE_PATH}/${message.id}-unread.wav`, message.buffer, err => {
                    if (err)
                        throw err;
                    this._receivedMessageFileList.push(`${message.id}-unread.wav`);
                });
            }
        };
        this.receiveUnreadMessages = (messages) => {
            if (!messages)
                return;
            messages.forEach(this.receiveMessage);
        };
        this.readMessage = () => {
            if (this._isPlaying)
                return;
            if (this._unReadMessage.length) {
                const msg = this._unReadMessage.shift();
                const fileName = `${RECEIVED_MESSAGE_PATH}/${msg.id}-unread.wav`;
                const sound = new PlaySound(fileName);
                this._isPlaying = true;
                sound.play();
                sound.on('complete', () => {
                    const newFileName = `${RECEIVED_MESSAGE_PATH}/${msg.id}.wav`;
                    const fileIdx = this._receivedMessageFileList.indexOf(fileName);
                    this._receivedMessageFileList[fileIdx] = newFileName;
                    fs.rename(fileName, newFileName);
                    this._isPlaying = false;
                });
                this._socket.emit(eventType_js_1.READ_MESSAGE, msg.id);
                if (this._unReadMessage.length == 0) {
                    this._eventManager.emit('emptyUnReadMessage');
                }
            }
            else {
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
        };
        this._socket = socket;
        this._eventManager = eventManager;
        this._unReadMessage = [];
        fs.readdir(RECEIVED_MESSAGE_PATH, (err, files) => {
            this._receivedMessageFileList = files.map(file => `${RECEIVED_MESSAGE_PATH}/${file}`);
        });
        fs.readdir(SENT_MESSAGE_PATH, (err, files) => {
            this._sentMessageFileList = files.map(file => `${SENT_MESSAGE_PATH}/${file}`);
        });
        this._socket.on(eventType_js_1.MESSAGE, this.receiveMessage);
        this._socket.on(eventType_js_1.PUSH_UNREAD_MESSAGE, this.receiveUnreadMessages);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MessageManager;
//# sourceMappingURL=messageManager.js.map