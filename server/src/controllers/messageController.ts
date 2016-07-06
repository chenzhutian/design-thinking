import MessageData from '../models/messageData';

interface Message {
    filePath: string,
    roomName: string,
    userType: string,
    isRead: boolean,
    isReceive: boolean,
}


function insertMessage(message: Message, callback: (err: any, res: {}) => void) {
    const newMessage = new MessageData(message);
    newMessage.save((err, res) => {
        if (err) callback(err, res);
    });
}

export default {
    insertMessage,
}