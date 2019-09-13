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
  // The easiest way to add a lot of styles the TinyMCE editor is to do this: Inside the "/public/" directory, create a "css" folder. Inside of that "css" folder, create a file called "tiny-mce.css". (You can call this file anything you want.) Then place the file path to that CSS file on the "content_css" setting, as I have done below. Then you can add your styles in your "tiny-mce.css" file. In your browser, you can right-click on the editor to inspect it and see which CSS classes are available for styling. (NOTE: TinyMCE doesn't allow you to overwrite too many of their default styles. In order to do that, you will have to look into using different skins.) You can also create styles for different HTML elements that are used within the editor. For example, you can style all <p> tags to have a light gray background and larger margins.
  // When you build your app for production, this file will also get placed in the correct location in relation to your index.html file, so it will work in production too without any extra configurations.
  // Keep in mind that this is a CSS file and not a Stylus file, so you can't nest your style rules or use variables, etc.
  // content_css: "/css/tiny-mce.css",
  // If you only have a few styles that you want to add, you can do that with the "content_style" setting.
  content_style: ".mce-content-body { background-color: #eee; }",
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
  toolbar_drawer: "sliding",
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
