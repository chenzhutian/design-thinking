import * as IO from 'socket.io-client';

/**
 * MessageManager
 */
interface Message {
    id: string;
    content: string;
}

export default class MessageManager {
    private _unReadMessage: Array<Message>;
    private _socket: SocketIOClient.Socket;

    constructor(socket: SocketIOClient.Socket) {
        this._socket = socket;
        this._socket.on('message', this.receiveMessage);
        this._socket.on('unReadMessage', this.receiveUnreadMessages);
    }

    private receiveMessage(message: Message) {
        if (message.id) {
            this._unReadMessage.push(message);
        }
    }

    private receiveUnreadMessages(messages: Array<Message>) {
        if (!messages) return;
        messages.forEach(this.receiveMessage);
    }
}
