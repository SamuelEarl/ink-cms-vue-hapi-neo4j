<template>
  <div id="auth-layout">
    <div id="wrapper">

      <div id="content-top">
        <FlashMessages />

        <div class="container">
          <br>
          <router-view />
        </div>
      </div>

      <div id="content-bottom">
      </div>

    </div>
  </div>
</template>

<script>
import FlashMessages from "../../components/FlashMessages.vue";

export default {
  name: "AuthLayout",
  components: {
    FlashMessages
  },
}
</script>

<style scoped lang="stylus">
@media $s-up {
  // You can expand the background to fit the page by creating a sticky footer:
  // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
  #auth-layout {
    height: 100vh;

    #wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;

      #content-top {
        flex: 1 0 auto;
        background-image: radial-gradient(
          ellipse at top left,
          lighten($ink-blue, 15%),
          $ink-blue
        );
      }

      #content-bottom {
        flex-shrink: 0;
      }
    }
  }
}

@media $m-up {
  #content-top {
    padding-bottom: 50px;
  }
}
</style>
