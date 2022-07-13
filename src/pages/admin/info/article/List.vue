<!--
 * @Description:
 * @Autor: MQJ
 * @Date: 2021-06-26 09:20:47
 * @LastEditors: MQJ
 * @LastEditTime: 2021-06-30 15:04:37
-->
<template>
  <!-- 资讯信息页面 -->
  <div>
    <!-- 头部区域 -->
    <div class="header">
      <!-- 状态选择器 -->
      <el-select
        v-model="articleStatus"
        style="width: 240px; margin-right: 5px"
        placeholder="请选择状态"
        clearable
      >
        <el-option label="正常" value="正常" />
        <el-option label="下架" value="下架" />
      </el-select>
      <!-- 标题 -->
      <el-input
        v-model="articleTitle"
        style="width: 240px; margin-right: 5px"
        placeholder="标题"
        clearable
      />
      <!-- 栏目选择器 -->
      <el-select
        v-model="articleCategory"
        style="margin-right: 5px"
        placeholder="请选择栏目"
        clearable
      >
        <el-option label="正常" value="正常" />
        <el-option label="下架" value="下架" />
      </el-select>
      <!-- 查询按钮 -->
      <el-button
        style="margin-right: 5px"
        type="primary"
        @click="queryArticle"
      >查询</el-button>
      <!-- 发布风采按钮 -->
      <el-button
        style="float: right"
        type="primary"
        @click="queryPublish"
      >发布风采</el-button>
    </div>
    <!-- 表格内容区域 -->
    <div class="table_content">
      <!-- :data 整个表格的数据源 -->
      <el-table :data="articleData" style="width: 100%">
        <!-- 序号 -->
        <el-table-column type="index" label="序号" align="center" />
        <!-- 封面 -->
        <el-table-column prop="id" label="封面" align="center" />
        <!-- 风采 -->
        <el-table-column prop="name" label="风采" align="center" />
        <!-- 状态 -->
        <el-table-column label="状态" align="center" />
        <!-- 操作 -->
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              style="color: #83d4ce"
              size="small"
              @click="recommendArticle(scope.row)"
            >
              推荐
            </el-button>
            <el-button
              style="color: #3a71a8"
              type="text"
              size="small"
              @click="checkArticle(scope.row.id)"
            >审核</el-button>
            <el-button
              style="color: #e65d6e"
              type="text"
              size="small"
              @click="deleteArticle(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 分页操作 -->
    <div class="paginetion">
      <!-- 分页组件 -->
      <el-pagination
        :current-page="list.page"
        :page-sizes="[2, 4, 6, 8]"
        :page-size="list.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { get, post } from '@/utils/request'
export default {
  data() {
    return {
      // 状态选择器
      articleStatus: '',
      // 输入框的 标题
      articleTitle: '',
      // 栏目选择器
      articleCategory: '',
      // 表格内容数据
      articleData: [],
      // 参数
      list: {
        page: 1,
        pageSize: 10
      },
      // 页面展示数据的总条数
      total: 10
    }
  },
  computed: {},
  created() {
    this.getAllArticleData()
  },
  mounted() {},
  methods: {
    /**
     * @description:获取数据
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    async getAllArticleData() {
      const res = await get('/category/findAll', this.list)
      // console.log(res);
      this.articleData = res.data
      console.log(this.articleData)
    },
    /**
     * @description: 头部的 查询按钮
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    queryArticle() {},
    /**
     * @description:发布风采按钮
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    queryPublish() {},
    /**
     * @description:推荐按钮
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    recommendArticle() {},
    /**
     * @description:审核按钮
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    checkArticle() {},
    /**
     * @description:表格内容的删除按钮
     * @param n*o
     * @return n*o
     * @author: MQJ
     */
    deleteArticle() {},
    /**
     * @description:控制每页数据条数
     * @param n*o val 每页要展示的数据条数
     * @return n*o
     * @author: MQJ
     */
    handleSizeChange(val) {
      // 将每页要展示的数据条数 进行一个更新
      this.list.pageSize = val
      // 将当前的页数 重置到第一页
      this.list.page = 1
      // 重新调用获取所有产品数据的方法
      this.getAllArticleData()
    },
    /**
     * @description: 控制当前显示的页数
     * @param n*o val 当前的页码
     * @return n*o
     * @author: MQJ
     */
    handleCurrentChange(val) {
      // 将当前页数 与 分页插件动态点击控制的页数相绑定
      this.list.page = val
      // 重新调用获取所有产品数据的方法
      this.getAllArticleData()
    }
  }
}
</script>
<style scoped>
</style>
