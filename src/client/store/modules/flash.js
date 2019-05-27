// All properties in this module are namespaced and accessible in Vue components as
// "flash/nameOfProperty". For example:

// computed: {
//   ...mapGetters({
//     flashMsg: "flash/getFlashMsg"
//   })
// }


const state = {
  flash: {
    type: null,
    msg: null
  },
};


const getters = {
  getFlash: (state) => {
    const flash = {
      type: state.flash.type,
      msg: state.flash.msg
    };
    return flash;
  },
};


const mutations = {
  // Set the message that will be displayed to the user upon successful or failed sign-in attempt
  setFlash: (state, { type, msg }) => {
    state.flash.type = type;
    state.flash.msg = msg;
  },
};


const actions = {
  /**
   * This action is often used like this: An AJAX called has been returned and the user is not
   * signed in, so the Boom message that was passed in the response gets passed to this action,
   * like this:
   *     this.flashAction({ type: "alert", msg: "String message" });
   *
   * The "type" argument accepts either "success" or "alert".
   * The "msg" argument accepts a string that will be displayed in the flash message. That flash
   * message will be displayed through the Flash component.
   *
   * You can also use this action to check if the user is signed in before an AJAX call is made. A
   * good time to use this action in that way is when you want to check if a user is signed in before
   * you display a confirmation dialog box that will make an AJAX call if the user clicks "OK". This
   * is how you would call it:
   *     this.flashAction({ type: "alert", msg: "noAuth" });
   *
   * You can pass any of the default messages to the "msg" property. See the available default
   * messages below.
   * See the MyAccount.vue component's "dropCourse" method for a complete example.
   */
  flashAction: ({ commit }, { type, msg }) => {
    if (msg === "signedIn") {
      msg = "You have successfully signed in!";
    }
    if (msg === "signedOut") {
      msg = "You have successfully signed out!";
    }
    if (msg === "noAuth") {
      msg = "Please sign in.";
    }
    if (msg === "noScope") {
      msg = "You do not have permission to do that.";
    }
    commit("setFlash", { type, msg });
  },
};


export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
