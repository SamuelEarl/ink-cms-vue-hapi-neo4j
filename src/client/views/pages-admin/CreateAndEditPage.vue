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

    <form @submit.prevent>
      <label><strong>Title</strong></label>
      <div v-if="$v.$dirty" class="validation-messages">
        <div v-if="!$v.title.required" class="error">Title is required</div>
      </div>
      <input type="text" class="w3-input input" name="title" v-model="title">

      <br><br>

      <label>
        <strong>Slug</strong>&nbsp;<em>(Optional)</em>
        <span class="w3-tooltip tooltip-icon">i
          <span class="w3-text w3-tag tooltip-text">The slug is a unique ID for the page. If this field is left blank, then the slug will be auto-generated based on the page title.</span>
        </span>
      </label>
      <input type="text" class="w3-input input" name="slug" v-model="slug">

      <br><br>

      <label><strong>Content</strong></label>
      <div v-if="$v.$dirty" class="validation-messages">
        <div v-if="!$v.content.required" class="error">Content is required</div>
      </div>
      <Editor
        v-model="content"
        :api-key="getEditorApiKey"
        :init="getEditorOptions"
      />

      <br><br>

      <!-- If this is the "create-page" route, then show the "Create Page" button -->
      <button
        v-if="$route.name === 'create-page'"
        @click="submitPageData('create')"
        class="btn-primary full-width"
      >
        <SpinnerSmall v-if="showSpinner" />
        Create Page <span class="bold">&rsaquo;</span>
      </button>
      <!-- If this is the "edit-page" route, then show the "Update Page" button -->
      <button
        v-if="$route.name === 'edit-page'"
        @click="submitPageData('edit')"
        class="btn-primary full-width"
      >
        <SpinnerSmall v-if="showSpinner" />
        Update Page <span class="bold">&rsaquo;</span>
      </button>

    </form>
  </div>
</template>

<script>
// TinyMCE Vue docs: https://github.com/tinymce/tinymce-vue
import Editor from "@tinymce/tinymce-vue";
import * as Axios from "axios";
import { mapActions, mapGetters } from "vuex";
import { required } from "vuelidate/lib/validators";
import SpinnerSmall from "@/client/components/SpinnerSmall.vue";

export default {
  name: "Page",
  components: {
    Editor,
    SpinnerSmall
  },

  data() {
    return {
      title: "",
      slug: "",
      content: "",
      sortPosition: this.$route.params.sortPosition
    }
  },

  validations: {
    title: {
      required
    },
    slug: {
      // nothing to validate
    },
    content: {
      required
    }
  },

  created() {
    if (this.$route.name === "edit-page") {
      this.getPageData();
    }
  },

  computed: {
    ...mapGetters({
      showSpinner: "userFeedback/getShowSpinner",
    }),

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
      showSpinnerAction: "userFeedback/showSpinnerAction",
    }),

    async submitPageData(type) {
      this.$v.$touch();

      try {
        // If the form is valid, then show the spinner and send the AJAX call.
        if (!this.$v.$invalid) {

          let method;
          let url;
          let payload;
          const pageId = this.$route.params.pageId;

          if (type === "create") {
            method = "POST";
            url = "/pages-admin/create-page";
            payload = {
              title: this.title,
              slug: this.slug,
              content: this.content,
              sortPosition: this.sortPosition
            };
          }
          if (type === "edit") {
            method = "PUT";
            url = `/pages-admin/edit-page/${pageId}`;
            payload = {
              title: this.title,
              slug: this.slug,
              content: this.content,
            };
          }

          this.showSpinnerAction(true);

          const response = await Axios({
            method: method,
            url: url,
            data: payload
          });

          const res = response.data;
          const msg = res.flash;

          this.showSpinnerAction(false);

          // If there is an error, then display the error message.
          if (res.error) {
            this.flashAction({ flashType: "error", flashMsg: msg });
            return;
          }

          // Otherwise redirect the user back to the "pages-list" page and display a success message.
          this.$router.push({ name: "pages-list" });
          this.flashAction({ flashType: "success", flashMsg: msg });
        }
      }
      catch(e) {
        console.error("submitPageData Error:", e);
        this.flashAction({ flashType: "error", flashMsg: e });
      }
    },

    async getPageData() {
      const pageId = this.$route.params.pageId;
      const method = "GET";
      const url = `/pages-admin/edit-page/${pageId}`;

      const response = await Axios({
        method: method,
        url: url
      });

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
  .tooltip-icon {
    margin-left: 5px;
    padding: 1px 5px;
    border-radius: 20px;
    background-color: $ink-blue;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    font-family: mono;
    cursor: help;

    .tooltip-text {
      position: absolute;
      width: 200px;
      padding: 8px;
      left: 20px;
      bottom: 0px;
      font-size: 0.9rem;
      font-weight: normal;
      font-family: sans-serif;
      background-color: $ink-blue;
    }
  }

  .error {
    padding: 5px;
    color: white;
    background-color: $red;
  }
}
</style>
