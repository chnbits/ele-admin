<template>
  <div class="ele-body">
    <el-card shadow="never" header="基本信息">
      <el-form v-loading="loading" size="mini" label-width="100px" class="ele-form-detail">
        <el-form-item label="账号:">
          <div class="ele-text-secondary">{{ user.username }}</div>
        </el-form-item>
        <el-form-item label="用户名:">
          <div class="ele-text-secondary">{{ user.nickname }}</div>
        </el-form-item>
        <el-form-item label="性别:">
          <div class="ele-text-secondary">{{ user.sexName }}</div>
        </el-form-item>
        <el-form-item label="手机号:">
          <div class="ele-text-secondary">{{ user.phone }}</div>
        </el-form-item>
        <el-form-item label="角色:">
          <div class="ele-text-secondary">
            <el-tag
              v-for="item in user.roles"
              :key="item.roleId"
              size="mini"
              type="primary"
              :disable-transitions="true">
              {{ item.roleName }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="创建时间:">
          <div class="ele-text-secondary">{{ $util.toDateString(user.createTime) }}</div>
        </el-form-item>
        <el-form-item label="状态:">
          <div class="ele-text-secondary">
            <ele-dot v-if="user.state === 0" text="正常"/>
            <ele-dot v-else type="danger" :ripple="false" text="冻结"/>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SystemUserInfo',
  data() {
    return {
      user: {},
      loading: true
    };
  },
  mounted() {
    this.query(this.$route.query.id);
  },
  methods: {
    /* 查询用户信息 */
    query(id) {
      if (!id) {
        return;
      }
      this.loading = true;
      this.$http.get('/sys/user/' + id).then((res) => {
        this.loading = false;
        if (res.data.code === 0) {
          this.user = res.data.data;
          // 修改页签标题
          this.$store.dispatch('user/tabSetTitle', {
            fullPath: this.$route.fullPath,
            title: this.user.nickname + '的信息'
          });
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((e) => {
        this.loading = false;
        this.$message.error(e.message);
      });
    }
  },
  watch: {
    $route() {
      this.query(this.$route.query.id);
    }
  }
}
</script>

<style scoped>
</style>
