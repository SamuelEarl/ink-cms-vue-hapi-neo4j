import Vue from "vue";
import Router from "vue-router";
import Home from "./views/home/Home.vue";
import Admin from "./views/admin/Admin.vue";
import PagesList from "./views/admin/PagesList.vue";
import Page from "./views/admin/Page.vue";
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
          path: "pages-list",
          name: "pages-list",
          component: PagesList
        },
        {
          path: "add-page",
          name: "add-page",
          component: Page
        },
        {
          path: "edit-page/:pageId",
          name: "edit-page",
          component: Page
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
