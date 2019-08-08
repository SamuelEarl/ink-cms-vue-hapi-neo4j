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
  reorderPagesAction: debounce(async ({ commit, dispatch, state }) => {
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

      const res = response.data;
      const msg = res.flash;

      // Display a flash message with either an error or a success message for page reordering.
      if (res.error) {
        console.log("REORDER PAGES ERROR:", res.error);
        // this.flashAction({ flashType: "error", flashMsg: msg });
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }
      else {
        // this.flashAction({ flashType: "success", flashMsg: msg });
        dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
      }
    }
    catch(e) {
      console.error(e);
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
