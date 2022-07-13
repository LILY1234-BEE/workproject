<template>
  <!-- 资讯分类管理 -->
  <div>
    <!-- 头部 -->
    <div class="header">
      <el-button type="primary" @click="addCategory">新增</el-button>
    </div>
    <!-- 表格区域的内容 -->
    <div class="table_data">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="categoryData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column prop="id" label="序号" align="center" />
        <!-- 名称 -->
        <el-table-column prop="name" label="名称" align="center" />
        <!-- 排序号 -->
        <el-table-column prop="no" label="排序号" align="center" />
        <!-- 描述 -->
        <el-table-column prop="description" label="描述" align="center" />
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              style="color: #2cb5ac"
              type="text"
              size="small"
              @click="edictCategory(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              style="color: #eb7d8b"
              type="text"
              size="small"
              @click="deleteCategory(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 模态框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @close="dialogClose"
    >
      {{ categoryForm }}
      <!-- 表单区域 -->
      <!-- :model 表单对象 最终我们要提交的那个表单对象 -->
      <!-- :rules 表单验证的规则 -->
      <!-- ref 类比与 id 最终通过ref找到这张表单 -->
      <el-form
        ref="category_form"
        :model="categoryForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 栏目名称 -->
        <el-form-item label="栏目名称" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <!-- 序号 -->
        <el-form-item label="序号" prop="id">
          <el-input v-model="categoryForm.id" />
        </el-form-item>
        <!-- 栏目介绍 -->
        <el-form-item label="栏目介绍" prop="description">
          <el-input
            v-model.number="categoryForm.description"
            type="textarea"
          />
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button type="primary" @click="submitForm"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入axios
import { get, post } from '@/utils/request'
export default {
  data() {
    return {
      // 表格数据
      categoryData: [],
      // 表单数据
      categoryForm: {
        // 栏目名称
        name: '',
        // 序号
        no: '',
        // 栏目介绍
        description: ''
      },
      // 表单规则
      rules: {
        // 产品名称
        name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }]
      },
      // 模态框标题
      dialogTitle: '新增',
      // 模态框是否显示
      dialogVisible: false
    }
  },
  computed: {},
  created() {
    this.getAllCategoryData()
  },
  mounted() {},
  methods: {
    /**
     * @description: 获取全部数据
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    async getAllCategoryData() {
      // 获取参数
      const res = await get('category/findAll')

      this.categoryData = res.data
    },
    /**
     * @description: 新增按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    addCategory() {
      // 清空表单对象
      this.categoryForm = {}
      // 修改模态框标题
      this.dialogTitle = '新增栏目信息'
      // 控制模态框是否显示
      this.dialogVisible = true
    },
    /**
     * @description: 编辑按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    edictCategory(row) {
      //  将当前的这一行的对象 赋值到 表单对象框
      // 浅拷贝 赋值对象的引用 对象的内存地址 用的还是一个
      // this.categoryForm =  ...row ;
      // 深拷贝
      this.categoryForm = { ...row }
      // 修改模态框标题
      this.dialogTitle = '编辑栏目信息'
      // 控制模态框是否显示
      this.dialogVisible = true
    },
    /**
     * @description:删除按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    async deleteCategory(id) {
      // console.log(id);
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // await等待后面异步函数运行完毕，拿到响应的数据，然后返回
          const res = await get('/category/deleteById', { id })
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllCategoryData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      // let res = await get("/category/deleteById", { id });
      // // 重新刷新页面的数据
      // this.getAllCategoryData();
    },
    /**
     * @description:模态框取消按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    dialogClose() {
      // ref的值category_form
      this.$refs['category_form'].resetFields()
      // 模态框的关闭
      this.dialogVisible = false
    },
    /**
     * @description:模态款确定按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    submitForm() {
      this.$refs['category_form'].validate(async(valid) => {
        if (valid) {
          const res = await post('/category/saveOrUpdate', this.categoryForm)
          if (res.status == 200) {
            this.$message({
              message: res.message,
              type: 'success'
            })
            // 重新刷新页面的数据
            this.getAllCategoryData()
            // 调用关闭模态框的方法
            this.dialogClose()
          } else {
            this.$message.error(res.message)
          }
          // 给用户一个成功的提示
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
<style scoped>
/* 分页区域的样式 */
.paginetion {
  position: fixed;
  bottom: 40px;
  right: 10px;
}
</style>
