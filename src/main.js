/** 主入口js */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import setting from './config/setting';
import permission from '@/utils/permission';
import './config/axios-config';
import EleAdmin from 'ele-admin';
import './styles/index.scss';
import VueClipboard from 'vue-clipboard2';
import i18n from './lang';

Vue.config.productionTip = false;
Vue.prototype.$setting = setting;
Vue.use(EleAdmin, {
  size: 'medium',
  i18n: (key, value) => {
    return i18n.t(key, value);
  }
});
Vue.use(permission);
Vue.use(VueClipboard);

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app');
