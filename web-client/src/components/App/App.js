import mdl from 'material-design-lite/material.js';
import 'material-design-lite/src/material-design-lite.scss';

// components
import Carousel from '../Carousel/Carousel.vue';


export default {
    ready() {
        mdl.upgradeDom();
        const images = [
            {
                img: 'http://acmedia365.com/wp-content/uploads/2016/02/201009101513590430.jpg',
                msg: 'Craving for more than campus food? Fortunately, you have FooPar Beta!',
            },
            {
                img: 'https://wallpaperscraft.com/image/salad_vegetables_greens_healthy_food_20779_1024x768.jpg',
                msg: 'Try our catering service for a variety of snacks and refreshments for functions',
            },
            {
                img: 'http://myhealthydish.com/wp-content/uploads/2015/07/healthy-foods-1024x768.jpg',
                msg: 'Simply choose from our lunch selection to avoid queues in the canteens',
            },
            {
                img: 'http://www.wallcoo.net/photography/sz189-at-the-Table/wallpapers/1024x768/foods-on-table-HV038_350A_wallcoo.com.jpg',
                msg: "Anytime you feel like eating off-campus foods, don't hesitate to tell us.",
            },
        ];
        this.$refs.carousel.setData(images);
    },
    components: {
        Carousel,
    },
};
