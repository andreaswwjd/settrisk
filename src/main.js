// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Context from './Context'
import router from './router'
import VueSocketio from 'vue-socket.io';

Vue.use(VueSocketio, 'http://localhost:3000');

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#context',
  router,
  template: '<Context/>',
  components: { Context }
})

