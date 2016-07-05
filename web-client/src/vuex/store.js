import Vue from 'vue';
import Vuex from 'vuex';
import { ADD_SELECTED_FEATURE,
    REMOVE_SELECTED_FEATURE,
    FETCH_FEATURE_LIST_SUCCESS,
    FETCH_FEATURE_DATA_SUCCESS,
    FETCH_FEATURE_DATA_FAILURE,
    FETCH_FEATURE_DATA_FROM_LOCAL_STORAGE_SUCCESS,
} from './mutation-types';
Vue.use(Vuex);

const state = {
    selectedFeatures: [],
    featuresData: null,
    featureList: null,
};

const mutations = {
    [ADD_SELECTED_FEATURE](pstate, feature) {
        pstate.selectedFeatures.push(feature);
    },
    [REMOVE_SELECTED_FEATURE](pstate, feature) {
        pstate.selectedFeatures.$remove(feature);
    },
    [FETCH_FEATURE_LIST_SUCCESS](pstate, featureList) {
        // Object.keys(pstate.featuresData).forEach(featureName => {
        //     for (let i = 0, len = featureList.length; i < len; ++i) {
        //         if (featureList[i].name === featureName) {
        //             featureList[i].data = true;
        //             break;
        //         }
        //     }
        // });
        pstate.featureList = featureList;
    },
    [FETCH_FEATURE_DATA_SUCCESS](pstate, featureData) {
        if (!pstate.featuresData) pstate.featuresData = {};
        featureData.data.forEach(d => {
            d.date = new Date(d.date);
        });
        pstate.featuresData[featureData.featureName] = featureData.data;
        localStorage.setItem('featuresData', JSON.stringify(pstate.featuresData));
    },
    [FETCH_FEATURE_DATA_FAILURE](pstate, errResponse) {
        // console.log(errResponse);
    },
    [FETCH_FEATURE_DATA_FROM_LOCAL_STORAGE_SUCCESS](pstate, featuresData) {
        pstate.featuresData = featuresData;
    },
};

export default new Vuex.Store({ state, mutations });
