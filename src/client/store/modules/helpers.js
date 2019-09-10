// All properties in this module are namespaced and accessible in Vue components as
// "helpers/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     getPrevRoute: "helpers/getPrevRoute"
//   })
// }


const state = {
  prevRoute: null,
};


const getters = {
  getPrevRoute: (state) => {
    return state.prevRoute;
  },
};


const mutations = {
  setPrevRoute: (state, prevRoute) => {
    state.prevRoute = prevRoute;
  },
};


const actions = {
  setPrevRouteAction: ({ commit }, prevRoute) => {
    commit("setPrevRoute", prevRoute);
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
