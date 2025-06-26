<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";

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

const visibleListModal = ref(false);

const studentsInClass = ref<any[]>([]);

const selectedCourseClass = ref(0);

const formatWeekdays = (weekdays: string) => {
  return weekdays.match(/\d+/g)?.map(day => weekdaysMap[parseInt(day)]).join(', ') || '';
};

const showFormCollection = () => {
  fetchStudentsInCourseClass(selectedCourseClass.value);
  visibleListModal.value = true;
  // Logic to handle showing the form for the selected course class
};

const fetchStudentsInCourseClass = async (courseClassId: number) => {
  try {
    const response = await apiClient.get(`/teacher/course-classes/${courseClassId}/students`);
    if (response && response.status) {
      // Assuming you want to store the students in a ref called studentsInClass
      studentsInClass.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching students in course class:", e);
  }
};

const fetchCourseActive = async () => {
  try {
    const response = await apiClient.get(`/teacher/courses/active`);
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
    const response = await apiClient.get(`/teacher/majors/active`);
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

function handleScoreInput(
    e: Event,
    row: any,
    field: 'frequent_score_1' | 'frequent_score_2' | 'frequent_score_3' | 'final_score'
) {
  const input = e.target as HTMLInputElement;
  let rawValue = input.value;

  // Nếu đang nhập dấu thập phân thì không xử lý vội (ví dụ: "9.")
  if (rawValue.endsWith('.')) {
    row.original[field] = rawValue;
    return;
  }

  let value = parseFloat(rawValue);

  if (isNaN(value)) value = 0;
  if (value > 10) value = 10;
  if (value < 0) value = 0;

  row.original[field] = value;
}

const fetchClassroomActive = async () => {
  try {
    const response = await apiClient.get(`/teacher/classrooms/active`);
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

const updateStudentScores = async () => {
  try {
    const response = await apiClient.post(`/teacher/course-classes/${selectedCourseClass.value}/update-scores`, {
      scores: studentsInClass.value
    });
    if (response && response.status) {
      useNuxtApp().$toast.success(response.message);
      visibleListModal.value = false;
      await fetchData();
    }
  } catch (e) {
    console.error("Error updating student scores:", e);
  }
};

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
  columnHelper.display({
    header: 'Hành động',
    cell: ({row}) => {
      return h(
          'div',
          {
            class: 'menu-link flex gap-2 justify-center',
          },
          [
            h('span', {
              class: 'menu-icon',
              onClick: () => {
                selectedCourseClass.value = row.original.course_class_id;
                showFormCollection();
              },
            }, [
              h('i', { class: 'fa fa-arrow-circle-right text-lg text-primary' })
            ])
          ]
      );
    },
    meta: { headerClassName: 'whitespace-nowrap text-center'}
  })
];

const studentColumns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = (currentPage.value - 1) * perPage.value + row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.accessor('student_code', {
    header: 'Mã sinh viên',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('student_name', {
    header: 'Tên sinh viên',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_1', {
    header: 'Điểm TX 1',
    cell: ({ row }) =>
      h('input', {
        type: 'number',
        class: 'form-input w-full px-2 py-1 rounded border',
        value: row.original.frequent_score_1,
        min: 0,
        max: 10,
        step: 0.1,
        onInput: (e: Event) => handleScoreInput(e, row, 'frequent_score_1')
      }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_2', {
    header: 'Điểm TX 2',
    cell: ({ row }) =>
      h('input', {
        type: 'number',
        class: 'form-input w-full px-2 py-1 rounded border',
        value: row.original.frequent_score_2,
        min: 0,
        max: 10,
        step: 0.1,
        onInput: (e: Event) => handleScoreInput(e, row, 'frequent_score_2')
      }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('frequent_score_3', {
    header: 'Điểm TX 3',
    cell: ({ row }) =>
      h('input', {
        type: 'number',
        class: 'form-input w-full px-2 py-1 rounded border',
        value: row.original.frequent_score_3,
        min: 0,
        max: 10,
        step: 0.1,
        onInput: (e: Event) => handleScoreInput(e, row, 'frequent_score_3')
      }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('final_score', {
    header: 'Điểm thi',
    cell: ({ row }) =>
        h('input', {
          type: 'number',
          class: 'form-input w-full px-2 py-1 rounded border',
          value: row.original.final_score,
          min: 0,
          max: 10,
          step: 0.1,
          onInput: (e: Event) => handleScoreInput(e, row, 'final_score')
        }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('absent_sessions', {
    header: 'Số tiết nghỉ',
    cell: ({ row }) =>
        h('input', {
          type: 'number',
          class: 'form-input w-full px-2 py-1 rounded border',
          value: row.original.absent_sessions,
          min: 0,
          max: 10,
          step: 0.1,
          onInput: (e: Event) => {
            row.original.absent_sessions = parseFloat((e.target as HTMLInputElement).value);
          }
        }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('average_score', {
    header: 'Điểm TB',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('grade', {
    header: 'Xếp loại',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('note', {
    header: 'Ghi chú',
    cell: ({ row }) =>
        h('input', {
          class: 'form-input w-full px-2 py-1 rounded border',
          value: row.original.note,
          onInput: (e: Event) => {
            row.original.note = (e.target as HTMLInputElement).value;
          }
        }),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
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

  <CommonModal
      :visible="visibleListModal"
      title="Tạo mới"
      :body="deleteMessage"
      width="1500px"
      @close="visibleListModal = false"
      @clickOutside="visibleListModal = false">
    <template #header>
      <h2 class="text-xl font-bold">Danh sách sinh viên</h2>
    </template>
    <VeeForm @submit="updateStudentScores" id="triggerFormCreateUpdate">
      <TableDefault :columns="studentColumns" :data="studentsInClass" />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="visibleListModal = false">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">Cập nhật</button>
    </template>
  </CommonModal>
</template>
<style scoped lang="scss">
</style>
