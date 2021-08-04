<!-- 编辑弹窗 -->
<template>
  <el-dialog width="480px" :visible="visible" :lock-scroll="false" :destroy-on-close="true" custom-class="ele-dialog-form" :title="isUpdate?'修改分类':'添加分类'" @update:visible="updateVisible">
    <el-form ref="form" :model="form" :rules="rules" label-width="92px" @keyup.enter.native="save" @submit.native.prevent>
      <el-row :gutter="6">
        <el-col :sm="24">
          <el-form-item label="分类名称：" prop="name">
            <el-input clearable v-model="form.name" placeholder="请输入分类名"/>
          </el-form-item>
          <el-form-item label="上级分类：">
            <treeselect :options="cateList" v-model="form.pid" :defaultExpandLevel="3" :normalizer="normalizer" placeholder="请选择上级分类"/>
          </el-form-item>
          <el-form-item label="分类图标：">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              accept=".jpg, .jpeg, .png, .JPEG"
              :auto-upload="false"
              :on-change="onChange">
              <el-image v-if="isUpdate?form.image:imageUrl" :src="imageUrl?imageUrl:isUpdate?form.image:imageUrl" class="avatar"/>
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item label="分类描述：">
            <el-input type="textarea" v-model="form.desc"></el-input>
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
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
let formData = new FormData();
export default {
  name: 'CateEdit',
  components: {Treeselect},
  props: {
    // 弹窗是否打开
    visible: Boolean,
    // 修改回显的数据
    data: Object,
    // 全部菜单数据
    cateList: Array
  },
  data() {
    return {
      // 表单数据
      form: this.initFormData(this.data),
      // 表单验证规则
      rules: {
        name: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ],
      },
      // 提交状态
      loading: false,
      // 是否是修改
      isUpdate: false,

      imageUrl:''
    };
  },
  watch: {
    data() {
      this.isUpdate = !!(this.data && this.data.id);
      this.form = this.initFormData(this.data);
    }
  },
  methods: {
    /* 下拉树格式化 */
    normalizer(d) {
      return {
        id: d.id,
        label: d.name,
        children: d.children || undefined
      };
    },
    onChange(file){
      formData.append('file',file.raw)
      let fileName = file.name;
      let regex = /(.jpg|.jpeg|.gif|.png|.bmp)$/;

      if (regex.test(fileName.toLowerCase())) {
        this.imageUrl = URL.createObjectURL(file.raw);
      } else {
        this.$message.error('请选择图片文件');
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.imageUrl = "";
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
    },
    /* 保存编辑 */
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          formData.append('id',this.form.id)
          formData.append('pid',this.form.pid)
          formData.append('image',this.form.image)
          formData.append('name',this.form.name)
          formData.append('desc',this.form.desc);
          this.$http.post('/article/category',formData).then(res => {
            this.loading = false;
            if (res.data.code === 0) {
              this.$message({type: 'success', message: res.data.msg});
              this.updateVisible(false);
              this.$emit('done');
              this.imageUrl = '';
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
      this.imageUrl='';
    },
    /* 初始化form数据 */
    initFormData(data) {
      let form = {};
      if (data) {
        Object.assign(form, data, {
          pid: data.pid === 0 ? null : data.pid,
        });
      }
      return form;
    },
  }
}
</script>

<style scoped>
  .el-icon-plus {
    border: 1px dashed #d9d9d9;
  }
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 128px;
    height: 128px;
    line-height: 128px;
    text-align: center;
  }
  .avatar {
    width: 128px;
    height: 128px;
    display: block;
  }
</style>
