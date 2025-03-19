<script setup lang="ts">

defineProps<{
  type: 'button'| 'submit' | 'reset',
  className?: string,
  label:string,
}>();
</script>

<template>
  <button :type="type || 'button'" :class="`btn flex justify-center grow ${className}`">
    {{ label }}
  </button>
</template>

<style scoped lang="scss">

</style>