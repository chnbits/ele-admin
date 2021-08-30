<template>
  <div class="ele-body">
    <el-card shadow="never">
      <!-- 搜索表单 -->
      <el-form :model="where" label-width="77px" class="ele-form-search" @keyup.enter.native="reload" @submit.native.prevent>
        <el-row :gutter="15">
          <el-col :md="6" :sm="12">
            <el-form-item label="职位名称:">
              <el-input clearable v-model="where.name" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <el-form-item label="备注:">
              <el-input clearable v-model="where.comments" placeholder="请输入"/>
            </el-form-item>
          </el-col>
          <el-col :md="6" :sm="12">
            <div class="ele-form-actions">
              <el-button type="primary" icon="el-icon-search" class="ele-btn-icon" @click="reload">查询
              </el-button>
              <el-button @click="reset">重置</el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <!-- 数据表格 -->
      <ele-pro-table ref="table" :where="where" :datasource="url" :columns="columns" :selection.sync="selection">
        <!-- 表头工具栏 -->
        <template slot="toolbar">
          <el-button size="small" type="primary" icon="el-icon-plus" class="ele-btn-icon" @click="openEdit(null)">添加
          </el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" class="ele-btn-icon" @click="removeBatch">删除
          </el-button>
        </template>
        <!-- 状态列 -->
        <template slot="deleted" slot-scope="{row}">
          <el-switch :active-value="0" :inactive-value="1" v-model="row.deleted" @change="editState(row)"/>
        </template>
        <!-- 操作列 -->
        <template slot="action" slot-scope="{row}">
          <el-link type="primary" :underline="false" icon="el-icon-edit" @click="openEdit(row)">修改
          </el-link>
          <el-popconfirm class="ele-action" title="确定要删除此角色吗？" @confirm="remove(row)">
            <el-link type="danger" slot="reference" :underline="false" icon="el-icon-delete">删除
            </el-link>
          </el-popconfirm>
        </template>
      </ele-pro-table>
    </el-card>
    <!-- 编辑弹窗 -->
    <position-edit :data="current" :visible.sync="showEdit" @done="reload"/>
  </div>
</template>

<script>
import PositionEdit from './position-edit';

export default {
  name: 'SystemPosition',
  components: {PositionEdit},
  data() {
    return {
      // 表格数据接口
      url: '/sys/position/page',
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
          label:'id',
          prop: 'id',
          width: 45,
          align: 'center',
          showOverflowTooltip: true
        },
        {
          prop: 'name',
          label: '名称',
          sortable: 'custom',
          align:'center',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'comments',
          label: '备注',
          sortable: 'custom',
          align:'center',
          showOverflowTooltip: true,
          minWidth: 110
        },
        {
          prop: 'deleted',
          label: '状态',
          align:'center',
          showOverflowTooltip: true,
          minWidth: 110,
          slot: 'deleted'
        },
        {
          prop: 'createTime',
          label: '创建时间',
          sortable: 'custom',
          align:'center',
          showOverflowTooltip: true,
          minWidth: 110,
          formatter: (row, column, cellValue) => {
            return this.$util.toDateString(cellValue);
          }
        },
        {
          prop: 'updateTime',
          label: '修改时间',
          align:'center',
          sortable: 'custom',
          showOverflowTooltip: true,
          minWidth: 110,
          formatter: (row, column, cellValue) => {
            return this.$util.toDateString(cellValue);
          }
        },
        {
          columnKey: 'action',
          label: '操作',
          width: 160,
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
      showAuth: false
    };
  },
  methods: {
    /* 刷新表格 */
    reload() {
      this.$refs.table.reload({page: 1});
    },
    /* 重置搜索 */
    reset() {
      this.where = {};
      this.$nextTick(() => {
        this.reload();
      });
    },
    /* 显示编辑 */
    openEdit(row) {
      this.current = row;
      this.showEdit = true;
    },
    /* 删除 */
    remove(row) {
      const loading = this.$loading({lock: true});
      this.$http.put('/sys/position/' + row.id).then(res => {
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
    /* 批量删除 */
    removeBatch() {
      if (!this.selection.length) {
        return this.$message.error('请至少选择一条数据');
      }
      this.$confirm('确定要删除选中的职位吗?', '提示', {
        type: 'warning'
      }).then(() => {
        const loading = this.$loading({lock: true});
        this.$http.put('/sys/position/batch', {
          data: this.selection.map(d => d.id)
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
    /*修改状态*/
    editState(row) {
      const loading = this.$loading({lock: true});
      this.$http.put('/sys/position/state/' + row.id, {'deleted':row.deleted}).then(res => {
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
