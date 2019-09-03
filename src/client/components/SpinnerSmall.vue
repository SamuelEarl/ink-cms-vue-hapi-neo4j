<template>
  <div class="spinner"></div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Spinner",

  data() {
    return {
      // properties...
    }
  },
};
</script>


<style lang="stylus" scoped>
@media $s-up {
  .spinner {
    border: 6px solid lightgray;
    border-top: 6px solid $ink-blue;
    border-radius: 50%;
    // width and height should each equal the total height of the class="btn-primary" buttons.
    width: 46px;
    height: 46px;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

@media $l-up {

}
</style>
