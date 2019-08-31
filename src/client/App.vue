<template>
  <div>
    <!-- When users navigate around your app, Vue will show components that are associated with the current page and hide the components that are not. The only component in this app that is associated with all pages (and that is shown on all pages) is this App.vue component. So in order to get the flash messages to show up on all the pages that we want them to, we have to include the FlashMessages component inside the only component that is shown on every page. On the other hand, for example, if we included the FlashMessages component in the Layout.vue and AuthLayout.vue components, then when a user logged in (the login component is nested inside the AuthLayout component), the flash messages would display for a split second and then they would be hidden immediately when the user gets redirected to the home page (the home page is nested inside the Layout component). So the flash messages would appear in the AuthLayout component, but then they would be hidden as soon as the AuthLayout component was hidden. -->
    <FlashMessages />
    <router-view />
  </div>
</template>

<script>
import FlashMessages from "@/client/components/FlashMessages.vue";

export default {
  name: "App",
  components: {
    FlashMessages
  }
};
</script>
