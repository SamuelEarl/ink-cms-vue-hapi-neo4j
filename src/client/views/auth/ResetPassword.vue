<template>
  <div id="verify-email">

    <br><br>

    <div v-if="validatingPasswordResetLink">
      <h1>Checking if password reset link is valid</h1>
      <br>
      <SpinnerLarge />
    </div>

    <div v-if="!validatingPasswordResetLink">
      <h1>{{ message }}</h1>

      <br><br>

      <!-- "Your password reset link is invalid or has expired." -->
      <h1 v-if="cta === 'tryAgain'">
        <button
          @click="redirectToPasswordReset"
        >
          Request a new password reset &rsaquo;
        </button>
      </h1>

      <!-- TODO: Create an "AuthFormContainer" component and refactor all of the auth forms to use it. I think I would use slots to do this. -->
      <div v-if="cta === 'resetPassword'" id="reset-password">
        <form @submit.prevent="resetPassword">
          <input v-model="password" class="w3-input w3-border" type="password" placeholder="Password">
          <!-- <div class="validation-messages">
            <div v-if="!$v.password.required" class="error">Password is required</div>
            <div v-if="!$v.password.minLength" class="error">Password must be at least {{ $v.password.$params.minLength.min }} characters long</div>
            <br v-if="$v.password.$invalid">
          </div> -->

          <br>

          <input v-model="confirmPassword" class="w3-input w3-border" type="password" placeholder="Confirm Password">
          <!-- <div class="validation-messages">
            <div v-if="!$v.confirmPassword.sameAsPassword" class="error">Passwords must match</div>
            <br v-if="$v.confirmPassword.$invalid">
          </div> -->

          <br>

          <!-- <button v-if="!getShowSpinner" @click="$v.$touch()" class="btn-primary">Reset Password</button> -->
          <button v-if="!getShowSpinner" class="btn-primary btn-form blue-gradient">Reset Password</button>
          <SpinnerSmall />
        </form>
      </div>
    </div>

    <br>

  </div>
</template>

<script>
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";
import SpinnerLarge from "@/client/components/SpinnerLarge.vue";

export default {
  name: "ResetPassword",
  components: {
    SpinnerSmall,
    SpinnerLarge
  },

  data() {
    return {
      email: this.$route.params.email,
      password: "",
      confirmPassword: "",
      token: this.$route.params.token,
      validatingPasswordResetLink: true,
      message: "",
      cta: "", // This can be "tryAgain" or "resetPassword",
    };
  },

  computed: {
    ...mapGetters({
      getShowSpinner: "userFeedback/getShowSpinner",
    })
  },

  created() {
    this.showSpinnerAction(true);
    this.checkPasswordResetLink();
  },

  methods: {
    ...mapActions({
      showSpinnerAction: "userFeedback/showSpinnerAction",
      flashAction: "userFeedback/flashAction"
    }),

    async checkPasswordResetLink() {
      const method = "GET";
      const url = `/reset-password/${this.email}/${this.token}`;

      const response = await Axios({
        method: method,
        url: url
      });

      console.log("checkPasswordResetLink RESPONSE:", response.data);

      const res = response.data;
      this.showSpinnerAction(false);
      this.validatingPasswordResetLink = false;
      this.message = res.flash;
      this.cta = res.cta;
    },

    async resetPassword() {
      this.showSpinnerAction(true);

      const method = "POST";
      const url = "/reset-password";
      const payload = {
        email: this.email,
        token: this.token,
        password: this.password,
        confirmPassword: this.confirmPassword
      };

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("checkPasswordResetLink RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;

      this.showSpinnerAction(false);

      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        return;
      }

      // If the user successfully updates their password, then redirect them to the login form.
      this.flashAction({ flashType: "success", flashMsg: msg });
      this.$router.push({ name: "auth" });
    },

    redirectToPasswordReset() {
      this.showSpinnerAction(false);
      this.$router.push({ name: "password-reset" });
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
