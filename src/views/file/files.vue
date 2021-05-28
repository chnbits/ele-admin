<template>
  <div class="ele-body">
    <el-card shadow="never" body-style="padding: 0;" style="overflow: visible;">
      <div style="padding: 15px 15px 0 15px;">
        <!-- 工具栏 -->
        <div class="ele-table-tool">
          <div class="ele-table-tool-title">
            <el-upload action="" :show-file-list="false" :before-upload="beforeUpload" class="ele-inline-block ele-action">
              <el-button size="small" type="primary" class="ele-btn-icon" icon="el-icon-upload2">上传</el-button>
            </el-upload>
            <el-button size="small" type="primary" class="ele-btn-icon" icon="el-icon-folder-add" @click="openUpload">批量上传</el-button>
            <el-button size="small" class="ele-btn-icon" icon="el-icon-folder-add" @click="openEdit">新建文件夹</el-button>
            <template v-if="checked.length">
              <el-button size="small" icon="el-icon-view" class="ele-btn-icon" :disabled="checked.length>1" @click="view(checked[0])">预览
              </el-button>
              <el-button size="small" type="danger" icon="el-icon-delete" class="ele-btn-icon hidden-xs-only" @click="deleteFile(checked)">删除
              </el-button>
            </template>
          </div>
          <div class="ele-table-tool-right">
            <!-- 搜索框 -->
            <div class="ele-file-tool-search hidden-xs-only">
              <el-input size="small" v-model="search" placeholder="搜索您的文件">
                <el-button slot="append" icon="el-icon-search"/>
              </el-input>
            </div>
            <!-- 排序方式切换 -->
            <el-dropdown @command="onSortClick">
              <i class="el-icon-_filter ele-file-tool-btn" title="排序方式"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="name">
                  <span :class="['ele-file-sort-item ele-text-primary', {'active': sort === 'name'}]">
                    <i :class="['ele-file-sort-item-icon', {'el-icon-top': order === 'asc'}, {'el-icon-bottom': order === 'desc'}]"></i>
                    <span>文件名</span>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="length">
                  <span :class="['ele-file-sort-item ele-text-primary', {'active': sort === 'length'}]">
                    <i :class="['ele-file-sort-item-icon', {'el-icon-top': order === 'asc'}, {'el-icon-bottom': order === 'desc'}]"></i>
                    <span>大小</span>
                  </span>
                </el-dropdown-item>
                <el-dropdown-item command="updateTime">
                  <span :class="['ele-file-sort-item ele-text-primary', {'active': sort === 'updateTime'}]">
                    <i :class="['ele-file-sort-item-icon', {'el-icon-top': order === 'asc'}, {'el-icon-bottom': order === 'desc'}]"></i>
                    <span>修改日期</span>
                  </span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <!-- 显示方式切换 -->
            <i title="显示方式" :class="['ele-file-tool-btn', {'el-icon-_menu': !grid}, {'el-icon-_nav': grid}]" @click="grid = !grid"></i>
          </div>
        </div>
        <!-- 文件目录面包屑 -->
        <div class="ele-file-breadcrumb-group ele-cell">
          <div class="ele-cell-content ele-cell">
            <div v-if="directory.length" class="ele-file-breadcrumb-back ele-text-primary" @click="back">返回上一级
            </div>
            <div class="ele-file-breadcrumb-list ele-cell-content ele-cell">
              <div :class="['ele-file-breadcrumb-item ele-cell', {'ele-text-primary': directory.length}]" @click="listAll">
                <div class="ele-file-breadcrumb-item-title">全部文件</div>
                <i v-if="directory.length" class="el-icon-arrow-right"></i>
              </div>
              <div v-for="(item,index) in directory" :key="index" :class="['ele-file-breadcrumb-item ele-cell', {'ele-text-primary': index !== directory.length - 1}]" @click="listDir(index)">
                <div class="ele-file-breadcrumb-item-title">{{ item }}</div>
                <i v-if="index!==directory.length-1" class="el-icon-arrow-right"></i>
              </div>
            </div>
          </div>
          <div class="hidden-xs-only">已全部加载，共{{ data.length }}个</div>
        </div>
      </div>
      <!-- 文件列表 -->
      <div v-loading="loading" style="min-height: 400px;">
        <ele-file-list :data="data" :grid="grid" :sort="sort" :order="order" :checked.sync="checked" @item-click="onItemClick" @sort-change="onSortChange">
          <template slot="tool" slot-scope="{item}">
            <i title="查看" class="el-icon-view ele-file-list-item-tool ele-text-primary" @click.stop="view(item)"></i>
            <i title="分享" class="el-icon-share ele-file-list-item-tool ele-text-primary"></i>
            <el-dropdown class="ele-file-list-item-tool">
              <i class="el-icon-more ele-text-primary"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>移动到</el-dropdown-item>
                <el-dropdown-item>复制到</el-dropdown-item>
                <el-dropdown-item>删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </ele-file-list>
      </div>
    </el-card>
    <!-- 用于图片预览 -->
    <el-image ref="previewImage" v-if="currentImage" :src="currentImage" class="ele-file-image-preview" :preview-src-list="previewList"></el-image>
