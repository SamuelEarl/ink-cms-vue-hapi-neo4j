<template>
  <AuthFormsWrapper>
    <template #form-title>Verify Your Email</template>
    <template #form-instructions>If you have not received a verification email, then check your spam folder. Otherwise, we can send a new verification email to you.</template>

    <template #form>
      <form class="auth-form" @submit.prevent="resendVerificationLink">
        <input v-model="email" class="w3-input w3-border" type="email" placeholder="Email">
        <!-- <div class="validation-messages">
          <div v-if="!$v.email.required && $v.email.$dirty" class="error">Email is required</div>
          <div v-if="!$v.email.email && $v.email.$dirty" class="error">Must be a valid email address</div>
          <br v-if="$v.email.$invalid && $v.email.$dirty">
        </div> -->

        <br>

        <!-- <button v-if="!showSpinner" @click="$v.$touch()" class="btn-primary">Send Verification</button> -->
        <button v-if="!showSpinner" class="btn-tertiary btn-form">Send Verification</button>
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
  name: "SendEmailVerificationForm",
  components: {
    AuthFormsWrapper,
    SpinnerSmall
  },

  data() {
    return {
      email: "",
    }
  },

  // validations: {
  //   email: {
  //     required,
  //     email
  //   },
  // },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    })
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
      showSpinnerAction: "userFeedback/showSpinnerAction",
      resendVerificationLinkAction: "auth/resendVerificationLinkAction",
    }),

    resendVerificationLink() {
      this.showSpinnerAction(true);
      this.resendVerificationLinkAction(this.email);
    },
  }
}
</script>
