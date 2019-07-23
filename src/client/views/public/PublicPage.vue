<template>
  <div id="page">
    {{ content }}
  </div>
</template>

<script>
// @ is an alias to /src
import * as Axios from "axios";

export default {
  name: "page",
  components: {},

  data() {
    return {
      slug: this.$route.params.slug,
      content: "Default Page Content"
    }
  },

  /**
   * When the page is created, retrieve its data from Neo4j
   */
  async created() {
    const url = `/public-pages/get-page/${this.slug}`;
    const response = await Axios.get(url);
    if (response.data.content) {
      this.content = response.data.content;
    }
  }
}
</script>