<!--    添加文件夹-->
    <file-edit :filePath="path" :visible.sync="showEdit" @done="reload"/>
    <file-upload :filePath="path" :visible.sync="showUpload" @done="reload"/>
  </div>
</template>

<script>
import EleFileList from 'ele-admin/packages/ele-file-list';
import FileEdit from './file-edit';
import FileUpload from './file-upload';

export default {
  name: 'ExtensionFile',
  components: {EleFileList,FileEdit,FileUpload},
  data() {
    return {
      // 加载状态
      loading: true,
      // 是否网格展示
      grid: true,
      // 文件列表数据
      data: [],
      // 选中数据
      checked: [],
      // 文件目录面包屑数据
      directory: [],
      // 图片预览文件
      currentImage: '',
      // 搜索
      search: '',
      // 排序字段
      sort: '',
      // 排序方式
      order: '',
      //文件夹路径
      path: '',
      // 是否显示编辑弹窗
      showEdit: false,

      showUpload:false,


    };
  },
  computed: {
    // 图片预览列表
    previewList() {
      return this.data.filter(d => d.thumbnail).map(d => d.url);
    }
  },
  mounted() {
    this.query();
  },
  methods: {
    /*批量上传*/
    openUpload(){
      let dir = '';
      this.directory.forEach(function (item){
        dir += '/'+item;
      })
      this.path = dir.substring(1);
      this.showUpload = true;
    },
    /*创建文件夹*/
    openEdit() {
      let dir = '';
      this.directory.forEach(function (item){
          dir += '/'+item;
      })
      this.path = dir.substring(1);
      this.showEdit = true;
    },
    /* 查询文件列表 */
    query() {
      const baseURL = process.env.VUE_APP_BASE_URL;
      this.data = [];
      this.checked = [];
      this.loading = true;
      this.$http.get('/file/list', {
        params: {
          sort: this.sort,
          order: this.order,
          directory: this.directory.join('/')
        }
      }).then(res => {
        this.loading = false;
        if (res.data.code === 0) {
          let result = [];
          res.data.data.forEach(d => {
            result.push({
              name: d.name,
              isDirectory: d.isDirectory,
              url: d.url ? (baseURL + '/' + d.url) : d.url,
              thumbnail: d.thumbnail ? (baseURL + '/' + d.thumbnail) : d.thumbnail,
              length: d.isDirectory ? '-' : this.getFileSize(d.length),
              directory:d.directory,
              updateTime: this.$util.toDateString(d.updateTime)
            });
          });
          this.data = result;
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        this.loading = false;
        this.$message.error(e.message);
      })
    },
    /* item点击事件 */
    onItemClick(item) {
      if (item.isDirectory) {  // 文件夹
        this.directory.push(item.name);
        this.query();
      } else if (item.thumbnail) {  // 图片
        this.currentImage = item.url;
        this.$nextTick(() => {
          if (this.$refs.previewImage) {
            this.$refs.previewImage.showViewer = true;
          }
        });
      } else {  // 文件
        const index = this.checked.indexOf(item);
        if (index !== -1) {
          this.checked.splice(index, 1);
        } else {
          this.checked.push(item);
        }
      }
    },
    /* 返回上级 */
    back() {
      this.directory.splice(this.directory.length - 1, 1);
      this.query();
    },
    //刷新
    reload(){
      this.query()
    },
    /* 全部文件 */
    listAll() {
      if (!this.directory.length) {
        return;
      }
      this.directory = [];
      this.query();
    },
    /* 回到指定目录 */
    listDir(index) {
      if (index === this.directory.length - 1) {
        return;
      }
      this.directory.splice(index, this.directory.length - index);
      this.query();
    },
    /* 文件大小格式化 */
    getFileSize(value) {
      if (value < 1024) {
        return value + 'B';
      } else if (value < 1024 * 1024) {
        return (value / 1024).toFixed(1) + 'KB';
      } else if (value < 1024 * 1024 * 1024) {
        return (value / 1024 / 1024).toFixed(1) + 'M';
      } else {
        return (value / 1024 / 1024 / 1024).toFixed(1) + 'G';
      }
    },
    /* 排序方式切换 */
    onSortClick(command) {
      if (this.sort === command) {
        this.order = {asc: 'desc', desc: 'asc'}[this.order];
      } else {
        this.order = 'asc';
        this.sort = command;
      }
      this.query();
    },
    /* 文件列表排序方式改变 */
    onSortChange(obj) {
      this.order = obj.order;
      this.sort = obj.sort;
      this.query();
    },
    /* 查看文件 */
    view(item) {
      if (item.isDirectory) {
        this.onItemClick(item);
      } else if (item.url) {
        window.open(item.url);
      }
    },
    /* 上传 */
    beforeUpload(file) {
      const loading = this.$loading({
        lock: true,
        text: '正在上传中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });

      let formData = new FormData();
      formData.append('file', file);
      formData.append('directory',this.directory);
      this.$http.post('/file/upload', formData).then(res => {
        loading.close();
        if (res.data.code === 0) {
          this.$message({type: 'success', message: res.data.msg});
          // this.directory = [res.dir.replace(/\//, '')];
          this.query();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        loading.close();
        this.$message.error(e.message);
      });
      return false;
    },
    /*删除*/
    deleteFile(items){
      this.$confirm('确认要删除选中项？').then(()=>{
        this.$http.post('/file/delete',items).then(res=>{
          if (res.data.code === 0){
            this.$message.success(res.data.msg)
            this.query();
          }else{
            this.$message.error(res.data.msg)
          }
        })
      })
    }
  }
}
</script>

<style scoped>
/** 文件目录面包屑 */
.ele-file-breadcrumb-group {
  font-size: 13px;
  padding: 2px 0 6px 0;
  line-height: 1;
}

.ele-file-breadcrumb-back {
  padding-right: 10px;
  border-right: 2px solid hsla(0, 0%, 60%, .2);
}

.ele-file-breadcrumb-back:hover,
.ele-file-breadcrumb-item.ele-text-primary:hover > .ele-file-breadcrumb-item-title {
  text-decoration: underline;
  cursor: pointer;
}

/* 图片预览组件 */
.ele-file-image-preview ::v-deep img.el-image__inner {
  display: none;
}

.ele-file-image-preview ::v-deep .el-image__error {
  display: none;
}

/* 图标按钮 */
.ele-file-tool-btn {
  cursor: pointer;
  font-size: 22px;
  display: inline-block;
  vertical-align: middle;
  margin-left: 10px;
}

/* 搜索框 */
.ele-file-tool-search {
  display: inline-block;
  vertical-align: middle;
  background-color: hsla(0, 0%, 60%, .15);
  border-radius: 32px;
}

.ele-file-tool-search ::v-deep .el-input-group__append,
.ele-file-tool-search ::v-deep .el-input__inner {
  background-color: transparent;
  border: none;
}

.ele-file-tool-search ::v-deep .el-input-group__append {
  padding: 0;
}

.ele-file-tool-search ::v-deep .el-input-group__append .el-button {
  margin: 0;
  padding: 7px 16px 7px 10px;
  border: none;
}

.ele-file-tool-search ::v-deep .el-input-group__append .el-button > i {
  font-size: 16px;
  font-weight: 600;
}

.ele-file-tool-search ::v-deep .el-input__inner {
  width: 200px;
  padding-right: 0;
  box-sizing: border-box;
}

/* 排序下拉 */
.ele-file-sort-item:not(.active) .ele-file-sort-item-icon {
  visibility: hidden;
}

.ele-file-sort-item .ele-file-sort-item-icon {
  font-weight: 600;
}

.ele-file-sort-item:not(.active) {
  color: inherit;
}
</style>
