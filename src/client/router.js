import Vue from "vue";
import Router from "vue-router";
// import Home from "./views/home/Home.vue";
import PublicPage from "./views/public/PublicPage.vue";
import Admin from "./views/admin/Admin.vue";
import PagesList from "./views/admin/PagesList.vue";
import AddEditPage from "./views/admin/AddEditPage.vue";
import Categories from "./views/admin/Categories.vue";
import Products from "./views/admin/Products.vue";
import ShoppingCart from "./views/shopping-cart/ShoppingCart.vue";

Vue.use(Router)

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "home",
      component: PublicPage
    },
    {
      path: "/page/:slug",
      name: "content-page",
      component: PublicPage
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
          path: "add-page/:sortPosition",
          name: "add-page",
          component: AddEditPage
        },
        {
          path: "edit-page/:pageId",
          name: "edit-page",
          component: AddEditPage
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
    }
  ]
})
