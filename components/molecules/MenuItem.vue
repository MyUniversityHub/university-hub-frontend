<script setup lang="ts">
import {defineProps} from "vue";
import type {MenuItem} from "~/config/menuSidebar";
import { ref } from 'vue';

const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};
defineProps({
  item: {
    type: Object as () => MenuItem,
    required: true,
  },
});
</script>
<template>
  <div v-if="item.children">
    <button
        type="button"
        class="flex items-center w-full p-2 text-base text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        @click="toggleDropdown"
    >
      <i :class="['w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white', item.icon]"></i>
      <span class="ms-3">{{ item.title }}</span>
      <i class="fa-solid fa-angle-down" :class="{'rotate-180': isOpen}"></i>
    </button>

    <div
        :class="['py-2 space-y-2', { 'hidden': !isOpen }]"
    >
      <MenuItem
          v-for="(child, index) in item.children"
          :key="index"
          :item="child"
      />
    </div>
  </div>

  <div v-else>
    <NuxtLink
        :to="item.path"
        class="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
    >
      <i :class="['w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white', item.icon]"></i>
      <span class="ms-3">{{ item.title }}</span>
    </NuxtLink>
  </div>

</template>


