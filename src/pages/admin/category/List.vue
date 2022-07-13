<template>
  <!-- 产品栏目管理 -->
  <div class="column">
    <!-- 头部区域 -->
    <div class="header">
       <el-button type="primary" @click="addProduct">添加</el-button>
    </div>
    <!-- 表格内容展示区 -->
    <div class="table">
      <el-table :data="productData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center">
        </el-table-column>
        <!-- 栏目编号 -->
        <el-table-column prop="id" label="栏目编号" align="center">
        </el-table-column>
        <!-- 名称 -->
        <el-table-column prop="name" label="名称" align="center">
        </el-table-column>
        <!-- 图片 -->
        <el-table-column label="图标" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            <el-image
              style="width: 30px; height: 30px"
              :src="scope.row.icon"
              :preview-src-list="[scope.row.icon]"
            >
            </el-image>
          </template>
        </el-table-column>
        <!-- 排序号 -->
        <el-table-column prop="num" label="排序号" align="center">
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button @click="editProduct(scope.row)" type="text" size="small">编辑</el-button>
            <el-button class="red_info" style="color: red" type="text" size="small" @click.prevent="toDelete(scope.row.id)">删除</el-button>
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
        :model="productForm"
        :rules="rules"
        ref="product_form"
        label-width="80px"
      >
        <!-- 栏目名称 -->
        <el-form-item label="栏目名称" prop="name">
          <el-input v-model="productForm.name"></el-input>
        </el-form-item>
        <!-- 序号 -->
        <el-form-item label="价格" prop="num">
          <el-input v-model.number="productForm.num"></el-input>
        </el-form-item>
        <!-- 图标 -->
        <el-form-item label="图标" prop="icon">
          <el-upload
            class="avatar-uploader"
            :action="uploadFileURL"
            :show-file-list="false"
            :on-success="handleSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="imageUrl" :src="productForm.icon" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 底部操作按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <!-- 提交表单后 调用重置表单的方法-->
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入axios
import { get, post ,del} from "@/utils/request";
// 引入文件上传路径 和 文件预览路径
import { showFileURL, uploadFileURL } from "@/utils/config";
import { login } from "@/api/user";
// import {
//   deleteById,
//   findAll,
//   saveOrUpdate
// } from '../../../../api/proCategory'
import _ from 'lodash'

export default {
  data() {
    return {
      // 上传文件的服务器地址
      uploadFileURL,

      productData: [],
      // 当前页码
      currentPage: 1,
      // 每页要展示的数据条数
      pageSize: 8,
      // 页面展示数据的总条数
      total: 10,
      // 控制模态框的显示与隐藏
      dialogVisible: false,
      // 模态框的标题
      dialogTitle: "添加产品",
      // 表单对象
      productForm: {
        // 栏目名称
        name: "",
        // 序号
        num: "",
        // 图标
        icon: "",
      },
      // 表单验证规则
      rules: {
        // 产品名称
        name: [{ required: true, message: "请输入栏目名称", trigger: "blur" }],
        // 序号
        num: [
          { required: false, message: "请输入序号", trigger: "blur" },
          { type: "number", message: "序号必须是数字" },
        ],
        // 图标
        icon: [{ required: true, message: "请选择图标", trigger: "change" }],
      },
      // 图标预览的路径
      imageUrl: "",
    };
  },
  computed: {},
  methods: {
    // 上传成功之后 调用方法
    // res 上传成功之后的回调参数
    handleSuccess(res, file) {
      this.imageUrl = URL.createObjectURL(file.raw);
      // 上传成功之后 更新imgUrl预览图片的路径
      console.log(showFileURL + res.data.id);
      this.productForm.icon = showFileURL + res.data.id;
    },
    // 上传之前 要做的限制
    beforeUpload(file) {
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        this.$message.error("上传头像图片大小不能超过 3MB!");
      }
    },
    // 分页获取所有产品数组数据
    // 获取所有产品的数据
    async getAllProductData() {
      // 获取参数
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      // 通过对应的参数发送网络请求 获取产品数组数据
      let res = await get("/productCategory/pageQuery", data);
      // 将data中的产品数组 进行赋值
      this.productData = res.data.list;
      // 页面总数据条数赋值
      this.total = res.data.total;
    },
    // 控制每页数据条数
    // 每页要展示的数据条数
    handleSizeChange(val) {
      // 将每页要展示的条数 进行一个更新
      this.pageSize = val;
      // 当前的页数 重置到第一页
      this.currentPage = 1;
      // 重新获取调用所有产品数据的方法
      this.getAllProductData();
    },
    // 控制当前显示的页数
    // 当前页码
    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.currentPage = val;
      // 重新调用获取所有产品数据的方法
      this.getAllProductData();
    },
    // 添加产品
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
    // 编辑产品
    // row 当前这一行的对象
    editProduct(row) {

      // 将当前点击的这一行的对象 赋值到 表单对象里
      // 浅拷贝 赋值对象的引用 对象的内存地址 用的还是用一个
      // 深拷贝
      this.productForm = { ...row };
      // 预览图片 地址赋值
      this.imageUrl = this.productForm.icon;
      // 设置模态框标题
      this.dialogTitle = "编辑栏目信息";
      // 模态框显示出来
      this.dialogVisible = true;
    },
    /**
     * @description: 删除
     * @param {*} id
     * @return {*}
     */
      // 删除
    toDelete(id) {
      // id 就是要删除的分类的对象的id
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // await等待后面异步函数运行完毕，拿到响应的数据，然后返回
          let res = await get("/productCategory/deleteById", { id });
          this.$message({
            type: "success",
            message: res.message,
          });
          this.getAllProductData();
          console.log(123);
        })
        .catch(() => {
          console.log(456);
        });
    },



    // 表单提交 更新或编辑产品信息
    submitForm() {
      this.$refs['product_form'].validate(async (valid) => {
        if (valid) {
        //  发送一个表单验证请求 提交表单对象
        // /productCategory/saveOrUpdate
         let res = await post('/productCategory/saveOrUpdate', this.productForm)
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
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 关闭模态框 调用表单重置的方法
    dialogClose() {
      // 重置表单
      this.$refs["product_form"].resetFields();
      // 关闭模态框
      setTimeout(() => {
        this.dialogVisible = false;
      }, 200);
    },
  },
  created() {
    // 自动的获取产品数据
    this.getAllProductData();
  },
  mounted() {},
};
</script>
<style scoped>
/* 分页区域样式 */
.paginetion {
  position: fixed;
  bottom: 20px;
  right: 10px;
}
</style>