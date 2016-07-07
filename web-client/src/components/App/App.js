// import mdl from 'material-design-lite/material.js';
import 'material-design-lite/src/material-design-lite.scss';

// components
import Carousel from '../Carousel/Carousel.vue';

import image1 from '../../assets/1.jpg';
import image2 from '../../assets/2.jpg';
import image3 from '../../assets/3.jpg';
import image4 from '../../assets/4.jpg';
import image5 from '../../assets/5.jpg';
import image6 from '../../assets/6.jpg';

export default {
    ready() {
        const images = [
            {
                components: [image1],
                msg: 'Craving for more than campus food? Fortunately, you have FooPar Beta!',
            },
            {
                components: [image2],
                msg: 'Try our catering service for a variety of snacks and refreshments for functions',
            },
            {
                components: [image3],
                msg: 'Simply choose from our lunch selection to avoid queues in the canteens',
            },
            {
                components: [image4],
                msg: "Anytime you feel like eating off-campus foods, don't hesitate to tell us.",
            },
            {
                components: [image6, image5],
                msg: '',
            },
        ];
        this.$refs.carousel.setData(images);
    },
    components: {
        Carousel,
    },
};
