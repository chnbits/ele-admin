<!-- 编辑弹窗 -->
<template>
  <el-dialog
    width="720px"
    :visible="visible"
    :lock-scroll="false"
    :destroy-on-close="true"
    custom-class="ele-dialog-form"
    :title="isUpdate?'修改菜单':'添加菜单'"
    @update:visible="updateVisible">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      label-width="92px"
      @keyup.enter.native="save"
      @submit.native.prevent>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="上级菜单:">
            <treeselect
              :options="menuList"
              v-model="form.parentId"
              :defaultExpandLevel="3"
              :normalizer="normalizer"
              placeholder="请选择上级菜单"/>
          </el-form-item>
          <el-form-item label="菜单名称:" prop="title">
            <el-input
              clearable
              v-model="form.title"
              placeholder="请输入菜单名称"/>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="菜单类型:">
            <el-radio-group
              v-model="form.menuType"
              @change="onMenuTypeChange">
              <el-radio :label="0">菜单</el-radio>
              <el-radio :label="1">按钮</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="打开方式:">
            <el-radio-group
              v-model="form.openType"
              :disabled="form.menuType === 1"
              @change="onOpenTypeChange">
              <el-radio :label="0">组件</el-radio>
              <el-radio :label="1">内链</el-radio>
              <el-radio :label="2">外链</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <div style="margin: 6px 0 28px 0;">
        <el-divider/>
      </div>
      <el-row :gutter="15">
        <el-col :sm="12">
          <el-form-item label="菜单图标:">
            <ele-icon-picker
              v-model="form.icon"
              placeholder="请选择菜单图标"
              :disabled="form.menuType===1"/>
          </el-form-item>
          <el-form-item name="path">
            <template slot="label">
              <el-tooltip
                v-if="form.openType === 2"
                placement="top"
                content="需要以`http://`、`https://`、`//`开头">
                <i class="el-icon-_question"></i>
              </el-tooltip>
              <span>{{ form.openType === 2 ? ' 外链地址:' : ' 路由地址:' }}</span>
            </template>
            <el-input
              clearable
              v-model="form.path"
              :disabled="form.menuType===1"
              :placeholder="form.openType === 2 ? '请输入外链地址' : '请输入路由地址'"/>
          </el-form-item>
          <el-form-item name="component">
            <template slot="label">
              <el-tooltip
                v-if="form.openType === 1"
                placement="top"
                content="需要以`http://`、`https://`、`//`开头">
                <i class="el-icon-_question"></i>
              </el-tooltip>
              <span>{{ form.openType === 1 ? ' 内链地址:' : ' 组件路径:' }}</span>
            </template>
            <el-input
              clearable
              v-model="form.component"
              :disabled="form.menuType === 1 || form.openType === 2"
              :placeholder="form.openType === 1 ? '请输入内链地址' : '请输入组件路径'"/>
          </el-form-item>
        </el-col>
        <el-col :sm="12">
          <el-form-item label="权限标识:">
            <el-input
              clearable
              v-model="form.authority"
              placeholder="请输入权限标识"
              :disabled="form.menuType === 0"/>
          </el-form-item>
          <el-form-item label="排序号:" prop="sortNumber">
            <el-input-number
              :min="0"
              v-model="form.sortNumber"
              placeholder="请输入排序号"
              controls-position="right"
              class="ele-fluid ele-text-left"/>
          </el-form-item>
          <el-form-item label="是否可见:">
            <el-switch
              v-model="form.isShow"
              :disabled="form.menuType === 1"/>
            <el-tooltip
              placement="top"
              content="选择不可见只注册路由不显示在侧边栏，比如添加页面应该选择不可见">
              <i class="el-icon-_question" style="vertical-align: middle;margin-left: 8px;"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer">
      <el-button @click="updateVisible(false)">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        @click="save">保存
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import EleIconPicker from 'ele-admin/packages/ele-icon-picker';

export default {
  name: 'MenuEdit',
  components: {EleIconPicker, Treeselect},
  props: {
    // 弹窗是否打开
    visible: Boolean,
    // 修改回显的数据
    data: Object,
    // 全部菜单数据
    menuList: Array
  },
  data() {
    return {
      // 表单数据
      form: this.initFormData(this.data),
      // 表单验证规则
      rules: {
        title: [
          {required: true, message: '请输入菜单名称', trigger: 'blur'}
        ],
        sortNumber: [
          {required: true, message: '请输入排序号', trigger: 'blur'}
        ]
      },
      // 提交状态
      loading: false,
      // 是否是修改
      isUpdate: false
    };
  },
  watch: {
    data() {
      this.isUpdate = !!(this.data && this.data.menuId);
      this.form = this.initFormData(this.data);
    }
  },
  methods: {
    /* 下拉树格式化 */
    normalizer(d) {
      return {
        id: d.menuId,
        label: d.title,
        children: d.children || undefined
      };
    },
    /* 保存编辑 */
    save() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$http[this.isUpdate ? 'put' : 'post']('/sys/menu',
            Object.assign({}, this.form, {
              parentId: this.form.parentId || 0,
              hide: this.form.isShow ? 0 : 1
            })
          ).then(res => {
            this.loading = false;
            if (res.data.code === 0) {
              this.$message({type: 'success', message: res.data.msg});
              this.updateVisible(false);
              this.$emit('done');
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
    },
    /* menuType选择改变 */
    onMenuTypeChange() {
      if (this.form.menuType === 0) {
        this.form.authority = '';
      } else {
        this.form.openType = 0;
        this.form.icon = '';
        this.form.path = '';
        this.form.component = '';
        this.form.hide = 0;
        this.form.isShow = true;
      }
    },
    /* openType选择改变 */
    onOpenTypeChange() {
      if (this.form.openType === 2) {
        this.form.component = '';
      }
    },
    /* 初始化form数据 */
    initFormData(data) {
      let form = {
        menuType: 0,
        openType: 0,
        hide: 0,
        isShow: true
      };
      if (data) {
        let openType = 0;
        if (this.isUrl(data.path)) {
          openType = 2;
        } else if (this.isUrl(data.component)) {
          openType = 1;
        }
        Object.assign(form, data, {
          parentId: data.parentId === 0 ? null : data.parentId,
          isShow: data.hide === 0,
          openType: openType,
        });
      }
      return form;
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
