import MessageData from '../models/messageData';
import TextMessageData from '../models/textMessageData';

interface Message {

    filePath: string,
    roomName: string,
    userType: string,
    isRead: boolean,
    isReceived: boolean,
}

interface TextMessage {
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

function insertTextMessage(message: TextMessage, callback: (err: any, res: {}) => void) {
    const newMessage = new TextMessageData(message);
    newMessage.save(err => {
        callback(err, newMessage._id);
    });
}

// function readTextMessage(params:type) {

// }

export default {
    insertMessage,
    insertTextMessage,
}