import * as mongoose from 'mongoose';

const messageDataSchema = new mongoose.Schema({
    filePath: String,
    roomName: String,
    userType: String,
    isRead: Boolean,
    isReceive: Boolean,
}, { collection: 'message', timestamps: true });

export default mongoose.model('Message', messageDataSchema);