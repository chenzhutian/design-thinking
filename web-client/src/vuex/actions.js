import { ADD_SELECTED_FEATURE,
    REMOVE_SELECTED_FEATURE,
    FETCH_FEATURE_LIST_SUCCESS,
    FETCH_FEATURE_DATA_SUCCESS,
    FETCH_FEATURE_DATA_FAILURE,
    FETCH_FEATURE_DATA_FROM_LOCAL_STORAGE_SUCCESS,
} from './mutation-types';

import { csv } from 'd3';

import Vue from 'vue';
import VueResource from 'vue-resource';
Vue.use(VueResource);

const devMainUrl = __DEVELOPMENT__ ? '//localhost:10024' : '//vis.cse.ust.hk/vc-playground';
const $http = Vue.http;


// function makeAction(type) {
//     return ({ dispatch }, ...args) => dispatch(type, ...args);
// }

const fetchFeatureList = ({ dispatch }, dataPath) => {
    csv(dataPath, (err, data) => {
        if (err) throw new Error('Cannot fetch feature data');
        dispatch(FETCH_FEATURE_LIST_SUCCESS, data);
    });
};
const fetchFeatureData = ({ dispatch }, feature) => {
    const url = `${devMainUrl}/fetch/building?featureName=${feature.name}`;
    $http.get(url).then(response => {
        dispatch(FETCH_FEATURE_DATA_SUCCESS, response.data[0]);
        dispatch(ADD_SELECTED_FEATURE, feature);
    }, errResponse => {
        dispatch(FETCH_FEATURE_DATA_FAILURE, errResponse);
    });
};

const fetchFeatureDataFromLocalStorage = ({ dispatch }) => {
    const tempFeatureData = JSON.parse(localStorage.getItem('featuresData')) || {};
    Object.keys(tempFeatureData).forEach(featureName => {
        tempFeatureData[featureName].forEach(d => {
            d.date = new Date(d.date);
        });
    });
    dispatch(FETCH_FEATURE_DATA_FROM_LOCAL_STORAGE_SUCCESS, tempFeatureData);
};

const updateSelectedFeature = ({ dispatch, state }, feature) => {
    if (state.selectedFeatures.indexOf(feature) !== -1) {
        dispatch(REMOVE_SELECTED_FEATURE, feature);
    } else {
        if (feature.name in state.featuresData) {
            dispatch(ADD_SELECTED_FEATURE, feature);
        } else {
            fetchFeatureData({ dispatch }, feature);
        }
    }
};

export {
updateSelectedFeature,
fetchFeatureList,
fetchFeatureData,
fetchFeatureDataFromLocalStorage,
};
