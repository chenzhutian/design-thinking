from socketIO_client import SocketIO, BaseNamespace

class VaseNamespace(BaseNamespace):
    def on_connect(self):
        print('[Connected]')
        #self.emit('login', { 'roomName': 'design-thinking',
        #                    'userType':'parent',
        #                    'userName':'daddy' })

    def on_test_pi(self, *args):
        print(args)

def main():
    with SocketIO('localhost', 18888, VaseNamespace) as socketIO:
        socket = socketIO.define(VaseNamespace, '/VASE')
        socketIO.wait(True)


if __name__ == '__main__':
    main()