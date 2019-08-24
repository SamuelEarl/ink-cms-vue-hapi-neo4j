<template>
  <div id="verify-email">
    <br>
    <br>
    <!-- I need to put a spinner here and on the LoginRegister page. -->
    <!-- After a user logs in or registers or while they are waiting for their email to be verified, I want to show some user feedback that something is happening until after they are redirected. -->
    <div v-if="verifyingEmail">
      <h1>Verifying your email address</h1>
      <br>
      <SpinnerLarge />
    </div>

    <h1 v-if="emailIsVerified">
      Your email address ({{ $route.params.email }}) has been verified.
      <br><br>
      <button @click="redirectToLogin">Please login &rsaquo;</button>
    </h1>

    <h1 v-if="emailNotVerified">
      Your email address was not verified.
      <br><br>
      Please do something...
    </h1>
    <br>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import SpinnerLarge from "@/client/components/SpinnerLarge.vue";

export default {
  name: "VerifyEmail",
  components: {
    SpinnerLarge
  },

  data() {
    return {
      verifyingEmail: true,
      emailIsVerified: false,
      emailNotVerified: false
    };
  },

  created() {
    this.showSpinnerAction(true);
  },

  methods: {
    ...mapActions({
      showSpinnerAction: "userFeedback/showSpinnerAction"
    }),

    redirectToLogin() {
      this.showSpinnerAction(false);
      this.$router.push({ name: "login" });
    }
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #verify-email {
    text-align: center;

    div, h1, button {
      color: white;
    }
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
