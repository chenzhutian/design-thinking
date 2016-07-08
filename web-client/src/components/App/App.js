// import mdl from 'material-design-lite/material.js';
// import 'material-design-lite/src/material-design-lite.scss';
import IO from 'socket.io-client';
// components
import Carousel from '../Carousel/Carousel.vue';

import image1 from '../../assets/1-min.jpg';
import image2 from '../../assets/2-min.jpg';
import image3 from '../../assets/3-min.jpg';
import image4 from '../../assets/4-min.jpg';
import image5 from '../../assets/5-min.jpg';
import image6 from '../../assets/6-min.jpg';

export default {
    ready() {
        this.socket = new IO('/ALBUM');

        this.socket.on('connect', () => {
            this.socket.emit('getUserType', 'design-thinking');
        });

        this.socket.on('reconnect', () => {
            this.socket.emit('login', {
                roomName: 'design-thinking',
                userType: this.userType,
                userName: this.userName,
            });
        });
        this.socket.on('userType', user => {
            if (user) {
                localStorage.clear();
                localStorage.setItem('userType', user.userType);
                localStorage.setItem('userName', user.userName);
                this.userType = user.userType;
                this.userName = user.userName;
                this.hasLocalUserType = true;
                this.$nextTick(() => {
                    this.$refs.carousel.setData(this.images, this.userType,
                        this.userName, this.socket);
                });
            }
            // else {
            //     const userType = localStorage.getItem('userType');
            //     const userName = localStorage.getItem('userName');
            //     if (userType && userName) {
            //         this.userType = userType;
            //         this.userName = userName;
            //         this.hasLocalUserType = true;
            //         this.$nextTick(() => {
            //             this.$refs.carousel.setData(this.images, userType,
            //                 this.userName, this.socket);
            //         });
            //     }
            // }
        });
    },
    components: {
        Carousel,
    },
    socket: null,
    data() {
        return {
            hasLocalUserType: false,
            userName: null,
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
        setUserType(isParent) {
            if (!this.userName || !this.userName.length) return;
            const userType = isParent ? 'parent' : 'child';
            localStorage.setItem('userType', userType);
            localStorage.setItem('userName', this.userName);
            this.hasLocalUserType = true;
            this.$nextTick(() => {
                this.$refs.carousel.setData(this.images, userType, this.userName, this.socket);
            });
        },
    },
};
