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

const router = new Router({
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
      path: "/",
      component: AuthLayout,
      children: [
        {
          path: "login",
          name: "login",
          component: LoginRegister
        },
      ]
    }
  ]
});

// Combine these two route guards into one:
// (1) Check if a route requires auth (and permissions).
// (2) If it does, then retrieve the user's authentication status and user permissions from the server.
// * Remember that each user's authentication status and permissions need to be verified during each request to the server.
// * Remember that hapi receives the browser cookie automatically on all requests to the server. Not every page navigation in Vue will send a request to the server, but I need to be aware of those that do, so I can use those requests in this route guard instead of sending an additional, separate request to the server.
// * Is there some way I can intercept the response back from the server in a route guard? I might have to call a "getAuthAction" for every route that requires authentication (and permissions).

// This route guard will check the matched routes "metadata" property for the key "requiresAuth" and will redirect the user to the Okta authentication flow if the user is not authenticated.
// router.beforeEach(Vue.prototype.$auth.authRedirectGuard());

// router.beforeEach( async (to, from , next) => {
//   // On each route request, retrieve authentication status and user permissions from the server.
//   // This will set the auth status and user permissions in Vuex.
//   // Getters are then used throughout the app to check if a user is signed in and if they have
//   // the proper permissions to access resources.
//   await store.dispatch("auth/getAuthGroupsAction");
//   // You have to call the next() method to continue navigating to the next route.
//   next();
// });

export default router;
