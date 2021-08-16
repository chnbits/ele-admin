<template>
  <div class="ele-body" ref="articleList">
    <el-card shadow="never" v-loading="loading" >
      <!-- 头部工具栏 -->
      <div class="ele-table-tool">
        <h6 class="ele-table-tool-title">文章列表</h6>
        <div class="ele-table-tool-right" style="float: right">
          <div class="ele-inline-block adv-list-search-group hidden-xs-only">
            <el-input placeholder="请输入..." v-model="search.keyword" size="small" clearable @keyup.enter.native="query">
              <el-button @click="query" slot="append" icon="el-icon-search"/>
            </el-input>
          </div>
          <div class="ele-inline-block">
            <el-button @click="openSearch" icon="el-icon-_retrieve" class="ele-btn-icon" size="mini" style="font-size:15px;" title="高级查询"/>
          </div>
        </div>
      </div>
      <el-button @click="openEdit(null)" icon="el-icon-plus" class="ele-fluid" type="primary" plain style="margin-bottom: 10px;">添加</el-button>
    </el-card>

    <el-card shadow="never" style="overflow: visible;">
      <div class="article-list-item" v-for="(item,index) in data" :key="index">
      <div class="article-list-wrapper">
        <div class="article-list-left">
          <h6><b>{{ item.title }}</b></h6>
          <div class="article-list-content">{{ item.desc }}</div>
          <div class="article-list-user-group">
            <el-avatar :size="24" :src="item.avatar"/>
            <span> {{ item.author }} 发表于 {{ item.createTime }}</span>
          </div>
        </div>

        <div class="article-list-center">
          <div class="article-list-cates">
            <div class="article-list-label">分类：</div>
            <div style="flex: 1">
              <el-tag
                type="success"
                size="mini"
                v-for="(cate,i) in JSON.parse(item.categories)"
                :key="i">
                {{ cate }}
              </el-tag>
            </div>
          </div>
          <div class="article-list-tags">
            <div class="article-list-label">标签：</div>
            <div style="flex: 1">
              <el-tag
                type="danger"
                size="mini"
                v-for="(tag,i) in JSON.parse(item.tags)"
                :key="i">
                {{ tag }}
              </el-tag>
            </div>
          </div>
          <div class="article-list-footer">
            <div class="article-list-tool">
              <i class="el-icon-star-off"/>
              <span> {{ item.favorites }}</span>
            </div>
            <el-divider direction="vertical"/>
            <div class="article-list-tool">
              <i class="el-icon-view"/>
              <span> {{ item.click }}</span>
            </div>
            <el-divider direction="vertical"/>
            <div class="article-list-tool">
              <i class="el-icon-chat-dot-square"/>
              <span> {{ item.comments }}</span>
            </div>
          </div>
        </div>
        <div class="article-list-state">
          <div style="margin-top: 35px;">
            <ele-dot :type="item.state === 0?'success':item.state === 1?'warning':'danger'" :ripple="true" :text="item.state === 0?'正常':item.state === 1?'禁用':'删除'"/>
          </div>
        </div>
        <div class="article-list-oper">
          <div style="margin-top: 10px">
             <el-button type="danger" size="mini" plain @click="openEdit(item)">修改</el-button>
          </div>
          <div style="margin-top: 10px">
            <el-dropdown style="margin-left: 0">
            <span class="el-dropdown-link" style="font-size: smaller;">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="update(item.id,'0')">发布</el-dropdown-item>
                <el-dropdown-item @click.native="update(item.id,'1')">禁用</el-dropdown-item>
                <el-dropdown-item @click.native="update(item.id,'-1')">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>

        <div class="article-list-right">
          <el-image style="width: 160px;height: 90px;" :src="item.image"/>
        </div>
      </div>
      <el-divider/>
    </div>
    <div style="padding-top: 15px;text-align: center;">
      <el-pagination
        :current-page="page.page"
        :page-size="page.limit"
        :total="data.count"
        :background="true"
        @size-change="d => (page.limit=d) && query()"
        @current-change="d => (page.page=d) && query()"
        layout="total, prev, pager, next, jumper"
        :pager-count="5"
        class="ele-pagination-circle"/>
    </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <content-edit :data="current" :baseData="baseData" :visible.sync="showEdit" @done="reload"/>
    <!--高级查询抽屉-->
    <el-drawer
      title="高级查询"
      :visible.sync="showSearch"
      @close="searchForm={}"
      size="340px"
      :append-to-body="true">
      <div style="padding: 22px 22px 22px 10px;">
        <el-form
          ref="searchForm"
          :model="searchForm"
          label-width="82px">
          <el-form-item label="文章标题:">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入文章标题"
              clearable/>
          </el-form-item>
          <el-form-item label="文章作者:" prop="author">
            <el-select
              v-model="searchForm.author"
              placeholder="请选择作者"
              clearable
              class="ele-fluid">
              <el-option v-for="item in baseData.authors" :key="item.userId" :label="item.nickname" :value="item.userId"/>
            </el-select>
          </el-form-item>
          <el-form-item label="文章分类:" prop="categories">
            <el-select
              v-model="searchForm.category"
              placeholder="请选择分类"
              clearable
              class="ele-fluid">
              <el-option v-for="item in baseData.categories" :key="item.id" :label="item.name" :value="item.id"/>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围:">
            <el-date-picker
              style="width: 100%"
              v-model="searchForm.createTime"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div class="ele-text-center">
          <el-button type="primary" @click="query">搜索</el-button>
          <el-button @click="showSearch=false">关闭</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import ContentEdit from "@/views/article/content-edit";

