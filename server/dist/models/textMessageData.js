"use strict";
const mongoose = require('mongoose');
const textMessageDataSchema = new mongoose.Schema({
    content: String,
    roomName: String,
    userType: String,
    isRead: Boolean,
    isReceived: Boolean
}, { collection: 'textMessage', timestamps: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mongoose.model('TextMessage', textMessageDataSchema);
//# sourceMappingURL=textMessageData.js.map