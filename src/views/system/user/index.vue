<template>
  <div class="ele-body">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="where" label-width="77px" class="ele-form-search" @keyup.enter.native="reload" @submit.native.prevent>
        <el-row :gutter="15">
          <el-col :md="6" :sm="12">
            <el-form-item label="用户账号:">
              <el-input clearable v-model="where.username" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <el-form-item label="用户名:">
              <el-input clearable v-model="where.nickname" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <el-form-item label="性别:">
              <el-select clearable v-model="where.sex" placeholder="请选择" class="ele-fluid">
                <el-option label="保密" value="0"/>
                <el-option label="男" value="1"/>
                <el-option label="女" value="2"/>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <div class="ele-form-actions">
              <el-button type="primary" icon="el-icon-search" class="ele-btn-icon" @click="reload">查询</el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据表格 -->
      <ele-pro-table ref="table" :where="where" :datasource="url" :columns="columns" :selection.sync="selection">
        <!-- 表头工具栏 -->
        <template slot="toolbar">
          <el-button @click="openEdit(null)" type="primary" icon="el-icon-plus" class="ele-btn-icon" size="small">添加</el-button>
          <el-button @click="removeBatch" type="danger" icon="el-icon-delete" class="ele-btn-icon" size="small">删除</el-button>
          <el-button @click="showImport=true" v-role="'admin'" icon="el-icon-upload2" class="ele-btn-icon" size="small">导入</el-button>
        </template>
        <!-- 用户名列 -->
        <template slot="nickname" slot-scope="{row}">
          <router-link :to="'/system/user/info?id=' + row.userId">
            {{ row.nickname }}
          </router-link>
        </template>
        <!-- 角色列 -->
        <template slot="roles" slot-scope="{row}">
          <el-tag v-for="item in row.roles" :key="item.roleId" size="mini" type="primary" :disable-transitions="true">{{ item.roleName }}</el-tag>
        </template>
        <!-- 状态列 -->
        <template slot="state" slot-scope="{row}">
          <el-switch :active-value="0" :inactive-value="1" v-model="row.state" @change="editState(row)"/>
        </template>
        <!-- 操作列 -->
        <template slot="action" slot-scope="{row}">
          <el-link type="primary" :underline="false" icon="el-icon-edit" @click="openEdit(row)">修改</el-link>
          <el-popconfirm class="ele-action" title="确定要删除此用户吗？" @confirm="remove(row)">
            <el-link type="danger" slot="reference" :underline="false" icon="el-icon-delete">删除</el-link>
          </el-popconfirm>
        </template>
      </ele-pro-table>
    </el-card>
    <!-- 编辑弹窗 -->
    <user-edit :data="current" :visible.sync="showEdit" @done="reload"/>
    <!-- 导入弹窗 -->
    <user-import :visible.sync="showImport" @done="reload"/>
  </div>
</template>

<script>
import UserEdit from './user-edit';
import UserImport from './user-import';

export default {
  name: 'SystemUser',
  components: {UserImport, UserEdit},
  data() {
    return {
      // 表格数据接口
      url: '/sys/user/page',
      // 表格列配置
      columns: [
        {
          columnKey: 'selection',
          type: 'selection',
          width: 45,
          align: 'center'
        },
        {
          columnKey: 'index',
          type: 'index',
          width: 45,
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'username',
          label: '用户账号',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'nickname',
          label: '用户名',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 110,
          slot: 'nickname'
        },
        {
          prop: 'sexName',
          label: '性别',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 80
        },
        {
          prop: 'phone',
          label: '手机号',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          columnKey: 'roles',
          label: '角色',
          showOverflowTooltip: true,
          minWidth: 110,
          slot: 'roles'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 110,
          formatter: (row, column, cellValue) => {
            return this.$util.toDateString(cellValue);
          }
        },
        {
          prop: 'state',
          label: '状态',
          align: 'center',
          sortable: 'custom',
          width: 80,
          resizable: false,
          slot: 'state'
        },
        {
          columnKey: 'action',
          label: '操作',
          width: 130,
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
      // 是否显示导入弹窗
      showImport: false
    };
  },
  methods: {
    /* 刷新表格 */
    reload() {
      this.$refs.table.reload({page: 1, where: this.where});
    },
    /* 重置搜索 */
    reset() {
      this.where = {};
      this.reload();
    },
    /* 显示编辑 */
    openEdit(row) {
      if (!this.$hasPermission(row!==null?'sys:user:edit':'sys:user:add')){
        return this.$message.warning('没有权限！');
      }
      this.current = row;
      this.showEdit = true;
    },
    /* 删除 */
    remove(row) {
      if (!this.$hasPermission('sys:user:remove')){
        return this.$message.warning('没有权限！');
      }
      const loading = this.$loading({lock: true});
      this.$http.post('/sys/user/' + row.userId).then(res => {
        loading.close();
        if (res.data.code === 0) {
          this.$message.success(res.data.msg);
          this.reload();
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        loading.close();
        this.$message.error(e.message);
      });
    },
    /* 批量删除 */
    removeBatch() {
      if (!this.selection.length) {
        this.$message.error('请至少选择一条数据')
        return;
      }
      if (!this.$hasPermission('sys:user:remove')){
        return this.$message.warning('没有权限！');
      }
      this.$confirm('确定要删除选中的用户吗?', '提示', {
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({lock: true});
        this.$http.post('/sys/user/batch', {
          data: this.selection.map(d => d.userId)
        }).then(res => {
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
      }).catch(() => {
      });
    },
    /* 更改状态 */
    editState(row) {
      if (!this.$hasPermission('sys:user:edit')){
        return this.$message.warning('没有权限！');
      }
      const loading = this.$loading({lock: true});
      this.$http.put('/sys/user/state/' + row.userId, {'state':row.state}).then(res => {
        loading.close();
        if (res.data.code === 0) {
          this.$message({type: 'success', message: res.data.msg});
        } else {
          row.state = !row.state ? 1 : 0;
          this.$message.error(res.data.msg);
        }
      }).catch(e => {
        loading.close();
        this.$message.error(e.message);
      });
    }
  }
}
</script>

<style scoped>
</style>
