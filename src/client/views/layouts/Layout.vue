<template>
  <div id="layout">
    <div id="wrapper">

      <div id="content-top">
        <Header />
        <FlashMessages />

        <div class="container">
          <br>
          <router-view />
        </div>
      </div>

      <div id="content-bottom">
        <Footer />
      </div>

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
  // You can make the footer stay at the bottom by creating a sticky footer:
  // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
  #layout {
    height: 100vh;

    #wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;

      #content-top {
        flex: 1 0 auto;
      }

      #content-bottom {
        flex-shrink: 0;
      }
    }
  }
}

@media $m-up {

}
</style>
