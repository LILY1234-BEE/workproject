<template>
  <!-- 订单详情页 -->

  <div id="detail">
    <!-- {{ this.$route.query.id }} -->
    <!-- 返回按钮 -->
    <el-button type="text" size="small" @click="back">返回</el-button>
    <!-- 表格区域 -->
    <el-table :data="detailData">
      <el-table-column prop="productId" label="订单项编号" align="center">
      </el-table-column>
      <el-table-column prop="product.id" label="产品编号"> </el-table-column>
      <el-table-column prop="product.name" label="产品"> </el-table-column>
      <el-table-column label="产品图片">
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-image
            style="width: 40px; height: 40px"
            :src="scope.row.photo"
            :preview-src-list="[scope.row.photo]"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="product.price" label="单价"> </el-table-column>
      <el-table-column prop="number" label="数量"> </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { get, post } from "@/utils/request";
export default {
  data() {
    return {
      detailData: [],
    };
  },
  computed: {},
  methods: {
    //获取后台数据方法
    async getAllDetail() {
      let ID = this.$route.query.id;
      let data = {
        id: ID,
      };
      let res = await get("/order/findById", data);

      //this.detailData = [res.data.orderLines[0].product];
      this.detailData = [res.data.orderLines[0]];
      console.log(res.data.orderLines[0]);
    },
    // 返回按钮方法
    back() {
      this.$router.push("/admin/order/List");
    },
  },
  created() {
    this.getAllDetail();
  },
  mounted() {},
};
</script>
<style scoped>
</style>