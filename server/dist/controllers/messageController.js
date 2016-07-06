"use strict";
const messageData_1 = require('../models/messageData');
function insertMessage(message, callback) {
    const newMessage = new messageData_1.default(message);
    newMessage.save((err, res) => {
        if (err)
            callback(err, res);
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    insertMessage: insertMessage,
};
//# sourceMappingURL=messageController.js.map