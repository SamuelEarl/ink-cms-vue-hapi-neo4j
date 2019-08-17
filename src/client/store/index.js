import Vue from "vue";
import Vuex from "vuex";
import pages from "./modules/pages.js";
import userFeedback from "./modules/user-feedback.js";
import auth from "./modules/auth.js";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    pages,
    userFeedback,
    auth
  }
});
