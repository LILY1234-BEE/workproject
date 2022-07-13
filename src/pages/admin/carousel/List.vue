<template>
  <!-- 产品管理页 -->
  <div class="product">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 添加按钮 -->
      <el-button type="primary" @click="addProduct">新增</el-button>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="PreProduct">预览</el-button>
    </div>

    <!-- 表格内容展示区 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="productData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center" />
        <!-- 轮播图名称 -->
        <el-table-column prop="name" label="轮播图名称" align="center" />
        <!-- 轮播图描述 -->
        <el-table-column prop="introduce" label="轮播图描述" align="center" />
        <!-- 轮播图图片 -->
        <el-table-column label="轮播图图片" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <!-- <el-image style="width: 40px; height: 40px" :src="scope.row.url">
            </el-image> -->
            <el-popover placement="right" trigger="hover">
              <el-image
                style="width: 300px"
                :src="scope.row.url"
                fit="contain"
              />
              <el-image
                slot="reference"
                style="height: 40px; width: 40px"
                :src="scope.row.url"
                fit="contain"
              />
            </el-popover>
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
              v-if="scope.row.status == '停用'"
              type="danger"
            >停用</el-tag>
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              plain
              size="small"
              @click="editProduct(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              type="primary"
              plain
              size="small"
              @click="delProduct(scope.row.id)"
            >
              删除
            </el-button>

            <el-button
              v-if="scope.row.status == '正常'"
              style="color: red"
              type="primary"
              plain
              size="small"
              autofocus
              @click="clickOffLine(scope.row)"
            >停用</el-button>
            <el-button
              v-else
              style="color: blue"
              type="primary"
              plain
              size="small"
              autofocus
              @click="clickOnLine(scope.row)"
            >启用</el-button>
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
      <!-- 表单区域 -->
      <!-- :model 表单对象 最终我们要提交的那个表单对象 -->
      <!-- :rules 表单验证的规则 -->
      <!-- ref 类比与 id 最终通过ref找到这张表单 -->
      <el-form
        ref="product_form"
        :model="productForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 名称 -->
        <el-form-item label="名称" prop="name">
          <el-input v-model="productForm.name" />
        </el-form-item>
        <!-- 轮播图片 -->
        <el-form-item label="轮播图片" prop="url">
          <el-upload
            class="avatar-uploader"
            :action="uploadFileURL"
            :show-file-array="false"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
            show-file-list
          >
            <img v-if="imageUrl" :src="productForm.url" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <!-- 产品描述 -->
        <el-form-item label="产品描述" prop="introduce">
          <el-input v-model="productForm.introduce" type="textarea" />
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <!-- 提交表单后 调用重置表单的方法 -->
        <el-button type="primary" @click="submitForm"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 轮播图模态框 -->
    <el-dialog
      :v-model="photo"
      title="大屏预览"
      :visible.sync="dialogVisibleShow"
    >
      <el-carousel :interval="5000" arrow="always">
        <el-carousel-item v-for="item in photo" :key="item.id">
          <img :src="item" alt="" style="width: 100%; height: 100%">
        </el-carousel-item>
      </el-carousel>
    </el-dialog>
  </div>
</template>

