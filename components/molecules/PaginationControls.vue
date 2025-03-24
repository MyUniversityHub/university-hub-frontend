<!-- components/PaginationControls.vue -->
<template>
  <div :class="['card-footer justify-center md:justify-between flex-col md:flex-row gap-5 px-0 text-gray-600 text-2sm font-medium', className]" >
    <RecordsPerPage @change="onPerPageChange" />
    <Pagination :total="totalRecords" :per-page="perPage" :current-page="currentPage" @change="onPageChange" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  totalRecords: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:perPage', 'update:currentPage']);

const onPageChange = (page: number) => {
  emit('update:currentPage', page);
};

const onPerPageChange = (size: number) => {
  emit('update:currentPage', 1);
  emit('update:perPage', size);
};
</script>
