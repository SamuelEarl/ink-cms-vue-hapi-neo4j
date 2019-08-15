<template>
  <div id="layout">
    <div id="wrapper">

      <div id="top-content">
        <Header />

        <FlashMessages />

        <div class="container">
          <br>
          <router-view />
        </div>
      </div>

      <Footer />

    </div>
  </div>
</template>

<script>
import Header from "./Header";
import Footer from "./Footer";
import FlashMessages from "../../components/FlashMessages.vue";

export default {
  name: "Layout",
  components: {
    Header,
    Footer,
    FlashMessages
  },
}
</script>

<style scoped lang="stylus">
@media $s-up {
  // Create sticky footer
  // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
  #layout {
    height: 100vh;

    #wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;

      #top-content {
        flex: 1 0 auto;
      }
    }
  }
}

@media $m-up {

}
</style>