<script>
// 引入axios
import { get, post } from '@/utils/request'
// 引入vuex的辅助函数
import { mapActions, mapState } from 'vuex'
// 引入文件上传路径 和 文件预览的路径
import { showFileURL, uploadFileURL } from '@/utils/config'
import data from '@/views/pdf/content'
import { log } from '@antv/g2plot/lib/utils'
export default {
  data() {
    return {
      visible: false,
      dialogVisibleShow: false,
      // 上传文件的服务器地址
      uploadFileURL,
      // 产品数组 - 表格的数据源的数据
      productData: [],
      // 控制模态框的显示与隐藏
      dialogVisible: false,
      // 模态框的标题
      dialogTitle: '新增轮播图',
      // 表单对象
      productForm: {
        // 名称
        name: '',
        // 轮播图片
        url: '',
        // 产品描述
        description: ''
      },
      // 表单验证规则
      rules: {
        // 产品名称
        name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
        // 封面
        url: [{ required: true, message: '请上传图片', trigger: 'blur' }]
      },
      // 图片预览的路径
      imageUrl: '',
      // 存放相片链接
      photo: []
    }
  },
  computed: {},
  methods: {
    async getAllProductData() {
      // 获取参数
      // let data = {
      //   item: this.id,
      // };
      const res = await get('/carousel/findAll')
      // console.log(res);
      // 将data中的产品数组 进行赋值
      this.productData = res.data
    },
    // 通过命名空间找到category对应的vuex模块 调用它模块里的方法
    // ...mapActions('category模块的文件名',['对应的方法'])
    ...mapActions('category', ['getAllCategoryData']),
    /**
     * @description: 上传成功之后 调用方法
     * @param {*} res 上传成功后回调的参数
     * @param {*} file 文件
     * @return {*}
     * @author: ZachGmy
     */
    handleSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw)
      // 上传成功之后 更新productForm.url的路径
      this.productForm.url = showFileURL + res.data.id
    },
    /**
     * @description: 上传之前 要做的一些限制
     * @param {*} file
     * @return {*}
     * @author: ZachGmy
     */
    beforeUpload(file) {
      const isLt3M = file.size / 1024 / 1024 < 3
      if (!isLt3M) {
        this.$message.error('上传头像图片大小不能超过 3MB!')
      }
    },
    /**
     * @description: 产品启用操作
     * @param {*} id 当前产品的id
     * @return {*}
     * @author: ZachGmy
     */
    async clickOnLine(row) {
      row.status = '正常'
      const res = await post('/carousel/saveOrUpdate', row)
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: 'success'
        })
        // 重新刷新页面的数据
        this.getAllProductData()
      } else {
        this.$message.error(res.message)
      }
    },
    /**
     * @description: 添加产品
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    addProduct() {
      // 清空表单对象
      this.productForm = {}
      // 将imageUrl 置空
      this.imageUrl = ''
      // 设置模态框的标题
      this.dialogTitle = '新增轮播图'
      // 模态框显示出来
      this.dialogVisible = true
    },
    PreProduct() {
      // 设置模态框的标题
      this.dialogTitle = '大屏预览'
      // 模态框显示出来
      this.dialogVisibleShow = true
      const r = this.productData
      for (let i = 0; i < r.length; i++) {
        this.photo.push(r[i].url)
      }
    },

    // 删除
    delProduct(id) {
      // id 就是要删除的分类的对象的id
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // await等待后面异步函数运行完毕，拿到响应的数据，然后返回
          const res = await get('/carousel/deleteById', { id })
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllProductData()
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },

    /**
     * @description: 查询产品操作
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    /**
     * @description: 产品下架操作
     * @param {*} id 产品id
     * @return {*}
     * @author: ZachGmy
     */
    async clickOffLine(row) {
      console.log(row)
      row.status = '停用'
      // 发送上架请求
      const res = await post('/carousel/saveOrUpdate', row)
      console.log(res)
      // 给用户一个成功或失败的提示;
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: 'success'
        })
        // 重新刷新页面的数据
        this.getAllProductData()
      } else {
        this.$message.error(res.message)
      }
    },
    /**
     * @description: 添加产品
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    /**
     * @description: 编辑产品
     * @param {*} row 当前这一行的对象
     * @return {*}
     * @author: ZachGmy
     */
    editProduct(row) {
      // 将当前点击的这一行的对象 赋值到 表单对象里
      // 浅拷贝 赋值对象的引用 对象的内存地址 用的还是用一个
      // 深拷贝
      this.productForm = { ...row }
      // 预览图片 地址赋值
      this.imageUrl = this.productForm.url
      // 设置模态框的标题
      this.dialogTitle = '编辑产品'
      // 模态框显示出来
      this.dialogVisible = true
    },
    /**
     * @description: 表单提交 更新或编辑产品信息
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    submitForm() {
      console.log(this.productForm)
      this.$refs['product_form'].validate(async(valid) => {
        if (valid) {
          // 发送表单验证的请求 提交表单对象
          const res = await post('/carousel/saveOrUpdate', this.productForm)
          console.log(res)
          // 给用户一个成功的提示
          if (res.status == 200) {
            this.$message({
              message: res.message,
              type: 'success'
            })
            // 重新刷新页面的数据
            this.getAllProductData()
            // 调用关闭模态框的方法
            this.dialogClose()
          } else {
            this.$message.error(res.message)
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    dialogClose() {
      // 重置表单
      this.$refs['product_form'].resetFields()
      // 关闭模态框
      setTimeout(() => {
        this.dialogVisible = false
      }, 200)
    },
    // clear
    clearHamdler(filelist) {
      console.log(filelist)
    }
  },
  created() {
    // 自动的获取产品数据
    this.getAllProductData()
  },
  mounted() {}
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;

  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
<style scoped>
/* 设置header的样式 */
.header {
  line-height: 40px;
}
</style>
