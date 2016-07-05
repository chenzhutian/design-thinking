import Vue from 'vue';
import App from './components/App/App.vue';

// store
import store from './vuex/store';

/* eslint-disable no-new */

new Vue({
    el: 'body',
    components: { App },
    store,
});
