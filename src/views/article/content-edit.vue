<template>
  <el-dialog
    :title="isUpdate?'编辑内容':'添加内容'"
    :visible="visible"
    width="1000px"
    :destroy-on-close="true"
    :lock-scroll="false"
    @update:visible="updateVisible">
    <el-form ref="editForm" :model="form" :rules="rules" label-width="82px">
      <el-row :gutter="48" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="20">
          <el-form-item label="文章标题:" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题" clearable/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="48" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="10">
          <el-form-item label="文章作者:" prop="author">
            <el-select v-model="form.author" filterable allow-create placeholder="请选择作者" class="ele-fluid" clearable>
              <el-option v-for="item in authors" :key="item.userId" :label="item.nickname" :value="item.nickname"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="文章来源:" prop="from">
            <el-select v-model="form.origin" filterable allow-create placeholder="请选择文章来源" class="ele-fluid" clearable>
              <el-option v-for="item in origins" :key="item.id" :label="item.name" :value="item.name"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="48" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="10">
          <el-form-item label="文章分类:" prop="cate">
            <el-select v-model="form.categories" multiple  clearable placeholder="请选择分类" class="ele-fluid">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.name"/>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="是否外链:" prop="isUrl">
            <template>
              <el-radio v-model="form.isUrl" label="0">非外链</el-radio>
              <el-radio v-model="form.isUrl" label="1">外链</el-radio>
            </template>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="form.isUrl === '1'" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="20">
          <el-form-item label="文章外链:" prop="url">
            <el-input v-model="form.url" placeholder="请输入外链地址" clearable/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="48" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="10">
          <el-form-item label="文章标签:" prop="tags" style="padding-top: 18px">
            <el-select v-model="form.tags" multiple filterable allow-create placeholder="请选择文章标签" class="ele-fluid">
              <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="发布时间:" prop="time" style="margin-top: 48px">
            <el-date-picker v-model="form.createTime" type="datetime" placeholder="请选择开始时间" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" class="ele-fluid"/>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="文章图片:" prop="image">
            <el-upload class="avatar-uploader" action="#" :auto-upload="false" :show-file-list="false" accept=".jpg, .jpeg, .png, .JPEG" :on-change="onChange">
              <el-image v-if="form.image||imageUrl" :src="imageUrl?imageUrl:isUpdate?form.image:imageUrl" class="avatar"/>
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="form.isUrl !== '1'" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="20">
          <el-form-item label="文章摘要:">
            <el-input v-model="form.desc" placeholder="请输入文章摘要" :rows="4" type="textarea"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row v-if="form.isUrl !== '1'" type="flex" justify="center" style="padding: 15px 0">
        <el-col :span="20">
          <el-form-item label="文章内容:">
            <tinymce-editor v-model="form.content" :init="option"/>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button type="primary" @click="save" :loading="editLoading">保存</el-button>
      <el-button type="primary" @click="test">测试</el-button>
    </div>
  </el-dialog>
</template>

<script>
import TinymceEditor from '@/components/TinymceEditor';

const formData = new FormData()
export default {
  name: "content-edit",
  components:{TinymceEditor},
  props:{
    // 弹窗是否打开
    visible: Boolean,
    // 修改回显的数据
    data: Object
  },
  data(){
    let file_picker_callback = (callback, value, meta) => {
      let input = document.createElement('input');
      input.setAttribute('type', 'file');
      // 设定文件可选类型
      if (meta.filetype === 'image') {
        input.setAttribute('accept', 'image/*');
      } else if (meta.filetype === 'media') {
        input.setAttribute('accept', 'video/*');
      }

      input.onchange = () => {
        let file = input.files[0];

        const formData = new FormData()

        formData.append('file', file, file.name);
        this.$http.post('/file/upload', formData).then(res => {
          console.log(res)
          if (res.data.url) {
            // success(res.data.url);
          } else {
            // error(res.data.msg);
          }
        }).catch(e => {
          console.error(e);
          this.$message.error(e.message);
        });
      }
      input.click();
    };

    return {
      //编辑器设置
      option: {
        height: 300,
        file_picker_callback: file_picker_callback
      },
      //管理员列表
      authors:[],
      //来源列表
      origins:[],
      //分类列表
      categories:[],
      //标签列表
      tags:[],
      // 表单数据
      form: Object.assign({}, this.data),
      // 编辑表单加载状态
      editLoading: false,
      // 是否是修改
      isUpdate: false,
      // 图片地址
      imageUrl:'',
      //表单规则
      rules: {
        title: [
          {required: true, message: '请输入文章标题', trigger: 'blur'}
        ],
      },
    }
  },
  mounted() {
    this.getAuthor();
    this.getFrom();
    this.getCate();
    this.getTags();
  },
  watch: {
    data() {
      if (this.data) {
        this.form = Object.assign({}, this.data,{categories:this.categories.map(d=>d.name)},{tags:this.tags.map(d=>d.name)});
        this.form.categories = this.data.categories?JSON.parse(this.data.categories):""
        this.form.tags = this.data.tags?JSON.parse(this.data.tags):""
        this.isUpdate = true;
      } else {
        this.form = {};
        this.isUpdate = false;
      }
    }
  },
  methods:{
    /*获取作者列表*/
    getAuthor(){
      this.$http.get('/article/author').then(res=>{
        if (res.data.code===0){
          this.authors = res.data.data
        }
      })
    },
    /*获取来源列表*/
    getFrom(){
      this.$http.get('/article/getFrom').then(res=>{
        if (res.data.code===0){
          this.origins = res.data.data
        }
      })
    },
    /*获取分类*/
    getCate(){
      this.$http.get('/article/getCate').then(res=>{
        if (res.data.code===0){
          this.categories = res.data.data
        }
      })
    },
    /*获取标签*/
    getTags(){
      this.$http.get('/article/getTags').then(res=>{
        if (res.data.code===0){
          this.tags = res.data.data
        }
      })
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
        this.file = "";
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
    },
    /* 保存编辑 */
    save() {
      formData.append('data',JSON.stringify(this.form))
      this.$http.post('/article/create',formData).then(res=>{
        if (res.data.code === 0){
          this.$message.success(res.data.msg)
          this.updateVisible(false)
          this.$emit('done')
        }else{
          this.$message.error(res.data.msg)
        }
      }).catch(e=>{
        this.$message.error(e.message)
      })
    },
    test(){
      console.log(this.form)
    },
    /* 更新visible */
    updateVisible(value) {
      this.imageUrl = "";
      this.$emit('update:visible', value);
      this.$emit('done')
    }
  }
}
</script>

<style>
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
  width: 288px;
  height: 162px;
  line-height: 162px;
  text-align: center;
}
.avatar {
  width: 288px;
  height: 162px;
  display: block;
}
</style>
