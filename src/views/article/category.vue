<template>
  <div class="ele-body">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="where" label-width="77px" class="ele-form-search" @keyup.enter.native="reload" @submit.native.prevent>
        <el-row :gutter="15">
          <el-col :md="8" :sm="12">
            <el-form-item label="分类名称:">
              <el-input clearable v-model="where.name" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="12" :sm="12">
            <div class="ele-form-actions">
              <el-button type="primary" icon="el-icon-search" class="ele-btn-icon" @click="reload">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据表格 -->
      <ele-pro-table ref="table" :where="where" row-key="id" :datasource="url" :columns="columns" default-expand-all :need-page="false" :parse-data="parseData">
        <!-- 表头工具栏 -->
        <template slot="toolbar">
          <el-button size="small" type="primary" icon="el-icon-plus" class="ele-btn-icon" @click="openEdit(null)">添加
          </el-button>
          <el-button @click="expandAll" class="ele-btn-icon" size="small">展开全部
          </el-button>
          <el-button @click="foldAll" class="ele-btn-icon" size="small">折叠全部
          </el-button>
        </template>
        <!--图片列-->
        <template slot="image" slot-scope="{row}">
          <el-image :src="row.image" style="width:60px;height: 40px" />
        </template>
        <!-- 标题列 -->
        <template slot="name" slot-scope="{row}">
           {{row.name}}
        </template>

        <!-- 操作列 -->
        <template slot="action" slot-scope="{row}">
          <el-link type="primary" :underline="false" icon="el-icon-plus" @click="openEdit(null, row.id)">添加
          </el-link>
          <el-link type="primary" :underline="false" icon="el-icon-edit" @click="openEdit(row)">修改</el-link>
          <el-popconfirm class="ele-action" title="确定要删除吗？" @confirm="remove(row)">
            <el-link type="danger" slot="reference" :underline="false" icon="el-icon-delete">删除
            </el-link>
          </el-popconfirm>
        </template>
      </ele-pro-table>
    </el-card>
    <!-- 编辑弹窗 -->
    <cate-edit :data="current" :cate-list="cateList" :visible.sync="showEdit" @done="reload"/>
  </div>
</template>

<script>
import CateEdit from './cate-edit';

export default {
  name: 'Category',
  components: {CateEdit},
  data() {
    return {
      // 表格数据接口
      url: '/article/category',
      // 表格列配置
      columns: [
        {
          columnKey: 'index',
          type: 'index',
          width: 45,
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'name',
          label: '分类名称',
          showOverflowTooltip: true,
          slot: 'name'
        },
        {
          prop: 'image',
          label: '分类图标',
          align: 'center',
          slot:'image',
          showOverflowTooltip: true,
        },
        {
          prop: 'desc',
          label: '分类描述',
          align: 'center',
          showOverflowTooltip: true,
        },
        {
          prop: 'createTime',
          label: '创建时间',
          showOverflowTooltip: true,
          align: 'center',
          minWidth: 110,
          formatter: (row, column, cellValue) => {
            return this.$util.toDateString(cellValue);
          }
        },
        {
          prop: 'updateTime',
          label: '修改时间',
          showOverflowTooltip: true,
          align: 'center',
          minWidth: 110,
          formatter: (row, column, cellValue) => {
            return this.$util.toDateString(cellValue);
          }
        },
        {
          columnKey: 'action',
          label: '操作',
          width: 190,
          align: 'center',
          resizable: false,
          slot: 'action'
        }
      ],
      // 表格搜索条件
      where: {},
      // 表格选中数据
      selection: [],
      // 当前编辑数据
      current: null,
      // 是否显示编辑弹窗
      showEdit: false,
      // 全部数据
      cateList: []
    };
  },
  methods: {
    /* 解析接口返回数据 */
    parseData(res) {
      res.data = this.$util.toTreeData(res.data, 'id', 'pid');
      this.cateList = res.data;
      return res;
    },
    /* 刷新表格 */
    reload() {
      this.$refs.table.reload();
    },
    /* 重置搜索 */
    reset() {
      this.where = {};
      this.$nextTick(() => {
        this.reload();
      });
    },
    /* 显示编辑 */
    openEdit(row, pid) {
      if (!this.$hasPermission(row!==null?'article:category:edit':'article:category:add')){
        return this.$message.warning('没有权限！')
      }
      this.current = Object.assign({
        pid: pid
      }, row);
      this.showEdit = true;
    },
    /* 删除 */
    remove(row) {
      if (!this.$hasPermission('article:category:remove')){
        return this.$message.warning('没有权限！')
      }
      if (row.children && row.children.length > 0) {
        this.$message.error('请先删除子节点');
        return;
      }
      const loading = this.$loading({lock: true});
      this.$http.put('/article/category/' + row.id,{'name':row.name},{headers:{'Content-Type':'application/json;token'}}).then(res => {
        loading.close();
        if (res.data.code === 0) {
          this.$message({type: 'success', message: res.data.msg});
          this.reload();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        loading.close();
        this.$message.error(e.message);
      });
    },
    /* 展开全部 */
    expandAll() {
      this.$refs.table.data.forEach(d => {
        this.$refs.table.toggleRowExpansion(d, true);
      });
    },
    /* 折叠全部 */
    foldAll() {
      this.$refs.table.data.forEach(d => {
        this.$refs.table.toggleRowExpansion(d, false);
      });
    },
    /* 判断是否是网址 */
    isUrl(url) {
      return url && (
        url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('://'));
    }
  }
}
</script>

<style scoped>
</style>
