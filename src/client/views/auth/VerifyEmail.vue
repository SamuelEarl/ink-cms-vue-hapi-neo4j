<template>
  <div id="verify-email">
    <br />
    <br />
    <!-- I need to put a spinner here and on the LoginRegister page. -->
    <!-- After a user logs in or registers or while they are waiting for their email to be verified, I want to show some user feedback that something is happening until after they are redirected. -->
    <h1 v-if="verifyingEmail">Verifying your email address</h1>
    <Spinner />

    <h1 v-if="emailIsVerified">Your email address ({{ $route.params.email }}) has been verified.</h1>
    <h1 v-else>Your email address was not verified.</h1>

    <br />
    <h1>
      <router-link :to="{ name: 'login' }" exact>Please login</router-link> &rsaquo;
    </h1>
  </div>
</template>

<script>
import Spinner from "@/client/components/Spinner.vue";

export default {
  name: "VerifyEmail",
  components: {
    Spinner
  },

  data() {
    return {
      verifyingEmail: true,
      emailIsVerified: false
    };
  }
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
