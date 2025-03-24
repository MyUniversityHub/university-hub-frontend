<script setup lang="ts">
import MenuItem from '~/components/molecules/MenuItem.vue';
import { getFilteredMenuItems } from '~/config/menuSidebar';

const filteredMenuItems = getFilteredMenuItems();
</script>

<template>
  <!-- Sidebar -->
  <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
    <div class="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
      <div class="space-y-2 font-medium">
        <MenuItem
            v-for="(item, index) in filteredMenuItems"
            :key="index"
            :item="item"
        />
      </div>
    </div>
  </aside>
  <!-- End of Sidebar -->
</template>


