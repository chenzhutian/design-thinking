import mdl from 'material-design-lite/material.js';
import 'material-design-lite/src/material-design-lite.scss';


// actions
import { fetchFeatureList, fetchFeatureDataFromLocalStorage } from '../../vuex/actions';

// components
import Chart from '../Chart/Chart.vue';
import FeaturePanel from '../FeaturePanel/FeaturePanel.vue';
import config from '../../../config';

const featureListPath = __DEVELOPMENT__ ? '/static/bldg-features.csv' :
    `${config.build.assetsPublicPath}/static/bldg-features.csv`;

export default {
    vuex: {
        actions: {
            fetchFeatureList,
            fetchFeatureDataFromLocalStorage,
        },
    },
    ready() {
        mdl.upgradeDom();
        this.fetchFeatureDataFromLocalStorage();
        this.fetchFeatureList(featureListPath);
    },
    components: {
        Chart,
        FeaturePanel,
    },

};
