// All properties in this module are namespaced and accessible in Vue components as
// "auth/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     isAuthenticated: "auth/getIsAuthentication"
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
  setIsAuthenticated: (state, isAuthenticated) => {
    state.isAuthenticated = isAuthenticated;
  },

  setUserProfile: (state, userProfile) => {
    state.userProfile = userProfile;
    router.back();
  },

  clearUserProfile: (state) => {
    state.userProfile.firstName = "";
    state.userProfile.lastName = "";
    state.userProfile.email = "";
    state.userProfile.scope = [];

    // Redirect user to the home route
    router.push("/");
  },
};


const actions = {
  registerAction: async ({ commit, dispatch }, newUser) => {
    try {
      let user = {
        firstName: "",
        lastName: "",
        email: "",
        scope: [],
      };

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

      user.firstName = res.user.newUserFirstName;
      user.lastName = res.user.newUserLastName;
      user.email = res.user.newUserEmail;
      user.scope = res.user.newUserScope;

      if (user.firstName && user.lastName && user.email && user.scope.length > 0) {
        // Otherwise call "setUserProfile" with the newly registered user's profile object and display a success message.
        commit("setUserProfile", user);
        commit("setIsAuthenticated", true);

        dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
      }
      else {
        throw new Error("Error while attempting to register user.");
      }
    }
    catch(e) {
      console.error("registerAction Error:", e);
      dispatch("userFeedback/flashAction", { flashType: "error", flashMsg: e }, { root: true });
    }
  },

  loginAction: async ({ commit, dispatch }, credentials) => {
    try {
      let user = {
        firstName: "",
        lastName: "",
        email: "",
        scope: [],
      };

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

      user.firstName = res.user.userFirstName;
      user.lastName = res.user.userLastName;
      user.email = res.user.userEmail;
      user.scope = res.user.userScope;

      // If the user is logged in, then call "setUserProfile" with the logged in user's profile
      // object and display a success message.
      if (user.firstName && user.lastName && user.email && user.scope.length > 0) {
        commit("setUserProfile", user);
        commit("setIsAuthenticated", true);

        dispatch("userFeedback/flashAction", { flashType: "success", flashMsg: msg }, { root: true });
      }
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
      commit("setIsAuthenticated", false);
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
