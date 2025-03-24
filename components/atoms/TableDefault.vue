<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
      <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
        <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            :colSpan="header.colSpan"
            class="px-6 py-3"
            v-bind="header.column.columnDef.meta?.headerClassName ? { class: header.column.columnDef.meta?.headerClassName } : {}"
        >
          <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()" />
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="row in table.getRowModel().rows" :key="row.id"
          class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
        <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="px-6 py-4"
            v-bind="cell.column.columnDef.meta?.cellClassName ? { class: cell.column.columnDef.meta.cellClassName } : {}"
        >
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
        </td>
      </tr>
      </tbody>
      <slot name="tfoot"></slot>
    </table>
  </div>
</template>

<script setup lang="ts">
import {
  FlexRender,
  getCoreRowModel,
  useVueTable,
  createColumnHelper
} from '@tanstack/vue-table'
import { ref, defineProps, watch, computed, h } from 'vue'

const columnHelper = createColumnHelper<any>();

const props = defineProps<{
  useColumnsDefault?: boolean,
  columns: any[],
  data: any[],
  currentPage: number,
  perPage: number
}>()

const data = ref(props.data)
watch(() => props.data, (newData) => {
  data.value = newData;
}, { deep: true })

const selectedIds = defineModel<Set<number>>('selectedIds', { default: () => new Set() });

watch([() => props.currentPage, () => props.perPage], () => {
  selectedIds.value.clear();
});

const isAllSelected = computed(() => {
  const currentPageIds = data.value.slice((props.currentPage - 1) * props.perPage, props.currentPage * props.perPage).map(row => row.id);
  return currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.value.has(id));
});

const handleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  const currentPageIds = data.value.slice((props.currentPage - 1) * props.perPage, props.currentPage * props.perPage).map(row => row.id);

  if (isChecked) {
    currentPageIds.forEach(id => selectedIds.value.add(id));
  } else {
    currentPageIds.forEach(id => selectedIds.value.delete(id));
  }
};

const handleSelectMultiple = (event: Event, id: number) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  if (isChecked) {
    selectedIds.value.add(id);
  } else {
    selectedIds.value.delete(id);
  }
};

const isSelected = (id: number) => selectedIds.value.has(id);

const sttColumn = columnHelper.display({
  id: 'stt',
  header: 'STT',
  cell: ({ row }) => {
    const startIndex = (props.currentPage - 1) * props.perPage;
    return startIndex + row.index + 1;
  },
  meta: { headerClassName: 'text-center', cellClassName: 'text-center' }
});

const selectColumn = columnHelper.display({
  id: 'select-all',
  header: () => {
    return h("div", { class: "flex justify-center items-center" }, [
      h("input", {
        type: "checkbox",
        checked: isAllSelected.value,
        class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500",
        onChange: handleSelectAll,
      }),
    ]);
  },
  cell: ({ row }) => {
    const id = row.original.id;
    return h("div", { class: "flex justify-center items-center" }, [
      h("input", {
        type: "checkbox",
        value: id,
        checked: isSelected(id),
        class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500",
        onChange: (e) => handleSelectMultiple(e, id),
      }),
    ]);
  },
  meta: { headerClassName: 'text-center', cellClassName: 'text-center' }
});

const mergedColumns = computed(() => {
  if (props.useColumnsDefault) {
    return [sttColumn, selectColumn, ...props.columns];
  }
  return [...props.columns];
});

const table = useVueTable({
  get data() {
    return data.value
  },
  columns: mergedColumns.value,
  getCoreRowModel: getCoreRowModel(),
})
</script>
