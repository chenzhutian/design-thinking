import * as mongoose from 'mongoose';

const textMessageDataSchema = new mongoose.Schema({
    content: String,
    roomName: String,
    userType: String,
    isRead: Boolean,
    isReceived: Boolean
}, { collection: 'textMessage', timestamps: true });

export default mongoose.model('TextMessage', textMessageDataSchema);