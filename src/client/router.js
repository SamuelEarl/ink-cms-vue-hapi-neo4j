import Vue from "vue";
import Router from "vue-router";
import Home from "./views/home/Home.vue";
import Admin from "./views/admin/Admin.vue";
import Pages from "./views/admin/Pages.vue";
import Categories from "./views/admin/Categories.vue";
import Products from "./views/admin/Products.vue";

Vue.use(Router)

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/admin",
      component: Admin,
      children: [
        {
          path: "pages",
          name: "admin-pages",
          component: Pages
        },
        {
          path: "categories",
          name: "admin-categories",
          component: Categories
        },
        {
          path: "products",
          name: "admin-products",
          component: Products
        },
      ]
    },
  ]
})
