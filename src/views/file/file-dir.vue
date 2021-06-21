<!-- 用户编辑弹窗 -->
<template>
  <el-dialog width="400px" :visible="visible" :lock-scroll="false" :destroy-on-close="true" custom-class="ele-dialog-form" @close="closeDiag(false)" :title="'移动/复制文件'">
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
    <el-tree class="filter-tree" show-checkbox :check-strictly = true :data="node" :props="defaultProps" :filter-node-method="filterNode" ref="tree"></el-tree>
    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button type="primary" :loading="loading" @click="save(checked)">保存</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'FileDir',
  props: {
    // 弹窗是否打开
    visible: Boolean,

    filePath: [String,Array]
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    }
  },
  data() {
    return {
      filterText:'',
      // 表单数据
      node:[],
      checked:[],
      files:[],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      // 提交状态
      loading: false,
    };
  },
  methods: {
    /*获取树数据*/
    getTree(items) {
      this.$http.get('/file/dir').then(res=>{
        if (res.data.code === 0){
          this.node = res.data.data
          this.files = items
        }else{
          this.$message.error('没有获取到目录信息！')
        }
      })
    },
    /* 保存编辑 */
    save() {
      let checkNodes = this.$refs.tree.getCheckedNodes();
      let files = this.files;
      let urls = [];
      let thumbnail = [];
      let toFile = [];
      files.forEach(function (file){
        urls.push(file.url)
        thumbnail.push(file.thumbnail)
      })
      checkNodes.forEach(function (item){
        let File;
        if (item.name === 'root'){
          File = 'root';
        }else{
          File = item.directory === null?item.name:item.directory+'/'+item.name
        }
        toFile.push(File)
      })
      this.loading = true;
      this.$http.post('/file/move',{'urls':urls,'toFile':toFile,'thumbs':thumbnail}).then(res=>{
        if (res.data.code === 0){
          this.$message.success(res.data.msg)
          this.updateVisible(false);
          this.$emit('done');
          this.loading = false;
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
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
  .el-tree{
    margin: 20px 0;
  }
</style>
