<template>
  <div class="spinner"></div>
</template>

<script>
export default {
  name: "SpinnerSmall"
};
</script>


<style lang="stylus" scoped>
@media $s-up {
  .spinner {
    display: inline-block;
    margin: -3px 7px -5px 0;
    border: 3px solid white;
    border-top: 3px solid gray;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}
</style>
