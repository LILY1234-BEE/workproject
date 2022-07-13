<template>
  <!-- 产品管理页 -->
  <div class="product">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 添加按钮 -->
      <el-button type="primary" @click="addProduct">添加</el-button>
      <!-- 产品名称输入框 -->
      <el-input
        style="width: 240px"
        placeholder="请输入名称"
        v-model="productName"
        clearable
      >
      </el-input>
      <!-- 产品状态下拉框 -->
      <el-select v-model="productStatus" clearable placeholder="请选择状态">
        <el-option label="正常" value="正常"></el-option>
        <el-option label="下架" value="下架"></el-option>
      </el-select>
      <!-- 产品栏目下拉框 -->
      <el-select v-model="productCategory" clearable placeholder="请选择栏目">
        <el-option
          v-for="category in categoryData.filter((item) => !item.parentId)"
          :key="category.id"
          :label="category.name"
          :value="category.id"
        ></el-option>
      </el-select>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="queryProduct">查询</el-button>
    </div>
    <!-- 表格内容展示区 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="productData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center">
        </el-table-column>
        <!-- 产品编号 -->
        <el-table-column prop="id" label="产品编号" align="center">
        </el-table-column>
        <!-- 名称 -->
        <el-table-column prop="name" label="名称" align="center">
        </el-table-column>
        <!-- 图片 -->
        <el-table-column label="图片" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-image
              style="width: 40px; height: 40px"
              :src="scope.row.photo"
              :preview-src-list="[scope.row.photo]"
            >
            </el-image>
          </template>
        </el-table-column>
        <!-- 价格 -->
        <el-table-column prop="price" label="价格" align="center">
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" align="center">
        </el-table-column>
        <!-- 所属栏目 -->
        <el-table-column prop="category.name" label="所属栏目" align="center">
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="editProduct(scope.row)" type="text" size="small">
              编辑
            </el-button>

            <el-button
              @click="clickOffLine(scope.row.id)"
              style="color: red"
              v-if="scope.row.status == '正常'"
              type="text"
              size="small"
              >下架</el-button
            >
            <el-button
              @click="clickOnLine(scope.row.id)"
              style="color: blue"
              v-else
              type="text"
              size="small"
              >上架</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 底部分页区域 -->
    <div class="paginetion">
      <!-- 分页组件 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
    <!-- 模态框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" @close="dialogClose">
      <!-- 表单区域 -->
      <!-- :model 表单对象 最终我们要提交的那个表单对象 -->
      <!-- :rules 表单验证的规则 -->
      <!-- ref 类比与 id 最终通过ref找到这张表单 -->
      <el-form
        :model="productForm"
        :rules="rules"
        ref="product_form"
        label-width="80px"
      >
        <!-- 产品名称 -->
        <el-form-item label="产品名称" prop="name">
          <el-input v-model="productForm.name"></el-input>
        </el-form-item>
        <!-- 所属栏目 -->
        <el-form-item label="所属栏目" prop="productCategoryId">
          <el-select
            v-model="productForm.productCategoryId"
            placeholder="请选择活动区域"
          >
            <el-option
              v-for="category in categoryData.filter((item) => !item.parentId)"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- 价格 -->
        <el-form-item label="价格" prop="price">
          <el-input v-model.number="productForm.price"></el-input>
        </el-form-item>
        <!-- 封面 -->
        <el-form-item label="封面" prop="photo">
          <el-upload
            class="avatar-uploader"
            :action="uploadFileURL"
            :show-file-list="false"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="imageUrl" :src="productForm.photo" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <!-- 产品描述 -->
        <el-form-item label="产品描述" prop="description">
          <el-input
            type="textarea"
            v-model="productForm.description"
          ></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <!-- 提交表单后 调用重置表单的方法 -->
        <el-button type="primary" @click="submitForm">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入axios
