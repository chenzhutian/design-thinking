"use strict";
const Socket = require('socket.io');
const socket_const_1 = require('./socket-const');
const decay_1 = require('../decay');
const messageController_1 = require('../controllers/messageController');
const PARENT = "parent";
const CHILD = "child";
function attachIO(server) {
    const io = Socket(server);
    const userNameToUser = {};
    const roomNameToRooms = {};
    const rooms = [];
    const tickInterval = 1000;
    const decayInitvalue = 100;
    const loginUser = new Set();
    io.of(socket_const_1.NS_ALBUM).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        let loginSuccess = false;
        socket.on('login', (params) => {
            console.info(params);
            if (!params || !params.roomName || !params.userName) {
                socket.emit('login_res', { state: false, info: 'no login params' });
                return;
            }
            if (params.userName !== 'daddy' && params.userName !== "boy") {
                console.info('login_res', { state: false, info: 'wrong userName' });
                return;
            }
            if (loginUser.has(userName)) {
                console.info('login_res', { state: false, info: 'this user already login' });
                return;
            }
            userName = params.userName;
            roomName = params.roomName;
            userType = userName === "daddy" ? PARENT : CHILD;
            targetType = userType === CHILD ? PARENT : CHILD;
            if (!(roomName in roomNameToRooms)) {
                const room = roomNameToRooms[roomName] = {
                    parent: { album: null, vase: null },
                    child: { album: null, vase: null },
                    roomName: roomName,
                    decayManager: new decay_1.default(decayInitvalue)
                };
                rooms.push(room);
            }
            if (!(userType in roomNameToRooms[roomName])) {
                roomNameToRooms[roomName][userType] = { album: null, vase: null };
            }
            roomNameToRooms[roomName][userType].album = socket.id;
            if (!(userName in userNameToUser)) {
                userNameToUser[userName] = {
                    userName: userName,
                    type: userType,
                    roomName: roomName,
                    album: null,
                    vase: null,
                };
            }
            userNameToUser[userName].album = socket.id;
            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr)
                    throw joinRoomErr;
                console.info('join room success');
                socket.emit('login_res', { state: true, info: 'login success', userType: userType });
                loginSuccess = true;
                loginUser.add(userName);
                messageController_1.default.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err)
                        throw err;
                    if (messages.length) {
                        socket.emit('unReadMessage', messages);
                    }
                });
            });
        });
        socket.on('moveSlides', slidesIndex => {
            if (!loginSuccess)
                return;
            if (userType === PARENT) {
                socket.in(roomName).emit('moveSlides', slidesIndex);
            }
        });
        socket.on('sendMessage', msg => {
            if (!loginSuccess)
                return;
            const room = roomNameToRooms[roomName];
            if (!room)
                return;
            const message = {
                content: msg,
                roomName: roomName,
                userType: userType,
                isRead: false,
                isReceived: false,
            };
            if (room[targetType].album) {
                message.isReceived = true;
                messageController_1.default.insertTextMessage(message, (err, recordId) => {
                    if (err)
                        throw err;
                    socket.in(roomName).emit('message', { content: msg, id: recordId });
                });
            }
            else {
                messageController_1.default.insertTextMessage(message, err => {
                    if (err)
                        throw err;
                });
            }
        });
        socket.on('readMessage', messageId => {
            if (!loginSuccess)
                return;
            if (!messageId || !messageId.length)
                return;
            messageController_1.default.readTextMessage(messageId, (err, res) => {
                if (err)
                    throw err;
            });
        });
        socket.on('disconnect', () => {
            if (!loginSuccess)
                return;
            const room = roomNameToRooms[roomName];
            if (room) {
                if (!room[userType])
                    return;
                room[userType].album = null;
                if (!room[userType].vase) {
                    delete room[userType];
                    if (!room[targetType]) {
                        delete roomNameToRooms[roomName];
                    }
                }
            }
            console.info('user disconnected');
        });
    });
    io.of(socket_const_1.NS_VASE).on('connection', socket => {
        console.info('user connect');
        let userName;
        let roomName;
        let targetType;
        let userType;
        socket.emit('test_pi', 'yes');
        socket.on('getUserType', roomName => {
            const room = roomNameToRooms[roomName];
            if (room && room.parent && room.parent.vase) {
                const resUser = {
                    userType: 'child',
                    userName: 'aLittleBoy'
                };
                socket.emit('userType', resUser);
                return;
            }
            socket.emit('userType', null);
        });
        socket.on('login', (params) => {
            console.info(params);
            if (!params || !params.roomName || !params.userType || !params.userName) {
                console.info('login failed');
                return;
            }
            userName = params.userName;
            roomName = params.roomName;
            userType = params.userType;
            targetType = userType === CHILD ? PARENT : CHILD;
            if (!(roomName in roomNameToRooms)) {
                const room = roomNameToRooms[roomName] = {
                    parent: { album: null, vase: null },
                    child: { album: null, vase: null },
                    roomName: roomName,
                    decayManager: new decay_1.default(decayInitvalue)
                };
                rooms.push(room);
            }
            if (!(userType in roomNameToRooms[roomName])) {
                roomNameToRooms[roomName][userType] = { album: null, vase: null };
            }
            roomNameToRooms[roomName][userType].vase = socket.id;
            if (!(userName in userNameToUser)) {
                userNameToUser[userName] = {
                    userName: userName,
                    type: userType,
                    roomName: roomName,
                    album: null,
                    vase: null,
                };
            }
            userNameToUser[userName].vase = socket.id;
            console.log(userNameToUser[userName]);
            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr)
                    throw joinRoomErr;
                console.info('join room success');
                messageController_1.default.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err)
                        throw err;
                    if (messages.length) {
                        socket.emit('unReadMessage', messages);
                    }
                });
            });
        });
        socket.on('sendMessage', msg => {
            const room = roomNameToRooms[roomName];
            if (!room)
                return;
            const message = {
                content: msg,
                roomName: roomName,
                userType: userType,
                isRead: false,
                isReceived: false,
            };
            console.log(room);
            if (room[targetType].album) {
                message.isReceived = true;
                messageController_1.default.insertTextMessage(message, (err, recordId) => {
                    if (err)
                        throw err;
                    console.log(msg);
                    io.of(socket_const_1.NS_ALBUM).in(roomName).emit('message', { content: msg, id: recordId });
                    io.of(socket_const_1.NS_VASE).in(roomName).emit('message', { content: msg, id: recordId });
                });
            }
            else {
                messageController_1.default.insertTextMessage(message, err => {
                    if (err)
                        throw err;
                });
            }
        });
        socket.on('readMessage', messageId => {
            if (!messageId || !messageId.length)
                return;
            messageController_1.default.readTextMessage(messageId, (err, res) => {
                if (err)
                    throw err;
            });
        });
        socket.on('disconnect', () => {
            const room = roomNameToRooms[roomName];
            if (room) {
                if (!room[userType])
                    return;
                room[userType].vase = null;
                if (!room[userType].vase) {
                    delete room[userType];
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
            io.of(socket_const_1.NS_ALBUM).in(room.roomName).emit('decay', decayManager.decayOnce(tickInterval));
        });
    }, tickInterval);
    return io;
}
exports.attachIO = attachIO;
//# sourceMappingURL=socket.js.map