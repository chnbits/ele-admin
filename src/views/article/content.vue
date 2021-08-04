<template>
  <div class="ele-body" ref="articleList">
    <el-card shadow="never">
      <el-row>
        <el-col :sm="8">
          <div class="top-text-item">
            <div class="top-text-title">文章总数</div>
            <div class="top-text-content">{{ count }}</div>
          </div>
        </el-col>
        <el-col :sm="8">
          <div class="top-text-item">
            <div class="top-text-title">阅读总数</div>
            <div class="top-text-content">10000</div>
          </div>
        </el-col>
        <el-col :sm="8">
          <div class="top-text-item">
            <div class="top-text-title">当日阅读数</div>
            <div class="top-text-content">120</div>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card shadow="never" v-loading="loading" >
      <!-- 头部工具栏 -->
      <div class="ele-table-tool">
        <h6 class="ele-table-tool-title">文章列表</h6>
        <div class="ele-table-tool-right">
          <div class="ele-inline-block adv-list-search-group hidden-xs-only">
            <el-input placeholder="请输入..." v-model="search.keyword" size="small" clearable @keyup.enter.native="query">
              <el-button @click="query" slot="append" icon="el-icon-search"/>
            </el-input>
          </div>
          <div class="ele-inline-block">
            <el-button @click="showSearch=true" icon="el-icon-_retrieve" class="ele-btn-icon" size="mini" style="font-size:15px;" title="高级查询"/>
          </div>
        </div>
      </div>
      <el-button @click="openEdit(null)" icon="el-icon-plus" class="ele-fluid" style="margin-bottom: 10px;">添加</el-button>
      <!-- 数据列表 -->
      <div v-for="(item,index) in data" :key="index">
        <div class="basic-list-item">
          <div class="ele-cell">
            <el-avatar shape="square" :size="60" :src="item.image"/>
            <div class="ele-cell-content">
              <div class="ele-cell-title">{{ item.title }}</div>
              <div class="ele-cell-desc">{{ item.desc }}</div>
            </div>
          </div>
          <div class="basic-list-item-owner">
            <div>来源</div>
            <div class="ele-text-secondary">
              <el-tag size="mini">{{ item.origin }}</el-tag>
            </div>
          </div>
          <div class="basic-list-item-owner">
            <div>发布人</div>
            <div class="ele-text-secondary">
              <el-tag size="mini">{{ item.author }}</el-tag>
            </div>
          </div>
          <div class="basic-list-item-owner">
            <div>浏览量</div>
            <div class="ele-text-secondary">{{ item.click }}</div>
          </div>
          <div class="basic-list-item-cate">
            <div>分类</div>
            <div class="ele-text-secondary ele-text-tag">
              <el-tag size="mini" effect="plain" type="success" :key="cate.id" v-for="cate in JSON.parse(item.categories)">{{cate}}</el-tag>
            </div>
          </div>
          <div class="basic-list-item-cate">
            <div>标签</div>
            <div class="ele-text-secondary ele-text-tag">
              <el-tag size="mini" effect="plain" type="danger" :key="tag.id" v-for="tag in JSON.parse(item.tags)">{{tag}}</el-tag>
            </div>
          </div>
           <div class="basic-list-item-owner">
            <div>类型</div>
            <div class="ele-text-secondary">
              <el-tag size="mini" :type="item.isUrl!== 0?'warning':'success'">{{ item.isUrl !== 0?'外链':'文章' }}</el-tag>
            </div>
          </div>
          <div class="basic-list-item-owner">
            <div>状态</div>
            <div class="ele-text-secondary">
              <ele-dot :type="item.state!== 0?'danger':'success'" :ripple="true" :text="item.state !== 0?'禁用':'正常'"/>
            </div>
          </div>
          <div class="basic-list-item-time">
            <div>发布时间</div>
            <div class="ele-text-secondary">{{ item.createTime }}</div>
          </div>
          <div class="basic-list-item-tool">
            <el-link @click="openEdit(item)" icon="el-icon-edit" type="primary" :underline="false">编辑
            </el-link>
            <el-dropdown @command="command => dropClick(command, item)">
              <el-link type="primary" :underline="false">更多<i class="el-icon-arrow-down"/>
              </el-link>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="share">分享</el-dropdown-item>
                <el-dropdown-item command="remove">删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <el-divider/>
      </div>
      <el-pagination
        :current-page="page.page"
        :page-size="page.limit"
        :total="count"
        :background="true"
        @size-change="d => (page.limit=d) && query()"
        @current-change="d => (page.page=d) && query()"
        layout="total, prev, pager, next, jumper"
        :pager-count="5"
        class="ele-pagination-circle"/>
    </el-card>
    <!-- 编辑弹窗 -->
    <content-edit :data="current" :visible.sync="showEdit" @done="reload"/>
    <!-- 高级查询抽屉 -->
