<template>
  <!-- 基础配置页面 -->
  <div class="baseList">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 新增按钮 -->
      <el-button type="primary" size="small" @click="newAdd">新增</el-button>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <el-table :data="baseData">
        <el-table-column type="index" label="序号"> </el-table-column>
        <el-table-column prop="name" label="名称"> </el-table-column>
        <el-table-column prop="val" label="值">
          <!-- <div v-if=""></div> -->
          <template slot-scope="scope">
            <div v-if="judgeHandler(scope.row.val)">
              <el-image
                style="width: 40px; height: 40px"
                :src="scope.row.val"
                :preview-src-list="[scope.row.val]"
              >
              </el-image>
            </div>
            <div v-else>
              {{ scope.row.val }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="introduce" label="介绍"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary"
              plain size="small" @click="editBase(scope.row)">编辑</el-button>
            <el-button
              style="color: red"
              type="primary"
              plain
              size="small"
              @click="deleteBase(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 模态框 -->
      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        @close="dialogClose"
      >
        <!-- 表单区域 -->
        <!-- :model 表单对象 最终要提交的表单对象 -->
        <!--:rules 表单验证规则  -->
        <!-- ref 类比于id最终通过ref找到表单 -->
        <el-form
          :model="productForm"
          :rules="rules"
          ref="product_form"
          label-width="80px"
        >
          <!-- 产品名称 -->
          <el-form-item label="名称" prop="name">
            <el-input v-model="productForm.name"></el-input>
          </el-form-item>
          <!-- 介绍 -->
          <el-form-item label="介绍" prop="introduce">
            <el-input
              type="textarea"
              v-model="productForm.introduce"
            ></el-input>
          </el-form-item>
          <!-- 所属栏目 -->
          <el-form-item label="所属栏目">
            <el-select v-model="productForm.photoText" placeholder="请选择栏目">
              <el-option label="文字" value="wenzi"></el-option>
              <el-option label="图片" value="tupian"></el-option>
            </el-select>
          </el-form-item>

          <!-- 封面 -->
          <el-form-item label="值" prop="val">
            <template>
              <div v-if="productForm.photoText == 'tupian'">
                <el-upload
                  class="avatar-uploader"
                  action="uploadFileURL"
                  :show-file-list="false"
                  :on-success="handleSuccess"
                  :before-upload="beforeUpload"
                >
                  <img v-if="imageUrl" :src="productForm.val" class="avatar" />
                  <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                </el-upload>
              </div>
              <div v-else>
                <el-input v-model="productForm.val"></el-input>
              </div>
            </template>
          </el-form-item>
        </el-form>
        <!-- 底部操作按钮区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" @close="dialogClose"
            >取 消</el-button
          >
          <!-- 提交表单后 调用重置表单的方法 -->
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { showFileURL, uploadFileURL } from "@/utils/config";
import { get, post } from "@/utils/request";
export default {
  data() {
    return {
      // 上传地址
      uploadFileURL,
      //图片地址
      imageUrl: "",
      //表单验证规则
      rules: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        introduce: [
          { required: true, message: "请选择产品介绍", trigger: "change" },
        ],
        photoText: [
          { required: true, message: "请选择栏目", trigger: "change" },
        ],
        val: [{ required: true, message: "请输入内容", trigger: "blur" }],
      },
      //模态框表单数组
      productForm: {
        name: "",
        introduce: "",
        photoText: "",
        val: "",
      },

      // 模态框的开关
      dialogVisible: false,
      // 模态框标题
      dialogTitle: "",

      // 表格区域内容存放
      baseData: [],
    };
  },
  computed: {},
  methods: {
    // 图片上传与下载
    //file文件
    handleSuccess(res, file) {
      //上传之前做的限制
      this.imageUrl = URL.createObjectURL(file.raw);
      console.log(res);
      //上传成功后更新imgUrl预览图片的功能
      this.productForm.val = showFileURL + res.data.id;
      console.log(this.imageUrl);
    },
    beforeUpload(file) {
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        this.$message.error("上传头像图片大小不能超过 3MB!");
      }
    },
    // 模态框确定按钮的方法
    submitForm() {
      this.$refs["product_form"].validate(async (valid) => {
        if (valid) {
          // 发送表单验证的请求 提交表单对象
          let res = await post("/baseConfig/saveOrUpdate", this.productForm);
          //给用户一个成功或失败的提示
          if (res.status == 200) {
            //重新刷新数据
            this.$message({
              message: res.message,
              type: "success",
            });
            this.getAllBase();
            this.dialogVisible = false;
          } else {
            this.$message.error(res.message);
          }
          //

          //刷新页面
          //调用你关闭模态框的方法
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 模态框相关方法
    dialogClose() {
      // 关闭模态框调用表单重置的方法
      // 重置表单
      this.$refs["product_form"].resetFields();
      // 关闭模态框 设置延时
      setTimeout(() => {
        this.dialogVisible = false;
      }, 200);
    },
    judgeHandler(val) {
      var bool;
      var sub = val.substring(val.lastIndexOf(".") + 1, val.length);
      if (sub === "jpg" || sub === "jpeg" || sub === "png") {
        bool = true;
      } else {
        bool = false;
      }
      return bool;
    },

    // 获取后台数据的方法
    async getAllBase() {
      let res = await get("/baseConfig/findAll");
      this.baseData = res.data;
    },



    // 删除按钮方法
    async deleteBase(Id) {
      let data = {
        id: Id,
      };
      let res = await get("/baseConfig/deleteById", data);
      if (res.status == 200) {
        //重新刷新数据
        this.$message({
          message: res.message,
          type: "success",
        });
        this.getAllBase();
      } else {
        this.$message.error(res.message);
      }
    },
    // 编辑按钮方法
    editBase(row) {
      this.productForm = { ...row }; //将row里的内容拆开
      //预览图片地址赋值
      this.imageUrl = this.productForm.val;
      //编辑产品
      //设置标题
      this.dialogTitle = "新增基础配置";
      //模态框显示出来
      this.dialogVisible = true;
    },
    // 新增按钮的方法
    newAdd() {
      //清空内容
      this.productForm = {};
      //添加产品
      //将imageUrl置空
      this.imageUrl = "";
      //设置标题
      this.dialogTitle = "新增基础配置";
      //模态框显示出来
      this.dialogVisible = true;
    },
  },
  created() {
    // 获取后台数据的方法
    this.getAllBase();
  },
  mounted() {},
};
</script>
<style scoped>
</style>