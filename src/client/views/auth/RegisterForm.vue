<template>
  <AuthFormsWrapper>
    <template #form-title>Register</template>

    <template #form>
      <form class="auth-form" @submit.prevent="register">
        <input v-model="firstName" class="w3-input w3-border input" type="text" placeholder="First Name">
        <!-- The v-if="$v.$dirty" check will only allow the error messages to be shown if the user has "touched" the input field. See the comment above the "Register" button for more details. -->
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.firstName.required" class="error">First Name is required</div>
          <br v-if="$v.firstName.$invalid">
        </div>

        <br>

        <input v-model="lastName" class="w3-input w3-border input" type="text" placeholder="Last Name">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.lastName.required" class="error">Last Name is required</div>
          <br v-if="$v.lastName.$invalid">
        </div>

        <br>

        <input v-model="email" class="w3-input w3-border input" type="email" placeholder="Email">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.email.required" class="error">Email is required</div>
          <div v-if="!$v.email.email" class="error">Must be a valid email address</div>
          <br v-if="$v.email.$invalid">
        </div>

        <br>

        <input v-model="password" class="w3-input w3-border input" type="password" placeholder="Password">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.password.required" class="error">Password is required</div>
          <div v-if="!$v.password.minLength" class="error">Password must be at least {{ $v.password.$params.minLength.min }} characters long</div>
          <br v-if="$v.password.$invalid">
        </div>

        <br>

        <input v-model="confirmPassword" class="w3-input w3-border input" type="password" placeholder="Confirm Password">
        <div v-if="$v.$dirty" class="validation-messages">
          <div v-if="!$v.confirmPassword.sameAsPassword" class="error">Passwords must match</div>
          <br v-if="$v.confirmPassword.$invalid">
        </div>

        <br>

        <!-- When a user has "touched" an input field, we say that the input field is "dirty". (With Vuelidate you decide what "touched" means. For example, you could use logic that causes an input field to be "touched" when a user clicks inside of it [e.g., using a click event] or clicks out of it [e.g., using a blur event].) Vuelidate uses a boolean property called "$dirty" to indicate whether an input field is dirty or not. $dirty is set to false by default and Vuelidate does not automatically set an input field's $dirty property to true for you. You have to manually take care of setting the $dirty property by calling the $touch() method when appropriate. -->
        <!-- In our register form, we are setting each field's $dirty property to true when the "Register" button is clicked. NOTE: $v.$touch refers to all the fields in the form. $v.firstName.$touch would only refer to the firstName field.  -->
        <button
          @click="$v.$touch()"
          class="btn-primary full-width blue-gradient"
        >
          <SpinnerSmall v-if="showSpinner" />
          Register
        </button>
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

  validations: {
    firstName: {
      required
    },
    lastName: {
      required
    },
    email: {
      required,
      email
    },
    password: {
      required,
      minLength: minLength(6)
    },
    confirmPassword: {
      // Do not use the "required" validator because it is not necessary and it will get displayed
      // at the same time as the "sameAs" validator, which will cause those error messages to overlap.
      sameAsPassword: sameAs("password")
    }
  },

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
        // If the form is valid, then show the spinner and send an AJAX call to the "/register" endpoint.
        if (!this.$v.$invalid) {
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

          this.showSpinnerAction(true);

          const response = await Axios({
            method: method,
            url: url,
            data: payload
          });


          const res = response.data;
          console.log("register RESPONSE:", res);
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
      }
      catch(e) {
        console.error("Registration Error:", e);
      }
    },
  }
}
</script>
