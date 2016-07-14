"use strict";
const messageData_1 = require('../models/messageData');
function insertMessage(message, callback) {
    const newMessage = new messageData_1.default(message);
    newMessage.save(err => {
        callback(err, newMessage._id);
    });
}
function readMessage(id, callback) {
    messageData_1.default.findByIdAndUpdate(id, { isRead: true }, callback);
}
function fetchUnReadMessage(targetType, callback) {
    messageData_1.default
        .find({
        userType: targetType,
        isReceived: false
    })
        .exec((err, messages) => {
        const contents = [];
        if (!err) {
            for (let i = 0, len = messages.length; i < len; ++i) {
                messages[i]['isReceived'] = true;
                contents.push({ id: messages[i]['_id'] });
                messages[i].save();
            }
        }
        callback(err, contents);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    insertMessage: insertMessage,
    readMessage: readMessage,
    fetchUnReadMessage: fetchUnReadMessage,
};
//# sourceMappingURL=messageController.js.map