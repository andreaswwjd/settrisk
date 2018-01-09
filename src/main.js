// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Context from './Context'
import router from './router'
import VueSocketio from 'vue-socket.io';

// Vue.use(VueSocketio, 'https://socket.settrisk.se:53001');
// Vue.use(VueSocketio, 'http://192.168.1.177:53001', {secure: true});
Vue.use(VueSocketio, 'http://127.0.0.1:53001', {secure: true});

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#context',
  router,
  template: '<Context/>',
  components: { Context }
})

