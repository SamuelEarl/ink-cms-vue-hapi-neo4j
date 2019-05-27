import Vue from "vue";
import Vuex from "vuex";
import pages from "./modules/pages";
import flash from "./modules/flash";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    pages,
    flash,
  }
});
