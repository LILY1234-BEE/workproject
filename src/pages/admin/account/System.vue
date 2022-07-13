<template>
  <!-- 系统账单管理 -->
  <div id="system">
    <!-- 头部区域 -->
    <div id="header">
      <!-- 日期选择器 -->
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
      <!-- 类型下拉框 -->
      <el-select v-model="systemType" clearable placeholder="请选择类型">
        <el-option label="充值" value="充值"> </el-option>
        <el-option label="收益" value="收益"> </el-option>
        <el-option label="提现" value="提现"> </el-option>
      </el-select>
      <!-- 状态下拉框 -->
      <el-select v-model="sysType" clearable placeholder="请选择状态">
        <el-option label="正常" value="正常"> </el-option>
        <el-option label="未审核" value="未审核"> </el-option>
      </el-select>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="querySystem">查询</el-button>
    </div>
    <!-- 表格区域 -->
    <div id="content">
      <el-table :data="systemData">
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
    <!-- 分页器 -->
    <div id="paginetion">
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
import { get, post } from "@/utils/request";
export default {
  data() {
    return {
      //定义一个参数
      queryData: {},
      //总条数
      total: 10,
      // 页数与每页条数
      currentPage: 1,
      pageSize: 10,
      // 表格数据
      systemData: [],
      // 状态类型下拉框数据
      sysType: "",
      // 类型选择器
      systemType: "",
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
  computed: {},
  methods: {
    // 分页器的对应方法
    handleSizeChange(val) {
      // 将每页要展示的数据条数进行更新
      this.pageSize = val;
      this.currentPage = 1;
      this.getAllSystem();
    },
    handleCurrentChange(val) {
      // 将当前页数与分页插件动态点击控制页数绑定
      //c重新调用获取所有产品数据的方法
      this.currentPage = val;
      this.getAllSystem();
    },
    // 查询后台数据事件
    async getAllSystem() {
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      let res = await get("/account/pageQuerySystemAccount", {
        ...data,
        ...this.queryData,
      });
      this.systemData = res.data.list;
      this.total = res.data.total;
    },
    // 查询按钮事件
    querySystem() {
      let data = {
        type: this.systemType,
        //产品状态
        status: this.sysType,

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
      this.getAllSystem();
    },
  },
  created() {
    this.getAllSystem();
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