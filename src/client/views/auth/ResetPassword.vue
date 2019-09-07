<template>
  <div id="verify-email">

    <br><br>

    <div v-if="validatingPasswordResetLink">
      <h1>Checking if password reset link is valid</h1>
      <br>
      <SpinnerLarge />
    </div>

    <div v-if="!validatingPasswordResetLink && cta === 'tryAgain'">
      <h1>{{ message }}</h1>

      <br><br>

      <!-- "Your password reset link is invalid or has expired." -->
      <h1>
        <button
          @click="redirectToForgotPassword"
        >
          Request a new password reset &rsaquo;
        </button>
      </h1>
    </div>

    <!-- If the password reset link is still valid, then show the reset password form. -->
    <AuthFormsWrapper v-if="!validatingPasswordResetLink && cta === 'resetPassword'">

      <template #form-title>Reset Your Password</template>

      <template #form>
        <form class="auth-form" @submit.prevent="resetPassword">
          <input v-model="password" class="w3-input w3-border" type="password" placeholder="New Password">
          <div v-if="$v.$dirty" class="validation-messages">
            <div v-if="!$v.password.required" class="error">Password is required</div>
            <div v-if="!$v.password.minLength" class="error">Password must be at least {{ $v.password.$params.minLength.min }} characters long</div>
            <br v-if="$v.password.$invalid">
          </div>

          <br>

          <input v-model="confirmPassword" class="w3-input w3-border" type="password" placeholder="Confirm New Password">
          <div v-if="$v.$dirty" class="validation-messages">
            <div v-if="!$v.confirmPassword.sameAsPassword" class="error">Passwords must match</div>
            <br v-if="$v.confirmPassword.$invalid">
          </div>

          <br>

          <button
            v-if="!showSpinner"
            @click="$v.$touch()"
            class="btn-primary btn-form blue-gradient"
          >
            Reset Password
          </button>
          <SpinnerSmall v-if="showSpinner" />
        </form>
      </template>

    </AuthFormsWrapper>

    <br>

  </div>
</template>

<script>
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { required, email, minLength, sameAs } from "vuelidate/lib/validators";
import AuthFormsWrapper from "./AuthFormsWrapper.vue";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";
import SpinnerLarge from "@/client/components/SpinnerLarge.vue";

export default {
  name: "ResetPassword",
  components: {
    AuthFormsWrapper,
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

  validations: {
    password: {
      required,
      minLength: minLength(6)
    },
    confirmPassword: {
      // Do not use the "required" validator because it is not necessary and it will get displayed
      // at the same time as the "sameAs" validator and the error messages will overlap.
      sameAsPassword: sameAs("password")
    }
  },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    })
  },

  created() {
    this.showSpinnerAction(true);
    this.checkPasswordResetLink();
  },

  methods: {
    ...mapActions({
      showSpinnerAction: "userFeedback/showSpinnerAction",
      flashAction: "userFeedback/flashAction",
    }),

    async checkPasswordResetLink() {
      const method = "GET";
      const url = `/reset-password/${this.email}/${this.token}`;

      const response = await Axios({
        method: method,
        url: url
      });

      const res = response.data;
      console.log("checkPasswordResetLink RESPONSE:", res);

      this.showSpinnerAction(false);
      this.validatingPasswordResetLink = false;
      this.message = res.flash;
      this.cta = res.cta;
    },

    async resetPassword() {
      try {
        // If the form is valid, then show the spinner and send the AJAX request.
        if (!this.$v.$invalid) {
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

          const res = response.data;
          console.log("checkPasswordResetLink RESPONSE:", res);
          const msg = res.flash;

          this.showSpinnerAction(false);

          if (res.error) {
            this.flashAction({ flashType: "error", flashMsg: msg });

            if (res.cta === "tryAgain") {
              this.$router.push({ name: "forgot-password" });
            }

            return;
          }

          // If the user successfully updates their password, then redirect them to the login form.
          this.flashAction({ flashType: "success", flashMsg: msg });
          this.$router.push({ name: "login" });
        }
      }
      catch(e) {
        console.error("resetPassword Error:", e);
      }
    },

    redirectToForgotPassword() {
      this.showSpinnerAction(false);
      this.$router.push({ name: "forgot-password" });
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
