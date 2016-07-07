"use strict";
const messageData_1 = require('../models/messageData');
const textMessageData_1 = require('../models/textMessageData');
function insertMessage(message, callback) {
    const newMessage = new messageData_1.default(message);
    newMessage.save(err => {
        callback(err, newMessage._id);
    });
}
function insertTextMessage(message, callback) {
    const newMessage = new textMessageData_1.default(message);
    newMessage.save(err => {
        callback(err, newMessage._id);
    });
}
function readTextMessage(id, callback) {
    textMessageData_1.default.findByIdAndUpdate(id, { isRead: true }, callback);
}
function fetchUnReadTextMessage(targetType, callback) {
    textMessageData_1.default
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    insertMessage: insertMessage,
    insertTextMessage: insertTextMessage,
    readTextMessage: readTextMessage,
    fetchUnReadTextMessage: fetchUnReadTextMessage,
};
//# sourceMappingURL=messageController.js.map