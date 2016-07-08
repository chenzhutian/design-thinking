from socketIO_client import SocketIO, BaseNamespace, LoggingNamespace, SocketIONamespace

class Namespace(BaseNamespace):
    def on_connect(self):
        print('[Connected]')

def main():
    
    with SocketIO('localhost', 18888, Namespace) as socketIO:
        # namespace = socketIO.define(Namespace, '/ALBUMN')
        socketIO.wait(seconds=1)
        print 'a'

if __name__ == '__main__':
    main()