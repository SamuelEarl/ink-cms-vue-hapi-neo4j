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
        <router-link :to="{ name: 'home' }" exact title="Home"><img id="logo" src="@/client/assets/logo-20x20.png" alt="logo"></router-link>
        <div v-if="$route.path.startsWith('/admin')">
          <router-link :to="{ name: 'admin-pages' }" exact>Pages</router-link>
          <router-link :to="{ name: 'admin-categories' }" exact>Categories</router-link>
          <router-link :to="{ name: 'admin-products' }" exact>Products</router-link>
        </div>
        <div v-else>
          <router-link :to="{ name: 'about' }" exact>About</router-link>
          <router-link :to="{ name: 'news' }" exact>News</router-link>
          <router-link :to="{ name: 'contact' }" exact>Contact</router-link>
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
          :to="{ name: 'admin-pages' }"
          title="Admin"
          exact
        >
          <font-awesome-icon icon="user-shield" />
        </router-link>
        <router-link :to="{ name: 'login' }" exact>Login</router-link>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
  components: {},

  data() {
    return {
      groups: [ "admin" ]
      // groups: []
    }
  },

  methods: {
    toggleNav() {
      const nav = document.getElementById("nav");
      if (nav.style.display === "flex") {
        nav.style.display = "none";
      }
      else {
        nav.style.display = "flex";
      }
    }
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

        .home {
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

        .home {
          display: block;
        }
      }
    }
  }
}
</style>
