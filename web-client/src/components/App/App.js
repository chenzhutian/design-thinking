// import mdl from 'material-design-lite/material.js';
// import 'material-design-lite/src/material-design-lite.scss';
import IO from 'socket.io-client';
// components
import Carousel from '../Carousel/Carousel.vue';

// io namspace
import { NS_ALBUM } from '../../nameSpace.js';

// event Type
import {
    CONNECT,
    LOGIN,
    LOGIN_RESULT,
} from '../../eventType.js';

import image2 from '../../assets/f1.png';
import image1 from '../../assets/f2.png';
// import image7 from '../../assets/7.jpg';
// import image8 from '../../assets/8.jpg';

export default {
    ready() {
        this.socket = new IO(NS_ALBUM);

        this.socket.on(CONNECT, () => {
            const userName = localStorage.getItem('userName');
            if (userName) {
                this.userName = userName;
                this.login();
            }
        });
        this.socket.on(LOGIN_RESULT, res => {
            if (res.state) {
                this.userType = res.userType;
                localStorage.clear();
                localStorage.setItem('userName', this.userName);
                this.loginSuccess = true;
                this.$nextTick(() => {
                    this.$refs.carousel.setData(this.images, this.userType,
                        this.userName, this.socket);
                });
            } else {
                console.warn(res.info);
            }
        });
    },
    components: {
        Carousel,
    },
    socket: null,
    data() {
        return {
            loginSuccess: false,
            userName: null,
            userType: null,
            images: [
                {
                    components: [image1, image2],
                    msg: '',
                },
                // {
                //     components: [image7, image8],
                //     msg: '',
                // },
            ],
        };
    },
    methods: {
        login() {
            if (!this.userName || !this.userName.length) return;
            this.socket.emit(LOGIN, {
                userName: this.userName,
                roomName: 'design-thinking',
            });
        },
    },
};
