<template>
  <!-- 顾客管理页 -->
  <div>
    <div class="header">
      <!-- 添加顾客 -->
      <el-button type="primary" @click="addcustome">添加</el-button>
      <!-- 输入框 -->
      <el-input
        v-model="list.username"
        style="width: 240px"
        placeholder="请输入顾客名"
        clearable
      />
      <!-- 状态 -->
      <el-select v-model="list.status" clearable placeholder="请选择状态">
        <el-option label="禁用" value="禁用" />
        <el-option label="正常" value="正常" />
      </el-select>
      <!-- 查询 -->
      <el-button type="primary" @click="querycustome">查询</el-button>
    </div>
    <!-- 表格展示区 -->
    <div class="table_content">
      <el-table :data="customeData" style="width: 100%">
        <!-- 编号 -->
        <el-table-column prop="id" label="编号" align="center" />
        <!-- 顾客名 -->
        <el-table-column prop="username" label="顾客名" align="center" />
        <!-- 姓名 -->
        <el-table-column prop="realname" label="姓名" align="center" />
        <!-- 手机号 -->
        <el-table-column prop="telephone" label="手机号" align="center" />
        <!-- 性别 -->
        <el-table-column prop="gender" label="性别" align="center">
          <template slot-scope="scope">
            <i
              v-if="scope.row.gender == 'male'"
              class="el-icon-male"
              style="color: blue"
            />
            <i
              v-if="scope.row.gender == 'female'"
              class="el-icon-female"
              style="color: Pink"
            />
          </template>
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" align="center">
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
              style="color: green"
              type="text"
              size="small"
              @click="edictcustome(scope.row)"
            >编辑</el-button>
            <el-button
              style="color: red"
              type="text"
              size="small"
              @click="deletecustome(scope.row.id)"
            >删除</el-button>
            <el-button
              style="color: blue"
              type="text"
              size="small"
              @click="customedetails(scope.row)"
            >详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页区域 -->
    <div class="pag">
      <!-- 分页 -->
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
      <el-form
        ref="custome_form"
        :model="customeForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 顾客名 -->
        <el-form-item label="顾客名" prop="username">
          <el-input v-model="customeForm.username" />
        </el-form-item>
        <!-- 姓名 -->
        <el-form-item label="姓名" prop="realname">
          <el-input v-model="customeForm.realname" />
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机号" prop="telephone">
          <el-input v-model.number="customeForm.telephone" />
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="customeForm.password" />
        </el-form-item>
        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-radio v-model="customeForm.gender" label="male">男</el-radio>
          <el-radio v-model="customeForm.gender" label="female">女</el-radio>
        </el-form-item>
      </el-form>
      <!-- 操作 -->
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
      if (value === '') {
        callback(new Error('请输入手机号'))
      } else if (!this.isCellPhone(value)) {
        callback(new Error('请输入正确的手机号!'))
      } else {
        callback()
      }
    }
    return {
      // 参数
      list: {
        page: 1,
        pageSize: 2,
        roleId: 6
      },
      // 表格的数据源的数据
      customeData: [],
      // 顾客名-输入
      customeName: '',
      customeStatus: '',
      total: 20,
      queryData: {},
      // 模态框的标题
      dialogTitle: '添加顾客',
      // 控制模态框
      dialogVisible: false,
      customeForm: {
        // 顾客名
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
          { required: true, message: '请输入顾客名称', trigger: 'blur' }
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
    this.getAllcustomeData()
  },
  methods: {
    async getAllcustomeData() {
      const data = {
        roleId: 6,
        page: this.list.page,
        pageSize: this.list.pageSize,
        username: this.list.username
      }
      // 获取参数
      const res = await get('/baseUser/pageQuery', data)
      this.customeData = res.data.list

      // 数据总条数
      this.total = res.data.total
    },

    handleSizeChange(val) {
      // 将每页要展示的数据的条数 进行一个更新
      this.list.pageSize = val
      // 将当前的页数 重置到第一页
      this.list.page = 1
      // 重新调用获取所有产品数据的方法
      this.getAllcustomeData()
    },

    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.list.page = val
      // 重新调用获取所有产品数据的方法
      this.getAllcustomeData()
    },
    isCellPhone(val) {
      if (!/^1(3|4|5|6|7|8)\d{9}$/.test(val)) {
        return false
      } else {
        return true
      }
    },
    querycustome() {
      // // 重新加载产品数据
      if (this.list.username == '') {
        delete this.list.username
      } else if (this.list.status == '') {
        delete this.list.status
      }
      this.getAllcustomeData()
    },
    async deletecustome(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // 异步函数
          const res = await get('/baseUser/deleteById', { id })
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllcustomeData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    addcustome() {
      // 清空表单对象
      this.customeForm = {}
      // 设置模态框的标题
      this.dialogTitle = '添加顾客'
      // 模态框显示出来
      this.dialogVisible = true
    },

    edictcustome(row) {
      // 将当前的这一行的对象 赋值到 表单对象框
      this.customeForm = { ...row }
      // 模态框标题
      this.dialogTitle = '编辑顾客信息'
      // 显示模态框
      this.dialogVisible = true
    },

    dialogClose() {
      this.$refs['custome_form'].resetFields()
      // 关闭模态框
      this.dialogVisible = false
    },
    submitForm() {
      this.$refs['custome_form'].validate(async(valid) => {
        if (valid) {
          if (this.dialogTitle == '编辑顾客信息') {
            const res = await post('/baseUser/saveOrUpdate', this.customeForm)
            if (res.status == 200) {
              this.$message({
                message: res.message,
                type: 'success'
              })
              // 刷新页面的数据
              this.getAllcustomeData()
            } else {
              this.$message.error(res.message)
            }
            this.getAllcustomeData()
            // 关闭模态框
            this.dialogClose()
          } else {
            const res = await post('/baseUser/addUserWidthRole', {
              ...this.customeForm,
              roleId: 1
            })
            if (res.status == 200) {
              this.$message({
                message: res.message,
                type: 'success'
              })
              // 刷新页面的数据
              this.getAllcustomeData()
            } else {
              this.$message.error(res.message)
            }
            // 刷新页面
            this.getAllcustomeData()
            // 关闭模态框
            this.dialogClose()
          }
          // 成功提示
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    customedetails(row) {
      console.log(row.id)
      const tokenId = row.id
      this.$router.push({
        path: '/admin/custome/Details',
        query: {
          tokenId
        }
      })
    }
  }
}
</script>
<style scoped>
.header {
  line-height: 30px;
}

.pag {
  position: fixed;
  bottom: 30px;
  right: 10px;
}
</style>
