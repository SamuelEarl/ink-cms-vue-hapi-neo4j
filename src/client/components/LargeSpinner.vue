<template>
  <!-- <div v-if="getShowSpinner" class="spinner-container"> -->
    <div v-if="getShowSpinner" class="spinner"></div>
  <!-- </div> -->
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

  computed: {
    ...mapGetters({
      getShowSpinner: "userFeedback/getShowSpinner"
    })
  },
};
</script>


<style lang="stylus" scoped>
@media $s-up {
  // .spinner-container {
  //   position: absolute;
  //   display: flex;
  //   justify-content: center;
  //   margin: 0 auto;
  //   width: 73.5%;
  //   z-index: 100;

    .spinner {
      border: 16px solid white;
      border-top: 16px solid darkgray;
      border-bottom: 16px solid darkgray;
      border-radius: 50%;
      width: 100px;
      height: 100px;
      animation: spin 2s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  // }
}

@media $l-up {

}
</style>
