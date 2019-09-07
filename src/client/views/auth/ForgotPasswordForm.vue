<template>
  <AuthFormsWrapper>
    <template #form-title>Forgot Your Password?</template>
    <template #form-instructions>Please enter your email address to request a password reset.</template>

    <template #form>
      <form class="auth-form" @submit.prevent="forgotPassword">
        <input v-model="email" class="w3-input w3-border" type="email" placeholder="Email">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.email.required" class="error">Email is required</div>
          <div v-if="!$v.email.email" class="error">Must be a valid email address</div>
          <br v-if="$v.email.$invalid">
        </div>

        <br>

        <button
          v-if="!showSpinner"
          @click="$v.$touch()"
          class="btn-tertiary btn-form"
        >
          Request Password Reset
        </button>
        <SpinnerSmall v-if="showSpinner" />
      </form>
    </template>

  </AuthFormsWrapper>
</template>

<script>
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { required, email, minLength } from "vuelidate/lib/validators";
import AuthFormsWrapper from "./AuthFormsWrapper.vue";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";

export default {
  name: "ForgotPasswordForm",
  components: {
    AuthFormsWrapper,
    SpinnerSmall
  },

  data() {
    return {
      email: "",
    }
  },

  validations: {
    email: {
      required,
      email
    },
  },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    })
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
      showSpinnerAction: "userFeedback/showSpinnerAction",
    }),

    async forgotPassword() {
      try {
        // If the form is valid, then show the spinner and send the AJAX request.
        if (!this.$v.$invalid) {
          const method = "POST";
          const url = "/send-password-reset-link";
          const payload = {
            email: this.email
          };
          let response;

          this.showSpinnerAction(true);

          response = await Axios({
            method: method,
            url: url,
            data: payload
          });

          const res = response.data;
          console.log("forgotPassword RESPONSE:", res);
          const msg = res.flash;

          this.showSpinnerAction(false);

          // If there is an error, then display the error message.
          if (res.error) {
            this.flashAction({ flashType: "error", flashMsg: msg });
            return;
          }

          // If a user successfully submits a request to reset their password, then they will be
          // redirected to the "email-sent" route where they will be instructed to check their email
          // account.
          this.$router.push({ name: "email-sent", params: { email: this.email } });
        }
      }
      catch(e) {
        console.error("Forgot Password Error:", e);
      }
    },
  }
}
</script>
