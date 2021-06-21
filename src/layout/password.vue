<!-- 修改密码弹窗 -->
<template>
  <el-dialog
    :visible="visible"
    title="修改密码"
    width="400px"
    @closed="onClose"
    @update:visible="updateVisible"
    :append-to-body="true"
    :lock-scroll="false">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="82px"
      @keyup.enter.native="save">
      <el-form-item
        label="旧密码:"
        prop="old">
        <el-input
          v-model="form.old"
          placeholder="请输入旧密码"
          show-password/>
      </el-form-item>
      <el-form-item
        label="新密码:"
        prop="password">
        <el-input
          v-model="form.password"
          placeholder="请输入新密码"
          show-password/>
      </el-form-item>
      <el-form-item
        label="确认密码:"
        prop="password2">
        <el-input
          v-model="form.password2"
          placeholder="请再次输入新密码"
          show-password/>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button
        @click="cancel">取消
      </el-button>
      <el-button
        type="primary"
        @click="save">确定
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ElePassword',
  props: {
    visible: Boolean
  },
  data() {
    let rePswRule = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };
    return {
      // 表单数据
      form: {
        old: '',
        password: '',
        password2: ''
      },
      // 表单验证
      rules: {
        old: [
          {required: true, message: '请输入旧密码', trigger: 'blur'}
        ],
        password: [
          {required: true, message: '请输入新密码', trigger: 'blur'}
        ],
        password2: [
          {validator: rePswRule, trigger: 'blur'}
        ]
      },
      // 按钮loading
      loading: false
    };
  },
  methods: {
    /* 保存修改 */
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http.put('/main/password', {'oldPsw':this.form.old,'newPsw':this.form.password}).then(res => {
            this.loading = false;
            if (res.data.code === 0) {
              this.$message({type: 'success', message: res.data.msg});
              this.cancel();
              this.$alert('密码已更改，请重新登录！',{type: 'warning'}).then(()=>{
                this.$store.dispatch('user/removeToken').then(() => {
                  location.replace('/login');  // 这样跳转避免再次登录重复注册动态路由
                })
              })
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(e => {
            this.loading = false;
            this.$message.error(e.message);
          });
        } else {
          return false;
        }
      });
    },
    /* 取消 */
    cancel() {
      this.updateVisible(false);
    },
    /* 关闭回调 */
    onClose() {
      this.form = {};
      this.$refs['form'].resetFields();
      this.loading = false;
    },
    /* 修改visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    }
  }
}
</script>
