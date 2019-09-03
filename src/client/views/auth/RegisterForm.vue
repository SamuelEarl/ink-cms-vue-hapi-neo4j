<template>
  <AuthFormsWrapper>
    <template #form-title>Register</template>

    <template #form>
      <form class="auth-form" @submit.prevent="register">
        <input v-model="firstName" class="w3-input w3-border" type="text" placeholder="First Name">
        <!-- <div class="validation-messages">
          <div v-if="!$v.firstName.required" class="error">First Name is required</div>
          <br v-if="$v.firstName.$invalid">
        </div> -->

        <br>

        <input v-model="lastName" class="w3-input w3-border" type="text" placeholder="Last Name">
        <!-- <div class="validation-messages">
          <div v-if="!$v.lastName.required" class="error">Last Name is required</div>
          <br v-if="$v.lastName.$invalid">
        </div> -->

        <br>

        <input v-model="email" class="w3-input w3-border" type="email" placeholder="Email">
        <!-- <div class="validation-messages">
          <div v-if="!$v.email.required" class="error">Email is required</div>
          <div v-if="!$v.email.email" class="error">Must be a valid email address</div>
          <br v-if="$v.email.$invalid">
        </div> -->

        <br>

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

        <!-- <button v-if="!showSpinner" @click="$v.$touch()" class="btn-primary">Register</button> -->
        <button v-if="!showSpinner" class="btn-primary btn-form blue-gradient">Register</button>
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
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { required, email, minLength, sameAs } from "vuelidate/lib/validators";
import AuthFormsWrapper from "./AuthFormsWrapper.vue";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";

export default {
  name: "RegisterForm",
  components: {
    AuthFormsWrapper,
    SpinnerSmall
  },

  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  },

  // validations: {
  //   firstName: {
  //     required
  //   },
  //   lastName: {
  //     required
  //   },
  //   email: {
  //     required,
  //     email
  //   },
  //   password: {
  //     required,
  //     minLength: minLength(6)
  //   },
  //   confirmPassword: {
  //     // Do not use the "required" validator because it is not necessary and it will get displayed
  //     // at the same time as the "sameAs" validator and the error messages will overlap.
  //     sameAsPassword: sameAs("password")
  //   }
  // },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    })
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
      // registerAction: "auth/registerAction",
      showSpinnerAction: "userFeedback/showSpinnerAction",
    }),

    async register() {
      try {
        const newUser = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword
        };

        // TODO: Remove the following line if I am not going to use it.
        // this.registerAction(newUser);

        const method = "POST";
        const url = "/register";
        const payload = newUser;
        let response;

        if (true) {
        // if (!this.$v.$invalid) {
          this.showSpinnerAction(true);

          response = await Axios({
            method: method,
            url: url,
            data: payload
          });
        }

        console.log("register RESPONSE:", response.data);

        const res = response.data;
        const msg = res.flash;

        this.showSpinnerAction(false);

        // If there is an error, then display the error message.
        if (res.error) {
          this.flashAction({ flashType: "error", flashMsg: msg });
          return;
        }

        // If a user successfully registers, they will be redirected to the "email-sent" route
        // where they will be instructed to check their email account.
        this.$router.push({ name: "email-sent", params: { email: this.email } });
      }
      catch(e) {
        console.error("Registration Error:", e);
      }
    },
  }
}
</script>
