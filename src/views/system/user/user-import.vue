<!-- 用户导入弹窗 -->
<template>
  <el-dialog
    width="440px"
    title="导入用户"
    :visible="visible"
    :lock-scroll="false"
    :destroy-on-close="true"
    @update:visible="updateVisible">
    <el-upload
      drag
      action=""
      class="ele-block"
      v-loading="loading"
      accept=".xls,.xlsx"
      :show-file-list="false"
      :before-upload="importFile">
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">将文件拖到此处，或 <em>点击上传</em></div>
      <div class="el-upload__tip ele-text-center" slot="tip">
        <span>只能上传xls、xlsx文件，</span>
        <el-link
          download
          :href="url"
          type="primary"
          :underline="false"
          style="vertical-align: baseline;">下载模板
        </el-link>
      </div>
    </el-upload>
  </el-dialog>
</template>

<script>
import XLSX from 'xlsx';
export default {
  name: 'UserImport',
  props: {
    // 是否打开弹窗
    visible: Boolean
  },
  data() {
    return {
      // 导入请求状态
      loading: false,
      // 导入模板下载地址
      url: 'https://laratest.com/files/用户导入模板.xlsx'
    };
  },
  methods: {
    /* 上传 */
    importFile(file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, {type: 'array'});
        let sheetNames = workbook.SheetNames;
        let worksheet = workbook.Sheets[sheetNames[0]];
        // 解析成二维数组
        let aoa = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        this.$http.post('/sys/user/import', {'data':aoa}).then(res => {
          this.loading = false;
          if (res.data.code === 0) {
            this.$message({type: 'success', message: res.data.msg});
            this.updateVisible(false);
            this.$emit('done');
          } else {
            this.$message.error(res.data.msg);
          }
        }).catch(e => {
          this.loading = false;
          this.$message.error(e.message);
        });

      };
      reader.readAsArrayBuffer(file);
      return false;
    },
    /* 更新visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    }
  }
}
</script>

<style scoped>
.ele-block ::v-deep .el-upload,
.ele-block ::v-deep .el-upload-dragger {
  width: 100%;
}
</style>
