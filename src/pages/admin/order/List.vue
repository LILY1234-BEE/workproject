<template>
  <!-- 订单管理页 -->
  <div id="orderList">
    <div class="content">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 所有订单 -->
        <el-tab-pane label="所有订单" name="first">
          <el-table :data="tableData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column prop="total" label="总价"> </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column prop="employeeId" label="员工ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待接单'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                  <!-- 因为可能存在假数据的情况，所以需要判断 -->
                  <el-button
                    v-if="scope.row.orderLines.length != 0"
                    style="color: #ffe4b5"
                    type="text"
                    size="small"
                    @click="cancelDispatch(scope.row.orderLines[0].orderId)"
                    >取消派单</el-button
                  >
                  <el-button
                    v-else
                    style="color: #ffe4b5"
                    type="text"
                    size="small"
                    @click="error"
                    >取消派单</el-button
                  >
                </div>
                <div v-else-if="scope.row.status == '待服务'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
                <div v-else>
                  <el-button
                    type="text"
                    size="small"
                    @click="Dispatch(scope.row.orderLines[0].orderId)"
                    >派单</el-button
                  >
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
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
          <!-- 模态框 -->
          <el-dialog
            :title="dialogTitle"
            :visible.sync="dialogVisible"
            @close="dialogClose"
          >
            <!--单选框  -->

            <el-radio-group v-model="writerData" size="small">
              <el-radio
                v-for="item in employData"
                :key="item.id"
                :label="item.id"
                border
                >{{ item.username }}</el-radio
              >
            </el-radio-group>
            <!-- 底部操作按钮区域 -->
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible = false" @close="dialogClose"
                >取 消</el-button
              >
              <!-- 提交表单后 调用重置表单的方法 -->
              <el-button type="primary" @click="submitForm">确 定</el-button>
            </span>
          </el-dialog>
        </el-tab-pane>
        <el-tab-pane label="待支付" name="second">
          <el-table :data="payData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待支付'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待派单" name="third">
          <el-table :data="innerData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>

            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待派单'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                  <el-button
                    type="text"
                    size="small"
                    @click="Dispatch(scope.row.orderLines[0].orderId)"
                    >派单</el-button
                  >
                </div>
                <el-dialog
                  :title="dialogTitle"
                  :visible.sync="dialogVisible"
                  @close="dialogClose"
                >
                  <!--单选框  -->

                  <el-radio-group v-model="writerData" size="small">
                    <el-radio
                      v-for="item in employData"
                      :key="item.id"
                      :label="item.id"
                      border
                      >{{ item.username }}</el-radio
                    >
                  </el-radio-group>
                  <!-- 底部操作按钮区域 -->
                  <span slot="footer" class="dialog-footer">
                    <el-button
                      @click="dialogVisible = false"
                      @close="dialogClose"
                      >取 消</el-button
                    >
                    <!-- 提交表单后 调用重置表单的方法 -->
                    <el-button type="primary" @click="submitForm"
                      >确 定</el-button
                    >
                  </span>
                </el-dialog>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待接单" name="fourth">
          <el-table :data="waitData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column prop="employeeId" label="员工ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待接单'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                  <el-button
                    v-if="scope.row.orderLines.length != 0"
                    style="color: #ffe4b5"
                    type="text"
                    size="small"
                    @click="cancelDispatch(scope.row.orderLines[0].orderId)"
                    >取消派单</el-button
                  >
                  <el-button
                    v-else
                    style="color: #ffe4b5"
                    type="text"
                    size="small"
                    @click="error"
                    >取消派单</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待服务" name="five">
          <el-table :data="severData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column prop="employeeId" label="员工ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待服务'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="待确认" name="six">
          <el-table :data="determineData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column prop="employeeId" label="员工ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待确认'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="已完成" name="seven">
          <el-table :data="endingData">
            <el-table-column prop="id" label="订单编号" align="center">
            </el-table-column>
            <el-table-column prop="orderTime" label="下单时间">
            </el-table-column>
            <el-table-column style="color: red" prop="total" label="总价">
            </el-table-column>
            <el-table-column prop="status" label="状态"> </el-table-column>
            <el-table-column prop="customerId" label="顾客ID">
            </el-table-column>
            <el-table-column prop="employeeId" label="员工ID">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <div v-if="scope.row.status == '待接单'">
                  <el-button
                    style="color: black"
                    type="text"
                    size="small"
                    @click="queryDetail(scope.row.id)"
                    >详情</el-button
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div id="paginetion">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[2, 4, 6, 10]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total1"
            >
            </el-pagination>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { get, post } from "@/utils/request";
