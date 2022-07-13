<template>
    <!-- 订单评论 -->
    
  <div class="product">
    <!-- 头部区域 -->
    <div class="header">
       <!-- 产品名称输入框 -->
           <el-input
        style="width: 240px"
        placeholder="请输入关键字"
        v-model="productcontent"
        clearable
      >
              </el-input
      >
            <el-input
        style="width: 240px"
        placeholder="请输入订单编号"
        v-model="productorderId"
        clearable
      >
              </el-input
      >
            <!-- 产品栏目下拉框 -->
            <el-select
        v-model="productstatus"
        clearable
        placeholder="请选择状态"
      >
                <el-option label="未审核" value="未审核"></el-option>
                <el-option label="通过" value="通过"></el-option>
                <el-option label="不通过" value="不通过"></el-option>
              </el-select
      >
            <!-- 查询按钮 -->
            <el-button type="primary" @click="querySearch">查询</el-button>     
    </div>
        <!-- 表格内容展示区 -->
        
    <div class="table_content">
            <!-- :data 整个表格的数据源 -->
            <el-table :data="productData" style="width: 100%">
                <!-- 序号 -->
                <el-table-column type="index" label="序号" align="center">
                  </el-table-column
        >
                <!-- 评论内容 -->
                <el-table-column prop="content" label="评论内容" align="center">
                  </el-table-column
        >
                <!-- 顾客编号 -->
                <el-table-column
          prop="customerId"
          label="顾客编号"
          align="center"
        >
                  </el-table-column
        >
                <!-- 订单编号 -->
                <el-table-column prop="orderId" label="订单编号" align="center">
                  </el-table-column
        >
                <!-- 评论时间 -->
                <el-table-column label="评论时间" align="center">
                      <template slot-scope="scope">
                              
            <div>{{ scope.row.commentTime | filter }}</div>
                        </template
          >
                   </el-table-column
        >
                 <!-- 状态 -->
                <el-table-column prop="status" label="评论状态" align="center"
          >            <!-- <el-button style="color:green">通过</el-button> -->
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status == '通过'" type="success"
              >通过</el-tag
            >
            <el-tag v-if="scope.row.status == '未通过'" type="danger"
              >未通过</el-tag
            >
            <el-tag v-if="scope.row.status == '未审核'" type="warning"
              >未审核</el-tag
            >
          </template>
                  </el-table-column
        >
                <!-- 操作 -->
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button
              @click="handleClick(scope.row.id)"
              type="text"
              size="small"
            >
                            删除             </el-button
            >
                                   </template
          >
                  </el-table-column
        >
              </el-table
      >
          
    </div>
        <!-- 底部分页区域 -->
        
    <div class="paginetion">
            <!-- 分页组件 -->
            <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
              </el-pagination
      >
          
    </div>
      
  </div>
</template>

<script>
// 引入axios
import moment from "moment";
import { get, post } from "@/utils/request";
import { log } from "@antv/g2plot/lib/utils";
export default {
  data() {
    return {
      // 产品数组 - 表格的数据源的数据
      productData: [], // 产品名称-输入
      productcontent: "", // 产品状态-下拉选择
      productorderId: "", // 产品栏目-下拉选择
      productstatus: "", // 当前的页码
      currentPage: 1, // 每页要展示的数据条数
      pageSize: 8, // 页面展示数据的总条数
      total: 10,
      searchdata: [],
      productName: "",
    };
  },
  computed: {},
  filters: {
    filter: function (data) {
      return moment(data).format("YYYY-MM-DD");
    },
  },
  methods: {
    /**
     * @description: 分页获取所有产品的数据
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    async getAllProductData() {
      // 获取参数
      let data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      }; // 通过对应的参数发送网络请求 获取产品数组数据
      let res = await get("/orderComment/pageQuery", {
        ...data,
        ...this.searchdata,
      });
      console.log(res); // 将data中的产品数组 进行赋值
      this.productData = res.data.list; // 页面总数据条数 赋值
      this.total = res.data.total;
    },
    querySearch() {
      let data = {
        content: this.productcontent,
        status: this.productstatus,
        orderId: this.productorderId,
      };
      for (const key in data) {
        if (!data[key]) {
          delete data[key];
        }
      }
      this.searchdata = data;
      this.currentPage = 1;
      this.getAllProductData();
    },
    /**
     * @description: 控制每页数据条数
     * @param {*} val 每页要展示的数据条数
     * @return {*}
     * @author: ZachGmy
     */ handleSizeChange(val) {
      // 将每页要展示的数据的条数 进行一个更新
      this.pageSize = val; // 将当前的页数 重置到第一页
      this.currentPage = 1; // 重新调用获取所有产品数据的方法
      this.getAllProductData();
    },
    /**
     * @description: 控制当前显示的页数
     * @param {*} val 当前的页码
     * @return {*}
     * @author: ZachGmy
     */ handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.currentPage = val; // 重新调用获取所有产品数据的方法
      this.getAllProductData();
    }, // 删除
    handleClick(id) {
      // id 就是要删除的分类的对象的id
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // await等待后面异步函数运行完毕，拿到响应的数据，然后返回
          let res = await get("/orderComment/deleteById", { id });
          this.$message({
            type: "success",
            message: res.message,
          });
          this.getAllProductData();
          console.log(123);
        })
        .catch(() => {
          console.log(456);
        });
    },
  },
  created() {
    // 自动的获取产品数据
    this.getAllProductData();
  },
  mounted() {},
};
</script>
<style scoped>
/* 设置顶部样式 */
.header {
  line-height: 40px;
}
/* 分页区域的样式 */
.paginetion {
  position: fixed;
  bottom: 40px;
  right: 10px;
}
</style>