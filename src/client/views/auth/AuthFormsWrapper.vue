<template>
  <div id="auth-form-wrapper">

    <div class="form-container">

      <div class="form-top">
        <header class="form-header">
          <h3><slot name="form-title"></slot></h3>
          <p><slot name="form-instructions"></slot></p>
        </header>

        <div class="form-body">
          <slot name="form"></slot>
          <slot name="security-tip"></slot>
        </div>
      </div>

      <footer class="form-bottom form-footer">
        <ul v-if="$route.name !== 'reset-password'">
          <li v-if="$route.name !== 'login'">
            <router-link :to="{ name: 'login' }" exact>Login to your account</router-link>
          </li>
          <li v-if="$route.name !== 'register'">
            <router-link :to="{ name: 'register' }" exact>Register for an account</router-link>
          </li>
          <li v-if="$route.name !== 'forgot-password'">
            <router-link :to="{ name: 'forgot-password' }" exact>Forgot your password?</router-link>
          </li>
          <li v-if="$route.name !== 'send-email-verification'">
            <router-link :to="{ name: 'send-email-verification' }" exact>Need to verify your email?</router-link>
          </li>
        </ul>
      </footer>

    </div>

  </div>
</template>

<script>
export default {
  name: "AuthFormsWrapper"
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #auth-form-wrapper {

    .form-container {
      display: flex;
      flex-direction: column;
      background-color: white;

      .form-top {
        padding: 30px;
        // You can make the form-bottom element stay at the bottom by creating a sticky footer:
        // https://css-tricks.com/couple-takes-sticky-footer/#article-header-id-3
        flex: 1 0 auto;

        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-body {

          .auth-form {
            input {
              background-color: $light-gray;
            }

            .error {
              padding: 5px;
              color: white;
              background-color: darkred;
              position: absolute;
            }
          }

          .security-tip {
            margin-top: 30px;
            text-align: center;

            .bold {
              font-weight: bold;
            }
          }
        }
      }

      .form-footer {
        border-top: 1px solid $medium-gray;
        padding: 20px;
        text-align: center;
        background-color: $light-gray;

        ul {
          list-style-type: none;

          a {
            display: inline-block;
            text-decoration: none;
            padding: 7px !important;
          }
        }
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

    .form-top {
      padding: 30px 50px !important;
    }
  }
}


@media $l-up {

}
</style>
