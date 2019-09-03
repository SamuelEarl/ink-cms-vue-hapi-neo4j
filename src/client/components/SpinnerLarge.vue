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
    border: 10px solid #474747;
    border-top: 10px solid lightgray;
    border-radius: 50%;
    width: 75px;
    height: 75px;
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
