<template>
  <div id="page-container">
    <div class="form-container">

      <div id="top-container">
        <header>
          <div class="w3-bar">
            <button class="tablink w3-bar-item w3-button" @click="openTab('login', $event)">
              Login
            </button>
            <button class="tablink w3-bar-item w3-button" @click="openTab('register', $event)">
              Register
            </button>
          </div>
        </header>

        <section id="body">
          <div id="login" class="tab-content">
            <form @submit.prevent="login">
              <input v-model="loginFields.email" class="w3-input w3-border" type="email" placeholder="Email">
              <input v-model="loginFields.password" class="w3-input w3-border" type="password" placeholder="Password">

              <button class="btn-primary">Login</button>
            </form>
          </div>

          <div id="register" class="tab-content">
            <form @submit.prevent="register">
              <input v-model="regFields.firstName" class="w3-input w3-border" type="text" placeholder="First Name">
              <input v-model="regFields.lastName" class="w3-input w3-border" type="text" placeholder="Last Name">
              <input v-model="regFields.email" class="w3-input w3-border" type="email" placeholder="Email">
              <input v-model="regFields.password" class="w3-input w3-border" type="password" placeholder="Password">
              <input v-model="regFields.confirmPassword" class="w3-input w3-border" type="password" placeholder="Confirm Password">
              <button class="btn-primary">Register</button>
            </form>
          </div>

          <div id="tip">
            <p><span class="bold">Security Tip:</span><br>Use a password manager like<br><a href="https://www.lastpass.com/" target="_blank">LastPass</a> or <a href="https://1password.com/" target="_blank">1Password</a>.</p>
          </div>

        </section>
      </div>

      <footer>
        <button @click="goBack">Cancel</button>
        <button @click="forgotPassword">Forgot Password?</button>
      </footer>

    </div>
  </div>
</template>

<script>
import * as Axios from "axios";
import { mapActions } from "vuex";

export default {
  name: "LoginRegister",
  components: {},

  data() {
    return {
      loginFields: {
        email: "",
        password: ""
      },
      regFields: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
      },
    }
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

    async login() {
      const method = "POST";
      const url = "/login"
      const payload = {
        email: this.loginFields.email,
        password: this.loginFields.password
      };

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("login RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        return;
      }

      // Otherwise redirect the user back to the previous page they were on and display a success message.
      this.$router.back();
      this.flashAction({ flashType: "success", flashMsg: msg });
    },

    async register() {
      const method = "POST";
      const url = "/register"
      const payload = {
        firstName: this.regFields.firstName,
        lastName: this.regFields.lastName,
        email: this.regFields.email,
        password: this.regFields.password,
        confirmPassword: this.regFields.confirmPassword
      };

      const response = await Axios({
        method: method,
        url: url,
        data: payload
      });

      console.log("register RESPONSE:", response.data);

      const res = response.data;
      const msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        return;
      }

      // Otherwise redirect the user back to the previous page they were on and display a success message.
      this.$router.back();
      this.flashAction({ flashType: "success", flashMsg: msg });
    },

    goBack() {
      this.$router.back();
    },

    forgotPassword() {
      console.log("Forgot Password clicked!");
    }
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #page-container {
    width: 100vw;
    height: 100vh;
    padding: 10px;
    background-image: radial-gradient(
      ellipse at top left,
      lighten($ink-blue, 15%),
      $ink-blue
    );
    color: white;

    .form-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: white;

      #top-container {
        // Create sticky footer
        // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
        flex: 1 0 auto;

        header div {
          display: flex;
          justify-content: space-around;
          padding: 20px 30px 10px 30px;

          button {
            border-bottom: 3px solid transparent;

            &:hover {
              background-color: transparent !important;
              border-bottom: 3px solid #ccc;
            }
            &.active-tab {
              background-color: transparent !important;
              border-bottom: 3px solid $ink-blue;
            }
          }
        }

        #body {
          padding: 20px 30px;

          form {
            input {
              margin-bottom: 20px;
              background-color: #eee;
            }

            button {
              width: 100%;
              padding: 14px;
              background-image: radial-gradient(
                ellipse at top left,
                lighten($ink-blue, 15%),
                $ink-blue
              );
            }
          }

          #tip {
            margin: 30px 0;
            text-align: center;

            .bold {
              font-weight: bold;
            }
          }
        }
      }

      footer {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid #ccc;
        padding: 20px;
        background-color: #eee;
      }
    }
  }
}


@media $m-up {
  .form-container {
    position: relative;
    top: 40px;
    margin-right: auto;
    margin-left: auto;
    width: 50%;
    height: auto !important;

    header div {
      padding: 60px 60px 10px 60px !important;
    }

    #body {
      padding: 20px 60px !important;
    }
  }
}


@media $l-up {
  .form-container {
    width: 30%;
  }
}
</style>
