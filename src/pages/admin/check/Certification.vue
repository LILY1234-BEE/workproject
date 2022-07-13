<template>
  <div>
    <!-- 员工实名认证审核 -->
    <!-- 头部区域 -->
    <el-form :inline="true" size="small" width="160" ref="product_form">
      <!-- 日期选择器 -->
      <el-date-picker
        v-model="value2"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        align="right"
      >
      </el-date-picker>
      <!-- 选择状态 -->
      <el-form-item>
        <!-- clearable -->
        <el-select v-model="productStatus" clearable placeholder="请选择状态">
          <el-option label="通过" value="通过" />
          <el-option label="不通过" value="不通过" />
          <el-option label="未审核" value="未审核" />
        </el-select>
      </el-form-item>
      <!-- 申请输入编号输入框 -->
      <el-form-item>
        <el-input v-model="ApplicantNumber" placeholder="申请人编号" clearable />
      </el-form-item>
      <!-- 查询 -->
      <el-form-item>
        <el-button type="primary" @click="toSearch">查询</el-button>
      </el-form-item>
    </el-form>
    <!-- 表格内容展示区 -->
    <el-table v-loading="loading" :data="tableData" size="small">
      <el-table-column type="index" :index="1" label="序号" />
      <el-table-column prop="userId" label="申请人编号" align="center" />

      <el-table-column prop="realname" label="姓名" align="center" />
      <el-table-column prop="applyTime" label="申请时间" align="center">
        <div>{{ getAllProductData.applyTime | filter }}</div>
      </el-table-column>
      <el-table-column prop="idCard" label="身份证号" align="center" />
      <!-- 身份证正面 -->
      <el-table-column
        prop="idcardPhotoPositive"
        label="身份证正面"
        align="center"
      >
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-image
            style="width: 30px; height: 30px"
            :src="scope.row.idcardPhotoPositive"
            :preview-src-list="[scope.row.idcardPhotoPositive]"
          ></el-image>
        </template>
      </el-table-column>
      <!-- 身份证反面 -->
      <el-table-column
        prop="idcardPhotoNegative"
        label="身份证反面"
        align="center"
      >
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-image
            style="width: 30px; height: 30px"
            :src="scope.row.idcardPhotoNegative"
            :preview-src-list="[scope.row.idcardPhotoNegative]"
          ></el-image>
        </template>
      </el-table-column>
      <!-- 银行卡号 -->
      <el-table-column prop="bankCard" label="银行卡号" align="center" />
      <!-- 银行卡 -->
      <el-table-column label="银行卡" align="center">
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-image
            style="width: 30px; height: 30px"
            :src="scope.row.bankCardPhoto"
            :preview-src-list="[scope.row.bankCardPhoto]"
          ></el-image>
        </template>
      </el-table-column>
      <!-- 状态 -->
      <el-table-column prop="status" label="状态" align="center" class="st">
        <template slot-scope="scope">
          <el-tag
            size="mini"
            :type="scope.row.status == '通过' ? 'success' : 'danger'"
            >{{ scope.row.status }}</el-tag
          >
        </template>
      </el-table-column>
      <!-- 操作:通过、不通过 -->
      <el-table-column fixed="right" label="操作" align="center">
        
        <template slot-scope="scope">
          <el-button @click="checkPass(scope.row.id)" type="text" size="small"
            >通过</el-button
          >

          <el-button
            @click="checkNoPass(scope.row.id)"
            style="color: red"
            type="text"
            size="small"
            >不通过</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination-div">
      <el-pagination
        size="mini"
       :current-page="currentPage"
        :page-sizes="[2, 4, 6, 8, 10]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script>
// 引入axios
import { get, post } from "@/utils/request";
import moment from "moment";

