import * as Socket from 'socket.io';
import { NS_ALBUMN} from './socket-const';
import Decay from '../decay';

// db
import messageController from '../controllers/messageController';
type UserType = "parent" | "child";
const PARENT = "parent";
const CHILD = "child";

interface LoginParams {
    roomName: string;
    userType: UserType;
}

interface Room {
    roomName: string;
    parent: string;
    child: string;
    decayManager: Decay;
}

interface User {
    type: UserType;
    roomName: string;
}

function attachIO(server): SocketIO.Server {
    const io: SocketIO.Server = Socket(server);
    const socketIdToUser: { [id: string]: User } = {};
    const roomNameToRooms: { [name: string]: Room } = {};
    const rooms: Array<Room> = [];
    const tickInterval: number = 1000;
    const decayInitvalue: number = 100;

    // Albumn here
    io.of(NS_ALBUMN).on('connection', socket => {
        console.info('user connect');

        let roomName;
        let targetType;
        let userType;
        // login
        socket.on('login', (params: LoginParams) => {
            console.info(params);
            if (!params.roomName) {
                console.info('login failed');
                return;
            }
            roomName = params.roomName;

            if (!params.userType) {
                // init room if not exists
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: socket.id, child: '', roomName, decayManager: new Decay(decayInitvalue) };
                    userType = PARENT;
                    targetType = CHILD;
                } else {
                    const room = roomNameToRooms[roomName];
                    if (!room.child) {
                        room.child = socket.id;
                        userType = CHILD;
                        targetType = PARENT;
                    } else {
                        room.parent = socket.id;
                        userType = PARENT;
                        targetType = CHILD;
                    }
                }
            } else {
                userType = params.userType;
                targetType = userType === CHILD ? PARENT : CHILD;

                // init room if not exists
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: '', child: '', roomName, decayManager: new Decay(decayInitvalue) };
                }
                roomNameToRooms[roomName][userType] = socket.id;
            }

            socketIdToUser[socket.id] = { type: userType, roomName };
            rooms.push(roomNameToRooms[roomName]);

            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr) throw joinRoomErr;
                console.info('join room success');
                messageController.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err) throw err;
                    if (messages.length) {
                        socket.emit('unReadMessage', messages);
                    }
                });
            });
        });

        // when receive message
        socket.on('moveSlides', slidesIndex => {
            if (userType === PARENT) {
                socket.in(roomName).emit('moveSlides', slidesIndex);
            }
        });

        // sendMessage
        socket.on('sendMessage', msg => {
            const room = roomNameToRooms[roomName];
            if (!room) return;
            const message = {
                content: msg,
                roomName,
                userType: userType,
                isRead: false,
                isReceived: false,
            };
            if (room[targetType]) {
                // target is connected
                message.isReceived = true;
                messageController.insertTextMessage(message, (err, recordId) => {
                    if (err) throw err;
                    socket.in(roomName).emit('message', { content: msg, id: recordId });
                });
            } else {
                messageController.insertTextMessage(message, err => {
                    if (err) throw err;
                });
            }
        });

        // read message
        socket.on('readMessage', messageId => {
            if (!messageId || !messageId.length) return;
            messageController.readTextMessage(messageId, (err, res) => {
                if (err) throw err;
            });
        });

        socket.on('disconnect', () => {
            const room = roomNameToRooms[roomName];
            if (room) {
                room[userType] = null;
            }
            console.info('user disconnected');
        });
    });

    const timer = setInterval(() => {
        rooms.forEach(room => {
            const decayManager = room.decayManager;
            io.of(NS_ALBUMN).in(room.roomName).emit('decay', decayManager.decayOnce(tickInterval));
        })
    }, tickInterval);

    return io;
}
export { attachIO };
