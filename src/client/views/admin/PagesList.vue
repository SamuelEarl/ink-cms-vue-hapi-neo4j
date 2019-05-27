<template>
  <div>
    <h1>Pages</h1>

    <br>

    <router-link :to="{ name: 'add-page' }" exact>
      <button class="btn-primary">Add a new page</button>
    </router-link>

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
          v-model="pages"
          handle=".btn-sort"
          v-bind="dragOptions"
          @end="onEnd"
          tag="tbody"
        >
          <tr v-for="(page, index) in pages" :key="page.id">
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
                  pageId: page.id
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
import { mapGetters } from "vuex";
import Draggable from "vuedraggable";

export default {
  name: "Pages",
  components: {
    Draggable
  },

  data() {
    return {
      pages: []
    }
  },

  computed: {
    ...mapGetters({
      getPages: "pages/getPages",
    }),

    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },

  watch: {
    getPages() {
      this.populatePages();
    }
  },

  created() {
    this.populatePages();
  },

  methods: {
    populatePages() {
      this.pages = this.getPages;
    },

    async deletePage(id, index, title) {
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

    // onEnd: debounce(async function(event) {
    //   // To see which Draggable properties are available on the event object, look at
    //   // https://github.com/SortableJS/Sortable#options under the "onEnd" method.

    //   console.log("Pages have been reordered!");
    //   // this.reorderPages();
    // }, 3000),
    async onEnd(event) {
      // To see which Draggable properties are available on the event object, look at
      // https://github.com/SortableJS/Sortable#options under the "onEnd" method.

      console.log("Pages have been reordered!");
      // this.reorderPages();
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
