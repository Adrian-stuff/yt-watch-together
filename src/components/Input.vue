<template>
  <input
    type="text"
    class="border-2 rounded p-2"
    :value="value"
    @input="$emit('update:value', $event.target.value)"
    :placeholder="placeholder"
  />
</template>
<script>
export default {
  props: {
    value: String,
    placeholder: String,
  },
};
</script>
