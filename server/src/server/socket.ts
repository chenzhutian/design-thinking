const Socket = require('socket.io');
import { NS_ALBUMN} from './socket-const';

enum UserType { 'parent', 'child' };
interface LoginParams {
    roomName: string;
    userType: UserType;
}

interface Room {
    roomName: string;
    parent: string;
    children: string;
}

interface User {
    type: UserType;
    roomName: string;
}


function attachIO(server): SocketIO.Server {
    const io: SocketIO.Server = new Socket(server);
    const socketIdToUser: { [id: string]: User } = {};
    const roomNameToRooms: { [name: string]: Room } = {};
    const rooms: Array<Room> = [];

    // Albumn here
    io.of(NS_ALBUMN).on('connection', socket => {
        console.info('user connect');
        let roomName;
        let targetType;
        let userType;
        // login
        socket.on('login', (params: LoginParams) => {
            console.info(params);
            if (!params.roomName || !params.userType) {
                console.info('login failed');
                return;
            }
            roomName = params.roomName;
            userType = params.userType;
            targetType = userType === UserType.child ? UserType.parent : UserType.child;

            socketIdToUser[socket.id] = { type: userType, roomName };

            // init room if not exists
            if (!(roomName in roomNameToRooms)) {
                roomNameToRooms[roomName] = { parent: '', children: '', roomName };
            }
            roomNameToRooms[roomName][userType] = socket.id;
            rooms.push(roomNameToRooms[roomName]);

            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr) throw joinRoomErr;
                console.info('join room success');
            });
        });

        // when receive message
        socket.on('chat message', msg => {
            console.info(`message:${msg}`);
            const user = socketIdToUser[socket.id];
            const roomName = user && user.roomName;

            io.of(NS_ALBUMN).in(roomName).emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.info('user disconnected');
        });
    });

    let count = 0;
    setInterval(() => {
        rooms.forEach(room => {
            io.of(NS_ALBUMN).in(room.roomName).emit('chat message', ++count);
        })
    }, 1000);

    return io;
}
export { attachIO };
