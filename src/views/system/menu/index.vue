<template>
  <div class="ele-body">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="where" label-width="77px" class="ele-form-search" @keyup.enter.native="reload" @submit.native.prevent>
        <el-row :gutter="15">
          <el-col :md="6" :sm="12">
            <el-form-item label="菜单名称:">
              <el-input clearable v-model="where.title" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <el-form-item label="菜单地址:">
              <el-input clearable v-model="where.path" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="12" :sm="12">
            <div class="ele-form-actions">
              <el-button type="primary" icon="el-icon-search" class="ele-btn-icon" @click="reload">查询
              </el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据表格 -->
      <ele-pro-table ref="table" :where="where" row-key="menuId" :datasource="url" :columns="columns" default-expand-all :need-page="false" :parse-data="parseData">
        <!-- 表头工具栏 -->
        <template slot="toolbar">
          <el-button size="small" type="primary" icon="el-icon-plus" class="ele-btn-icon" @click="openEdit(null)">添加
          </el-button>
          <el-button @click="expandAll" class="ele-btn-icon" size="small">展开全部
          </el-button>
          <el-button @click="foldAll" class="ele-btn-icon" size="small">折叠全部
          </el-button>
        </template>
        <!-- 标题列 -->
        <template slot="title" slot-scope="{row}">
          <i :class="row.icon"></i> {{ row.title }}
        </template>
        <!-- 类型列 -->
        <template slot="menuType" slot-scope="{row}">
          <el-tag v-if="isUrl(row.path)" type="warning" size="mini">外链
          </el-tag>
          <el-tag v-else-if="isUrl(row.component)" type="success" size="mini">内链
          </el-tag>
          <el-tag v-else :type="['primary', 'info'][row.menuType]" size="mini">{{ ['菜单', '按钮'][row.menuType] }}
          </el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="action" slot-scope="{row}">
          <el-link type="primary" :underline="false" icon="el-icon-plus" @click="openEdit(null, row.menuId)">添加
          </el-link>
          <el-link type="primary" :underline="false" icon="el-icon-edit" @click="openEdit(row)">修改
          </el-link>
          <el-popconfirm class="ele-action" title="确定要删除吗？" @confirm="remove(row)">
            <el-link type="danger" slot="reference" :underline="false" icon="el-icon-delete">删除
            </el-link>
          </el-popconfirm>
        </template>
      </ele-pro-table>
    </el-card>
    <!-- 编辑弹窗 -->
    <menu-edit :data="current" :menu-list="menuList" :visible.sync="showEdit" @done="reload"/>
  </div>
</template>

<script>
import MenuEdit from './menu-edit';

export default {
  name: 'SystemMenu',
  components: {MenuEdit},
  data() {
    return {
      // 表格数据接口
      url: '/sys/menu',
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
          prop: 'title',
          label: '菜单名称',
          showOverflowTooltip: true,
          minWidth: 110,
          slot: 'title'
        },
        {
          prop: 'path',
          label: '路由地址',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'component',
          label: '组件路径',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'authority',
          label: '权限标识',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'sortNumber',
          label: '排序',
          align: 'center',
          showOverflowTooltip: true,
          width: 60
        },
        {
          prop: 'hide',
          label: '可见',
          align: 'center',
          showOverflowTooltip: true,
          width: 60,
          formatter: (row, column, cellValue) => {
            return ['是', '否'][cellValue];
          }
        },
        {
          prop: 'menuType',
          label: '类型',
          align: 'center',
          showOverflowTooltip: true,
          width: 60,
          slot: 'menuType'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          showOverflowTooltip: true,
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
      // 全部菜单数据
      menuList: []
    };
  },
  methods: {
    /* 解析接口返回数据 */
    parseData(res) {
      res.data = this.$util.toTreeData(res.data, 'menuId', 'parentId');
      this.menuList = res.data;
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
    openEdit(row, parentId) {
      if (!this.$hasPermission(row!==null?'sys:menu:edit':'sys:menu:add')){
        return this.$message.warning('没有权限！')
      }
      this.current = Object.assign({
        menuType: 0,
        hide: 0,
        parentId: parentId
      }, row);
      this.showEdit = true;
    },
    /* 删除 */
    remove(row) {
      if (!this.$hasPermission('sys:menu:delete')){
        return this.$message.warning('没有权限！')
      }
      if (row.children && row.children.length > 0) {
        this.$message.error('请先删除子节点');
        return;
      }
      const loading = this.$loading({lock: true});
      this.$http.put('/sys/menu/' + row.menuId).then(res => {
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
