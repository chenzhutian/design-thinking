from socketIO_client import SocketIO, BaseNamespace

class VaseNamespace(BaseNamespace):
    def on_connect(self):
        print('[Connected]')
        self.emit('login', { 'roomName': 'design-thinking' })

def main():
    with SocketIO('localhost', 18888, VaseNamespace) as socketIO:
        socket = socketIO.define(VaseNamespace, '/VASE')


if __name__ == '__main__':
    main()