export default {
  name: 'ListCardArticle',
  components:{ContentEdit},
  data() {
    return {
      loading: false,
      search: {
        state: 0
      },
      showEdit:false,
      showSearch: false,
      data: [],
      //基础数据
      baseData:{
        authors:[],
        //来源列表
        origins:[],
        //分类列表
        categories:[],
        //标签列表
        tags:[],
      },
      current:null,
      searchForm:{},
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      // 分页参数
      page: {page: 1, limit: 5},
    }
  },
  computed: {
    previewList() {
      return this.data.map(item => item.cover);
    }
  },
  mounted() {
    this.query()
  },
  methods: {
    query() {
      this.loading = true;
      this.$http.get('/article',{params:{page:this.page.page,limit:this.page.limit}}).then(res=>{
        if (res.data.code===0){
          this.data = res.data.data
          this.data.count = res.data.data.count
          this.loading = false
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    update(id,state){
      let warnMsg = state==='0'?'发布':state==='-1'?'删除':'禁用';
      this.$confirm('确认要' + warnMsg + '该内容吗？',{type:"warning"}).then(()=>{
        this.$http.put('/article/state',{'id':id,'state':state}).then(res=>{
          if (res.data.code === 0){
            this.$message.success(res.data.msg);
            this.query();
          }else{
            this.$message.error(res.data.msg);
          }
        }).catch(() => 0)
      })
    },
    /*获取作者列表*/
    getAuthor(){
      this.$http.get('/article/author').then(res=>{
        if (res.data.code===0){
          this.baseData.authors = res.data.data
        }
      })
    },
    /*获取来源列表*/
    getFrom(){
      this.$http.get('/article/getFrom').then(res=>{
        if (res.data.code===0){
          this.baseData.origins = res.data.data
        }
      })
    },
    /*获取分类*/
    getCate(){
      this.$http.get('/article/getCate').then(res=>{
        if (res.data.code===0){
          this.baseData.categories = res.data.data
        }
      })
    },
    /*获取标签*/
    getTags(){
      this.$http.get('/article/getTags').then(res=>{
        if (res.data.code===0){
          this.baseData.tags = res.data.data
        }
      })
    },
    /* 显示编辑弹窗 */
    openEdit(item) {
      this.getAuthor();
      this.getCate();
      this.getFrom();
      this.getTags();
      if (item !== null){
        item.isUrl = item.isUrl ? item.isUrl.toString():"0"
        this.current = item;
      }else {
        this.current = {
          isUrl:'0'
        };
      }
      this.showEdit = true;
    },
    openSearch(){
      this.getAuthor();
      this.getCate();
      this.showSearch = true
    },
    handleClose(){
      this.searchForm = {};
    },
    reload() {
      this.current = {isUrl:0}

      this.query()
    },
  }
}
</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
  color: #409EFF;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.article-list-wrapper {
  display: flex;
  padding: 15px 0;
}

.article-list-left {
  flex: 0.5;
}
.article-list-center{
  flex:0.3;
}
.article-list-state{
  flex: 0.2;
}
.article-list-oper{
  flex: 0.2;
}
.article-list-cates{
  display: flex;
}
.article-list-tags {
  margin: 12px 0;
  display: flex;
}

.article-list-content {
  margin-top: 15px;
  max-width: 700px;
}

.article-list-user-group {
  margin-top: 15px;
}

.article-list-user-group > span {
  vertical-align: middle;
}

.article-list-footer {
  margin-top: 5px;
}

.article-list-footer .article-list-tool {
  display: inline-block;
  line-height: 22px;
  cursor: pointer;
}

.article-list-footer .el-divider--vertical {
  margin: 0 16px;
}

/* 响应式 */
@media screen and (max-width: 768px) {
  .article-list-wrapper {
    display: block;
  }

  .article-list-right {
    margin-top: 10px;
  }

  .article-list-right ::v-deep .el-image {
    max-width: 100%;
  }
}
</style>
