import Vue from "vue";
import Vuex from "vuex";
import account from "./modules/Account";
import setting from "./modules/Setting";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    videoObject: "",
    videoCanvasObject: "",
    videoCanvasRunTime: {
      time: 23,
      fps: 8
    }
  },
  mutations: {
    setVideoObject(state, stream) {
      state.videoObject = stream;
    },
    setVideoCanvasObject(state, stream) {
      state.videoCanvasObject = stream;
    },
    setVideoCanvasRunTime(state, data) {
      state.videoCanvasRunTime = data;
    }
  },
  actions: {},
  modules: {
    account,
    setting
  }
});
