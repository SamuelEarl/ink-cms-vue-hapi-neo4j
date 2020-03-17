<template>
  <div id="page">
    <h1>{{ title }}</h1>
    <div v-html="content"></div>
  </div>
</template>

<script>
// @ is an alias to /src
import * as Axios from "axios";
import { mapActions } from "vuex";

export default {
  name: "ContentPage",
  components: {},

  data() {
    return {
      title: "",
      content: "You are seeing this message because you have not created any pages yet. <br> Please sign into the Admin area and create some pages."
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
    // To improve performance, Vue will try to re-use components when it can. If a component can be reused, then the browser won't have to reload all the HTML, CSS, JavaScript, etc. that is required to load a page. So when a user navigates to a new page that uses the same component as the previous page they were on, you have to do something to tell the browser to request and load the data for that page.
    // In this case, when a user navigates to a new page that also uses this "ContentPage" component, then Vue will not reload the component, which means that the new page's data will also not be loaded in the browser. When a user navigates to a new page the route will change in the URL, but nothing else will and it will appear as if the app is broken.
    // This watch property will watch the $route and if the route changes, then the "loadPageContent" method will be called, which will load the content for the new page.
    $route() {
      this.loadPageContent();
    }
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
    }),

    async loadPageContent() {
      let url;
      // All the "public-page" routes are defined as "/:slug" (e.g., "/about-us").
      // However, the home route is defined simply as "/", which does not allow for a slug. So we
      // can run the following conditional checks to see which path the user is trying to navigate
      // to. If they are going to the home route, then the "sortPosition" will be set to 0 and sent
      // to the API endpoint in hapi. But for any other "public-page" route, the "sortPosition" will
      // be set to null (because the sortPosition is not needed to retrieve the page's data) and the
      // "slug" will be set to the route's slug value.
      // We can use the same URL for either page request ("home" or some other "public-page" request)
      // because the "slug" parameter in the "/pages-public/get-page/{sortPosition}/{slug}" endpoint is optional.
      if (this.$route.name === "home") {
        url = "/pages-public/get-page/0";
      }
      else {
        const slug = this.$route.params.slug;
        url = `/pages-public/get-page/null/${slug}`;
      }
      const response = await Axios.get(url);

      const res = response.data;
      const msg = res.flash;

      // If there is an error, then display the error message.
      if (res.error) {
        this.flashAction({ flashType: "error", flashMsg: msg });
        return;
      }

      if (res.pageData) {
        this.title = res.pageData.title;
        this.content = res.pageData.content;
      }
    }
  }
}
</script>
