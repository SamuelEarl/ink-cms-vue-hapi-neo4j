<template>
  <div v-if="getFlashMessages">
    <ul id="msg-list">
      <li
        v-for="(msg, index) in flashMessages" :key="index"
        class="flash-msg"
        :class="msg.flashType === 'success' ? 'success' : 'error'"
      >
        {{ msg.flashMsg }}
        <button
          @click="removeFlashMsg(index)"
          class="remove-flash-msg"
        >
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "FlashMessages",
  data() {
    return {
      flashMessages: [],
    };
  },

  computed: {
    ...mapGetters({
      getFlashMessages: "userFeedback/getFlashMessages",
    }),
  },

  watch: {
    getFlashMessages(currentMessages, previousMessages) {
      this.flashMessages = currentMessages;
    }
  },

  methods: {
    ...mapActions({
      removeFlashMsgAction: "userFeedback/removeFlashMsgAction"
    }),

    removeFlashMsg(index) {
      this.removeFlashMsgAction(index);
    },
  },
}
</script>

<style scoped lang="stylus">
@media $s-up {
  #msg-list {
    list-style-type: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }

  .flash-msg {
    margin: 5px 7px 0 7px;
    padding: 15px 10px 15px 20px;
    border-radius: 10px;
    color: white;
  }

  .success {
    background-color: $green;
  }

  .error {
    background-color: $red;
  }

  .remove-flash-msg {
    float: right;
    margin-top: -8px;
    padding: 3px 7px;
    font-size: 1.5rem;
    font-weight: bold;
    background: transparent;
    color: white;
  }
}


@media $m-up {

}


@media $l-up {

}
</style>
