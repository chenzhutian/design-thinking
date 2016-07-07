"use strict";
const Socket = require('socket.io');
const socket_const_1 = require('./socket-const');
const decay_1 = require('../decay');
const messageController_1 = require('../controllers/messageController');
const PARENT = "parent";
const CHILD = "child";
function attachIO(server) {
    const io = Socket(server);
    const socketIdToUser = {};
    const roomNameToRooms = {};
    const rooms = [];
    const tickInterval = 1000;
    const decay = new decay_1.default(100);
    io.of(socket_const_1.NS_ALBUMN).on('connection', socket => {
        console.info('user connect');
        let roomName;
        let targetType;
        let userType;
        socket.on('login', (params) => {
            console.info(params);
            if (!params.roomName) {
                console.info('login failed');
                return;
            }
            roomName = params.roomName;
            if (!params.userType) {
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: socket.id, child: '', roomName: roomName };
                    userType = PARENT;
                    targetType = CHILD;
                }
                else {
                    const room = roomNameToRooms[roomName];
                    if (!room.child) {
                        room.child = socket.id;
                        userType = CHILD;
                        targetType = PARENT;
                    }
                    else {
                        room.parent = socket.id;
                        userType = PARENT;
                        targetType = CHILD;
                    }
                }
            }
            else {
                userType = params.userType;
                targetType = userType === CHILD ? PARENT : CHILD;
                if (!(roomName in roomNameToRooms)) {
                    roomNameToRooms[roomName] = { parent: '', child: '', roomName: roomName };
                }
                roomNameToRooms[roomName][userType] = socket.id;
            }
            socketIdToUser[socket.id] = { type: userType, roomName: roomName };
            rooms.push(roomNameToRooms[roomName]);
            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr)
                    throw joinRoomErr;
                console.info('join room success');
                messageController_1.default.fetchUnReadTextMessage(targetType, (err, messages) => {
                    if (err)
                        throw err;
                    console.info(messages);
                    if (messages.length) {
                        socket.emit('unReadMessage', messages);
                    }
                });
            });
        });
        socket.on('moveSlides', slidesIndex => {
            if (userType === PARENT) {
                console.info('move');
                socket.in(roomName).emit('moveSlides', slidesIndex);
            }
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
            if (room[targetType]) {
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
                room[userType] = null;
            }
            console.info('user disconnected');
        });
    });
    setInterval(() => {
        rooms.forEach(room => {
            io.of(socket_const_1.NS_ALBUMN).in(room.roomName).emit('chat message', decay.decayOnce(tickInterval));
        });
    }, tickInterval);
    return io;
}
exports.attachIO = attachIO;
//# sourceMappingURL=socket.js.map