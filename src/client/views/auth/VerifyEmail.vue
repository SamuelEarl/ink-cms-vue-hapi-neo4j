<template>
  <div id="verify-email">

    <br><br>

    <div v-if="verifyingEmail">
      <h1>Verifying your email address</h1>
      <br>
      <SpinnerLarge />
    </div>

    <div v-if="!verifyingEmail">
      <h1>{{ message }}</h1>

      <br><br>

      <!-- "We were unable to verify your email address. That link may have expired." -->
      <h1 v-if="!getShowSpinner">
        <button
          v-if="cta === 'sendVerification'"
          @click="sendVerificationLink"
        >
          Click here to send a new verification link &rsaquo;
        </button>
      </h1>

      <SpinnerLarge />

      <!-- "We were unable to find a user associated with that email address." -->
      <h1>
        <button
          v-if="cta === 'register'"
          @click="redirectToLogin"
        >
          Please register again &rsaquo;
        </button>
      </h1>

      <!-- `Your email address (${email}) has (already) been verified.` -->
      <h1>
        <button
          v-if="cta === 'login'"
          @click="redirectToLogin"
        >
          Please login &rsaquo;
        </button>
      </h1>
    </div>

    <br>

  </div>
</template>

<script>
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
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
      cta: "" // This can be "sendVerification", "register", or "login"
    };
  },

  computed: {
    ...mapGetters({
      getShowSpinner: "userFeedback/getShowSpinner",
    })
  },

  created() {
    this.showSpinnerAction(true);
    this.verifyEmail();
  },

  methods: {
    ...mapActions({
      showSpinnerAction: "userFeedback/showSpinnerAction",
      sendVerificationLinkAction: "auth/sendVerificationLinkAction"
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

    sendVerificationLink() {
      this.showSpinnerAction(true);
      this.sendVerificationLinkAction(this.email);
    },

    redirectToLogin() {
      this.showSpinnerAction(false);
      this.$router.push({ name: "auth" });
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
