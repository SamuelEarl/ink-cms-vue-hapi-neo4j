<template>
  <div id="login-register">
    <div class="form-container">

      <div class="form-top">
        <header class="form-header">
          <div class="w3-bar">
            <button class="tablink w3-bar-item w3-button" @click="openTab('login', $event)">
              Login
            </button>
            <button class="tablink w3-bar-item w3-button" @click="openTab('register', $event)">
              Register
            </button>
          </div>
        </header>

        <div class="form-body">
          <div v-if="resendVerification">
            <button
              @click="resendVerificationLink"
              id="resend-verification-button"
              class="btn-primary"
            >
              Resend Verification
            </button>
            <br><br>
          </div>

          <div id="login" class="tab-content">
            <form @submit.prevent="login">
              <input v-model="email" class="w3-input w3-border" type="email" placeholder="Email">
              <!-- <div class="validation-messages">
                <div v-if="!$v.email.required && $v.email.$dirty" class="error">Email is required</div>
                <div v-if="!$v.email.email && $v.email.$dirty" class="error">Must be a valid email address</div>
                <br v-if="$v.email.$invalid && $v.email.$dirty">
              </div> -->

              <br>

              <input v-model="password" class="w3-input w3-border" type="password" placeholder="Password">
              <!-- <div class="validation-messages">
                <div v-if="!$v.password.required && $v.password.$dirty" class="error">Password is required</div>
                <div v-if="!$v.password.minLength && $v.password.$dirty" class="error">Password must be at least {{ $v.password.$params.minLength.min }} characters long</div>
                <br v-if="$v.password.$invalid && $v.password.$dirty">
              </div> -->

              <br>

              <!-- <button v-if="!getShowSpinner" @click="$v.$touch()" class="btn-primary">Login</button> -->
              <button v-if="!getShowSpinner" class="btn-primary">Login</button>
              <SpinnerSmall />
            </form>
          </div>

          <div id="register" class="tab-content">
            <form @submit.prevent="register">
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

              <!-- <button v-if="!getShowSpinner" @click="$v.$touch()" class="btn-primary">Register</button> -->
              <button v-if="!getShowSpinner" class="btn-primary">Register</button>
              <SpinnerSmall />
            </form>
          </div>

          <div class="tip">
            <p><span class="bold">Security Tip:</span><br>Use a password manager like<br><a href="https://www.lastpass.com/" target="_blank">LastPass</a> or <a href="https://1password.com/" target="_blank">1Password</a>.</p>
          </div>

        </div>
      </div>

      <footer class="form-bottom form-footer">
        <button @click="goBack">Cancel</button>
        <button @click="forgotPassword">Forgot Password?</button>
      </footer>

    </div>
  </div>
</template>

<script>
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { required, email, minLength, sameAs } from "vuelidate/lib/validators";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";

export default {
  name: "LoginRegister",
  components: {
    SpinnerSmall
  },

  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      resendVerification: true
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
      getShowSpinner: "userFeedback/getShowSpinner",
      getPrevRouteName: "helpers/getPrevRouteName"
    })
  },

  mounted() {
    // Click on the first tab in the modal to select it when the modal first pops up
    let firstTab = document.getElementsByClassName("tablink")[0].click();
    // Add the "active-tab" class to the currently selected tab.
    firstTab += " active-tab";
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
      // registerAction: "auth/registerAction",
      loginAction: "auth/loginAction",
      showSpinnerAction: "userFeedback/showSpinnerAction"
    }),

    openTab(tabName, event) {
      let i, x, tablinks;
      // Create an array of all the "tab" elements and save it to a variable "x".
      x = document.getElementsByClassName("tab-content");
      // When a new tab is clicked, loop through each "tab" div and reset them to "display: none".
      for (i = 0; i < x.length; i++) {
          x[i].style.display = "none";
      }
      // Create an array of all the "tablink"s.
      tablinks = document.getElementsByClassName("tablink");
      // Loop through each "tablink" and remove the "active-tab" class.
      for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active-tab", "");
      }
      // Select the tab content div with id equal to the tab that was clicked and set the tab content to "display: block".
      document.getElementById(tabName).style.display = "block";
      // Add the "active-tab" class to the currently selected tab.
      event.currentTarget.className += " active-tab";
    },

    async register() {
      try {
        const newUser = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword
        };

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

        // If there is an error, then display the error message.
        if (res.error) {
          this.flashAction({ flashType: "error", flashMsg: msg });
          this.showSpinnerAction(false);
          return;
        }

        if (res.redirect) {
          this.showSpinnerAction(false);
          this.$router.push({ name: "email-sent", params: { email: this.email } });
        }
        else {
          throw new Error("Error while attempting to register user.");
        }
      }
      catch(e) {
        console.error("Registration Error:", e);
      }
    },

    async login() {
      try {
        const credentials = {
          email: this.email,
          password: this.password
        };

        if (true) {
        // if (!this.$v.email.$invalid && !this.$v.password.$invalid) {
          this.showSpinnerAction(true);
          this.loginAction(credentials);

          // TODO: If a user tries to login before they have verified their email address, then a flash message will be displayed that says "You have not verified your email address....". When that happens I want to show a red button that says "Resend Verification".
          // I might need to refactor this method by moving all of the loginAction code from Vuex to this method. I will add a new return value in the login route called "resendVerification". If that is set to true, then I will display the "Resend Verification" button.
        }
      }
      catch(e) {
        console.error("Login Error:", e);
      }
    },

    goBack() {
      const prevRouteName = this.getPrevRouteName;

      // If the previous route is "verify-email", then redirect the user to the home route.
      if (prevRouteName === "verify-email") {
        this.$router.push({ name: "home" });
      }
      // Otherwise redirect the user to the previous route.
      else {
        this.$router.back();
      }
    },

    async resendVerificationLink() {
      // TODO: Create auth/resendVerificationLinkAction
      console.log("Clicked resend verification link");
    },

    forgotPassword() {
      console.log("Forgot Password clicked!");
    }
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #login-register {

    .form-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: white;

      .form-top {
        // You can make the form-bottom element stay at the bottom by creating a sticky footer:
        // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
        flex: 1 0 auto;

        .form-header div {
          display: flex;
          justify-content: space-around;
          padding: 20px 30px 10px 30px;

          button {
            border-bottom: 3px solid transparent;

            &:hover {
              background-color: transparent !important;
              border-bottom: 3px solid $medium-gray;
            }
            &.active-tab {
              background-color: transparent !important;
              border-bottom: 3px solid $ink-blue;
            }
          }
        }

        .form-body {
          padding: 20px 30px;

          #resend-verification-button {
            width: 100%;
            background-color: $red;
          }

          form {
            input {
              background-color: $light-gray;
            }

            .error {
              padding: 5px;
              color: white;
              background-color: darkred;
              position: absolute;
            }

            button {
              width: 100%;
              background-image: radial-gradient(
                ellipse at top left,
                lighten($ink-blue, 15%),
                $ink-blue
              );
            }
          }

          .tip {
            margin: 30px 0;
            text-align: center;

            .bold {
              font-weight: bold;
            }
          }
        }
      }

      .form-bottom {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid $medium-gray;
        padding: 20px;
        background-color: $light-gray;
      }
    }
  }
}


@media $m-up {
  .form-container {
    margin-top: 40px;
    margin-right: auto;
    margin-left: auto;
    width: 425px;
    height: auto !important;

    .form-header div {
      padding: 60px 60px 10px 60px !important;
    }

    .form-body {
      padding: 20px 60px !important;
    }
  }
}


@media $l-up {

}
</style>
