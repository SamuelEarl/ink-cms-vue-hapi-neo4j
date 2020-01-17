<template>
  <div>
    <h1>Users</h1>

    <br>

    <table class="w3-table-all w3-hoverable">
      <thead>
        <tr class="table-head">
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Scope</th>
          <th class="center">Edit Scope</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in usersList" v-bind:key="user.userId">
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.scope }}</td>
          <td style="text-align:center;">
            <button class="btn-table" @click="openUserModal(user)">
              <font-awesome-icon icon="edit" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- User Modal -->
    <div v-if="showUserModal" id="user-modal" class="w3-modal">
      <div class="w3-modal-content w3-card-4 w3-animate-top">
        <header class="w3-container user-modal-header">
          <button @click="closeUserModal" id="x-btn">&times;</button>
        </header>
        <div class="w3-container user-modal-body">
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
          <div id="checkbox-container">
            <label for="user">
              <input class="w3-check" type="checkbox" id="user" value="user" v-model="modeledUserScope"> User
            </label>
            <br>
            <label for="admin">
              <input class="w3-check" type="checkbox" id="admin" value="admin" v-model="modeledUserScope"> Admin
            </label>
          </div>
        </div>
        <footer class="user-modal-footer">
          <button @click="updateScope" id="update-scope-btn" class="btn-primary">
            Update Scope
          </button>
          <button @click="closeUserModal" class="btn-secondary">Close</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import * as Axios from "axios";

export default {
  name: "Users",
  components: {},

  data() {
    return {
      usersList: [],
      showUserModal: false,
      // Since we are using a unique session ID for authentication, instead of the user's userId, we
      // can pass the userId here without any security issues. In this case the userId is no more
      // risky to pass around and store in the browser than the email address is.
      selectedUser: {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        scope: []
      },
      modeledUserScope: []
    };
  },

  computed: {
    ...mapGetters({
      // getters
    })
  },

  mounted() {
    this.getUsers();
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
    }),

    async getUsers() {
      const response = await Axios.get("/users/get-all-users");
      const res = response.data;
      this.usersList = res.usersList;
    },

    openUserModal(user) {
      this.selectedUser = user;

      // The checkboxes for the user scope (in the user modal) are bound to the
      // "this.modeledUserScope" property. If they were bound to the "this.selectedUser.scope"
      // property, then the scope values for the selected user in "this.usersList" would change
      // everytime a user toggles one of the checkboxes. That would be very confusing for an admin
      // because the user scope values that are displayed in the UI could get out of sync with the
      // actual user scope values in the database. By assigning "this.modeledUserScope" to equal
      // "this.selectedUser.scope" and setting "v-model='modeledUserScope'" on the checkboxes, it
      // prevents the user scopes from getting out of sync because the user scopes are not changed
      // in the "Users" table (i.e., the user scopes are not changed in "this.usersList", which is
      // the data that is used to create the "Users" table).
      this.modeledUserScope = this.selectedUser.scope;

      this.showUserModal = true;
      // document.getElementById("user-modal").style.display = "block";
    },

    closeUserModal() {
      // It is not strictly necessary to clear these data properties, but it's good practice to
      // clear data values whenever you can.
      this.selectedUser = {
        userId: "",
        firstName: "",
        lastName: "",
        email: "",
        scope: []
      };

      this.modeledUserScope = [];

      // Close user modal
      this.showUserModal = false;
      // document.getElementById("user-modal").style.display = "none";
    },

    async updateScope() {
      const userId = this.selectedUser.userId;
      const firstName = this.selectedUser.firstName;
      const lastName = this.selectedUser.lastName;

      const method = "PUT";
      const url = "/users/update-user-scope";
      const payload = {
        userId: userId,
        updatedScopeArray: this.modeledUserScope
      };

      const confirmation = confirm(`Are you sure you want to change the scope for ${firstName} ${lastName}?`);

      if (confirmation) {
        const response = await Axios({
          method: method,
          url: url,
          data: payload
        });

        const res = response.data;
        const msg = res.flash;

        // If there is an error, then display the error message.
        if (res.error) {
          this.flashAction({ flashType: "error", flashMsg: msg });
          return;
        }

        // You could refresh the entire browser instead of writing the rest of this code, but since
        // we are creating a single-page app, we are going to create a nicer user experience.
        // window.location.reload();

        // Update the user's scope that is displayed in the "Users" table.
        // The array.find() method returns the matching element/object.
        let userObj = this.usersList.find((user) => {
          // Return the user object whose userId equals this.selectedUser.userId (which is the
          // "userId" variable that is defined at the beginning of this method).
          return user.userId === userId;
        })
        // If userObj exists, then update that user's scope.
        if (userObj) {
          userObj.scope = res.userScope;
        }

        this.closeUserModal();

        this.flashAction({ flashType: "success", flashMsg: msg });
      }
    },
  }
}
</script>

<style lang="stylus" scoped>
@media $s-up {
  thead {
    tr, th {
      background-color: $ink-blue;
      color: white;
    }
  }

  .center {
    text-align: center !important;
  }

  #user-modal {
    display: block;

    // User Modal Styles
    .user-modal-header {
      display: flex;
      justify-content: flex-end;

      #x-btn {
        padding: 10px;
        font-size: 2rem;
      }
    }

    .user-modal-body {
      padding: 0 40px 40px 40px;

      label, input[type="checkbox"] {
        cursor: pointer;
      }
    }

    .user-modal-footer {
      display: flex;
      justify-content: flex-end;
      padding: 20px;
      background-color: $medium-gray;

      button {
        margin: 0 10px;
      }
    }
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
