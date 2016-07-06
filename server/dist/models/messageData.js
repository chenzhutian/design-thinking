"use strict";
const mongoose = require('mongoose');
const messageDataSchema = new mongoose.Schema({
    filePath: String,
    roomName: String,
    userType: String,
    isRead: Boolean,
    isReceive: Boolean,
}, { collection: 'message', timestamps: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('Message', messageDataSchema);
//# sourceMappingURL=messageData.js.map