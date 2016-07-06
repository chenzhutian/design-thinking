export default {
    ready() {

    },
    data() {
        return {
            currentSlideIndex: 0,
            images: [],
            imagesCount: 0,
            carouselWraperStyle: { left: 0, width: 0 },
            imageStyle: {},
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
    },
};