import { get, post } from "@/utils/request";
// 引入vuex的辅助函数
import { mapActions, mapState } from "vuex";
// 引入文件上传路径 和 文件预览的路径
import {showFileURL, uploadFileURL} from '@/utils/config'
export default {
  data() {
    return {
      // 上传文件的服务器地址
      uploadFileURL,
      // 产品数组 - 表格的数据源的数据
      productData: [],
      // 产品名称-输入
      productName: "",
      // 产品状态-下拉选择
      productStatus: "",
      // 产品栏目-下拉选择
      productCategory: "",
      // 当前的页码
      currentPage: 1,
      // 每页要展示的数据条数
      pageSize: 8,
      // 页面展示数据的总条数
      total: 10,
      // 定一个查询的参数
      queryData: {},
      // 控制模态框的显示与隐藏
      dialogVisible: false,
      // 模态框的标题
      dialogTitle: "添加产品",
      // 表单对象
      productForm: {
        // 产品名称
        name: "",
        // 产品栏目
        productCategoryId: "",
        // 价格
        price: "",
        // 封面
        photo: "",
        // 产品描述
        description: "",
      },
      // 表单验证规则
      rules: {
        // 产品名称
        name: [{ required: true, message: "请输入产品名称", trigger: "blur" }],
        // 产品栏目
        productCategoryId: [
          { required: true, message: "请选择产品栏目", trigger: "change" },
        ],
        // 价格
        price: [
          { required: true, message: "请输入价格", trigger: "blur" },
          { type: "number", message: "价格必须是数字" },
        ],
        // 封面
        photo: [{ required: true, message: "请选择图片", trigger: "change" }],
      },
      // 图片预览的路径
      imageUrl: ''
    };
  },
  computed: {
    // 使用辅助函数
    ...mapState("category", ["categoryData"]),
  },
  methods: {
    // 通过命名空间找到category对应的vuex模块 调用它模块里的方法
    // ...mapActions('category模块的文件名',['对应的方法'])
    ...mapActions("category", ["getAllCategoryData"]),
    /**
     * @description: 上传成功之后 调用方法
     * @param {*} res 上传成功后回调的参数
     * @param {*} file 文件
     * @return {*}
     * @author: ZachGmy
     */
    handleSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
      // 上传成功之后 更新productForm.photo的路径
      this.productForm.photo = showFileURL + res.data.id
    },
    /**
     * @description: 上传之前 要做的一些限制
     * @param {*} file
     * @return {*}
     * @author: ZachGmy
     */
    beforeUpload(file) {
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        this.$message.error('上传头像图片大小不能超过 3MB!');
      }
    },
    /**
     * @description: 分页获取所有产品的数据
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    async getAllProductData() {
      // 获取参数
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      // queryData 和 data 结合成一个对象呢？
      // console.log({...data, ...this.queryData});
      // 通过对应的参数发送网络请求 获取产品数组数据
      let res = await get("/product/pageQuery", { ...data, ...this.queryData });
      // 将data中的产品数组 进行赋值
      this.productData = res.data.list;
      // 页面总数据条数 赋值
      this.total = res.data.total;
    },
    /**
     * @description: 产品上架操作
     * @param {*} id 当前产品的id
     * @return {*}
     * @author: ZachGmy
     */
    async clickOnLine(id) {
      // 发送上架请求
      let res = await get("/product/online", { id });
      // 给用户一个成功或失败的提示
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        // 重新刷新页面的数据
        this.getAllProductData();
      } else {
        this.$message.error(res.message);
      }
    },
    /**
     * @description: 产品下架操作
     * @param {*} id 产品id
     * @return {*}
     * @author: ZachGmy
     */
    async clickOffLine(id) {
      // 发送上架请求
      let res = await get("/product/offline", { id });
      // 给用户一个成功或失败的提示
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        // 重新刷新页面的数据
        this.getAllProductData();
      } else {
        this.$message.error(res.message);
      }
    },
    /**
     * @description: 根据条件 模糊查询产品的信息
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    /**
     * @description: 查询产品操作
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    queryProduct() {
      // 定义参数
      let data = {
        // 产品名称
        name: this.productName,
        // 产品状态
        status: this.productStatus,
        // 栏目的id
        productCategoryId: this.productCategory,
      };
      // 格式化参数 当某个属性没有值的时候 将其删除掉 以防影响网络请求的操作
      for (const key in data) {
        if (!data[key]) {
          delete data[key];
        }
      }
      // 将参数 赋值给 queryData
      this.queryData = data;
      // 将页数强制回到第一页
      this.currentPage = 1;
      // 重新加载产品数据
      this.getAllProductData();
    },
    /**
     * @description: 添加产品
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    addProduct() {
      // 清空表单对象
      this.productForm = {};
      // 将imageUrl 置空
      this.imageUrl = ''
      // 设置模态框的标题
      this.dialogTitle = "添加产品";
      // 模态框显示出来
      this.dialogVisible = true;
    },
   /**
     * @description: 编辑产品
     * @param {*} row 当前这一行的对象
     * @return {*}
     * @a uthor: ZachGmy
     */
    editProduct(row) {
      // 将当前点击的这一行的对象 赋值到 表单对象里
      // 浅拷贝 赋值对象的引用 对象的内存地址 用的还是用一个
      // 深拷贝
      this.productForm = { ...row };
      // 预览图片 地址赋值
      this.imageUrl = this.productForm.photo
      // 设置模态框的标题
      this.dialogTitle = "编辑产品";
      // 模态框显示出来
      this.dialogVisible = true;
    },
    /**
     * @description: 表单提交 更新或编辑产品信息
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    submitForm(){
      this.$refs['product_form'].validate(async (valid) => {
        if (valid) {
          // 发送表单验证的请求 提交表单对象
          let res = await post('/product/saveOrUpdate', this.productForm)
          // 给用户一个成功的提示
          if (res.status == 200) {
            this.$message({
              message: res.message,
              type: "success",
            });
            // 重新刷新页面的数据
            this.getAllProductData();
            // 调用关闭模态框的方法
            this.dialogClose()
          } else {
            this.$message.error(res.message);
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    /**
     * @description: 控制每页数据条数
     * @param {*} val 每页要展示的数据条数
     * @return {*}
     * @author: ZachGmy
     */
    handleSizeChange(val) {
      // 将每页要展示的数据的条数 进行一个更新
      this.pageSize = val;
      // 将当前的页数 重置到第一页
      this.currentPage = 1;
      // 重新调用获取所有产品数据的方法
      this.getAllProductData();
    },
    /**
     * @description: 控制当前显示的页数
     * @param {*} val 当前的页码
     * @return {*}
     * @author: ZachGmy
     */
    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.currentPage = val;
      // 重新调用获取所有产品数据的方法
      this.getAllProductData();
    },
    /**
     * @description: 获取产品栏目的方法
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    queryCategoryData() {
      // 定义参数
      let data = {
        page: 1,
        pageSize: 100,
      };
      // 调用vuex中定义好的方法
      this.getAllCategoryData(data);
    },
    // 关闭模态框 调用表单重置的方法
    dialogClose(){
      // 重置表单
      this.$refs['product_form'].resetFields();
      // 关闭模态框
      setTimeout(() => {
        this.dialogVisible = false
      }, 200);
    }
  },
  // 生命周期钩子函数 自动的去处理一下需要自执行的方法
  created() {
    // 自动的获取产品数据
    this.getAllProductData();
    // 自动获取产品栏目数据
    this.queryCategoryData();
  },
  mounted() {},
};
</script>
<style scoped>
/* 设置header的样式 */
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