<!-- 角色编辑弹窗 -->
<template>
  <el-dialog :title="isUpdate?'修改标签':'添加标签'" :visible="visible" width="400px" :destroy-on-close="true" :lock-scroll="false" @update:visible="updateVisible">
    <el-form ref="form" :model="form" :rules="rules" label-width="82px">
      <el-form-item label="标签名称:" prop="name">
        <el-input v-model="form.name" placeholder="请输入标签名称" clearable/>
      </el-form-item>
      <el-form-item label="标签备注:">
        <el-input v-model="form.desc" placeholder="请输入备注" :rows="4" type="textarea"/>
      </el-form-item>
      <el-form-item label="标签状态:">
        <el-switch v-if="form.state!=null" v-model="form.state" active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0"></el-switch>
        <el-switch v-if="form.state==null" v-model="state" active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button type="primary" @click="save" :loading="loading">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'tags-edit',
  props: {
    // 弹窗是否打开
    visible: Boolean,
    // 修改回显的数据
    data: Object
  },
  data() {
    return {
      // 表单数据
      form: Object.assign({}, this.data),
      // 表单验证规则
      rules: {
        name: [
          {required: true, message: '请输入标签名称', trigger: 'blur'}
        ],
      },
      // 提交状态
      loading: false,
      // 是否是修改
      isUpdate: false,

      state:1
    };
  },
  watch: {
    data() {
      if (this.data) {
        this.form = Object.assign({}, this.data);
        this.isUpdate = true;
      } else {
        this.form = {};
        this.isUpdate = false;
      }
    }
  },
  methods: {
    /* 保存编辑 */
    save() {
      // console.log(this.form.state)
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http[this.isUpdate ? 'put' : 'post']('/article/tags', this.form).then(res => {
            this.loading = false;
            if (res.data.code === 0) {
              this.$message({type: 'success', message: res.data.msg});
              if (!this.isUpdate) {
                this.form = {};
              }
              this.updateVisible(false);
              this.$emit('done');
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
    /* 更新visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    }
  }
}
</script>

<style scoped>
</style>
