<template>
  <div>
    <h1 v-if="$route.name === 'add-page'">Add a page</h1>
    <h1 v-if="$route.name === 'edit-page'">Edit page</h1>

    <br>

    <router-link :to="{ name: 'pages-list' }" exact>
      <button class="btn-primary">
        <span class="bold">&lsaquo;</span> Back to all pages
      </button>
    </router-link>

    <br><br><br>

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
        v-if="$route.name === 'add-page'"
        @click="submitPageData('add')"
        class="btn-primary"
      >
        Submit <span class="bold">&rsaquo;</span>
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

  computed: {
    getEditorApiKey() {
      return this.$editorApiKey;
    },

    getEditorOptions() {
      return this.$editorOptions;
    }
  },

  methods: {
    async submitPageData(type) {
      let method;
      let url;

      if (type === "add") {
        method = "POST";
        url = "/admin-pages/add-page";
      }
      if (type === "edit") {
        method = "PUT";
        url = "/admin-pages/edit-page";
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

      console.log("RESPONSE:", response.data);

      if (response.data.error) {
        // Call flashAction with error message.
        const msg = response.data.error.output.payload.message;
      }
      else {
        // Call flashAction with success message.
        this.$router.push({ name: "pages-list" });
      }
    },
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
