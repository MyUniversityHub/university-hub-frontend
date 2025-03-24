<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  total: Number,
  perPage: Number,
  currentPage: Number,
});

const totalPages = computed(() => Math.ceil((props.total || 0) / (props.perPage || 1)));
const start = computed(() => ((props.currentPage || 1) - 1) * (props.perPage || 1) + 1);
const end = computed(() => Math.min(props.total || 0, (props.currentPage || 1) * (props.perPage || 1)));


const visiblePages = computed(() => {
  const pages: number[] = [];
  let startPage = Math.max(1, props.currentPage - 2);
  let endPage = Math.min(totalPages.value, props.currentPage + 2);
  if((endPage - startPage) < 6) {
    endPage = Math.min(totalPages.value, startPage + 4);
  }
  if(startPage + 4 > totalPages.value) {
    startPage = Math.max(1, props.currentPage - 4);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});
</script>
<template>
  <div class="flex items-center gap-4 order-1 md:order-2">
    <span>{{ start }}-{{ end }} of {{ total }}</span>
    <div class="pagination">
      <button class="btn" :disabled="currentPage === 1" @click="$emit('change', 1)">
        <i class="ki-outline ki-black-left-line"></i>
      </button>
      <button class="btn" :disabled="currentPage === 1" @click="$emit('change', currentPage - 1)">
        <i class="ki-outline ki-black-left"></i>
      </button>
      <button v-for="page in visiblePages" :key="page" class="btn" :class="{ active: page === currentPage }" @click="$emit('change', page)">
        {{ page }}
      </button>
      <button class="btn" :disabled="currentPage === totalPages" @click="$emit('change', currentPage + 1)">
        <i class="ki-outline ki-black-right"></i>
      </button>
      <button class="btn" :disabled="currentPage === totalPages" @click="$emit('change', totalPages)">
        <i class="ki-outline ki-black-right-line"></i>
      </button>
    </div>
  </div>
</template>
