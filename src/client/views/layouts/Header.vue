<template>
  <header>
    <div id="mobile-nav-bar">
      <div>
        <button id="toggle-nav" class="mobile-menu-btn" title="Toggle Navigation" v-on:click="toggleNav"><font-awesome-icon icon="bars" /></button>
      </div>
      <div>
        <div id="mobile-logo"><router-link to="/" exact><img id="logo" src="@/client/assets/logo-30x30.png" alt="logo"></router-link></div>
      </div>
      <div>
        <button id="placeholder-btn" class="mobile-menu-btn"><font-awesome-icon icon="bars" /></button>
      </div>
    </div>
    <nav id="nav" class="container">
      <div id="left-nav">

        <!-- Home link -->
        <router-link :to="{ name: 'home' }" exact id="home-link" title="Home">
          <img id="logo" src="@/client/assets/logo-20x20.png" alt="logo">
        </router-link>

        <!-- Admin header links -->
        <div v-if="$route.path.startsWith('/admin')">
          <router-link :to="{ name: 'pages-list' }" exact>Pages</router-link>
          <!-- <router-link :to="{ name: 'admin-categories' }" exact>Categories</router-link>
          <router-link :to="{ name: 'admin-products' }" exact>Products</router-link> -->
        </div>

        <!-- Public header links -->
        <div v-else v-for="page in getPagesList" :key="page.id">
          <router-link :to="{
            name: 'public-page',
            params: {
              slug: page.slug
            }
          }" exact>
            {{ page.title | capitalize }}
          </router-link>
        </div>
      </div>
      <div id="right-nav">
        <router-link
          v-if="!$route.path.startsWith('/admin')"
          :to="{ name: 'shopping-cart' }"
          title="Shopping Cart"
          exact
        >
          <font-awesome-icon icon="shopping-cart" /> ( 0 )
        </router-link>
        <router-link
          v-if="!$route.path.startsWith('/admin')"
          :to="{ name: 'pages-list' }"
          title="Admin"
          exact
        >
          <font-awesome-icon icon="user-shield" />
        </router-link>
        <button>Login</button>
      </div>
    </nav>
  </header>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Header",
  components: {},

  data() {
    return {
      groups: [ "admin" ],
    }
  },

  computed: {
    ...mapGetters({
      getPagesList: "pages/getPagesList",
    }),
  },

  /**
   * When this component is first created, it calls the "setPagesListAction", which populates
   * the "pages" state property in the "pages" Vuex module.
   */
  async created() {
    // Since the "setPagesListAction" will also be called when the "pages-list" route is loaded
    // we don't want it to be called twice unnecessarily. So we will return with no value if
    // the "pages-list" route is being loaded.
    if (this.$route.name === "pages-list") {
      return;
    }
    await this.setPagesListAction();
  },

  methods: {
    ...mapActions({
      setPagesListAction: "pages/setPagesListAction",
    }),

    toggleNav() {
      const nav = document.getElementById("nav");
      if (nav.style.display === "flex") {
        nav.style.display = "none";
      }
      else {
        nav.style.display = "flex";
      }
    },
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {
  header {
    width: 100%;
    background-color: navy;

    button {
      color: white;
    }

    a {
      text-decoration: none;
      color: white;
    }

    #mobile-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 50;
      width: 100%;
      height: 50px;
      background-color: navy;
      box-shadow: 0 0 5px gray;

      .mobile-menu-btn {
        padding: 15px;
        background-color: transparent;
      }

      #placeholder-btn {
        cursor: default;
        background: none;
        color: transparent;
      }
    }

    // Hide all links by default.
    #nav {
      display: none;
      flex-direction: column;
      text-align: center;

      div {
        display: flex;
        flex-direction: column;

        a {
          padding: 12px;
          text-decoration: none;
          color: lightgray;
          &:hover {
            color: white;
          }
        }

        #home-link {
          display: none;
        }
      }
    }
  }
}

@media $m-up {

}

@media $l-up {
  header {
    #mobile-nav-bar {
      display: none;
    }

    #nav {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      padding-left: 0;
      padding-right: 0;
      text-align: center;

      div {
        flex-direction: row;
        align-items: center;

        #home-link {
          display: block;
        }
      }
    }
  }
}
</style>
