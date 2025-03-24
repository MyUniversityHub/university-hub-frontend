<script setup lang="ts">

import ActionButton from "~/components/atoms/ActionButton.vue";

defineProps<{
  onDelete?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  number?: 0;
}>();
</script>

<template>
  <div class="flex gap-2.5">
    <ActionButton v-if="number > 0 && onDelete" :on="onDelete" icon="fa-solid fa-trash" label="Xóa" colorClass="text-danger"></ActionButton>
    <ActionButton v-if="onCreate" :on="onCreate" icon="fa-solid fa-plus" label="Thêm mới" colorClass="text-primary"></ActionButton>
    <ActionButton v-if="onImport" :on="onImport" icon="fa-solid fa-file-import" label="Import" colorClass="text-success"></ActionButton>
    <ActionButton v-if="onExport" :on="onExport" icon="fa-solid fa-file-export" label="Export to excel" colorClass="text-success"></ActionButton>
  </div>
</template>

