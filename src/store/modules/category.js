// 引入axios
import {get} from '@/utils/request'
export default {
  // 命名空间
  namespaced: true,
  state: {
    // 栏目数组
    categoryData: []
  },
  mutations: {
    // 接收栏目数据
    SET_CATEGORYDATA(state, payload){
      // 将actions传递过来的数据赋值给state中对应的变量
      state.categoryData = payload
    }
  },
  actions: {
    // {commit} 代替context成为actions方法中的第一个参数
    // 直接通过commit('mutations方法名', 要传递的数据)
    /**
     * @description: 分页查询所有栏目数据
     * @param {*} commit 提交mutations
     * @param {*} payload 外界传递进来的分页参数
     * @return {*}
     * @author: ZachGmy
     */
    async getAllCategoryData({commit}, payload){
      let res = await get('/productCategory/pageQuery', payload)
      // console.log(res);
      // 将异步交互拿到的数据 提交给mutations
      commit('SET_CATEGORYDATA', res.data.list)
    },
  }
}