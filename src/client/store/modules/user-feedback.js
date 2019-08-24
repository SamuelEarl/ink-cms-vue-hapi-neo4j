// All properties in this module are namespaced and accessible in Vue components as
// "userFeedback/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     getFlashMessage: "flash/getFlashMessage"
//   })
// }

import debounce from "lodash.debounce";

const state = {
  flashMessages: [
    // {
    //   flashType: null,
    //   flashMsg: null
    // }
  ],

  showSpinner: false
};


const getters = {
  getFlashMessages: (state) => {
    return state.flashMessages;
  },

  getShowSpinner: (state) => {
    return state.showSpinner;
  }
};


const mutations = {
  addFlashMessage: (state, flashObj) => {
    state.flashMessages = [ flashObj, ...state.flashMessages ];
  },

  removeAllFlashMessages: (state) => {
    state.flashMessages = [];
  },

  removeFlashMsg: (state, index) => {
    state.flashMessages.splice(index, 1);
  },

  setShowSpinner: (state, status) => {
    state.showSpinner = status;
  }
};


const actions = {
  /**
   * You can call this action like this:
   *
   *     this.flashAction({ flashType: "error", flashMsg: "String message" });
   *
   * The "flashType" argument accepts either "success" or "error".
   * The "flashMsg" argument accepts a string that will be displayed in the flash message. That flash
   * message will be displayed through the FlashMessages component.
   *
   * You can pass any of the default messages to the "msg" property. See the available default
   * messages below.
   */
  flashAction: ({ commit, dispatch }, { flashType, flashMsg }) => {
    if (flashMsg === "signedIn") {
      flashMsg = "You have successfully signed in!";
    }
    if (flashMsg === "signedOut") {
      flashMsg = "You have successfully signed out!";
    }
    if (flashMsg === "noAuth") {
      flashMsg = "Please sign in.";
    }
    if (flashMsg === "noScope") {
      flashMsg = "You do not have permission to do that.";
    }

    const flashObj = {
      flashType: flashType,
      flashMsg: flashMsg
    };

    commit("addFlashMessage", flashObj);

    // Start the timer for the flash message that was added to be removed
    dispatch("userFeedback/removeAllFlashMessagesAction", null, { root: true });
  },

  // Remove all the flash messages after 7 seconds.
  removeAllFlashMessagesAction: debounce(({ commit }) => {
    commit("removeAllFlashMessages");
  }, 7000),

  // Remove only the flash message that the user deleted. This probably won't be used very much,
  // since all of the flash messages get removed after 5 seconds, but it is here in case users want
  // to manually delete flash messages right away.
  removeFlashMsgAction: ({ commit }, index) => {
    commit("removeFlashMsg", index);
  },

  showSpinnerAction: ({ commit }, status) => {
    commit("setShowSpinner", status);
  }
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
