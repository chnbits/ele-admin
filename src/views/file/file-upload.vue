<template>
  <el-dialog  width="480px" :visible="visible" :lock-scroll="false" :destroy-on-close="true" custom-class="ele-dialog-form" @close="closeDiag(false)" :title="'批量上传'">
    <el-row style="padding-bottom: 20px">
        <el-col :sm="24">
          <el-upload
            class="FileUpload"
            ref="upload"
            action="#"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :file-list="fileList"
            :auto-upload="false"
            multiple
            list-type="picture">
            <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-col>
      </el-row>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      fileList: [],
      files:[]
    };
  },
  props:{
    visible:Boolean,
    filePath:String
  },
  methods: {
    submitUpload() {
      let that = this;
      let param = new FormData();
      let config = {headers: {
        "Content-Type": "multipart/form-data"
      }}
      if (that.fileList.length>0){
          that.fileList.forEach(function (item,index){
            param.append('file'+index,item.raw)
          })
      }else{
        that.$message.warning("请选择需要上传的文件！");
        return
      }
      param.append('path',this.filePath)
      this.$http.post('file/uploads',param,config).then(res=>{
        if (res.data.code===0){
          this.$message.success(res.data.msg)
          this.updateVisible(false)
          this.$emit('done');
        }else{
          this.$message.error(res.data.msg)
        }
      }).catch(e=>{
        this.$message.error(e.message)
      })
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    handlePreview(file) {
      console.log(file);
    },
    /* 更新visible */
    updateVisible(value) {
      this.$emit('update:visible', value);
    },
    handleChange(file,fileList){
      let existFile = fileList.slice(0, fileList.length - 1).find(f => f.name === file.name);
      if (existFile) {
        this.$message.error('当前文件已经存在!');
        fileList.pop();
      }
      this.fileList = fileList;
    },
    closeDiag(done){
      this.updateVisible(done);
      this.fileList = [];
    }
  }
}
</script>
<style scoped>
</style>
