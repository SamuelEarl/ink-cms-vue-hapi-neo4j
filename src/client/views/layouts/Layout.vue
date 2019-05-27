<template>
  <div id="layout">
    <Header />
    <div class="container">
      <br>
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import Header from "./Header";
import Footer from "./Footer";

export default {
  name: "Layout",
  components: {
    Header,
    Footer
  },

  watch: {
// I don't know if this is the best way to check for updates to the pages array. This checks
// on every route change, which is unnecessary. I need to come up with a better way to check
// for page updates.
    // When the route changes, execute the "refreshPages" method. This will check for changes
    // to the "pages" array.
    "$route": "refreshPages"
  },

  created() {
    this.refreshPages();
  },

  methods: {
    ...mapActions({
      pagesAction: "pages/pagesAction",
    }),

    async refreshPages() {
      this.pagesAction();
    },
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {

}

@media $m-up {

}
</style>
