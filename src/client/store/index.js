import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";
import pages from "./modules/pages.js";
import userFeedback from "./modules/user-feedback.js";
import auth from "./modules/auth.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    pages,
    userFeedback,
    auth
  },
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
      key: "auth",
      paths: [
        "auth"
      ]
    })
  ]
});
