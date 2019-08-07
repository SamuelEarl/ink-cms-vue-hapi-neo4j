// All properties in this module are namespaced and accessible in Vue components as
// "pages/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     pagesList: "pages/getPagesList"
//   })
// }

import * as Axios from "axios";
import debounce from "lodash.debounce";

const state = {
  pagesList: [],
};


const getters = {
  getPagesList: (state) => {
    console.log("VUEX getPagesList:", state.pagesList);
    return state.pagesList;
  },
};


const mutations = {
  setPagesList: (state, pagesArray) => {
    console.log("VUEX setPagesList:", pagesArray);
    state.pagesList = pagesArray;
  },

  removePageFromPagesList: (state, index) => {
    console.log("removePageFromPagesList:", index);
    state.pagesList.splice(index, 1);
  },
};


const actions = {
  setPagesListAction: async ({ commit }) => {
    const response = await Axios.get("/public-pages/get-all-pages");
    const pagesArray = response.data;
    commit("setPagesList", pagesArray);
  },

  removePageAction: ({ commit }, index) => {
    console.log("removePageAction:", index);
    commit("removePageFromPagesList", index);
  },

  /**
   * Reorganizing the pages in the database is a bit of an expensive operation, so wait 2 seconds
   * before you send the request to reorganize the pages to make sure that the user has completed
   * at least most of their reorganizing.
   */
  reorderPagesAction: debounce(async ({ commit, state }) => {
    try {
      const reorderedPagesList = state.pagesList;

      const method = "PUT";
      const url = "/admin-pages/reorder-pages";
      const payload = {
        pagesList: reorderedPagesList
      };

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      // Display flash message for error (Error: Page reordering not saved) or successful reordering (Success: Page reordering successfully saved).
    }
    catch(err) {
      console.log(err);
    }

  }, 2000),
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
