<template>
  <!-- 员工账单管理 -->
  <div id="employee">
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
      <!-- 收益下拉框 -->
      <el-select v-model="employGain" clearable placeholder="请选择类型">
        <el-option label="收益" value="收益"> </el-option>
        <el-option label="提现" value="提现"> </el-option>
      </el-select>
      <!-- 状态下拉框 -->
      <el-select v-model="employStatus" clearable placeholder="请选择类型">
        <el-option label="正常" value="正常"> </el-option>
        <el-option label="未审核" value="未审核"> </el-option>
      </el-select>
      <!-- 员工编号下拉框 -->
      <el-select v-model="employNumber" clearable placeholder="员工编号">
        <el-option
          v-for="employ in employData"
          :key="employ.id"
          :label="employ.username"
          :value="employ.id"
        >
        </el-option>
      </el-select>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="queryEmploy">查询</el-button>
    </div>
    <!-- 表格内容展示区 -->
    <div class="content">
      <el-table :data="tableData">
        <el-table-column prop="id" label="序号" align="center">
        </el-table-column>
        <el-table-column prop="transferMoney" label="栏目编号">
        </el-table-column>
        <el-table-column prop="transferTime" label="名称"> </el-table-column>
        <el-table-column prop="type" label="图标"> </el-table-column>
        <el-table-column prop="status" label="排序号"> </el-table-column>
        <el-table-column prop="description" label="操作"> </el-table-column>
      </el-table>
    </div>
    <!-- 底部分页 -->
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
      // 总条数
      total: 10,
      // 页数与页面最大条数
      currentPage: 1,
      pageSize: 10,
      // 表格源数据
      tableData: [],
      employGain: "",
      employStatus: "",
      employNumber: "",
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
      value2: "",
      queryData: {},
    };
  },
  computed: {
    ...mapState("employ", ["employData"]),
  },
  methods: {
    ...mapActions("employ", ["getAllEmployData"]),
    queryEmployData() {
      //定义参数
      let data = {
        page: 1,
        pageSize: 100,
        roleId: 2,
      };
      //调用vuex中定义好的方法
      //获取产品栏目的方法
      this.getAllEmployData(data);
    },
    handleSizeChange(val) {
      // 将每页要展示的数据条数进行更新
      this.pageSize = val;
      this.currentPage = 1;
      this.getAllEmploy();
      // console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      // 将当前页数与分页插件动态点击控制页数绑定
      //c重新调用获取所有产品数据的方法
      this.currentPage = val;
      this.getAllEmploy();
      // console.log(`当前页: ${val}`);
    },
    // 查询按钮事件
    queryEmploy() {
      let data = {
        type: this.employGain,
        userId: this.employNumber,
        //产品状态
        status: this.employStatus,
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
      this.getAllEmploy();
    },
    // 分页查询员工账单
    async getAllEmploy() {
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      let res = await get("/account/pageQueryEmployeeAccount", {
        ...data,
        ...this.queryData,
      });
      console.log(res);
      this.tableData = res.data.list;
      this.total = res.data.total;
    },
  },
  created() {
    this.queryEmployData();
    this.getAllEmploy();
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