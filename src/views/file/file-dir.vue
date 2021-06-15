<!-- 用户编辑弹窗 -->
<template>
  <el-dialog width="400px" :visible="visible" :lock-scroll="false" :destroy-on-close="true" custom-class="ele-dialog-form" @close="closeDiag(false)" :title="'移动/复制文件'">
    <el-input
      placeholder="输入关键字进行过滤"
      v-model="filterText">
    </el-input>
    <el-tree
      class="filter-tree"
      show-checkbox
      :check-strictly = true
      :data="node"
      :props="defaultProps"
      :filter-node-method="filterNode"
      ref="tree">
    </el-tree>
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
  mounted() {
    this.getTree();
  },
  data() {
    return {
      filterText:'',
      // 表单数据
      node:[],
      checked:[],
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
    getTree() {
      this.$http.get('/file/dir').then(res=>{
        if (res.data.code === 0){
          this.node = res.data.data
        }else{
          this.$message.error('没有获取到目录信息！')
        }
      })
    },
    /* 保存编辑 */
    save() {
      console.log(this.$refs.tree.getCheckedNodes())
      console.log(this.filePath)
      // this.loading = true;
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
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
