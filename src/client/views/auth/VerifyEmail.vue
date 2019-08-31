<template>
  <div id="verify-email">

    <br><br>

    <div v-if="verifyingEmail">
      <h2>Verifying your email address</h2>
      <br>
      <SpinnerLarge />
    </div>

    <div v-if="!verifyingEmail">
      <h2>{{ message }}</h2>

      <br><br>

      <!-- "We were unable to verify your email address. That link may have expired." -->
      <h2>
        <button
          v-if="cta === 'resendVerification'"
          @click="resendVerificationLink"
        >
          Click here to send a new verification link &rsaquo;
        </button>
      </h2>

      <!-- "We were unable to find a user associated with that email address." -->
      <h2>
        <button
          v-if="cta === 'register'"
          @click="redirectToLogin"
        >
          Please register again &rsaquo;
        </button>
      </h2>

      <!-- `Your email address (${email}) has (already) been verified.` -->
      <h2>
        <button
          v-if="cta === 'login'"
          @click="redirectToLogin"
        >
          Please login &rsaquo;
        </button>
      </h2>
    </div>


<!--
    <div v-if="!verifyingEmail">
      "We were unable to verify your email address. That link may have expired."
      <h2 v-if="error && resendVerification">
        {{ message }}
        <br><br>
        <button @click="resendVerificationLink">Click to resend verification link &rsaquo;</button>
      </h2>

      "We were unable to find a user associated with that email address."
      <h2 v-if="error && !resendVerification">
        {{ message }}
        <br><br>
        <button @click="redirectToLogin">Please register again &rsaquo;</button>
      </h2>

      `Your email address (${email}) has been verified.`
      `Your email address (${email}) has already been verified.`
      <h2 v-if="!error && !resendVerification">
        {{ message }}
        <br><br>
        <button @click="redirectToLogin">Please login &rsaquo;</button>
      </h2>
    </div> -->


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
      message: "",
      cta: "" // This can be "resendVerification", "register", or "login"
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
      this.message = res.flash;
      this.cta = res.cta;
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

    div, h2, button {
      color: white;
    }
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
