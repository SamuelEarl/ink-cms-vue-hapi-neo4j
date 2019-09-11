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
      <div v-if="$v.$dirty" class="validation-messages">
        <div v-if="!$v.title.required" class="error">Title is required</div>
      </div>
      <input type="text" class="w3-input input" name="title" v-model="title">

      <br><br>

      <label><b>Slug</b></label>
      <input type="text" class="w3-input input" name="slug" v-model="slug">

      <br><br>

      <label><b>Content</b></label>
      <div v-if="$v.$dirty" class="validation-messages">
        <div v-if="!$v.content.required" class="error">Content is required</div>
      </div>
      <Editor
        v-model="content"
        :api-key="getEditorApiKey"
        :init="getEditorOptions"
      />

      <!-- If this v-if check is not here along with the matching one below, then the "Content" label will get two <br> spaces under it and the spinner will be touching the bottom of the "Content" input box. -->
      <div v-if="!showSpinner">
        <br><br>
      </div>

      <button
        v-if="$route.name === 'create-page' && !showSpinner"
        @click="submitPageData('create')"
        class="btn-primary full-width"
      >
        Create Page <span class="bold">&rsaquo;</span>
      </button>
      <button
        v-if="$route.name === 'edit-page' && !showSpinner"
        @click="submitPageData('edit')"
        class="btn-primary full-width"
      >
        Update Page <span class="bold">&rsaquo;</span>
      </button>

      <!-- If this v-if check is not here along with the matching one above, then the "Content" label will get two <br> spaces under it and the spinner will be touching the bottom of the "Content" input box. -->
      <div v-if="showSpinner">
        <br><br>
      </div>

      <SpinnerSmall v-if="showSpinner" />
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
          console.log("submitPageData RESPONSE:", res);
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

<style lang="stylus">
  .mce-content-body {
    background-color: #eee !important;
  }
</style>

<style scoped lang="stylus">
@media $s-up {
  .error {
    padding: 5px;
    color: white;
    background-color: $red;
  }
}
</style>
