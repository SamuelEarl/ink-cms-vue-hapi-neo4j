<template>
  <div>
    <h1>Pages</h1>

    <br>

    <!-- <router-link :to="{ name: 'add-page' }" exact> -->
      <button
        @click="addPage"
        class="btn-primary"
      >
        Add a new page <span class="bold">&rsaquo;</span>
      </button>
    <!-- </router-link> -->

    <br><br><br>

    <div class="w3-responsive">
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
          <tr v-for="(page, index) in pagesList" :key="page.id">
            <td>
              <button class="btn-table btn-sort" title="Drag &amp; Drop">
                <font-awesome-icon icon="sort" />
              </button>
            </td>
            <td>{{ page.title | capitalize }}</td>
            <td class="center">
              <router-link :to="{
                name: 'edit-page',
                params: {
                  pageId: page._id
                }
              }" exact>
                <button class="btn-table">
                  <font-awesome-icon icon="edit" />
                </button>
              </router-link>
            </td>
            <td class="center">
              <button v-on:click="deletePage(page.id, index, page.title)" class="btn-table">
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
        return this.$store.state.pages.pages;
      },
      set(pagesArray) {
        this.$store.commit("pages/setPages", pagesArray);
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
    await this.setPagesAction();
  },

  methods: {
    ...mapActions({
      setPagesAction: "pages/setPagesAction",
      reorderPagesAction: "pages/reorderPagesAction",
    }),

    addPage() {
      // Set the new chapter's sortPosition number to 1 greater than the largest existing sortPosition number.
      let sortPosition = 0;
      for (let i = 0; i < this.pagesList.length; i++) {
        if (this.pagesList[i].sortPosition >= sortPosition) {
          sortPosition = this.pagesList[i].sortPosition + 1;
        }
      }

      this.$router.push({
        name: "add-page",
        params: {
          sortPosition: sortPosition
        }
      });
    },

    async deletePage(id, index, title) {
// I need to rewrite this. I will delete the page on the server first, then use a Vuex action to remove the page in Vuex.
      try {
        if (index > -1) {
          this.pages.splice(index, 1);
        }
        else {
          console.log("Error when deleting the page.");
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
      background-color: navy;
      color: white;
    }
  }

  .center {
    text-align: center !important;
  }
}
</style>
