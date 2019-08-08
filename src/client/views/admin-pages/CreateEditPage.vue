<template>
  <div>
    <h1 v-if="$route.name === 'create-page'">Create a page</h1>
    <h1 v-if="$route.name === 'edit-page'">Edit page</h1>

    <br>

    <router-link :to="{ name: 'pages-list' }" exact>
      <button class="btn-primary">
        <span class="bold">&lsaquo;</span> Back to all pages
      </button>
    </router-link>

    <br><br><br>

    <p>
      <em>
        NOTE: To create a home page, give one of your pages the slug "home".
      </em>
    </p>

    <br>

    <form @submit.prevent>
      <label><b>Title</b></label>
      <input type="text" class="w3-input" name="title" v-model="title">

      <br><br>

      <label><b>Slug</b></label>
      <input type="text" class="w3-input" name="slug" v-model="slug">

      <br><br>

      <label><b>Content</b></label>
      <Editor
        v-model="content"
        :api-key="getEditorApiKey"
        :init="getEditorOptions"
      />

      <br><br>

      <button
        v-if="$route.name === 'create-page'"
        @click="submitPageData('create')"
        class="btn-primary"
      >
        Create Page <span class="bold">&rsaquo;</span>
      </button>
      <button
        v-if="$route.name === 'edit-page'"
        @click="submitPageData('edit')"
        class="btn-primary"
      >
        Update Page <span class="bold">&rsaquo;</span>
      </button>
    </form>
  </div>
</template>

<script>
// TinyMCE Vue docs: https://github.com/tinymce/tinymce-vue
import Editor from "@tinymce/tinymce-vue";
import * as Axios from "axios";
import { mapActions } from "vuex";

export default {
  name: "Page",
  components: {
    Editor
  },

  data() {
    return {
      title: "",
      slug: "",
      content: "",
      sortPosition: this.$route.params.sortPosition
    }
  },

  created() {
    if (this.$route.name === "edit-page") {
      this.getPageData();
    }
  },

  computed: {
    getEditorApiKey() {
      return this.$editorApiKey;
    },

    getEditorOptions() {
      return this.$editorOptions;
    }
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
    }),

    async submitPageData(type) {
      try {
        let method;
        let url;
        const pageId = this.$route.params.pageId;

        if (type === "create") {
          method = "POST";
          url = "/admin-pages/create-page";
        }
        if (type === "edit") {
          method = "PUT";
          url = `/admin-pages/edit-page/${pageId}`;
        }

        const payload = {
          title: this.title,
          slug: this.slug,
          content: this.content,
          sortPosition: this.sortPosition
        };

        const response = await Axios({
          method: method,
          url: url,
          data: payload
        });

        console.log("submitPageData RESPONSE:", response.data);

        const res = response.data;
        const msg = res.flash;

        // If there is an error, then display the error message.
        if (res.error) {
          this.flashAction({ flashType: "error", flashMsg: msg });
          return;
        }
        // Otherwise redirect the user back to the "pages-list" page and display a success message.
        else {
          this.$router.push({ name: "pages-list" });
          this.flashAction({ flashType: "success", flashMsg: msg });
        }
      }
      catch(e) {
        console.error("submitPageData Error:", e);
      }
    },

    async getPageData() {
      const pageId = this.$route.params.pageId;
      const method = "GET";
      const url = `/admin-pages/edit-page/${pageId}`;

      const response = await Axios({
        method: method,
        url: url
      });

      console.log("getPageData RESPONSE:", response);

      const res = response.data;
      const msg = res.flash;

      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        return;
      }

      if (res.pageData) {
        const pageData = res.pageData;
        this.title = pageData.title;
        this.slug = pageData.slug;
        this.content = pageData.content;
      }
    }
  }
}
</script>

<style scoped lang="stylus">
@media $s-up {
  input {
    background-color: #eee;
  }
}
</style>
