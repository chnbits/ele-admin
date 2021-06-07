/**
 * 路由配置
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '@/store';
import setting from '@/config/setting';
import EleLayout from '@/layout';
import {menuToRoutes} from 'ele-admin';
import NProgress from 'nprogress';

Vue.use(VueRouter);

// 静态路由
const routes = [
  {
    path: '/login',
    component: () => import('@/views/login/login'),
    meta: {title: '登录'}
  },
  {
    path: '/forget',
    component: () => import('@/views/login/forget'),
    meta: {title: '忘记密码'}
  },
  {
    path: '*',
    component: () => import('@/views/exception/404')
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'  // 把这个删掉就是hash模式
});

// 路由守卫
router.beforeEach((to, from, next) => {
  NProgress.start();
  updateTitle(to);
  // 判断是否登录
  if (setting.takeToken()) {
    // 判断是否已经注册动态路由
    if (!store.state.user.menus) {
      // 获取动态路由
      store.dispatch('user/getMenus').then(({menus, home}) => {
        // menuToRoutes方法是把菜单数据转换路由数据格式, 并会过滤掉重复的path, 详细说明到文档中查看
        router.addRoute({
          name: '/',
          path: '/',
          component: EleLayout,
          redirect: setting.homePath || home,
          children: menuToRoutes(menus, (component) => import('@/views' + component))
        });
        next({...to, replace: true});
      }).catch(() => {
        next();
      });
    } else {
      next();
    }
  } else if (setting.whiteList.indexOf(to.path) !== -1) {
    next();  // 在无需登录的白名单内
  } else {
    // 未登录跳转登录页面
    next({path: '/login', query: to.path === '/' ? {} : {from: to.path}});
  }
});

router.afterEach(() => {
  setTimeout(() => {
    NProgress.done(true);
  }, 300);
});

export default router;

/**
 * 更新浏览器标题
 * @param route 路由
 */
function updateTitle(route) {
  let names = [];
  if (route && route.meta && route.meta.title) {
    names.push(route.meta.title);
  }
  const appName = process.env.VUE_APP_NAME;
  if (appName) {
    names.push(appName);
  }
  document.title = names.join(' - ');
}
