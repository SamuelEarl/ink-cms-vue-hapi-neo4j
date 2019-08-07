<template>
  <div>
    <h1>Pages</h1>

    <br>

    <!-- <router-link :to="{ name: 'create-page' }" exact> -->
      <button
        @click="createPage"
        class="btn-primary"
      >
        Create a new page <span class="bold">&rsaquo;</span>
      </button>
    <!-- </router-link> -->

    <br><br><br>

    <p v-if="pagesList.length > 0">
      <em>
        NOTE: To create a home page, give one of your pages the slug "home".
      </em>
    </p>

    <br>

    <p v-if="pagesList.length === 0">
      <em>
        You have not created any pages
      </em>
    </p>

    <div v-else class="w3-responsive">
      <table class="w3-table-all w3-hoverable">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th class="center">Edit Page</th>
            <th class="center">Delete Page</th>
          </tr>
        </thead>
        <Draggable
          v-model="pagesList"
          handle=".btn-sort"
          v-bind="dragOptions"
          @end="onEnd"
          tag="tbody"
        >
          <tr v-for="(page, index) in pagesList" :key="page.pageId">
            <td>
              <button class="btn-table btn-sort" title="Drag &amp; Drop">
                <font-awesome-icon icon="sort" />
              </button>
            </td>
            <td>{{ page.title | capitalize }}</td>
            <td class="center">
              <router-link
                :to="{
                  name: 'edit-page',
                  params: {
                    pageId: page.pageId
                  }
                }"
                exact
              >
                <button class="btn-table">
                  <font-awesome-icon icon="edit" />
                </button>
              </router-link>
            </td>
            <td class="center">
              <button v-on:click="deletePage(page.pageId, index, page.title)" class="btn-table">
                <font-awesome-icon icon="times-circle" />
              </button>
            </td>
          </tr>
        </Draggable>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Draggable from "vuedraggable";
import * as Axios from "axios";

export default {
  name: "Pages",
  components: {
    Draggable
  },

  data() {
    return {
      // pages: []
    }
  },

  computed: {
    ...mapGetters({
      //
    }),

    pagesList: {
      get() {
        return this.$store.state.pages.pagesList;
      },
      set(pagesArray) {
        this.$store.commit("pages/setPagesList", pagesArray);
      }
    },

    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },

  /**
   * To understand what is going on in this component, see the comment above the "created" hook
   * in the "Header.vue" component file.
   */
  async created() {
    await this.setPagesListAction();
  },

  methods: {
    ...mapActions({
      setPagesListAction: "pages/setPagesListAction",
      removePageAction: "pages/removePageAction",
      reorderPagesAction: "pages/reorderPagesAction",
    }),

    createPage() {
      // Set the new chapter's sortPosition number to 1 greater than the largest existing sortPosition number.
      let sortPosition = 0;
      for (let i = 0; i < this.pagesList.length; i++) {
        if (this.pagesList[i].sortPosition >= sortPosition) {
          sortPosition = this.pagesList[i].sortPosition + 1;
        }
      }

      this.$router.push({
        name: "create-page",
        params: {
          sortPosition: sortPosition
        }
      });
    },

    async deletePage(pageId, index, title) {
      let flash;

      // Delete the page on the server first, then use a Vuex action to remove the page in Vuex.
      try {
        const confirm = window.confirm(`Are you sure you want to delete the "${title}" page?`);
        if (confirm) {
          const method = "DELETE";
          const url = `/admin-pages/delete-page`;
          const payload = {
            pageId: pageId,
            title: title
          };

          const response = await Axios({
            method: method,
            url: url,
            data: payload
          });

          console.log("RESPONSE:", response.data);

          // If there is an error, then display the error message.
          if (response.data.error) {
            flash = response.data.flash;
            console.log("Remove Page Error:", flash);
            // this.flashAction({ type: "alert", msg: flash });
          }
          // Otherwise use a Vuex action to remove the page in Vuex and display a success message.
          else {
            if (index > -1) {
              this.removePageAction(index, 1);
              flash = response.data.flash;
              // this.flashAction({ type: "success", msg: flash });
              console.log("Remove Page Message:", flash);
            }
            else {
              flash = "UI error while deleting the page.";
              // this.flashAction({ type: "alert", msg: flash });
            }
          }
        }
      }
      catch(err) {
        console.log(err);
      }
    },

    async onEnd(event) {
      // To see which Draggable properties are available on the event object, look at
      // https://github.com/SortableJS/Sortable#options under the "onEnd" method.

      console.log("Pages have been reordered!");
      this.reorderPagesAction();
    },
  }
}
</script>

<style scoped lang="stylus">
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
}
</style>
