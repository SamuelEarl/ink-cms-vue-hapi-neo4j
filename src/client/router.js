import Vue from "vue";
import Router from "vue-router";
import Layout from "./views/layouts/Layout.vue";
import AuthLayout from "./views/layouts/AuthLayout.vue";
import PublicPage from "./views/pages-public/PublicPage.vue";
import Admin from "./views/pages-admin/Admin.vue";
import PagesList from "./views/pages-admin/PagesList.vue";
import CreateEditPage from "./views/pages-admin/CreateEditPage.vue";
import Categories from "./views/pages-admin/Categories.vue";
import Products from "./views/pages-admin/Products.vue";
import LoginRegister from "./views/auth/LoginRegister.vue";
import ShoppingCart from "./views/shopping-cart/ShoppingCart.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      component: Layout,
      children: [
        {
          path: "",
          name: "home",
          component: PublicPage
        },
        {
          path: "page/:slug",
          name: "public-page",
          component: PublicPage
        },
        {
          path: "admin",
          component: Admin,
          children: [
            {
              path: "pages-list",
              name: "pages-list",
              component: PagesList
            },
            {
              path: "create-page/:sortPosition",
              name: "create-page",
              component: CreateEditPage
            },
            {
              path: "edit-page/:pageId",
              name: "edit-page",
              component: CreateEditPage
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
        {
          path: "shopping-cart",
          name: "shopping-cart",
          component: ShoppingCart
        },
      ],
    },
    {
      path: "/auth",
      component: AuthLayout,
      children: [
        {
          path: "login-register",
          name: "login-register",
          component: LoginRegister
        },
      ]
    }
  ]
});
