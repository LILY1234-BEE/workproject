import { get } from '@/utils/request'

export default {
  //命名空间
  namespaced: true,
  state: {
    //栏目数组
    employData: []
  },
  mutations: {
    //接受栏目数据
    SET_CATEGORYDATA(state, paylod) {
      //将action传递过来的数据赋值给state中对应的变量
      state.employData = paylod

    }

  },
  actions: {
    async getAllEmployData({ commit }, paylod) {
      let res = await get('/baseUser/pageQuery', paylod)
      commit('SET_CATEGORYDATA', res.data.list)
    },


  }
}

