// All properties in this module are namespaced and accessible in Vue components as
// "pages/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     pages: "pages/getPages"
//   })
// }

import * as Axios from "axios";

const state = {
  pages: [],
};


const getters = {
  getPages: (state) => {
    console.log("GET VUEX PAGES:", state.pages);
    return state.pages;
  },
};


const mutations = {
  setPages: (state, pages) => {
    state.pages = pages;
    console.log("VUEX PAGES:", state.pages);
  },
};


const actions = {
  pagesAction: async ({ commit }) => {
    const response = await Axios.get("/pages/get-all-pages");
    const pagesArray = response.data;
    commit("setPages", pagesArray);
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
