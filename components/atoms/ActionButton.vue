<script setup lang="ts">
defineProps<{
  on?: () => void;
  label?: string;
  colorClass?: string;
  icon?: string;
}>();
</script>
<template>
  <div :class="[colorClass, 'rounded-md h-10 flex items-center px-2.5 gap-1 cursor-pointer max-w-fit border border-solid border-gray-300'] " @click="on">
    <i :class="[icon,'text-lg']"></i>
    <span class="text-sm font-medium">{{ label }}</span>
  </div>
</template>
