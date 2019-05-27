<template>
  <div>
    <div id="flash">{{ flashMsg }}</div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Flash",
  data() {
    return {
      flashMsg: null
    };
  },

  computed: {
    ...mapGetters({
      getFlash: "userFeedback/getFlash",
    }),
  },

  mounted() {
    this.displayFlashMsg(this.getFlash);
  },

  methods: {
    ...mapActions({
      flashAction: "userFeedback/flashAction",
    }),

    displayFlashMsg(flash) {
      if (flash.type === "success") {
        // Success: forest green
        document.getElementById("flash").style.backgroundColor = "rgb(34, 139, 34)";
      }
      if (flash.type === "error") {
        // Error: strong red
        document.getElementById("flash").style.backgroundColor = "rgb(196, 0, 0)";
      }

      if (flash.msg) {
        // Set the flash message that will be displayed:
        this.flashMsg = flash.msg;

        // Remove the flash message after a given amount of time:
        const vm = this;
        setTimeout(function() {
          vm.flashAction({ type: null, msg: null });
        }, 5000);
      }
    },
  },
}
</script>

<style scoped lang="stylus">
@media $xs-up {
  #flash {
    margin: -10px -35px 0 -30px;
    padding: 15px 30px;
    z-index: 1000;
    color: white;
  }
}
</style>
