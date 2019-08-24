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
  // }
}

@media $l-up {

}
</style>
