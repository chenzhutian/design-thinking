from socketIO_client import SocketIO, BaseNamespace, LoggingNamespace
import time, threading
class VaseNamespace(BaseNamespace):
    '''' 
    Attribute:
        user_type:None
        user_name:None
        login_success:False
    '''
    def __init__(self,io,path):
        self.login_success = False
        self.user_name = None
        self.user_type = None
        super(VaseNamespace, self).__init__(io,path)

    def on_connect(self):
        print('[Connected]')

    def on_test_pi(self, *args):
        print(args)

    def on_message(self, messages):
        print(messages)

    def on_unread_message(self,messages):
        pass

    def login(self,user_name):
        print('call login')
        print(user_name)
        if(user_name is None or len(user_name) == 0):
            return
        self.user_name = user_name
        self.emit('login', {
            'userName': self.user_name,
            'roomName': 'design-thinking',
        })
    
    def on_login_res(self,res):
        print(res)
        if(res['state']):
            self.user_type = res['userType']
            print(self.user_type);
        else:
            print(res['info'])

def count_to_ten():
    for i in range(10):
        print(i)
        time.sleep(1)

def main():
    with SocketIO('localhost', 18888) as socketIO:
        vase_socket = socketIO.define(VaseNamespace, '/VASE')
        print(vase_socket.login_success)
        user_name = 'daddy'
        vase_socket.login(user_name)
        count_to_ten()
        #t = threading.Thread(target=count_to_ten)
        #t.start()

        #socketIO.wait(seconds=10)
            
if __name__ == '__main__':
    main()