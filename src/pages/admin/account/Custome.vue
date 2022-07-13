<template>
  <!-- 顾客账户管理 -->
  <div id="custom">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 时间日期选择 -->
      <el-date-picker
        v-model="value2"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        align="right"
      >
      </el-date-picker>
      <!-- 消费类型下拉框 -->
      <el-select v-model="consumType" clearable placeholder="请选择类型">
        <el-option label="充值" value="充值"> </el-option>
        <el-option label="消费" value="消费"> </el-option>
      </el-select>
      <!-- 状态类型下拉框 -->
      <el-select v-model="orderType" clearable placeholder="请选择状态">
        <el-option label="正常" value="正常"> </el-option>
        <el-option label="未审核" value="未审核"> </el-option>
      </el-select>
      <!-- 顾客编号下拉框 -->
      <el-select v-model="customNumber" clearable placeholder="顾客编号">
        <el-option
          v-for="customJs in customData"
          :key="customJs.id"
          :label="customJs.username"
          :value="customJs.id"
        >
        </el-option>
      </el-select>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="queryCustom">查询</el-button>
    </div>
    <!-- 表格区域 -->
    <div class="content">
      <el-table :data="customerData">
        <el-table-column prop="id" label="编号" align="center">
        </el-table-column>
        <el-table-column prop="transferMoney" label="交易金额">
        </el-table-column>
        <el-table-column prop="transferTime" label="交易时间">
        </el-table-column>
        <el-table-column prop="type" label="交易类型"> </el-table-column>
        <el-table-column prop="status" label="状态"> </el-table-column>
        <el-table-column prop="description" label="描述"> </el-table-column>
      </el-table>
    </div>
    <!-- 尾部分页区域 -->
    <div class="paginetion">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[2, 4, 6, 10]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { get, post } from "@/utils/request";
export default {
  data() {
    return {
      // 定义接受参数
      queryData: {},
      // 页面总条数
      total: 10,
      // 页数和每页大小
      currentPage: 1,
      pageSize: 10,
      // 表格数据
      customerData: [],
      // 顾客编号下拉框数据
      customNumber: "",
      // 状态类型下拉框数据
      orderType: "",
      // 消费类型下拉框数据
      consumType: "",
      // 日期选择器的相关内容
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
            },
          },
        ],
      },
      // 日期选择器绑定的值
      value2: "",
    };
  },
  computed: {
    ...mapState("customJs", ["customData"]),
  },
  methods: {
    //获取产品栏目的方法
    queryCustomData() {
      //定义参数
      let data = {
        page: 1,
        pageSize: 100,

        roleId: 6,
      };
      //调用vuex中定义好的方法
      //获取产品栏目的方法
      this.getAllCustomData(data);
    },
    //对应封装方法
    ...mapActions("customJs", ["getAllCustomData"]),
    // 分页器的对应方法
    handleSizeChange(val) {
      // 将每页要展示的数据条数进行更新
      this.pageSize = val;
      this.currentPage = 1;
      this.getAllCustom();
    },
    handleCurrentChange(val) {
      // 将当前页数与分页插件动态点击控制页数绑定
      //c重新调用获取所有产品数据的方法
      this.currentPage = val;
      this.getAllCustom();
    },
    // 获取表格数据查询方法
    async getAllCustom() {
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      let res = await get("/account/pageQueryCustomerAccount", {
        ...data,
        ...this.queryData,
      });
      this.customerData = res.data.list;
      this.total = res.data.total;
    },
    // 查询按钮方法
    queryCustom() {
      let data = {
        type: this.consumType,
        //产品状态
        status: this.orderType,
        userId: this.customNumber,
        //时间封装
        beginTime: Date.parse(this.value2[0]),
        endTime: Date.parse(this.value2[1]),
      };

      //格式化参数 当某个属性没有值的时候，将其删掉 以防止影响网络请求的操作
      for (const key in data) {
        //console.log(data[key]);
        if (!data[key]) {
          //若对象里没有值，直接删除
          delete data[key];
        }
      }
      console.log(data);
      //将参数赋值给queryData
      this.queryData = data;
      this.currentPage = 1;
      this.getAllCustom();
    },
  },
  created() {
    this.getAllCustom();
    this.queryCustomData();
  },
  mounted() {},
};
</script>
<style scoped>
.header {
  line-height: 40px;
}
/* 分页区域样式 */
.paginetion {
  position: fixed;
  bottom: 40px;
  right: 10px;
}
</style>