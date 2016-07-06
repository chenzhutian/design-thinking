"use strict";
const Socket = require('socket.io');
const socket_const_1 = require('./socket-const');
const decay_1 = require('../decay');
var UserType;
(function (UserType) {
    UserType[UserType['parent'] = 0] = 'parent';
    UserType[UserType['child'] = 1] = 'child';
})(UserType || (UserType = {}));
;
function attachIO(server) {
    const io = Socket(server);
    const socketIdToUser = {};
    const roomNameToRooms = {};
    const rooms = [];
    const tickInterval = 1000;
    const decay = new decay_1.default(100);
    // Albumn here
    io.of(socket_const_1.NS_ALBUMN).on('connection', socket => {
        console.info('user connect');
        let roomName;
        let targetType;
        let userType;
        // login
        socket.on('login', (params) => {
            console.info(params);
            if (!params.roomName || !params.userType) {
                console.info('login failed');
                return;
            }
            roomName = params.roomName;
            userType = params.userType;
            targetType = userType === UserType.child ? UserType.parent : UserType.child;
            socketIdToUser[socket.id] = { type: userType, roomName: roomName };
            // init room if not exists
            if (!(roomName in roomNameToRooms)) {
                roomNameToRooms[roomName] = { parent: '', children: '', roomName: roomName };
            }
            roomNameToRooms[roomName][userType] = socket.id;
            rooms.push(roomNameToRooms[roomName]);
            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr)
                    throw joinRoomErr;
                console.info('join room success');
            });
        });
        // when receive message
        socket.on('moveSlides', slidesIndex => {
            const user = socketIdToUser[socket.id];
            const roomName = user && user.roomName;
            socket.in(roomName).emit('moveSlides', slidesIndex);
        });
        // socket.on('chat message', msg => {
        //     console.info(`message:${msg}`);
        //     const user = socketIdToUser[socket.id];
        //     const roomName = user && user.roomName;
        //     io.of(NS_ALBUMN).in(roomName).emit('chat message', msg);
        // });
        socket.on('disconnect', () => {
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