<template>
  <div id="email-sent">
    <br />
    <br />
    <h1>An email has been sent to {{ $route.params.email }}.</h1>
    <br />
    <h1>Please check your email account.</h1>
  </div>
</template>

<script>
export default {
  name: "EmailSent"
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #email-sent {
    text-align: center;
    color: white;
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
