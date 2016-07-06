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
    const decay = new Decay(100);

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
            // init room if not exists
            if (!params.userType) {
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: socket.id, child: '', roomName };
                    userType = PARENT;
                    targetType = CHILD;
                } else {
                    roomNameToRooms[roomName].child = socket.id;
                    userType = CHILD;
                    targetType = PARENT;
                }
            } else {
                userType = params.userType;
                targetType = userType === CHILD ? PARENT : CHILD;

                // init room if not exists
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: '', child: '', roomName };
                }
                roomNameToRooms[roomName][userType] = socket.id;
            }

            socketIdToUser[socket.id] = { type: userType, roomName };
            rooms.push(roomNameToRooms[roomName]);

            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr) throw joinRoomErr;
                console.info('join room success');
            });
        });

        // when receive message
        socket.on('moveSlides', slidesIndex => {
            const user = socketIdToUser[socket.id];
            const roomName = user && user.roomName;
            if (user.type === PARENT) {
                console.info('move');
                socket.in(roomName).emit('moveSlides', slidesIndex);
            }
        });

        // sendMessage
        socket.on('sendMessage', msg => {
            const user = socketIdToUser[socket.id];
            const roomName = user && user.roomName;
            const room = roomNameToRooms[roomName];
            const message = {
                content: msg,
                roomName,
                userType: user.type,
                isRead: false,
                isReceived: false,
            };
            const targetType = userType === CHILD ? PARENT : CHILD;
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
        socket.on('message', msgIndex => {
            const user = socketIdToUser[socket.id];
            const roomName = user && user.roomName;
            console.log(msgIndex);
        });

        socket.on('disconnect', () => {
            const user = socketIdToUser[socket.id];
            if (user) {
                const roomName = user.roomName;
                const userType = user.type;
                const room = roomNameToRooms[roomName];
                room[userType] = null;
            }

            console.info('user disconnected');
        });
    });

    setInterval(() => {
        rooms.forEach(room => {
            io.of(NS_ALBUMN).in(room.roomName).emit('chat message', decay.decayOnce(tickInterval));
        })
    }, tickInterval);

    return io;
}
export { attachIO };
