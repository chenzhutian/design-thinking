import { updateSelectedFeature } from '../../vuex/actions';
export default {
    vuex: {
        getters: {
            features: state => state.featureList,
            selectedFeatures: state => state.selectedFeatures,
        },
        actions: {
            updateSelectedFeature,
        },
    },
    data() {
        return {
            featuresGroupByCategories: null,

        };
    },
    methods: {
    },
    watch: {
        features(vaule) {
            this.featuresGroupByCategories = {
                general: [],
                f1: [],
                f2: [],
                f3: [],
            };
            this.features.forEach(f => {
                this.featuresGroupByCategories[f.category].push(f);
            });
        },
    },
};
