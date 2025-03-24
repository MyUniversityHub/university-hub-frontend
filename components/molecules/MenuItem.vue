<script setup lang="ts">
import {defineProps} from "vue";
import type {MenuItem} from "~/config/menuSidebar";

defineProps({
  item: {
    type: Object as () => MenuItem,
    required: true,
  },
});
</script>
<template>
  <div>
    <NuxtLink :to="item.path" class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
      <i :class="['w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white', item.icon]"></i>
      <span class="ms-3">{{
          item.title
        }}</span>
    </NuxtLink>
  </div>
</template>


