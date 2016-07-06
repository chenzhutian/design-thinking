import mdl from 'material-design-lite/material.js';
import 'material-design-lite/src/material-design-lite.scss';

// components
import Carousel from '../Carousel/Carousel.vue';

import image1 from '../../assets/1.jpg';
import image2 from '../../assets/2.jpg';
import image3 from '../../assets/3.jpg';
import image4 from '../../assets/4.jpg';

export default {
    ready() {
        mdl.upgradeDom();
        const images = [
            {
                img: image1,
                msg: 'Craving for more than campus food? Fortunately, you have FooPar Beta!',
            },
            {
                img: image2,
                msg: 'Try our catering service for a variety of snacks and refreshments for functions',
            },
            {
                img: image3,
                msg: 'Simply choose from our lunch selection to avoid queues in the canteens',
            },
            {
                img: image4,
                msg: "Anytime you feel like eating off-campus foods, don't hesitate to tell us.",
            },
        ];
        this.$refs.carousel.setData(images);
    },
    components: {
        Carousel,
    },
};
