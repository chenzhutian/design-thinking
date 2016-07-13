import * as fs from 'fs';
import MessageData from '../models/messageData';

interface Message {
    content: string,
    roomName: string,
    userType: string,
    isRead: boolean,
    isReceived: boolean,
}

function insertMessage(message: Message, callback: (err: any, res: {}) => void) {
    const newMessage = new MessageData(message);
    newMessage.save(err => {
        callback(err, newMessage._id);
    });
}

function readMessage(id: string, callback: (err: any, res: {}) => void) {
    MessageData.findByIdAndUpdate(id, { isRead: true }, callback);
}

function fetchUnReadMessage(targetType: string, callback: (err, res) => void) {
    MessageData
        .find({
            userType: targetType,
            isReceived: false
        })
        .exec((err, messages) => {
            const contents = [];
            if (!err) {
                for (let i = 0, len = messages.length; i < len; ++i) {
                    messages[i]['isReceived'] = true;
                    contents.push({ content: messages[i]['content'], id: messages[i]['_id'] });
                    messages[i].save();
                }
            }
            callback(err, contents);
        });
}

export default {
    insertMessage,
    readMessage,
    fetchUnReadMessage,
}