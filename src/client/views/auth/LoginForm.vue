<template>
  <AuthFormsWrapper>
    <template #form-title>Login</template>

    <template #form>
      <form class="auth-form" @submit.prevent="login">
        <input v-model="email" class="w3-input w3-border" type="email" placeholder="Email">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.email.required" class="error">Email is required</div>
          <div v-if="!$v.email.email" class="error">Must be a valid email address</div>
          <br v-if="$v.email.$invalid">
        </div>

        <br>

        <input v-model="password" class="w3-input w3-border" type="password" placeholder="Password">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.password.required" class="error">Password is required</div>
          <div v-if="!$v.password.minLength" class="error">Password must be at least {{ $v.password.$params.minLength.min }} characters long</div>
          <br v-if="$v.password.$invalid">
        </div>

        <br>

        <button
          v-if="!showSpinner"
          @click="$v.$touch()"
          class="btn-primary btn-form blue-gradient"
        >
          Login
        </button>
        <SpinnerSmall v-if="showSpinner" />
      </form>
    </template>

    <template #security-tip>
      <div class="security-tip">
        <p><span class="bold">Security Tip:</span><br>Use a password manager like<br><a href="https://www.lastpass.com/" target="_blank">LastPass</a> or <a href="https://1password.com/" target="_blank">1Password</a>.</p>
      </div>
    </template>

  </AuthFormsWrapper>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { required, email, minLength } from "vuelidate/lib/validators";
import AuthFormsWrapper from "./AuthFormsWrapper.vue";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";

export default {
  name: "LoginForm",
  components: {
    AuthFormsWrapper,
    SpinnerSmall
  },

  data() {
    return {
      email: "",
      password: "",
    }
  },

  validations: {
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    },
  },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    })
  },

  methods: {
    ...mapActions({
      loginAction: "auth/loginAction",
      showSpinnerAction: "userFeedback/showSpinnerAction",
    }),

    login() {
      try {
        // If the form is valid, then show the spinner and call loginAction.
        if (!this.$v.$invalid) {
          const credentials = {
            email: this.email,
            password: this.password
          };

          this.showSpinnerAction(true);
          this.loginAction(credentials);
        }
      }
      catch(e) {
        console.error("Login Error:", e);
      }
    },
  }
}
</script>
