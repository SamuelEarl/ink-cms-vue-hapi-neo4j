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
    };
  },
};
</script>


<style lang="stylus" scoped>
@media $s-up {
  .spinner {
    position: absolute;
    border: 3px solid white;
    border-top: 3px solid gray;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

@media $l-up {

}
</style>