<!--    <el-drawer-->
<!--      title="高级查询"-->
<!--      :visible.sync="showSearch"-->
<!--      size="340px"-->
<!--      :append-to-body="true">-->
<!--      <div style="padding: 22px 22px 22px 10px;">-->
<!--        <el-form-->
<!--          ref="searchForm"-->
<!--          :model="searchForm"-->
<!--          label-width="82px">-->
<!--          <el-form-item label="文章标题:">-->
<!--            <el-input-->
<!--              v-model="searchForm.title"-->
<!--              placeholder="请输入文章标题"-->
<!--              clearable/>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="时间范围:">-->
<!--            <el-date-picker-->
<!--              style="width: 100%"-->
<!--              v-model="value"-->
<!--              type="daterange"-->
<!--              unlink-panels-->
<!--              range-separator="至"-->
<!--              start-placeholder="开始日期"-->
<!--              end-placeholder="结束日期"-->
<!--              :picker-options="pickerOptions">-->
<!--            </el-date-picker>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="文章作者:" prop="author">-->
<!--            <el-select-->
<!--              v-model="searchForm.author"-->
<!--              placeholder="请选择作者"-->
<!--              clearable-->
<!--              class="ele-fluid">-->
<!--              <el-option v-for="item in authors" :key="item.userId" :label="item.nickname" :value="item.userId"/>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
<!--        <div class="ele-text-center">-->
<!--          <el-button type="primary" @click="query">搜索</el-button>-->
<!--          <el-button @click="showSearch=false">关闭</el-button>-->
<!--        </div>-->
<!--      </div>-->
<!--    </el-drawer>-->
  </div>
</template>

<script>
import ContentEdit from './content-edit';

export default {
  name: 'contents',
  components:{ContentEdit},
  data() {
    return {
      current: null,
      // 列表加载状态
      loading: false,
      //列表数据
      data:[],
      // 编辑弹窗数据
      form: Object.assign({}, this.data),
      // 搜索表单
      search: {
        state: 0
      },
      // 分页参数
      page: {page: 1, limit: 5},
      // 数据总数
      count: 0,
      // 是否显示编辑弹窗
      showEdit: false,
      //弹窗上传图片
      file:"",
      // 是否显示搜索抽屉
      showSearch: false,
      // 高级搜索表单
      searchForm: {},

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
      imageUrl: '',
    }
  },
  mounted() {
    this.query();
  },
  methods: {
    /* 查询数据 */
    query() {
      this.loading = true;
      this.$http.get('/article',{params:{page:this.page.page,limit:this.page.limit}}).then(res=>{
        if (res.data.code===0){
          this.data = res.data.data
          this.count = res.data.count
          this.loading = false
        }else{
          this.$message.error(res.data.msg)
        }
      })
    },
    /* 显示编辑弹窗 */
    openEdit(item) {
      if (item !== null){
        item.isUrl = item.isUrl !== null ? item.isUrl.toString():"0"
        this.form = Object.assign({}, item);
        this.current = item;
      }else {
        this.current = {
          isUrl:'0'
         };
      }
      this.showEdit = true;
    },

    /* 下拉菜单点击事件 */
    dropClick(command, item) {
      if (command === 'remove') {
        // 删除
        this.$confirm('确定删除该任务吗？', '删除任务', {
          type: 'warning'
        }).then(() => {
          this.data.splice(this.data.findIndex(d => d.id === item.id), 1);
          this.$message({type: 'success', message: '删除成功'});
        }).catch(() => 0);
      } else if (command === 'share') {
        this.$message('点击了分享');
      }
    },
    reload() {
      this.current = {isUrl:0}
      this.$nextTick(function (){
        this.query()
      })
    },
  }
}
</script>

<style>
/* 顶部文字样式 */
.top-text-item {
  padding: 8px 0;
  text-align: center;
}

.top-text-item .top-text-content {
  font-size: 24px;
  margin-top: 8px;
}

/* 列表样式 */
.basic-list-item {
  display: flex;
  align-items: center;
  padding: 15px 10px;
}

.basic-list-item .ele-cell {
  flex: 1;
}

.basic-list-item .basic-list-item-owner {
  width: 60px;
  padding: 0 15px;
}
.basic-list-item .basic-list-item-cate {
  width: 90px;
  padding: 0 15px;
}

.basic-list-item .basic-list-item-time {
  width: 150px;
  padding: 0 15px;
}
.ele-text-tag{
  width: 90px;
}
.basic-list-item .ele-text-secondary {
  margin-top: 8px;

  }
.basic-list-item>div{
  text-align: center;
}
.basic-list-item .basic-list-item-progress {
  width: 180px;
}

.basic-list-item .basic-list-item-tool {
  padding: 0 15px;
}

.ele-body .el-pagination {
  margin: 20px 0 5px 0;
}

/* 表头工具栏 */
.ele-table-tool-right .ele-inline-block {
  vertical-align: top;
}

.ele-table-tool-right .ele-inline-block + .ele-inline-block {
  margin-left: 12px;
}

.ele-inline-block ::v-deep .el-radio-button__inner {
  padding-left: 12px;
  padding-right: 12px;
}

.adv-list-search-group {
  width: 180px;
}

.adv-list-search-group ::v-deep .el-button {
  padding-left: 13px;
  padding-right: 12px;
}

/* 响应式 */
@media screen and (max-width: 992px) {
  .basic-list-item .basic-list-item-owner,
  .basic-list-item .basic-list-item-time,
  .basic-list-item .basic-list-item-progress,
  .basic-list-item .basic-list-item-tool {
    width: auto;
    padding: 0 10px;
  }

  .basic-list-item .basic-list-item-progress {
    width: 100px;
  }
}

@media screen and (max-width: 768px) {
  .basic-list-item {
    display: block;
  }

  .basic-list-item .basic-list-item-owner,
  .basic-list-item .basic-list-item-time,
  .basic-list-item .basic-list-item-tool {
    width: auto;
    padding: 8px 0 0 0;
  }

  .basic-list-item .ele-text-secondary {
    margin-top: 0;
    padding-left: 15px;
  }

  .basic-list-item .basic-list-item-owner > div,
  .basic-list-item .basic-list-item-time > div {
    display: inline-block;
  }

  .basic-list-item .basic-list-item-tool {
    text-align: right;
  }
}
</style>
