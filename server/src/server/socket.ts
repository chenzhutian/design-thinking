const Socket = require('socket.io');
const myRoomName = 'Aroom';
function attachIO(server):SocketIO.Server {
    const io = new Socket(server);
    io.of('/test').on('connection', socket => {
        console.info('a user connected');
        // login
        socket.on('login', roomName => {
            console.info(roomName);
            if (roomName !== myRoomName) return;
            socket.join(roomName, joinRoomErr => {
                if (joinRoomErr) throw joinRoomErr;
                console.info('join room success');
            });
        });

        socket.on('chat message', msg => {
            console.info(`message:${msg}`);
            io.of('/test').in(myRoomName).emit('chat message', msg);
        });

        socket.on('disconnect', () => {
            console.info('user disconnected');
        });
    });

    return io;
}

export { attachIO };
