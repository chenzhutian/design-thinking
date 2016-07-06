import IO from 'socket.io-client';

export default {
    ready() {
        this.socket = new IO('/ALBUMN');
        this.socket.emit('login', this.loginParams);
        this.socket.on('moveSlides', this.setCurrentSlide);
    },
    socket: null,
    data() {
        return {
            currentSlideIndex: 0,
            images: [],
            imagesCount: 0,
            carouselWraperStyle: { left: 0, width: 0 },
            imageStyle: {},
            loginParams: { userType: 'parent', roomName: 'designThinking' },
        };
    },
    methods: {
        setData(images) {
            this.images = images;
            this.imagesCount = this.images.length;
            this.carouselWraperStyle.width = `${100 * this.imagesCount}%`;
        },
        moveSlides(index) {
            this.setCurrentSlide(index);
            this.socket.emit('moveSlides', index);
        },
        setCurrentSlide(index) {
            this.currentSlideIndex = index;
            this.carouselWraperStyle.left = `${-100 * this.currentSlideIndex}%`;
        },

    },
};
