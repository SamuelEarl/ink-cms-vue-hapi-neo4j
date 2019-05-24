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
import Header from "./Header";
import Footer from "./Footer";

export default {
  name: "Layout",
  components: {
    Header,
    Footer
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {

}

@media $m-up {

}
</style>