export default {
  data() {
    return {
      // 表单对象
      productForm: {
        data: "",
        message: "",
        status: "",
        timestamp: "",
      },
      //查询
      // 状态-下拉选择
      productStatus: '',
      //类型下拉选择
      ApplicantNumber: '',
      
      // 日期选择器
      // 搜索表单
      searchForm: {},
      // 表格数据
      tableData: [],
      // 表格总数据
      total: 10,
      // 表格加载
      loading: false,
      // 基本信息表单
      form: {},
      // 表单可见性
      visible: false,
      // 分页数据
      // params: {
      //   page: 1,
      //   pageSize: 10,
      // },
        // 当前的页码
      currentPage: 1,
      // 每页要展示的数据条数
      pageSize: 8,
      // 页面展示数据的总条数
      total: 10,
      // 定一个查询的参数
      queryData: {},

      productData: [],
      // 日期选择器
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      value2: "",
      // watch: {
      //   params: {
      //     handler() {
      //       this.getAllProductData();
      //     },
      //     deep: true,
      //   },
      // },
    }
  },
  created() {
    this.getAllProductData();
  },
  // 时间转换
  filters: {
    filter: function (data) {
      return moment(data).format("YYYY-MM-DD HH:mm:ss");
    },
  },

  methods: {
    /**
     * @description: 查询数据
     * @param {*}
     * @return {*}
     */
    toSearch() {
      let data = {};
      if(this.value2){
        data={
          status: this.productStatus,
        // 申请编号
        userId: this.ApplicantNumber,
        //时间封装
        beginTime: Date.parse(this.value2[0]),
        endTime: Date.parse(this.value2[1]),
        }
      }else{
   data = {
   status: this.productStatus,
        // 申请编号
        userId: this.ApplicantNumber,
    }
      }
      // 定义参数
      // let data = {
      //   // 状态
      //   status: this.productStatus,
      //   // 申请编号
      //   userId: this.ApplicantNumber,
      //   //时间封装
      //   beginTime: Date.parse(this.value2[0]),
      //   endTime: Date.parse(this.value2[1]),
      // };
      console.log(data);
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
     * @description: 分页每页条数发生变化的回调
     * @param {*} val  当前条数值
     * @return {*}
     */
    handleSizeChange(val) {
       // 将每页要展示的数据的条数 进行一个更新
      this.pageSize = val;
      // 将当前的页数 重置到第一页
      this.currentPage = 1;
      // 重新获取调用所有产品数据的方法
      this.getAllProductData();
    },
    /**
     * @description: 页码发生变化的回调
     * @param {*} val  当前条数值
     * @return {*}
     */
    handleCurrentChange(val) {
      this.currentPage = val;
      // 重新获取调用所有产品数据的方法
      this.getAllProductData();
    },

    /**
     * @description: 分页获取用户数据
     * @param {*}
     * @return {*}
     */
    // 分页获取数据
    async getAllProductData() {
      // 获取参数
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      // 通过对应的参数发送网络请求 获取数据
      let res = await get(
        "/certification/pageQueryCertificationApply",
      {
        ...data,
        ...this.queryData,
      }
      );
      console.log(res);
      // 将data进行赋值
      this.tableData = res.data.list;
      // 页面总数据条数赋值
      this.total = res.data.total;
    },
    // 操作
    /**
     * @description: 审核通过
     * @param {*} id 当前id
     * @return {*}
     * @author: ZachGmy
     */
    async checkPass(id) {
      // 发送通过请求
      let res = await get("/certification/checkPass", { id });
      // 给用户一个成功或失败的提示
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        // 重新刷新页面的数据· 
        this.getAllProductData();
      } else {
        this.$message.error(res.message);
      }
    },
    async checkNoPass(id) {
      // 发送不通过请求
      let res = await get("/certification/checkNoPass", { id });
      // 给用户一个成功或失败的提示s
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
  },
};
</script>
<style scoped>
.el-range-editor--medium.el-input__inner {
  height: 31.5px;
}
.el-table--small {
  font-size: 11px;
}
</style>
