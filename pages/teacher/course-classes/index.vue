<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import Card from "~/components/molecules/Card.vue";

const params = reactive({
  course_class_code: '',
  course_id: '',
  classroom_id: ''
});

const {
  dataList,
  totalRecords,
  currentPage,
  perPage,
  fetchData
} = useCommonList("/teacher/course-classes", params);

const courses = ref<Options[]>([]);
const courseMap = ref<Map<number, string>>(new Map());

const classrooms = ref<Options[]>([]);
const classroomMap = ref<Map<number, string>>(new Map());

const majors = ref<Options[]>([]);
const majorMap = ref<Map<number, string>>(new Map());

const weekdaysMap = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const formatWeekdays = (weekdays: string) => {
  return weekdays.match(/\d+/g)?.map(day => weekdaysMap[parseInt(day)]).join(', ') || '';
};

const fetchCourseActive = async () => {
  try {
    const response = await apiClient.get(`/admin/courses/active`);
    if (response && response.status) {
      const tempCourses: Options[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((course: any) => {
        const newCourse = { label: course.course_name, value: course.course_id };
        tempCourses.push(newCourse);
        tempMap.set(newCourse.value, newCourse.label);
      });

      courses.value = tempCourses;
      courseMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching courses active:", e);
  }
};

const fetchMajorsActive = async () => {
  try {
    const response = await apiClient.get(`/admin/majors/active`);
    if(response && response.status) {
      const tempMajors: Major[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((major: any) => {
        const newMajor = { label: major.major_name, value: major.major_id };
        tempMajors.push(newMajor);
        tempMap.set(newMajor.value, newMajor.label);
      });

      majors.value = tempMajors;
      majorMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching majors active:", e);
  }
};

const fetchClassroomActive = async () => {
  try {
    const response = await apiClient.get(`/admin/classrooms/active`);
    if (response && response.status) {
      const tempClassrooms: Options[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((classroom: any) => {
        const newClassroom = { label: classroom.room_name, value: classroom.classroom_id };
        tempClassrooms.push(newClassroom);
        tempMap.set(newClassroom.value, newClassroom.label);
      });

      classrooms.value = tempClassrooms;
      classroomMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching classrooms active:", e);
  }
};

onMounted(() => {
  fetchCourseActive();
  fetchMajorsActive();
  fetchClassroomActive();
})

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = (currentPage.value - 1) * perPage.value + row.index + 1;
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
  columnHelper.accessor('course_id', {
    header: 'Môn học',
    cell: info => courseMap.value.get(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('classroom_id', {
    header: 'Phòng học',
    cell: info => classroomMap.value.get(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('semester', {
    header: 'Kỳ học',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('major_id', {
    header: 'Chuyên ngành',
    cell: info => majorMap.value.get(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('weekdays', {
    header: 'Ngày học',
    cell: ({ row }) => formatWeekdays(row.original?.weekdays || ''),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('lesson_start', {
    header: 'Tiết học',
    cell: ({ row }) => `${row.original.lesson_start} -> ${row.original.lesson_end}`,
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('max_student_count', {
    header: 'Số lượng sinh viên',
    cell: ({ row }) => `${row.original.current_student_count}/${row.original.max_student_count}`,
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('start_date', {
    header: 'Ngày bắt đầu',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('end_date', {
    header: 'Ngày kết thúc',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
];
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Danh sách lớp học phần đang giảng dạy">
      <template #action>
        <div class="flex items-center justify-center gap-2">
          <InputField
              id="courseClassCode"
              name="courseClassCode"
              label="Mã lớp học phần"
              placeholder="Tìm theo mã lớp học phần"
              v-model="params.course_class_code"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="course"
              name="course"
              label="Môn học"
              v-model="params.course_id"
              :dataOptions="courses"
              inputType="select2"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
              selectPlaceholder="Chọn môn học"
          />
          <InputField
              id="classroom"
              name="classroom"
              label="Phòng học"
              v-model="params.classroom_id"
              :dataOptions="classrooms"
              inputType="select2"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
              selectPlaceholder="Chọn phòng học"
          />
        </div>
      </template>
      <TableDefault :columns="columns" :data="dataList" />
      <PaginationControls
          :totalRecords="totalRecords"
          :perPage="perPage"
          :currentPage="currentPage"
          @update:perPage="perPage = $event"
          @update:currentPage="currentPage = $event"
      />
    </Card>
  </div>
</template>
<style scoped lang="scss">
</style>
