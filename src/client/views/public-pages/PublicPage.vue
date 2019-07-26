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
      content: "You are seeing this message because you have not create a home page yet. <br> Please sign into the Admin area and create a custom home page. <br> Feel free to also create any other custom pages you want."
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
    // To improve performance, Vue will try to re-use components when it can. If a component can be reused, then the browser won't have to reload all the HTML, CSS, JavaScript, etc. that is required to load a page. The browser will only have to load the new data that is returned from the server.
    $route() {
      this.loadPageContent();
    }
  },

  methods: {
    async loadPageContent() {
      let url;
      if (this.$route.name === "home") {
        url = "/public-pages/get-page";
      }
      else {
        const slug = this.$route.params.slug;
        url = `/public-pages/get-page/${slug}`;
      }
      const response = await Axios.get(url);
      console.log("GET PAGE RESPONSE:", response.data.pageData);
      if (response.data.pageData) {
        this.content = response.data.pageData.content;
      }
    }
  }
}
</script>
