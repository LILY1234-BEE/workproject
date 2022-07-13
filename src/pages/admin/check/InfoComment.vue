<template>
  <!-- 资讯评论 -->
  <div class="product">
    <!-- 头部区域 -->
    <div style="font-size: 24px" class="header">
      <!-- 批量删除按钮 -->

      <el-button
        type="danger"
        plain
        :disabled="multipleSelection.length == 0"
        @click="clickdeleteById1(multipleSelection)"
      >批量删除</el-button>

      <!-- 评论查询输入框 -->
      <el-input
        v-model="productData.comment"
        style="width: 360px"
        placeholder="请输入内容"
        clearable
      />
      <!-- 查询按钮 -->
      <el-button type="primary" @click="toSearch()">查询</el-button>
    </div>
    <!-- 表格内容展示区 -->
    <div class="table_content">
      <el-table
        ref="multipleTable"
        :data="productData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" align="center" />
        <!-- 评论内容 -->
        <el-table-column prop="comment" label="评论内容" align="center" />
        <!-- 评论人编号 -->
        <el-table-column
          prop="userId"
          label="评论人编号"
          :index="indexMethod"
          align="center"
        />
        <!-- 资讯编号 -->
        <el-table-column prop="articleId" label="评论编号" align="center" />
        <!-- 评论时间 -->
        <el-table-column prop="commentTime" label="评论时间" align="center">
          <div>{{ productData.commentTime | filter }}</div>
        </el-table-column>
        <!-- 评论状态 -->
        <el-table-column prop="status" label="状态" align="center">
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status == '审核通过'"
              type="success"
            >通过</el-tag>
            <el-tag
              v-if="scope.row.status == '审核不通过'"
              type="danger"
            >不通过</el-tag>
            <el-tag
              v-if="scope.row.status == '未审核'"
              type="warning"
            >未审核</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template slot-scope="scope">
            <el-button
              style="color: red"
              align="center"
              @click="clickdeleteById(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 底部分页区域 -->
    <div class="paginetion">
      <!-- 分页组件 -->
      <el-pagination
        :current-page="currentPage"
        :page-sizes="[2, 4, 6, 8]"
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
// 引入辅助函数
// import { mapActions, mapState } from "vuex";
import moment from 'moment'

// 引入axios
import { get, post } from '@/utils/request'
import { log } from '@antv/g2plot/lib/utils'
export default {
  filters: {
    filter: function(data) {
      return moment(data).format('YYYY-MM-DD')
    }
  },
  data() {
    return {
      multipleSelection: [],
      // 分页数据
      // params: {
      //   page: 1,
      //   pageSize: 10,
      // },

      // 产品数组 - 表格的数据源的数据
      productData: [],
      // 产品名称-输入
      productName: '',
      // 产品状态-下拉选择
      productStatus: '',
      // 产品栏目-下拉选择
      productCategory: '',
      // 当前的页码
      currentPage: 1,
      // 每页要展示的数据条数
      pageSize: 8,
      // 页面展示数据的总条数
      total: 10
      // 定义查询参数
      // keywords: null,
    }
  },
  computed: {
    // 辅助函数
    // ...mapState("category", ["categoryData"]),
  },
  created() {
    // 自动的获取产品数据
    this.getAllProductData()
    this.queryCategoryData()
  },
  mounted() {},
  methods: {
    // 找到category
    // ...mapActions("category", ["getAllCategoryData"]),
    // 查询功能
    toSearch() {
      if (this.productData.comment == '') {
        delete this.productData.comment
      }
      // console.log(this.productData.comment);
      this.currentPage = 1
      // 重新加载数据
      this.getAllProductData()
    },
    // 删除评论 id当前删除评论的id
    async clickdeleteById(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // await 等待后面异步函数运行完毕，拿到想用的数据，然后返回
          let res
          if (id) {
            res = await get('/comment/deleteById', { id })
          }
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllProductData()
        })
        .catch((err) => {
          console.log(err, '===')
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      // 刷新编号
      this.getAllProductData()
    },
    // 批量删除评论 id当前删除评论的id
    async clickdeleteById1(multipleSelection) {
      console.log('multipleSelection111=', multipleSelection)
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          // await 等待后面异步函数运行完毕，拿到想用的数据，然后返回
          let res
          if (multipleSelection) {
            res = await post('/comment/batchDelete', {
              ids: multipleSelection.toString()
            })
          }
          this.$notify({
            title: res.status == 200 ? '成功' : '失败',
            message: res.statusText,
            type: res.status == 200 ? 'success' : 'error'
          })
          this.getAllProductData()
        })
        .catch((err) => {
          console.log(err, '===')
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      // 刷新编号
      this.getAllProductData()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map((item) => item.id)
    },
    indexMethod(index) {
      return index + 1
      // 编号从1开始
    },
    /**
     * @description: 分页获取用户数据
     * @param {*}
     * @return {*}
     */
    // 分页获取数据
    async queryData() {
      // 获取参数
      // 通过对应的参数发送网络请求 获取数据
      const res = await get('/comment/pageQuery', this.params)
      console.log(res)
      // 将data进行赋值
      this.tableData = res.data.list
      // 页面总数据条数赋值
      this.total = res.data.total
    },
    /**
     * @description: 分页获取所有产品的数据
     * @param {*}
     * @return {*}
     * @author: ZachGmy
     */
    async getAllProductData() {
      // 获取参数
      const data = {
        page: this.currentPage,
        pageSize: this.pageSize,
        keywords: this.productData.comment
      }
      // console.log(data);
      // 通过对应的参数发送网络请求 获取产品数组数据
      const res = await get('/comment/pageQuery', data)
      // 将data中的产品数组 进行赋值
      this.productData = res.data.list
      // 页面总数据条数 赋值
      this.total = res.data.total
    },
    /**
     * @description: 控制每页数据条数
     * @param {*} val 每页要展示的数据条数
     * @return {*}
     * @author: ZachGmy
     */
    handleSizeChange(val) {
      // 将每页要展示的数据的条数 进行一个更新
      this.pageSize = val
      // 将当前的页数 重置到第一页
      this.currentPage = 1
      // 重新调用获取所有产品数据的方法
      this.getAllProductData()
    },
    /**
     * @description: 控制当前显示的页数
     * @param {*} val 当前的页码
     * @return {*}
     * @author: ZachGmy
     */
    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.currentPage = val
      // 重新调用获取所有产品数据的方法
      this.getAllProductData()
    },
    queryCategoryData() {
      const data = {
        page: 1,
        pageSize: 100
      }
      // 调用vue
      // this.getAllCategoryData(data);
    }
  }
}
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
