<!-- 用户编辑弹窗 -->
<template>
  <el-dialog width="400px" :visible="visible" :lock-scroll="false" :destroy-on-close="true" custom-class="ele-dialog-form" @close="closeDiag(false)" :title="'新建文件夹'">
    <el-form ref="form" :model="form" :rules="rules" label-width="100px">
      <el-row >
        <el-col :sm="24">
          <el-form-item label="文件夹名:" prop="filename">
            <el-input clearable v-model="form.filename" placeholder="请输入文件夹名称" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'FileEdit',
  props: {
    // 弹窗是否打开
    visible: Boolean,

    filePath: String
  },
  data() {
    return {
      // 表单数据
      form: {
        filename: '',
        path:''
      },
      // 表单验证规则
      rules: {
        filename: [
          {required: true, message: '请输入文件夹名', trigger: 'blur'}
        ],
      },
      // 提交状态
      loading: false,
    };
  },
  beforeUpdate() {
    this.getFilePath()
  },
  methods: {
    getFilePath(){
      this.form.path = this.filePath
    },
    /* 保存编辑 */
    save() {
      this.loading = true;
      this.$http.post('/file/create', this.form).then(res => {
        this.loading = false;
        if (res.data.code === 0) {
          this.$message({type: 'success', message: res.data.msg});
          this.updateVisible(false);
          this.form.filename = '';
          this.$emit('done');
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        this.loading = false;
        this.$message.error(e.message);
      });
    },
    /* 更新visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    },
    closeDiag(done){
      this.updateVisible(done);
    }
  },
}

</script>

<style scoped>
</style>
