<template>
  <!-- 产品管理页 -->
  <div class="product">
    <!-- 头部区域 -->
    <div class="header"></div>
    <!-- 表格内容展示区 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="productData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center">
        </el-table-column>
        <!-- 访问人真实姓名 -->
        <el-table-column prop="realname" label="访问人真实姓名" align="center">
        </el-table-column>
        <!-- 访问方式 -->
        <el-table-column prop="method" label="访问方式" align="center">
        </el-table-column>
        <!-- 访问路径 -->
        <el-table-column prop="content" label="访问路径" align="center">
        </el-table-column>
        <!-- 访问时间 -->
        <el-table-column prop="logTime" label="访问时间" align="center">
          <template slot-scope="scope">
            <div>
              {{ scope.row.logTime | filter }}
            </div>
          </template>
          <!-- <div>{{ logTime | filter }}</div> -->
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
import moment from "moment";
export default {
  data() {
    return {
      logTime: "",
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
        // 封面
        photo: "",
        // 产品描述
        description: "",
      },
    };
  },
  computed: {
    // 使用辅助函数
    ...mapState("category", ["categoryData"]),
  },
  filters: {
    filter: function (data) {
      return moment(data).format("YYYY-MM-DD hh:mm:ss");
    },
  },
  methods: {
    // 通过命名空间找到category对应的vuex模块 调用它模块里的方法
    // ...mapActions('category模块的文件名',['对应的方法'])
    ...mapActions("category", ["getAllCategoryData"]),
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
      let res = await get("/baseLog/pageQuery", { ...data, ...this.queryData });
      // 将data中的产品数组 进行赋值
      this.productData = res.data.list;
      // 页面总数据条数 赋值
      this.total = res.data.total;
    },
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