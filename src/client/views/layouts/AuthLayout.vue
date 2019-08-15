<template>
  <div id="auth-layout">

    <FlashMessages />

    <router-view />

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

}

@media $m-up {

}
</style>
