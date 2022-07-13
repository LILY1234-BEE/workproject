import { get } from '@/utils/request'

export default {
  //命名空间
  namespaced: true,
  state: {
    //栏目数组
    customData: []
  },
  mutations: {
    //接受栏目数据
    SET_CATEGORYDATA(state, paylod) {
      //将action传递过来的数据赋值给state中对应的变量
      state.customData = paylod

    }

  },
  actions: {
    //{commit}代替context成为actions方法中的第一个参数
    //直接通过commit（'mutation方法名'，要传递的数据）
    //分页查询所有栏目数据 commit提交mutaion paylod外界传递进来的参数
    async getAllCustomData({ commit }, paylod) {

      let res = await get('/baseUser/pageQuery', paylod)
      // console.log(res);
      commit('SET_CATEGORYDATA', res.data.list)
    },


  }
}
