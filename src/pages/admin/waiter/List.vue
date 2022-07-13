<template>
  <!-- 员工管理页 -->
  <div>
    <!-- 头部区域 -->
    <div class="header">
      <!-- 添加按钮 -->
      <el-button type="primary" @click="addWaiter">添加</el-button>
      <!-- 用户名输入框 -->
      <!-- {{ list }} -->
      <!-- {{ waiterData }} -->
      <el-input
        v-model="list.username"
        style="width: 240px"
        placeholder="请输入用户名"
        clearable
      />
      <!-- 状态选择器 -->
      <el-select v-model="list.status" clearable placeholder="请选择状态">
        <el-option label="禁用" value="禁用" />
        <el-option label="正常" value="正常" />
      </el-select>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="queryWaiter">查询</el-button>
    </div>
    <!-- 表格内部展示区 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="waiterData" style="width: 100%">
        <!-- 编号 -->
        <el-table-column prop="id" label="编号" align="center" />
        <!-- 用户名 -->
        <el-table-column prop="username" label="用户名" align="center" />
        <!-- 姓名 -->
        <el-table-column prop="realname" label="姓名" align="center" />
        <!-- 手机号 -->
        <el-table-column prop="telephone" label="手机号" align="center" />
        <!-- 性别 -->
        <el-table-column prop="gender" label="性别" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <i
              v-if="scope.row.gender == 'male'"
              class="el-icon-male"
              style="color: #86d1bd"
            />
            <i
              v-if="scope.row.gender == 'female'"
              class="el-icon-female"
              style="color: #ed8e9a"
            />
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status == '正常'"
              type="success"
            >正常</el-tag>
            <el-tag
              v-if="scope.row.status == '禁用'"
              type="danger"
            >禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              style="color: #30b08f"
              type="text"
              size="small"
              @click="edictWaiter(scope.row)"
            >编辑</el-button>
            <el-button
              style="color: #eb7d8b"
              type="text"
              size="small"
              @click="deleteWaiter(scope.row.id)"
            >删除</el-button>
            <el-button
              style="color: #8fafce"
              type="text"
              size="small"
              @click="waiterdetails(scope.row)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 底部分页区域 -->
    <div class="paginetion">
      <!-- 分页组件 -->
      <el-pagination
        :current-page="list.page"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="list.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      >
        >
      </el-pagination>
    </div>
    <!-- 模态框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      @close="dialogClose"
    >
      <!-- 表单区域 -->
      <!-- :model 表单对象 最终我们要提交的那个表单对象 -->
      <!-- :rules 表单验证的规则 -->
      <!-- ref 类比与 id 最终通过ref找到这张表单 -->
      <!-- {{ waiterForm }} -->
      <el-form
        ref="waiter_form"
        :model="waiterForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="waiterForm.username" />
        </el-form-item>
        <!-- 姓名 -->
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="waiterForm.realname" />
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机号" prop="telephone">
          <el-input v-model.number="waiterForm.telephone" />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="waiterForm.password" />
        </el-form-item>
        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-radio v-model="waiterForm.gender" label="male">男</el-radio>
          <el-radio v-model="waiterForm.gender" label="female">女</el-radio>
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
import { get, post } from '@/utils/request'
export default {
  data() {
    var checkphone = (rule, value, callback) => {
      // let phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!this.isCellPhone(value)) {
        // 引入methods中封装的检查手机格式的方法
        callback(new Error('请输入正确的手机号!'))
      } else {
        callback()
      }
    }
    return {
      // 参数
      list: {
        page: 1,
        pageSize: 10
      },
      // 产品数组 表格的数据源的数据
      waiterData: [],
      // 用户名-输入
      waiterName: '',
      // 产品状态-下拉选择
      waiterStatus: '',
      // // 当前的页码
      // currentPage: 1,
      // // 每页要展示的数据条数
      // pageSize: 8,
      // // 页面展示数据的总条数
      total: 20,
      //  定一个查询的参数
      queryData: {},
      // 模态框的标题
      dialogTitle: '添加用户',
      // 控制模态框的显示与隐藏
      dialogVisible: false,
      // 选择是男是女 默认为1:男
      waiterForm: {
        // 用户名
        username: '',
        // 姓名
        realname: '',
        // 电话号码
        telephone: '',
        // 密码
        password: '',
        // 性别
        gender: '',
        roleId: 1
      },
      rules: {
        // 产品名称
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' }
        ],
        // 产品栏目
        realname: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        // 价格
        telephone: [
          {
            required: true,
            validator: checkphone,
            message: '请输入电话号码',
            trigger: 'blur'
          }
        ],
        // 封面
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      radio: '男'
    }
  },
  computed: {},
  created() {
    this.getAllwaiterData()
  },
  mounted() {},
  methods: {
    /**
     * @description:手机号验证函数
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    isCellPhone(val) {
      if (!/^1(3|4|5|6|7|8)\d{9}$/.test(val)) {
        return false
      } else {
        return true
      }
    },
    /**
     * @description: 获取所有用户的数据
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    async getAllwaiterData() {
      // 获取参数
      const res = await get('/baseUser/pageQuery', this.list)
      this.waiterData = res.data.list
      // 页面的总条数 赋值
      this.total = res.data.total
      // console.log(res.data.list.gender);
    },
    /**
     * @description:控制每页数据条数
     * @param {*}val 每页要展示的数据条数
     * @return {*}
     * @author: MQJ
     */
    handleSizeChange(val) {
      // 将每页要展示的数据的条数 进行一个更新
      this.list.pageSize = val
      // 将当前的页数 重置到第一页
      this.list.page = 1
      // 重新调用获取所有产品数据的方法
      this.getAllwaiterData()
    },
    /**
     * @description: 控制当前显示的页数
     * @param {*} val 当前的页码
     * @return {*}
     * @author: MQJ
     */
    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.list.page = val
      // 重新调用获取所有产品数据的方法
      this.getAllwaiterData()
    },
    /**
     * @description:根据条件模糊
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    queryWaiter() {
      // // 重新加载产品数据
      if (this.list.username == '') {
        delete this.list.username
      } else if (this.list.status == '') {
        delete this.list.status
      }
      this.getAllwaiterData()
    },
    /**
     * @description: 对添加按钮进行相关设置
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    addWaiter() {
      // 清空表单对象
      this.waiterForm = {}
      // 设置模态框的标题
      this.dialogTitle = '添加用户'
      // 模态框显示出来
      this.dialogVisible = true
    },
    /**
     * @description:
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    edictWaiter(row) {
      // 将当前的这一行的对象 赋值到 表单对象框
      // 浅拷贝 赋值对象的引用 对象的内存地址 用的还是一个
      // this.waiterForm =  ...row ;
      // 深拷贝
      this.waiterForm = { ...row }
      // 设置模态框的标题
      this.dialogTitle = '编辑用户信息'
      // 模态框的显示
      this.dialogVisible = true
    },
    /**
     * @description:设置模态框的关闭 调用表单重置的方法
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    dialogClose() {
      // ref的值waiter_form
      this.$refs['waiter_form'].resetFields()
      // 模态框的关闭
      this.dialogVisible = false
    },
    /**
     * @description:模态框的确定按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    submitForm() {
      this.$refs['waiter_form'].validate(async(valid) => {
        if (valid) {
          if (this.dialogTitle == '编辑用户信息') {
            const res = await post('/baseUser/saveOrUpdate', this.waiterForm)
            if (res.status == 200) {
              this.$message({
                message: res.message,
                type: 'success'
              })
              // 重新刷新页面的数据
              this.getAllwaiterData()
            } else {
              this.$message.error(res.message)
            }
            // 刷新页面
            this.getAllwaiterData()
            // 调用关闭模态框的方法
            this.dialogClose()
          } else {
            const res = await post('/baseUser/addUserWidthRole', {
              ...this.waiterForm,
              roleId: 1
            })
            if (res.status == 200) {
              this.$message({
                message: res.message,
                type: 'success'
              })
              // 重新刷新页面的数据
              this.getAllwaiterData()
            } else {
              this.$message.error(res.message)
            }
            // 刷新页面
            this.getAllwaiterData()
            // 调用关闭模态框的方法
            this.dialogClose()
          }

          // 给用户一个成功的提示
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    /**
     * @description:表格的删除按钮
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    async deleteWaiter(id) {
      // console.log(id);
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // await等待后面异步函数运行完毕，拿到响应的数据，然后返回
          const res = await get('/baseUser/deleteById', { id })
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllwaiterData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      // let res = await get("/baseUser/deleteById", { id });
      // console.log(res);
      // // 重新刷新页面的数据
      // this.getAllwaiterData();
      // this.handleCurrentChange();
      // this.handleSizeChange();
    },
    /**
     * @description:详情按钮（跳转到详情页）
     * @param {*}
     * @return {*}
     * @author: MQJ
     */
    waiterdetails(row) {
      console.log(row.id)
      const tokenId = row.id
      this.$router.push({
        path: '/admin/waiter/Details',
        query: {
          tokenId
        }
      })
    }
  }
}
</script>
<style scoped>
/* 设置顶部样式 */
.header {
  line-height: 40px;
}
/* 分页区域的样式 */
.paginetion {
  position: fixed;
  bottom: 40px;
  right: 10px;
}
</style>
