<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
import {useNuxtApp} from "#app";

const {
  dataList,
  fetchData
} = useCommonList("/student/course-results");

const visibleUnregisterCourseModal = ref(false);
const selectedIds = ref<Set<number>>(new Set());
const unregisterCourse = async () => {
  try {
    const response = await apiClient.delete(`/student/unregister-course/${selectedIds.value}`);
    if(response && response.status) {
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      visibleUnregisterCourseModal.value = false;
    }
  } catch (e) {
    console.error("Error registering course:", e);
  }
};

const statusResults = ['Học lại', 'Đang học', 'Đã học']
const statusClass = ['bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300',
'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300',
'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300']
const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.accessor('course_class_code', {
    header: 'Mã lớp học phần',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('course_name', {
    header: 'Môn học',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_1', {
    header: 'Điểm tx 1',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_2', {
    header: 'Điểm tx 2',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_3', {
    header: 'Điểm tx 3',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('absent_sessions', {
    header: 'Số tiết nghỉ',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('average_score', {
    header: 'Điểm TB',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: info => h('span', { class: statusClass[info.getValue()]}, statusResults[info.getValue()]),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('grade', {
    header: 'Xếp loại',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('note', {
    header: 'Ghi chú',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  // columnHelper.display({
  //   header: 'Hành động',
  //   cell: ({row}) => {
  //     return row.original.status === 1 && h(
  //         'div',
  //         {
  //           class: 'menu-link flex gap-2 justify-center',
  //         },
  //         [
  //           h('span', {
  //             class: 'menu-icon',
  //             onClick: () => {
  //               selectedIds.value = row.original.course_class_id;
  //               visibleUnregisterCourseModal.value = true;
  //             },
  //           }, [
  //             h('i', { class: 'fa fa-times text-lg text-danger' })
  //           ])
  //         ]
  //     );
  //   },
  //   meta: { headerClassName: 'whitespace-nowrap text-center'}
  // })
];
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Kết quả học tập" :isAction="false">
      <TableDefault :columns="columns" :data="dataList" />
    </Card>
  </div>

  <CommonModal
      :visible="visibleUnregisterCourseModal"
      title="Xác nhận thao tác"
      @close="() => visibleUnregisterCourseModal = false"
      @clickOutside="() => visibleUnregisterCourseModal = false">
    <template #header>
      <h2 class="text-xl font-bold text-red-500">Xác nhận hủy</h2>
    </template>
    <template #footer>
      <button class="btn btn-light" @click="() => visibleUnregisterCourseModal = false">Hủy</button>
      <button class="btn btn-primary" @click="unregisterCourse">Xác nhận</button>
    </template>
  </CommonModal>
</template>
<style scoped lang="scss">

</style>
