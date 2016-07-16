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


const RESOURCE_PATH = './resource';

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
                console.error('no login params');
                return;
            }
            if (params.userName !== 'daddy' && params.userName !== "boy") {
                socket.emit(LOGIN_RESULT, { state: false, info: 'wrong userName' });
                console.error('wrong username');
                return;
            }
            if (loginedAlbumUser.has(params.userName)) {
                const user = userNameToUser[params.userName];
                io.sockets.connected[user.album] && io.sockets.connected[user.album].disconnect();
                // socket.emit(LOGIN_RESULT, { state: false, info: 'this user already login' });
                console.error('this user already login, but I just disconnect him');
                // return;
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
                if (joinRoomErr) {
                    console.error(joinRoomErr);
                    socket.emit(LOGIN_RESULT, { state: false, info: 'join room failed' });
                    return;
                }
                console.info('join room success');
                // emit login success
                socket.emit(LOGIN_RESULT, { state: true, info: 'login success', userType });
                loginSuccess = true;
                loginedAlbumUser.add(userName);
            });
        });

        // when receive message
        socket.on(MOVE_SLIDES, slidesIndex => {
            if (!loginSuccess) return;
            if (userType === PARENT) {
                socket.in(roomName).emit(MOVE_SLIDES, slidesIndex);
            }
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
            loginSuccess = false;
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
                if (joinRoomErr) {
                    console.error(joinRoomErr);
                    socket.emit(LOGIN_RESULT, { state: false, info: 'join room failed' });
                    return;
                }
                console.info('join room success');
                // emit login success
                socket.emit(LOGIN_RESULT, { state: true, info: 'login success', userType });
                loginSuccess = true;
                loginedVaseUser.add(userName);

                //fetch unread messsages
                messageController.fetchUnReadMessage(targetType, (err, messages) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    if (messages.length) {
                        for (let i = 0, len = messages.length; i < len; ++i) {
                            const msg = messages[i];
                            const filePath = `${RESOURCE_PATH}/${targetType}/${msg.id}.wav`;
                            try {
                                fs.accessSync(filePath);
                                const buffer = fs.readFileSync(filePath);
                                msg.buffer = buffer;
                            } catch (err) {
                                msg.buffer = new Buffer('');
                            }
                        }
                        socket.emit(PUSH_UNREAD_MESSAGE, messages);
                    }
                });
            });
        });

        // sendMessage
        socket.on(SEND_MESSAGE, msg => {
            if (!loginSuccess) return;
            const room = roomNameToRooms[roomName];
            if (!room) return;
            const message = {
                roomName,
                userType: userType,
                isRead: false,
                isReceived: false,
            };
            if (userType === CHILD) {
                room.decayManager.childSendMessage(10 * 1000);
            }
            console.log('send message try to detect targetType');
            if (room[targetType] && room[targetType].vase) {
                // target is connected
                console.log('ready to insertMessage');
                messageController.insertMessage(message, (err, recordId) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    socket.in(roomName).emit(MESSAGE, { buffer: msg.buffer, id: recordId });
                    message.isReceived = true;
                    const filePath = `${RESOURCE_PATH}/${userType}/${recordId}.wav`;
                    fs.writeFile(filePath, msg.buffer, err => {
                        if (err) {
                            console.error(err.message);
                            console.error(err.stack);
                        } else {
                            console.info('write resource success');
                        }
                    });
                });
            } else {
                messageController.insertMessage(message, (err, recordId) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    const filePath = `${RESOURCE_PATH}/${userType}/${recordId}.wav`;
                    fs.writeFile(filePath, msg.buffer, err => {
                        if (err) {
                            console.error(err.message);
                            console.error(err.stack);
                        } else {
                            console.info('write resource success');
                        }
                    });
                });
            }
        });

        // read message
        socket.on(READ_MESSAGE, messageId => {
            if (!loginSuccess) return;
            if (!messageId || !messageId.length) return;
            const room = roomNameToRooms[roomName];
            if (!room) return;
            if (userType === CHILD) {
                room.decayManager.childReadMessage(10 * 1000);
            }
            messageController.readMessage(messageId, (err, res) => {
                if (err) {
                    console.error(err);
                }
            });
        });

        socket.on('disconnect', () => {
            if (!loginSuccess) return;
            const room = roomNameToRooms[roomName];
            if (room) {
                // erase vase
                if (!room[userType]) return;
                room[userType].vase = null;
                // if no album also, erase user
                if (!room[userType].album) {
                    delete room[userType];
                    // if no targetUser also, erase room
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            loginSuccess = false;
            loginedVaseUser.delete(userName);
            console.info('user disconnected');
        });
    });

    const timer = setInterval(() => {
        rooms.forEach(room => {
            if (!room || !room.child || !room.child.album) return;
            const decayManager = room.decayManager;
            io.of(NS_ALBUM).to(room.child.album).emit(DECAY, decayManager.decayOnce(tickInterval));
        });
    }, tickInterval);

    return io;
}
export { attachIO };
