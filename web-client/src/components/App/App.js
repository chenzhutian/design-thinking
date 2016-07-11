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

import image1 from '../../assets/1-min.jpg';
import image2 from '../../assets/2-min.jpg';
import image3 from '../../assets/3-min.jpg';
import image4 from '../../assets/4-min.jpg';
import image5 from '../../assets/5-min.jpg';
import image6 from '../../assets/6-min.jpg';

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
                    components: [image1],
                    msg: 'Craving for more thanately, you have FooPar Beta!',
                },
                {
                    components: [image2],
                    msg: 'Try our catering ety of snacks and refreshments for functions',
                },
                {
                    components: [image3],
                    msg: 'Simply choose ion to avoid queues in the canteens',
                },
                {
                    components: [image4],
                    msg: "Anytime you feampus foods, don't hesitate to tell us.",
                },
                {
                    components: [image6, image5],
                    msg: '',
                },
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
