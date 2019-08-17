<template>
  <div>
    <h1>Users</h1>

    <br>

    <table class="w3-table-all w3-hoverable">
      <thead>
        <tr class="table-head">
          <!-- <th>User ID</th> -->
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Scope</th>
          <th style="text-align:center;">Edit Scope</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in usersList" v-bind:key="user.userId">
          <!-- <td>{{ user.userId }}</td> -->
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.scope }}</td>
          <td style="text-align:center;">
            <button class="table-btn" v-on:click="openEditScopeModal(user)">
              <font-awesome-icon icon="pencil-alt" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- User Edit Modal -->
    <div id="user-edit-modal" class="w3-modal">
      <div class="w3-modal-content w3-card-4 w3-animate-top">
        <header class="w3-container user-modal-header">
          <span class="w3-button w3-xlarge w3-display-topright" v-on:click="closeEditUserModal">&times;</span>
        </header>
        <div class="w3-container user-modal-body">
          <p><img v-bind:src="selectedUser.avatar" /></p>
          <table class="w3-table w3-bordered">
            <tbody>
              <tr>
                <td>User ID:</td><td><strong>{{ selectedUser.userId }}</strong></td>
              </tr>
              <tr>
                <td>First Name:</td><td><strong>{{ selectedUser.firstName }}</strong></td>
              </tr>
              <tr>
                <td>Last Name:</td><td><strong>{{ selectedUser.lastName }}</strong></td>
              </tr>
              <tr>
                <td>Email:</td><td><strong>{{ selectedUser.email }}</strong></td>
              </tr>
            </tbody>
          </table>
          <br>
          <div>
            <div class="w3-left">
              <label for="user">
                <input class="w3-check" type="checkbox" id="user" value="user" v-model="selectedUser.scope"> User
              </label>
              <br>
              <label for="admin">
                <input class="w3-check" type="checkbox" id="admin" value="admin" v-model="selectedUser.scope"> Admin
              </label>
            </div>
            <div class="w3-center">
              <button id="save-scope-btn" v-on:click="saveScope">SAVE SCOPE</button>
            </div>
          </div>
        </div>
        <footer class="w3-container w3-padding user-modal-footer">
          <div class="w3-left">
          </div>
          <div class="w3-right">
            <button class="w3-border" v-on:click="closeEditUserModal">CLOSE</button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import * as Axios from "axios";
// import Header from "../layouts/Header.vue";

export default {
  name: "Users",
  components: {
    // Header
  },

  data() {
    return {
      usersList: [],
      selectedUser: {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        avatar: "",
        scope: []
      }
    }
  },

  computed: {
    ...mapGetters({
      isAuthenticated: "auth/getIsAuthenticated"
    })
  },

  // async mounted() {
  //   this.retrieveUsers();
  // },

  methods: {
    ...mapActions({
      uxFeedbackAction: "uxFeedback/uxFeedbackAction"
    }),

    async retrieveUsers() {
      const response = await Axios.get("/users/retrieve-all-users");
      const usersArray = response.data;
      this.usersList = usersArray;
    },

    openEditScopeModal(user) {
      this.selectedUser = user;
      document.getElementById("user-edit-modal").style.display = "block";
    },

    closeEditUserModal(user) {
      const confirmation = confirm("Close without saving scope?");
      if (confirmation) {
        this.selectedUser = {
          userId: "",
          firstName: "",
          lastName: "",
          email: "",
          avatar: "",
          scope: []
        };
        document.getElementById("user-edit-modal").style.display = "none";
        window.location.reload();
      }
    },

    async saveScope() {
      // If the user is not signed in, then display the sign-in modal along with the default message telling them to sign in before the confirmation dialog box is displayed.
      if (!this.isAuthenticated) {
        this.uxFeedbackAction({ displayModal: true, message: "default" });
        return; // return here so no other code gets executed and displays things that would be confusing to the user
      }

      const sessionId = sessionStorage.getItem("session_id");
      const userId = this.selectedUser.userId;
      const firstName = this.selectedUser.firstName;
      const lastName = this.selectedUser.lastName;

      const method = "PUT";
      const url = "/users/save-user-scope";
      const payload = {
        sessionId: sessionId,
        userId: userId,
        updatedScopeArray: this.selectedUser.scope
      };

      const confirmation = confirm(`Are you sure you want to change scope for ${firstName} ${lastName}?`);

      if (confirmation) {
        const response = await Axios({
          method: method,
          url: url,
          data: payload
        });

        window.location.reload();
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
@media $xs-up {
  // User Edit Modal Styles
  #user-edit-modal {

    .w3-modal-content {

      .user-modal-header {
        margin-bottom: 20px;
      }

      .user-modal-body {

        #save-scope-btn {
          margin-top: 10px;
          padding: 10px;
          background-color: $tremain-blue;
          color: white;
          &:hover {
            color: $soft-gold;
            text-shadow: 0 0 2px;
          }
        }
      }

      .user-modal-footer {
        margin-top: 20px;

        button {
          border: 1px solid transparent !important;
          background-color: transparent;
          color: $dark-gray;
        }
      }
    }
  }
}


@media $m-up {

}


@media $xl-up {

}
</style>
