"use strict";
class MessageManager {
    constructor(socket) {
        this._socket = socket;
        this._socket.on('message', this.receiveMessage);
        this._socket.on('unReadMessage', this.receiveUnreadMessages);
    }
    receiveMessage(message) {
        if (message.id) {
            this._unReadMessage.push(message);
        }
    }
    receiveUnreadMessages(messages) {
        if (!messages)
            return;
        messages.forEach(this.receiveMessage);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MessageManager;
//# sourceMappingURL=messageManager.js.map