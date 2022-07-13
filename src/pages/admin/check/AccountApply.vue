<template>
  <!-- 账户变更页 -->
  <div class="product">
    <!-- 头部区域 -->
    <div class="header">
      <!-- 时间节点 -->
      <el-date-picker
        v-model="value2"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
      >
      </el-date-picker>

      <!-- 变更类型 -->
      <el-select
        v-model="applyTypeStatus"
        clearable
        placeholder="请选择变更类型"
      >
        <el-option label="提现" value="提现"></el-option>
        <el-option label="充值" value="充值"></el-option>
      </el-select>
      <!-- 账户状态下拉框 -->
      <el-select v-model="productStatus" clearable placeholder="请选择账户状态">
        <el-option label="通过" value="通过"></el-option>
        <el-option label="不通过" value="不通过"></el-option>
        <el-option label="未审核" value="未审核"></el-option>
      </el-select>
      <!-- 申请人编号 -->
      <el-input
        style="width: 240px"
        placeholder="申请人编号"
        v-model="ApplicantNumber"
        clearable
      >
      </el-input>
      <!-- 查询按钮 -->
      <el-button type="primary" @click="queryProduct">查询</el-button>
    </div>
    <!-- 表格内容展示区 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="accountData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center">
        </el-table-column>
        <!-- 申请人编号 -->
        <el-table-column prop="userId" label="申请人编号" align="center">
        </el-table-column>
        <!-- 申请时间 -->
        <el-table-column prop="applyTime" label="申请时间" align="center">
          <template slot-scope="scope">
            <span>{{
              moment(scope.row.applyTime).format("YYYY-MM-DD HH:mm:SS")
            }}</span>
          </template>
        </el-table-column>
        <!-- 变更类型 -->
        <el-table-column prop="applyType" label="变更类型" align="center">
        </el-table-column>
        <!-- 变更资金 -->
        <el-table-column prop="money" label="变更资金" align="center">
          <!-- 作用域插槽 -->
          <template slot-scope="scope">
            ￥<span style="color: red; font-size: 24px">{{
              scope.row.money
            }}</span
            >元
          </template>
        </el-table-column>
        <!-- 变更原因 -->
        <el-table-column prop="reason" label="变更原因" align="center">
        </el-table-column>
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" align="center">
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              @click="clickOffLine(scope.row.id)"
              type="text"
              size="small"
              style="color: red"
            >
              不通过
            </el-button>

            <el-button
              @click="clickOnLine(scope.row.id)"
              type="text"
              size="small"
            >
              通过
            </el-button>
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
  </div>
</template>

<script>
// 引入axios
import { get, post } from "@/utils/request";
// 引入vuex的辅助函数
import { mapActions, mapState } from "vuex";
// 引入时间函数
import moment from "moment";
export default {
  data() {
    return {
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

      // 账户数组 - 表格的数据源的数据
      accountData: [],
      // 申请人编号-输入
      ApplicantNumber: "",

      // 用户状态-下拉选择
      productStatus: "",
      //变更类型下拉选择
      applyTypeStatus: "",

      // 当前的页码
      currentPage: 1,
      // 每页要展示的数据条数
      pageSize: 8,
      // 页面展示数据的总条数
      total: 10,
      // 定一个查询的参数
      queryData: {},
    };
  },
  computed: {
    // 使用辅助函数
    ...mapState("category", ["categoryData"]),
  },
  methods: {
    moment,
    async getAllaccountData() {
      // 获取参数
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };
      let res = await get("/accountApply/pageQueryAccountApply", {
        ...data,
        ...this.queryData,
      });
      // 将data中的账户数组 进行赋值
      this.accountData = res.data.list;
      // 页面总数据条数 赋值
      this.total = res.data.total;
    },

    async clickOnLine(id) {
      // 发送申请通过请求
      let res = await get("/accountApply/checkPass", { id });
      // 给用户一个成功或失败的提示
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        // 重新刷新页面的数据
        this.getAllaccountData();
      } else {
        this.$message.error(res.message);
      }
    },

    async clickOffLine(id) {
      // 发送申请不通过请求
      let res = await get("/accountApply/checkNoPass", { id });
      // 给用户一个成功或失败的提示
      if (res.status == 200) {
        this.$message({
          message: res.message,
          type: "success",
        });
        // 重新刷新页面的数据
        this.getAllaccountData();
      } else {
        this.$message.error(res.message);
      }
    },

    queryProduct() {
      // 定义参数
      let data = {};
      if(this.value2){
      data= {

 // 申请人编号
        userId: this.ApplicantNumber,
        // 用户状态
        status: this.productStatus,
        //变更类型
        applyType: this.applyTypeStatus,

        beginTime: Date.parse(this.value2[0]),

        endTime: Date.parse(this.value2[1]),
      }
      }
      else{
          data= {

 // 申请人编号
        userId: this.ApplicantNumber,
        // 用户状态
        status: this.productStatus,
        //变更类型
        applyType: this.applyTypeStatus,

    
      }
  
       
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
      // 重新加载账户数据
      this.getAllaccountData();
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
      // 重新调用获取所有账户数据的方法
      this.getAllaccountData();
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
      // 重新调用获取所有账户数据的方法
      this.getAllaccountData();
    },
    /**
     * @description: 获取账户栏目的方法
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
  // 生命周期钩子函数 自动的去处理一下需要自执行的方法
  created() {
    // 自动的获取账户数据
    this.getAllaccountData();
    // 自动获取账户栏目数据
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
