<template>
  <button
    type="submit"
    class="text-center font-bold  border-2 w-max rounded-lg "
    @click="$emit('button-click')"
  >
    {{ text }}
  </button>
</template>
<script>
export default {
  props: {
    text: String,
  },
};
</script>
<style lang=""></style>
