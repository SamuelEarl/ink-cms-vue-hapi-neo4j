// All properties in this module are namespaced and accessible in Vue components as
// "auth/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     isAuthenticated: "auth/getAuthentication"
//   })
// }

import * as Axios from "axios";
import router from "../../router";

const state = {
  isAuthenticated: false,
  userProfile: {
    firstName: "",
    lastName: "",
    email: "",
    scope: [] // user permissions
  }
};


const getters = {
  getIsAuthenticated: (state) => {
    return state.isAuthenticated;
  },

  // Get user permissions
  getScope: (state) => {
    return state.userProfile.scope;
  },

  getUserProfile: (state) => {
    return state.userProfile;
  }
};


const mutations = {
  setAuthenticated: (state, isAuthenticated) => {
    state.isAuthenticated = isAuthenticated;
  },

  /**
   * The user's auth (authentication and authorization) will be checked on each route request that
   * requires auth. So "userJustLoggedIn" will be set to true only when the user first registers or
   * logs in. "userJustLoggedIn" will be set to false on every auth check.
   */
  setUserProfile: (state, { userJustLoggedIn, userProfile }) => {
    state.userProfile = userProfile;

    if (userJustLoggedIn) {
      router.back();
    }
  },

  clearUserProfile: (state) => {
    state.userProfile = null;

    // Redirect user to the home route
    router.push("/");
  },
};


const actions = {
  registerAction: async ({ commit, dispatch }, newUser) => {
    try {
      const method = "POST";
      const url = "/register";
      const payload = newUser;

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("register RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }

      // Otherwise call "setUserProfile" with the newly registered user's profile object and display a success message.
      commit("setUserProfile", { userJustLoggedIn: true, userProfile: res.user });

      dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
    }
    catch(e) {
      console.error("registerAction Error:", e);
      dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: e }, { root: true });
    }
  },

  loginAction: async ({ commit, dispatch }, credentials) => {
    try {
      const method = "POST";
      const url = "/login";
      const payload = credentials;

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("login RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }

      // Otherwise call "setUserProfile" with the logged in user's profile object and display a success message.
      commit("setUserProfile", { userJustLoggedIn: true, userProfile: res.user });

      dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
    }
    catch(e) {
      console.error("loginAction Error:", e);
      dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: e }, { root: true });
    }
  },

  logoutAction: async ({ commit, dispatch }) => {
    try {
      const method = "GET";
      const url = "/logout";

      const response = await Axios({
        method: method,
        url: url
      });

      console.log("Logout RESPONSE:", response.data);

      const res = response.data;
      let msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: msg }, { root: true });
        return;
      }

      // Otherwise clear the userProfile and display a success message.
      commit("clearUserProfile");
      dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
    }
    catch(e) {
      console.error("logoutAction Error");
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
