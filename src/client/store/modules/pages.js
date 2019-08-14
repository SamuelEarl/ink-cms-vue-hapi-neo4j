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
    return state.pagesList;
  },
};


const mutations = {
  setPagesList: (state, pagesArray) => {
    state.pagesList = pagesArray;
  },

  removePageFromPagesList: (state, index) => {
    state.pagesList.splice(index, 1);
  },
};


const actions = {
  setPagesListAction: async ({ commit, dispatch }) => {
    const response = await Axios.get("/pages-both/get-all-pages");

    const res = response.data;
    const msg = res.flash;

    // If there is an error, then display a flash message with the error.
    if (res.error) {
      dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
      return;
    }

    const pagesArray = res.pagesArray;
    commit("setPagesList", pagesArray);
  },

  removePageAction: ({ commit }, index) => {
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
      const url = "/pages-admin/reorder-pages";
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
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }
      else {
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
