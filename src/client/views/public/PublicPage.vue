<template>
  <div id="page">
    <div v-html="content"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as Axios from "axios";

export default {
  name: "PublicPage",
  components: {},

  data() {
    return {
      content: "Default Page Content"
    }
  },

  /**
   * When the page is created, retrieve its data from Neo4j
   */
  created() {
    this.loadPageContent();
  },

  watch: {
    // When the route changes, call the "loadPageContent" method.
    $route() {
      this.loadPageContent();
    }
  },

  methods: {
    async loadPageContent() {
      const slug = this.$route.params.slug;
      const url = `/public-pages/get-page/${slug}`;
      const response = await Axios.get(url);
      console.log("RESPONSE:", response.data.pageData);
      if (response.data.pageData) {
        this.content = response.data.pageData.content;
      }
    }
  }
}
</script>
