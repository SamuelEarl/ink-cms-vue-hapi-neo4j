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
            <th>Title</th>
            <th class="center">Edit Page</th>
            <th class="center">Delete Page</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(page, index) in pages" :key="page.id">
            <td>{{ page.title | capitalize }}</td>
            <td class="center">
              <router-link :to="{ name: 'edit-page', params: {
                pageId: page.id
              }}" exact>
                <button><font-awesome-icon icon="edit" /></button>
              </router-link>
            </td>
            <td v-if="page.title === 'home'" class="center"></td>
            <td v-else class="center">
              <button v-on:click="deletePage(page.id, index, page.title)">
                <font-awesome-icon icon="times-circle" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "Pages",
  components: {},

  data() {
    return {
      pages: [
        {
          id: 0,
          title: "home"
        },
        {
          id: 1,
          title: "About"
        },
        {
          id: 2,
          title: "contact"
        },
        {
          id: 3,
          title: "news"
        }
      ]
    }
  },

  methods: {
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
    }
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
