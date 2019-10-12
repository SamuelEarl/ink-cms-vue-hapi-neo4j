// All properties in this module are namespaced and accessible in Vue components as
// "pages/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     pagesList: "pages/getPagesList"
//   })
// }

import * as Axios from "axios";

const state = {
  pagesList: [],
};


const getters = {
  getPagesList: (state) => {
    console.log("getPagesList:", state.pagesList);
    return state.pagesList;
  },
};


const mutations = {
  setPagesList: (state, pagesArray) => {
    state.pagesList = pagesArray;
  },

  setShowPage: (state, [ index, showPage ]) => {
    state.pagesList[index].showPage = showPage;
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

  showPageAction: ({ commit }, [ index, showPage ]) => {
    commit("setShowPage", [ index, showPage ]);
  },

  removePageAction: ({ commit }, index) => {
    commit("removePageFromPagesList", index);
  },

  /**
   * Reorganizing the pages in the database.
   */
  reorderPagesAction: async ({ commit, dispatch, state }) => {
    try {
      // The first page in the list (in the PagesList.vue file) is designated as the home page. So when the pages get reordered, the following commit to "setShowPage" will set the first page's "Show Page" property to true so that the home page will appear in the header.
      commit("setShowPage", [ 0, true ]);

      // Send the most recently reordered pagesList to the server to update the "sortPosition" and "showPage" properties in the database.
      const reorderedPagesList = state.pagesList;
      console.log("PAGES:", reorderedPagesList);

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
      console.log("reorderedPagesList:", res);

      const msg = res.flash;

      // Display a flash message with either an error or a success message for page reordering.
      if (res.error) {
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }
      else {
        commit("setPagesList", res.reorderedPagesArray);
        // I have decided to remove the success message for page reordering, but you can keep it in, if you prefer.
        // dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
      }
    }
    catch(e) {
      console.error(e);
    }

  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
