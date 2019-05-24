<template>
  <div>
    <h1 v-if="$route.name === 'add-page'">Add a page</h1>
    <h1 v-if="$route.name === 'edit-page'">Edit page</h1>

    <br>

    <router-link :to="{ name: 'admin-pages' }" exact>
      <button class="btn-primary">
        Back to all pages
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

      <button @click="submitPageData" class="btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
// TinyMCE Vue docs: https://github.com/tinymce/tinymce-vue
import Editor from "@tinymce/tinymce-vue";

export default {
  name: "EditPage",
  components: {
    Editor
  },

  data() {
    return {
      title: "",
      slug: "",
      content: ""
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
    submitPageData() {
      console.log("PAGE DATA:", "TITLE:", this.title, "SLUG:", this.slug, "CONTENT:", this.content);
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
