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
  <div :class="['menu-item w-56', item.children ? 'menu-item-accordion' : '']"
       :data-menu-item-toggle="item.children ? 'accordion' : null"
       :data-menu-item-trigger="item.children ? 'click' : null">
    <!-- Nếu có children -->
    <template v-if="item.children">
      <div
          class="menu-link flex items-center grow cursor-pointer border border-transparent gap-[10px] ps-[10px] pe-[10px] py-[6px]"
          tabindex="0">
      <span class="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
        <i :class="item.icon"></i>
      </span>
        <span
            class="menu-title text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">{{
            item.title
          }}</span>
        <span class="menu-arrow text-gray-400 w-[20px] shrink-0 justify-end ms-1 me-[-10px]">
        <i class="ki-filled ki-plus text-2xs menu-item-show:hidden"></i>
        <i class="ki-filled ki-minus text-2xs hidden menu-item-show:inline-flex"></i>
      </span>
      </div>
      <!-- Render các mục con -->
      <div
          class="menu-accordion gap-0.5 ps-[10px] relative before:absolute before:start-[20px] before:top-0 before:bottom-0 before:border-s before:border-gray-200">
        <MenuItem
            v-for="(child, index) in item.children"
            :key="index"
            :item="child"
        />
      </div>
    </template>
    <!-- Nếu không có children -->
    <div
        v-else
        class="menu-label border border-transparent gap-[10px] ps-[10px] pe-[10px] py-[6px]">
      <span class="menu-icon items-start text-gray-500 dark:text-gray-400 w-[20px]">
        <i :class="item.icon"></i>
      </span>
      <NuxtLink :to="item.path"
                class="menu-title text-sm font-medium text-gray-800 menu-item-active:text-primary menu-link-hover:!text-primary">{{
          item.title
        }}</NuxtLink>
    </div>
  </div>

</template>


