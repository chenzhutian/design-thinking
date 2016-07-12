import * as Socket from 'socket.io';
import Decay from '../decay';
import * as fs from 'fs';

import { NS_ALBUM, NS_VASE } from '../nameSpace.js';
import {
    LOGIN,
    LOGIN_RESULT,
    MOVE_SLIDES,
    MESSAGE,
    SEND_MESSAGE,
    READ_MESSAGE,
    PUSH_UNREAD_MESSAGE,
    DECAY,
    TEST_PI,
} from '../eventType.js';

// db
import messageController from '../controllers/messageController';
type UserType = "parent" | "child";
type UserName = "daddy" | "boy";
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
    const loginedAlbumUser = new Set();
    const loginedVaseUser = new Set();

    // Album here
    io.of(NS_ALBUM).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        let loginSuccess = false;
        // login
        socket.on(LOGIN, (params: LoginParams) => {
            console.info(params);
            if (!params || !params.roomName || !params.userName) {
                socket.emit(LOGIN_RESULT, { state: false, info: 'no login params' });
                return;
            }
            if (params.userName !== 'daddy' && params.userName !== "boy") {
                socket.emit(LOGIN_RESULT, { state: false, info: 'wrong userName' });
                return;
            }
            if (loginedAlbumUser.has(params.userName)) {
                socket.emit(LOGIN_RESULT, { state: false, info: 'this user already login' });
                return;
            }

            userName = params.userName;
            roomName = params.roomName;
            userType = userName === "daddy" ? PARENT : CHILD;
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
            // init userType in room if not exists
            if (!(userType in roomNameToRooms[roomName])) {
                roomNameToRooms[roomName][userType] = { album: null, vase: null };
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
                socket.emit(LOGIN_RESULT, { state: true, info: 'login success', userType });
                loginSuccess = true;
                loginedAlbumUser.add(userName);
                messageController.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err) throw err;
                    if (messages.length) {
                        socket.emit(PUSH_UNREAD_MESSAGE, messages);
                    }
                });
            });
        });

        // when receive message
        socket.on(MOVE_SLIDES, slidesIndex => {
            if (!loginSuccess) return;
            if (userType === PARENT) {
                socket.in(roomName).emit(MOVE_SLIDES, slidesIndex);
            }
        });

        // sendMessage
        socket.on(SEND_MESSAGE, msg => {
            if (!loginSuccess) return;
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
                    socket.in(roomName).emit(MESSAGE, { content: msg, id: recordId });
                });
            } else {
                messageController.insertTextMessage(message, err => {
                    if (err) throw err;
                });
            }
        });

        // read message
        socket.on(READ_MESSAGE, messageId => {
            if (!loginSuccess) return;
            if (!messageId || !messageId.length) return;
            messageController.readTextMessage(messageId, (err, res) => {
                if (err) throw err;
            });
        });

        socket.on('disconnect', () => {
            if (!loginSuccess) return;
            const room = roomNameToRooms[roomName];
            if (room) {
                // erase album
                if (!room[userType]) return;
                room[userType].album = null;
                // if no vase also, erase user
                if (!room[userType].vase) {
                    delete room[userType];
                    // if no targetUser also, erase room
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            loginedAlbumUser.delete(userName);
            console.info('user disconnected');
        });
    });

    io.of(NS_VASE).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        let loginSuccess = false;
        // login
        socket.on(LOGIN, (params: LoginParams) => {
            console.info(params);
            if (!params || !params.roomName || !params.userName) {
                socket.emit(LOGIN_RESULT, { state: false, info: 'no login params' });
                return;
            }
            if (params.userName !== 'daddy' && params.userName !== "boy") {
                socket.emit(LOGIN_RESULT, { state: false, info: 'wrong userName' });
                return;
            }
            if (loginedVaseUser.has(params.userName)) {
                socket.emit(LOGIN_RESULT, { state: false, info: 'this user already login' });
                return;
            }

            userName = params.userName;
            roomName = params.roomName;
            userType = userName === "daddy" ? PARENT : CHILD;
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
            // init userType in room if not exists
            if (!(userType in roomNameToRooms[roomName])) {
                roomNameToRooms[roomName][userType] = { album: null, vase: null };
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
                socket.emit(LOGIN_RESULT, { state: true, info: 'login success', userType });
                loginSuccess = true;
                loginedVaseUser.add(userName);
                setInterval(() => {
                    socket.emit(TEST_PI, 3);
                }, 5000);
                messageController.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err) throw err;
                    if (messages.length) {
                        socket.emit(PUSH_UNREAD_MESSAGE, messages);
                    }
                });
            });
        });

        // when receive message
        socket.on(MOVE_SLIDES, slidesIndex => {
            if (!loginSuccess) return;
            if (userType === PARENT) {
                socket.in(roomName).emit(MOVE_SLIDES, slidesIndex);
            }
        });

        // sendMessage
        socket.on(SEND_MESSAGE, msg => {
            if (!loginSuccess) return;
            const room = roomNameToRooms[roomName];
            if (!room) return;
            const message = {
                content: "",
                roomName,
                userType: userType,
                isRead: false,
                isReceived: false,
            };
            if (room[targetType].vase) { // TODO remove album
                // target is connected
                message.isReceived = true;
                messageController.insertTextMessage(message, (err, recordId) => {
                    if (err) throw err;
                    socket.in(roomName).emit(MESSAGE, { buffer: msg, id: recordId });
                    const filePath = `../resource/${userType}/${recordId}`;
                    fs.writeFile(filePath, err => {
                        if (err) throw err;
                        console.info('write resource success');
                    });
                });
            } else {
                messageController.insertTextMessage(message, err => {
                    if (err) throw err;
                });
            }
        });

        // read message
        socket.on(READ_MESSAGE, messageId => {
            if (!loginSuccess) return;
            if (!messageId || !messageId.length) return;
            messageController.readTextMessage(messageId, (err, res) => {
                if (err) throw err;
            });
        });

        socket.on('disconnect', () => {
            if (!loginSuccess) return;
            const room = roomNameToRooms[roomName];
            if (room) {
                // erase vase
                if (!room[userType]) return;
                room[userType].vase = null;
                // if no vase also, erase user
                if (!room[userType].vase) {
                    delete room[userType];
                    // if no targetUser also, erase room
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            loginedVaseUser.delete(userName);
            console.info('user disconnected');
        });
    });

    const timer = setInterval(() => {
        rooms.forEach(room => {
            const decayManager = room.decayManager;
            io.of(NS_ALBUM).in(room.roomName).emit(DECAY, decayManager.decayOnce(tickInterval));
        })
    }, tickInterval);

    return io;
}
export { attachIO };