export default {
  data() {
    return {
      //待支付表单数据
      payData: [],
      // 已完成表单数据
      endingData: [],
      //待确认表单数据
      determineData: [],
      //待服务表格数据
      severData: [],
      //待接单表格数据
      waitData: [],
      //模态框单选框数据
      writerData: "",
      // 模态框关闭
      dialogVisible: false,
      // 模态框标题
      dialogTitle: "",
      //派单按钮中员工id的数组
      employData: [],
      //员工ID
      waiterId: [],
      //待派单总条数
      total1: 30,
      //代派单表格数据
      innerData: [],
      //页数与每页条数
      pageSize: 10,
      currentPage: 1,
      orderId: "",
      //总条数
      total: 10,
      //所有订单表格数据
      tableData: [],

      // 默认打开的第一个页面
      activeName: "first",
    };
  },
  computed: {},
  methods: {
    // 判断取消派单为假的时候的情况
    error() {
      alert(此订单为假);
    },
    //模态框确定按钮方法
    async submitForm() {
      let data = {
        waiterId: this.writerData,
        orderId: this.orderId,
      };
      let res = await get("/order/sendOrder", data);
      if (res.status == 200) {
        //重新刷新数据
        this.$message({
          message: res.message,
          type: "success",
        });
        this.getAllOrder();
        this.dialogVisible = false;
      } else {
        console.log("error submit!!");
        return false;
      }
    },
    //模态框相关方法
    dialogClose() {
      // 关闭模态框 设置延时
      setTimeout(() => {
        this.dialogVisible = false;
      }, 200);
    },
    //获取员工id waiterId的方法
    async queryWiterId() {
      let data = {
        page: 1,
        pageSize: 10,
        roleId: 1,
      };
      let res = await get("/baseUser/pageQuery", data);
      this.employData = res.data.list;
      // let r = res.data.list;
      // console.log(r);
    },
    handleSizeChange(val) {
      // 将每页要展示的数据条数进行更新
      this.pageSize = val;
      this.currentPage = 1;
      this.getAllOrder();
    },
    handleCurrentChange(val) {
      // 将当前页数与分页插件动态点击控制页数绑定
      //c重新调用获取所有产品数据的方法
      this.currentPage = val;
      this.getAllOrder();
    },
    //派单按钮事件
    async Dispatch(orderId1) {
      this.dialogVisible = true;
      this.dialogTitle = "派单";
      this.orderId = orderId1;
    },
    // 取消派单按钮事件
    async cancelDispatch(id) {
      // console.log(id, "=========");
      let data = {
        orderId: id,
      };
      let res = await get("/order/cancelSendOrder", data);
      if (res.status == 200) {
        this.getAllOrder();
        this.$message({
          type: "success",
          message: res.message,
        });
      }
    },
    //详情按钮对应事件
    queryDetail(id) {
      // this.$router.push("/admin/order/Details");

      this.$router.push({
        path: "/admin/order/Details",
        query: { id: id },
      });
    },
    //所有订单页面获取后台数据对应的方法
    async getAllOrder() {
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };

      let res = await get("/order/pageQuery", data);
      this.tableData = res.data.list;
      this.innerData = res.data.list.filter((item) => item.status == "待派单");
      this.waitData = res.data.list.filter((item) => item.status == "待接单");
      this.severData = res.data.list.filter((item) => item.status == "待服务");
      this.payData = res.data.list.filter((item) => item.status == "待支付");
      this.determineData = res.data.list.filter(
        (item) => item.status == "待确认"
      );
      this.endingData = res.data.list.filter((item) => item.status == "已完成");
      //  this.total1 = res.data.total.filter((item) => item.status == "待派单");
      this.total = res.data.total;
    },
    //标签页对应的方法
    handleClick(tab, event) {
      console.log(tab, event);
    },
  },
  created() {
    //所有订单页面方法渲染
    this.getAllOrder();
    // 员工ID方法渲染
    this.queryWiterId();
  },
  mounted() {},
};
</script>
<style scoped>
</style>