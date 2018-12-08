export default {
  namespaced: true,
  state: {
    info: {}
  },
  mutations: {
    setInfo(state, data) {
      state.info = data;
    }
  },
  actions: {
    // 获取相关信息
    getInfo({ commit }) {
      return commit("setInfo", "data.data");
    }
  }
};
