from socketIO_client import SocketIO, BaseNamespace
class VaseNamespace(BaseNamespace):
    # user_type
    # user_name

    def on_connect(self):
        print('[Connected]')
        self.emit('getUserType', 'design-thinking')
        
    def on_reconnect(self):
        self.emit('login', { 'roomName': 'design-thinking',
                            'userType':self.user_type,
                            'userName':self.user_name })

    def on_user_type(self, user):
        if(user):
            self.user_type = user.user_type
            self.user_name = user.user_name

    def on_test_pi(self, *args):
        print(args)

    def on_message(self, messages):
        print(messages)

    def on_unread_message(self,messages):
        pass

    def login():
        if(self.userName is None or len(self.userName) == 0):
            return
        self.socket.emit('login', {
            userName: this.userName,
            roomName: 'design-thinking',
        })

def main():
    with SocketIO('localhost', 18888, VaseNamespace) as socketIO:
        vase_socket = socketIO.define(VaseNamespace, '/VASE')
        raw_input_A = raw_input("raw_input: ")
        vase_socket.emit('sendMessage',raw_input_A)
        userName = input
        socketIO.wait()

if __name__ == '__main__':
    main()