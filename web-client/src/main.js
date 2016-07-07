import Vue from 'vue';
import VueTouch from 'vue-touch';
import App from './components/App/App.vue';
Vue.use(VueTouch);

/* eslint-disable no-new */

new Vue({
    el: 'body',
    components: { App },
});
