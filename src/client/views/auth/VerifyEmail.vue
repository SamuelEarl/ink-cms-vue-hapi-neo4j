<template>
  <div id="verify-email">
    <br />
    <br />
    <h1>An email has been sent to {{ $route.params.email }}.</h1>
    <br />
    <h1>Please verify your email address.</h1>
  </div>
</template>

<script>
export default {
  name: "VerifyEmail"
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #verify-email {
    text-align: center;
    color: white;
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
