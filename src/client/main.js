import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faShoppingCart,
  faUserShield,
  faEdit,
  faTimesCircle,
  faSort
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Vuelidate from "vuelidate";
import "./registerServiceWorker";

library.add(faBars);
library.add(faShoppingCart);
library.add(faUserShield);
library.add(faEdit);
library.add(faTimesCircle);
library.add(faSort);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.use(Vuelidate);

// TinyMCE Editor Configs:
Vue.prototype.$editorApiKey = "7gka8rihodg40gmphfhqb1tk9tjbswjiu0xcdqvgetdg6057";
// Configure the editor's appearance, including the menu and toolbar controls:
// https://www.tiny.cloud/docs/configure/editor-appearance/
// This pen shows some more advanced configs: https://codepen.io/qinglu/pen/mOKgPP. I think it's an
// older version of TinyMCE, but most of the concepts still apply.
Vue.prototype.$editorOptions = {
  // TODO: Figure out how to configure the "content_css" setting in Vue so I can add a "background-color: $light-gray;" style to the TinyMCE editors. Once I have figured out how to do that, then I need to remove all style rules for ".mce-content-body" that I won't be using.
  // content_css: "/css/main.*.css",
  min_height: 300,
  branding: false,
  plugins: [
    "lists",
    "fullscreen",
  ],
  menu: {
    view: { title: "View", items: "fullscreen" },
  },
  menubar: "edit view format",
  toolbar: "undo redo cut copy paste | styleselect | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | fullscreen",
  toolbar_drawer: "sliding"
};

Vue.config.productionTip = false;

// -------------------
// Global Vue Filters
// -------------------
/**
 * Capitalize the first letter in a string
 */
Vue.filter("capitalize", function (value) {
  if (!value) return "";
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
