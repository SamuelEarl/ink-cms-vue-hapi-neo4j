<template>
  <div id="verify-email">
    <br>
    <br>

    <div v-if="verifyingEmail">
      <h1>Verifying your email address</h1>
      <br>
      <SpinnerLarge />
    </div>

    <div v-if="!verifyingEmail">
      <!-- "We were unable to verify your email address. That link may have expired." -->
      <h1 v-if="error && resendVerification">
        {{ message }}
        <br><br>
        <button @click="resendVerificationLink">Click to resend verification link &rsaquo;</button>
      </h1>

      <!-- "We were unable to find a user associated with that email address." -->
      <h1 v-if="error && !resendVerification">
        {{ message }}
        <br><br>
        <button @click="redirectToLogin">Please register again &rsaquo;</button>
      </h1>

      <!-- `Your email address (${email}) has been verified.` -->
      <h1 v-if="!error && !resendVerification">
        {{ message }}
        <br><br>
        <button @click="redirectToLogin">Please login &rsaquo;</button>
      </h1>
    </div>

    <br>
  </div>
</template>

<script>
import * as Axios from "axios";
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
      error: null,
      resendVerification: null,
      message: ""
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
      const url = `/verify-email/${this.email}/${this.token}`;

      const response = await Axios({
        method: method,
        url: url
      });

      console.log("verifyEmail RESPONSE:", response.data);

      const res = response.data;
      this.showSpinnerAction(false);
      this.verifyingEmail = false;
      this.error = res.error;
      this.resendVerification = res.resendVerification;
      this.message = res.flash;
    },

    async resendVerificationLink() {
      // TODO: Create auth/resendVerificationLinkAction
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
