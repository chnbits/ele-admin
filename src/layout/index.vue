<!-- 框架布局 -->
<template>
  <ele-pro-layout
    ref="layout"
    :i18n="i18n"
    :tabs="user.tabs"
    :menus="user.menus"
    :home-title="homeTitle"
    :project-name="projectName"
    :hide-footers="hideFooters"
    :hide-sidebars="hideSidebars"
    :repeatable-tabs="repeatableTabs"
    :keep-alive-list="keepAliveList"
    :show-content="showContent"
    :need-setting="needSetting"
    :show-setting.sync="showSetting"
    :collapse="theme.collapse"
    :head-style="theme.headStyle"
    :side-style="theme.sideStyle"
    :layout-style="theme.layoutStyle"
    :side-menu-style="theme.sideMenuStyle"
    :body-full="theme.bodyFull"
    :fixed-body="theme.fixedBody"
    :fixed-header="theme.fixedHeader"
    :fixed-sidebar="theme.fixedSidebar"
    :logo-auto-size="theme.logoAutoSize"
    :side-unique-open="theme.sideUniqueOpen"
    :colorful-icon="theme.colorfulIcon"
    :show-footer="theme.showFooter"
    :show-tabs="theme.showTabs"
    :tab-style="theme.tabStyle"
    :weak-mode="theme.weakMode"
    :dark-mode="theme.darkMode"
    :color="theme.color"
    @logo-click="onLogoClick"
    @update-screen="updateScreen"
    @update-collapse="updateCollapse"
    @tab-add="tabAdd"
    @tab-remove="tabRemove"
    @tab-remove-all="tabRemoveAll"
    @tab-remove-left="tabRemoveLeft"
    @tab-remove-right="tabRemoveRight"
    @tab-remove-other="tabRemoveOther"
    @change-color="changeColor"
    @change-style="changeStyle">
    <!-- logo图标 -->
    <template slot="logo">
      <img src="@/assets/logo.svg" alt="logo"/>
    </template>
    <!-- 顶栏右侧区域 -->
    <template slot="right">
      <ele-header-right
        :show-setting="needSetting"
        @item-click="onItemClick"
        @change-language="changeLanguage"/>
    </template>
    <!-- 全局页脚 -->
    <template #footer>
      <ele-footer/>
    </template>
    <!-- 修改密码弹窗 -->
    <ele-password :visible.sync="showPassword"/>
  </ele-pro-layout>
</template>

<script>
import {mapGetters} from 'vuex';
import setting from '@/config/setting';
import EleHeaderRight from './header-right';
import ElePassword from './password';
import EleFooter from './footer';

export default {
  name: 'EleLayout',
  components: {
    EleHeaderRight,
    ElePassword,
    EleFooter
  },
  computed: {
    // 主页标题
    homeTitle() {
      return this.$t('layout.home');
      //return setting.homeTitle;  // 移除国际化后使用这一行
    },
    // 不显示全局页脚的路由地址
    hideFooters() {
      return setting.hideFooters;
    },
    // 不显示侧边栏的路由地址
    hideSidebars() {
      return setting.hideSidebars;
    },
    // 可重复打开页签的路由地址
    repeatableTabs() {
      return setting.repeatableTabs;
    },
    // 需要缓存的组件
    keepAliveList() {
      return setting.keepAliveList;
    },
    // 是否需要主题设置抽屉
    needSetting() {
      return setting.showSetting;
    },
    ...mapGetters(['theme', 'user'])
  },
  data() {
    return {
      // 项目名
      projectName: process.env.VUE_APP_NAME,
      // 是否显示修改密码弹窗
      showPassword: false,
      // 是否显示主题设置抽屉
      showSetting: false,
      // 是否显示主体部分, 如果首页用到了权限控制指令, 把这个改成false, 避免权限控制指令可能不生效
      showContent: true
    };
  },
  mounted() {
    // 获取用户信息
    this.getUserInfo();
  },
  methods: {
    /* 获取当前用户信息 */
    getUserInfo() {
      if (setting.userUrl) {
        this.$http.get(setting.userUrl).then((res) => {
          const result = setting.parseUser ? setting.parseUser(res.data) : res.data;
          if (result.code === 0) {
            const user = result.data;
            this.$store.dispatch('user/setUser', user);
            this.$store.dispatch('user/setRoles', user ? user.roles : null);
            this.$store.dispatch('user/setAuthorities', user ? user.authorities : null);
          } else if (result.msg) {
            this.$message.error(result.msg);
          }
          // 在用户权限信息请求完成后再渲染主体部分, 以免权限控制指令不生效
          this.showContent = true;
        }).catch((e) => {
          console.error(e);
          this.showContent = true;
          this.$message.error(e.message);
        });
      }
    },
    /* 顶栏右侧点击 */
    onItemClick(key) {
      if (key === 'password') {
        this.showPassword = true;
      } else if (key === 'setting') {
        this.showSetting = true;
      }
    },
    /* logo点击事件 */
    onLogoClick(isHome) {
      if (!isHome) {
        this.$router.push('/');
      }
    },
    /* 更新collapse */
    updateCollapse(value) {
      this.$store.dispatch('theme/set', {key: 'collapse', value: value});
    },
    /* 更新屏幕尺寸 */
    updateScreen() {
      this.$store.dispatch('theme/updateScreen');
    },
    /* 切换主题风格 */
    changeStyle(value) {
      this.$store.dispatch('theme/set', value);
    },
    /* 切换主题色 */
    changeColor(value) {
      const loading = this.$loading({lock: true, background: 'transparent'});
      this.$store.dispatch('theme/setColor', value).then(() => {
        loading.close();
      }).catch((e) => {
        console.error(e);
        loading.close();
        this.$message.error('主题加载失败');
      });
    },
    /* 添加tab */
    tabAdd(value) {
      this.$store.dispatch('user/tabAdd', value);
    },
    /* 移除tab */
    tabRemove(obj) {
      this.$store.dispatch('user/tabRemove', obj.name).then(({lastPath}) => {
        if (obj.active === obj.name) {
          this.$router.push(lastPath || '/');
        }
      });
    },
    /* 移除全部tab */
    tabRemoveAll() {
      this.$store.dispatch('user/tabRemoveAll');
    },
    /* 移除左边tab */
    tabRemoveLeft(value) {
      this.$store.dispatch('user/tabRemoveLeft', value);
    },
    /* 移除右边tab */
    tabRemoveRight(value) {
      this.$store.dispatch('user/tabRemoveRight', value);
    },
    /* 移除其它tab */
    tabRemoveOther(value) {
      this.$store.dispatch('user/tabRemoveOther', value);
    },
    /* 菜单路由国际化对应的名称 */
    i18n(path, key/*, menu*/) {
      // 参数menu即原始菜单数据, 如果需要菜单标题多语言数据从接口返回可用此参数获取对应的多语言标题
      // 例如下面这样写, 接口的菜单数据为{path: '/system/user', titles: {zh: '用户管理', en: 'User'}}
      // return menu ? menu.titles[this.$i18n.locale] : null;
      const k = 'route.' + key + '._name', title = this.$t(k);
      return title === k ? null : title;
    },
    /* 切换语言 */
    changeLanguage(lang) {
      this.$i18n.locale = lang;
      this.$refs.layout.changeLanguage();
      localStorage.setItem('i18n-lang', lang);
    }
  }
}
</script>
