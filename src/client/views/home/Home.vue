<template>
  <div id="home">
    <p>Home</p>
    {{ $route.path.startsWith('/admin') }}
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: "home",
  components: {},
  // computed: {
  //   route() {
  //     return this.$route;
  //   }
  // }
}
</script>
