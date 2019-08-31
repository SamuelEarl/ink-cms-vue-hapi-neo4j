// All properties in this module are namespaced and accessible in Vue components as
// "helpers/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     getPrevRouteName: "helpers/getPrevRouteName"
//   })
// }


const state = {
  prevRouteName: null,
};


const getters = {
  getPrevRouteName: (state) => {
    return state.prevRouteName;
  },
};


const mutations = {
  setPrevRouteName: (state, prevRouteName) => {
    state.prevRouteName = prevRouteName;
  },
};


const actions = {
  setPrevRouteNameAction: ({ commit }, prevRouteName) => {
    commit("setPrevRouteName", prevRouteName);
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
