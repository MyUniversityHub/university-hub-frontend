<template>
  <div class="flex items-center gap-2 order-2 md:order-1">
    Show
    <select class="select select-sm w-16" v-model="selectedPerPage" @change="onChange">
      <option v-for="size in [5, 10, 20, 30, 50]" :key="size" :value="size">{{ size }}</option>
    </select>
    per page
  </div>
</template>

<script setup lang="ts">
import { defineEmits, ref } from 'vue';

const emit = defineEmits<{
  (e: 'change', size: number): void;
}>();

const selectedPerPage = ref(10); // Set default to 10

const onChange = () => {
  emit('change', selectedPerPage.value);
};
</script>
