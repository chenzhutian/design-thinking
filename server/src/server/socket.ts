import * as Socket from 'socket.io';
import { NS_ALBUM, NS_VASE } from './socket-const';
import Decay from '../decay';

// db
import messageController from '../controllers/messageController';
type UserType = "parent" | "child";
const PARENT = "parent";
const CHILD = "child";

interface LoginParams {
    roomName: string;
    userType: UserType;
    userName: string;
}

interface Room {
    roomName: string;
    parent: { album: string, vase: string };
    child: { album: string, vase: string };
    decayManager: Decay;
}

interface User {
    type: UserType;
    userName: string;
    roomName: string;
    album: string;
    vase: string;
}

function attachIO(server): SocketIO.Server {
    const io: SocketIO.Server = Socket(server);
    const userNameToUser: { [id: string]: User } = {};
    const roomNameToRooms: { [name: string]: Room } = {};
    const rooms: Array<Room> = [];
    const tickInterval: number = 1000;
    const decayInitvalue: number = 100;

    // Album here
    io.of(NS_ALBUM).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        // getUserType
        socket.on('getUserType', roomName => {
            const room = roomNameToRooms[roomName];
            if (room && room.parent && room.parent.album) {
                const resUser = {
                    userType: 'child',
                    userName: 'aLittleBoy'
                };
                socket.emit('userType', resUser);
                return;
            }
            socket.emit(null);
        });


        // login
        socket.on('login', (params: LoginParams) => {
            console.info(params);
            if (!params || !params.roomName || !params.userType || !params.userName) {
                console.info('login failed');
                return;
            }
            userName = params.userName;
            roomName = params.roomName;
            userType = params.userType;
            targetType = userType === CHILD ? PARENT : CHILD;

            // init room if not exists
            if (!(roomName in roomNameToRooms)) {
                const room = roomNameToRooms[roomName] = {
                    parent: { album: null, vase: null },
                    child: { album: null, vase: null },
                    roomName,
                    decayManager: new Decay(decayInitvalue)
                };
                rooms.push(room);
            }
            roomNameToRooms[roomName][userType].album = socket.id;

            // init user if not exists
            if (!(userName in userNameToUser)) {
                userNameToUser[userName] = {
                    userName: userName,
                    type: userType,
                    roomName,
                    album: null,
                    vase: null,
                };
            }
            userNameToUser[userName].album = socket.id;

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
            if (room[targetType].album) {
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
                // erase album
                room[userType].album = null;
                // if no vase also, erase user
                if (!room[userType].vase) {
                    room[userType] = null;
                    // if no targetUser also, erase room
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            console.info('user disconnected');
        });
    });

    io.of(NS_VASE).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        // login
        socket.on('login', (params: LoginParams) => {
            console.info(params);
            if (!params || !params.roomName || !params.userType || !params.userName) {
                console.info('login failed');
                return;
            }
            userName = params.userName;
            roomName = params.roomName;
            userType = params.userType;
            targetType = userType === CHILD ? PARENT : CHILD;

            // init room if not exists
            if (!(roomName in roomNameToRooms)) {
                const room = roomNameToRooms[roomName] = {
                    parent: { album: null, vase: null },
                    child: { album: null, vase: null },
                    roomName,
                    decayManager: new Decay(decayInitvalue)
                };
                rooms.push(room);
            }
            roomNameToRooms[roomName][userType].vase = socket.id;

            // init user if not exists
            if (!(userName in userNameToUser)) {
                userNameToUser[userName] = {
                    userName: userName,
                    type: userType,
                    roomName,
                    album: null,
                    vase: null,
                };
            }
            userNameToUser[userName].vase = socket.id;

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
            if (room[targetType].vase) {
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
                // erase vase
                room[userType].vase = null;
                // if no vase also, erase user
                if (!room[userType].album) {
                    room[userType] = null;
                    // if no targetUser also, erase room
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            console.info('user disconnected');
        });
    });

    const timer = setInterval(() => {
        rooms.forEach(room => {
            const decayManager = room.decayManager;
            io.of(NS_ALBUM).in(room.roomName).emit('decay', decayManager.decayOnce(tickInterval));
        })
    }, tickInterval);

    return io;
}
export { attachIO };
