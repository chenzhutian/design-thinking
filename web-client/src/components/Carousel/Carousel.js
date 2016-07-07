import IO from 'socket.io-client';

export default {
    ready() {
        this.socket = new IO('/ALBUMN');
        this.socket.emit('login', { roomName: 'design-thinking' });
        this.socket.on('moveSlides', this.setCurrentSlide);
        this.socket.on('message', this.receiveMessage);
        this.socket.on('unReadMessage', this.receiveUnReadMessage);
    },
    socket: null,
    data() {
        return {
            currentSlideIndex: 0,
            images: [],
            imagesCount: 0,
            carouselWraperStyle: { left: 0, width: 0 },
            unReadMessage: [],
        };
    },
    methods: {
        setData(images) {
            this.images = images;
            this.imagesCount = this.images.length;
            this.carouselWraperStyle.width = `${100 * this.imagesCount}%`;
        },
        setCurrentSlide(index) {
            this.currentSlideIndex = index;
            this.carouselWraperStyle.left = `${-100 * this.currentSlideIndex}%`;
        },
        moveSlides(index) {
            this.setCurrentSlide(index);
            this.socket.emit('moveSlides', index);
        },

        sendMessage() {
            this.socket.emit('sendMessage', `this is a message ${Math.random()}`);
        },
        receiveMessage(message) {
            console.log(message);
            if (message.id) {
                this.unReadMessage.push(message);
            }
        },
        readMessage() {
            const msg = this.unReadMessage.shift();
            this.socket.emit('readMessage', msg.id);
        },
        receiveUnReadMessage(messages) {
            console.log(messages);
            if (!messages) return;
            messages.forEach(this.receiveMessage);
        },
    },
};
