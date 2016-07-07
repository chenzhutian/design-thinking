import IO from 'socket.io-client';
import Hammer from 'hammerjs';
export default {
    ready() {
        this.socket = new IO('/ALBUMN');
        this.socket.on('connect', () => {
            this.socket.emit('login', { roomName: 'design-thinking' });
        });
        this.socket.on('moveSlides', this.setCurrentSlide);
        this.socket.on('message', this.receiveMessage);
        this.socket.on('unReadMessage', this.receiveUnReadMessage);
        this.socket.on('decay', this.handleDecay);
        this.hammer = new Hammer(this.$els.wraper);
        this.hammer.on('swipeleft swiperight panleft panright panend pancancel',
            this.hammerHandler);
    },
    socket: null,
    hammer: null,
    data() {
        return {
            currentSlideIndex: 0,
            images: [],
            imagesCount: 0,
            wraperTransition: { transition: true },
            carouselWraperStyle: { left: '0%', width: 0 },
            slideWidth: 0,
            unReadMessage: [],
            panBoundaryRatio: 0.25, // if the pane is paned .25, switch to the next pane.
        };
    },
    methods: {
        setData(images) {
            this.images = images;
            this.imagesCount = this.images.length;
            this.carouselWraperStyle.width = `${100 * this.imagesCount}%`;
            this.$nextTick(() => {
                this.slideWidth = this.$els.wraper.clientWidth / this.imagesCount;
            });
        },
        setCurrentSlide(index) {
            this.currentSlideIndex = index;
            this.carouselWraperStyle.left = `${-100 * this.currentSlideIndex}%`;
        },
        moveSlides(index, doTransition = true) {
            this.wraperTransition.transition = doTransition;
            this.$nextTick(() => {
                this.setCurrentSlide(index);
            });
            this.socket.emit('moveSlides', index);
        },
        sendMessage() {
            this.socket.emit('sendMessage', `this is a message ${Math.random()}`);
        },
        receiveMessage(message) {
            if (message.id) {
                this.unReadMessage.push(message);
            }
        },
        readMessage() {
            const msg = this.unReadMessage.shift();
            this.socket.emit('readMessage', msg.id);
        },
        receiveUnReadMessage(messages) {
            if (!messages) return;
            messages.forEach(this.receiveMessage);
        },
        handleDecay(value) {
            console.log(value);
        },
        hammerHandler(e) {
            switch (e.type) {
                case 'swipeleft':
                case 'swiperight':
                    this.handleSwipe(e);
                    break;
                case 'panleft':
                case 'panright':
                case 'panend':
                case 'pancancel':
                    this.handlePan(e);
                    break;
                default: break;
            }
        },
        handleSwipe(e) {
            switch (e.direction) {
                case 4: {
                    if (this.currentSlideIndex > 0) {
                        --this.currentSlideIndex;
                    }
                    break;
                }
                case 2: {
                    if (this.currentSlideIndex < this.imagesCount - 1) {
                        ++this.currentSlideIndex;
                    }
                    break;
                }
                default: break;
            }
            this.moveSlides(this.currentSlideIndex);
            this.hammer.stop(true);
        },
        handlePan(e) {
            switch (e.type) {
                case 'panleft':
                case 'panright': {
                    // Slow down at the first and last pane.
                    const left = this.carouselWraperStyle.left.slice(0, -1);
                    const maxLeft = (this.imagesCount - 1) * 100;
                    if ((this.currentSlideIndex === 0 && left >= 0) ||
                        (this.currentSlideIndex === this.imagesCount - 1 && left <= maxLeft)) {
                        e.deltaX *= 0.2;
                    }
                    this.wraperTransition.transition = false;
                    this.carouselWraperStyle.left = `${-100 * (this.currentSlideIndex -
                        e.deltaX / this.slideWidth)}%`;
                    break;
                }
                case 'panend':
                case 'pancancel': {
                    if (Math.abs(e.deltaX) > this.slideWidth * this.panBoundaryRatio) {
                        if (e.deltaX > 0) {
                            if (this.currentSlideIndex > 0) {
                                --this.currentSlideIndex;
                            }
                        } else {
                            if (this.currentSlideIndex < this.imagesCount - 1) {
                                ++this.currentSlideIndex;
                            }
                        }
                    }
                    this.moveSlides(this.currentSlideIndex);
                    break;
                }
                default: break;
            }
        },
    },
};
