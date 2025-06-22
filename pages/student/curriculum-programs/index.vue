<script setup lang="ts">

import Card from "~/components/molecules/Card.vue";
import {useNuxtApp} from "#app";
import {h, onMounted, ref} from "vue";
import {createColumnHelper} from "@tanstack/vue-table";
const dataList = ref<any[]>([]);
const userInfo = ref<any>({});

const fetchUserInfo = async () => {
  try {
    const response = await apiClient.get('/student/info');
    if (response && response.status) {
      Object.assign(userInfo, response.data);
    }
  } catch (e) {
    console.error("Error fetching user info:", e);
    useNuxtApp().$toast.error("Lỗi khi tải thông tin sinh viên");
  }
};
const fetchCurriculumPrograms = async () => {
  try {
    const [programsResponse, scheduleResponse] = await Promise.all([
      apiClient.get(`/student/curriculum-programs/major/${userInfo.major_id}`),
      apiClient.get('/student/class-schedule')
    ]);

    if (programsResponse && programsResponse.status) {
      const registeredCourses = scheduleResponse?.data?.map((item: any) => item.course_name) || [];

      dataList.value = programsResponse.data.map((item: any) => ({
        ...item,
        is_registered: registeredCourses.includes(item.course_name)
      }));
    }
  } catch (e) {
    console.error("Error fetching curriculum programs:", e);
    useNuxtApp().$toast.error("Lỗi khi tải chương trình đào tạo");
  }
};

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
  columnHelper.accessor('course_code', {
    header: 'Mã môn học',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('course_name', {
    header: 'Tên môn học',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('semester', {
    header: 'Học kỳ',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('prerequisite_code', {
    header: 'Mã môn tiên quyết',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  })
];

onMounted(async () => {
  await fetchUserInfo();
  await fetchCurriculumPrograms();
});
</script>

<template>
  <Card title="Danh sách môn học" :isAction="false">
    <!--      <template #action>-->
    <!--        <div class="flex items-center justify-center gap-2">-->
    <!--          <InputField-->
    <!--              id="semester"-->
    <!--              name="semester"-->
    <!--              label="Kỳ học"-->
    <!--              placeholder="Tìm theo kỳ học"-->
    <!--              v-model="params.semester"-->
    <!--              labelPosition="border"-->
    <!--              labelClass="hidden"-->
    <!--              inputClass="w-[200px]"-->
    <!--          />-->
    <!--        </div>-->
    <!--      </template>-->
    <TableDefault :columns="columns" :data="dataList" />
  </Card>
</template>

<style scoped lang="scss">

</style>