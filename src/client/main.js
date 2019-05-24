import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faShoppingCart,
  faUserShield,
  faEdit,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./registerServiceWorker";

library.add(faBars);
library.add(faShoppingCart);
library.add(faUserShield);
library.add(faEdit);
library.add(faTimesCircle);

Vue.component("font-awesome-icon", FontAwesomeIcon);

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
