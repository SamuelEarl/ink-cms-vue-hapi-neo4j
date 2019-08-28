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

    <div v-if="!verifyingEmail">
      <!-- "We were unable to find a valid token. That token may have expired." -->
      <h1 v-if="error && resendToken">
        {{ flash }}
        <br><br>
        <button @click="resendVerificationLink">Click to resend verification link &rsaquo;</button>
      </h1>

      <!-- "We were unable to find a user for this token." -->
      <h1 v-if="error && !resendToken">
        {{ flash }}
        <br><br>
        <button @click="redirectToLogin">Please try to register again &rsaquo;</button>
      </h1>

      <!-- `Your email address (${email}) has been verified.` -->
      <h1 v-if="!error && !resendToken">
        {{ flash }}
        <br><br>
        <button @click="redirectToLogin">Please login &rsaquo;</button>
      </h1>
    </div>

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
      email: this.$route.params.email,
      token: this.$route.params.token,
      verifyingEmail: true,
      error: false
    };
  },

  created() {
    this.showSpinnerAction(true);
    this.verifyEmail();
  },

  methods: {
    ...mapActions({
      showSpinnerAction: "userFeedback/showSpinnerAction"
    }),

    async verifyEmail() {
      const method = "GET";
      const url = "/verify-email/${this.email}/${this.token}";

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("verifyEmail RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;
      this.showSpinnerAction(false);

      // If there is an error, then display the error message.
      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        this.showSpinnerAction(false);
        return;
      }

      if (res.redirect) {
        this.showSpinnerAction(false);
        this.$router.push({ name: "email-sent", params: { email: this.email } });
      }
      else {
        throw new Error("Error while attempting to register user.");
      }
    },

    async resendVerificationLink() {
      console.log("Clicked resend verification link");
    },

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
