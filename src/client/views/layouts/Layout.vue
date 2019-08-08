<template>
  <div id="layout">
    <Header />

    <FlashMessages />

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

}

@media $m-up {

}
</style>
