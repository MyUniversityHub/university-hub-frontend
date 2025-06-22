<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import {useNuxtApp} from "#app";
import {useFormData} from "~/composables/useFormData";
import {useFormValidation} from "~/composables/useFormValidation";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";

const defaultFormCreate = {
  course_class_id: 0,
  course_class_code: '',
  course_id: null,
  classroom_id: null,
  major_id: null,
  teacher_id: null,
  weekdays: '',
  semester: '',
  max_student_count: '',
  current_student_count: 0,
  lesson_start: '',
  lesson_end: '',
  start_date: '',
  end_date: '',
};

const params = reactive({
  course_class_code: '',
  course_id: '',
  classroom_id: '',
  teacher_id: ''
});

const visibleDeleteModal = ref(false);
const visibleCreateModal = ref(false);

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);
const isSingleDelete = ref<boolean>(false);
const {handleInvalidSubmit} = useFormValidation();

const majors = ref<Options[]>([]);
const majorMap = ref<Map<number, string>>(new Map());

const selectedMajorId = ref<number | null>(null);
const selectCourseId = ref<number | null>(null);
const selectedSemester = ref<number | null>(null);

const coursesByMajorId = ref<any[]>([]);

const boxData = ref<any[]>([]);

const {
  dataList,
  totalRecords,
  currentPage,
  perPage,
  selectedIds,
  handleSelectAll,
  handleSelectMultiple,
  fetchData
} = useCommonList("/admin/course-classes", params);

const handleDelete = async () => {
  visibleDeleteModal.value = false;
  const ids = ref([]);
  if (isSingleDelete.value) {
    ids.value.push([...selectedIds.value].at(-1));
    selectedIds.value.delete(ids.value);
    isSingleDelete.value = false;
  } else {
    ids.value = [...selectedIds.value];
  }
  try {
    const res = await apiClient.delete('/admin/course-classes/bulk-delete', {
      body: { ids: ids.value }
    });
    if (res.status) {
      useNuxtApp().$toast.success(res.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    fetchData();
  }
};

const deleteMessage = computed(() => {
  const count = selectedIds.value.size;
  if (isSingleDelete.value) return `Bạn có chắc chắn muốn xóa học phần với ID ${[...selectedIds.value].at(-1)} không?`;
  return count === 1
      ? `Bạn có chắc chắn muốn xóa học phần với ID ${[...selectedIds.value][0]} không?`
      : `Bạn có chắc chắn muốn xóa ${count} học phần này không?`;
});

const handleCloseFormCreate = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  boxData.value = [];
  visibleCreateModal.value = false;
};

const handleCloseFormDelete = () => {
  if (isSingleDelete.value) {
    selectedIds.value.delete([...selectedIds.value].at(-1));
    isSingleDelete.value = false;
  }
  visibleDeleteModal.value = false;
};

const fetchCoursesByMajorId = async () => {
  try {
    const response = await apiClient.get(`/admin/curriculum-programs/major/${selectedMajorId.value}`);
    if(response && response.status) {
      coursesByMajorId.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching courses by major ID:", e);
  }
};

const showFormDelete = () => {
  if (selectedIds.value.size === 0) {
    useNuxtApp().$toast.warning("Chưa có bản ghi nào được chọn");
    return;
  }
  visibleDeleteModal.value = true;
};

const showFormUpdate = (data: any) => {
  Object.assign(
      formData,
      Object.fromEntries(
          Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
      )
  );
  formData.weekdays = JSON.parse(formData.weekdays);
  visibleCreateModal.value = true;
};

const showFormCreate = () => {
  resetForm();
  visibleCreateModal.value = true;
};

const handleCreate = async () => {
  if (boxData) {
    try {
      const response = await apiClient.post(`/admin/course-classes/bulk-create`, {...boxData.value});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error creating course classes:", e);
    }
  }
};

const handleUpdate = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/course-classes/${formData.course_class_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error updating course classes:", e);
    }
  }
};

const weekdaysMap = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const weekdaysOptions = [
  { label: "Thứ 2", value: 0 },
  { label: "Thứ 3", value: 1 },
  { label: "Thứ 4", value: 2 },
  { label: "Thứ 5", value: 3 },
  { label: "Thứ 6", value: 4 },
  { label: "Thứ 7", value: 5 },
  { label: "Chủ nhật", value: 6 },
];

const formatWeekdays = (weekdays: string) => {
  return weekdays.match(/\d+/g)?.map(day => weekdaysMap[parseInt(day)]).join(', ') || '';
};

const courses = ref<Options[]>([]);
const courseMap = ref<Map<number, string>>(new Map());

const classrooms = ref<Options[]>([]);
const classroomMap = ref<Map<number, string>>(new Map());

const teachers = ref<Options[]>([]);
const teacherMap = ref<Map<number, string>>(new Map());
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
    console.error("Error fetching departments active:", e);
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

const fetchTeacherActive = async () => {
  try {
    const response = await apiClient.get(`/admin/teachers/active`);
    if (response && response.status) {
      const tempTeachers: Options[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((teacher: any) => {
        const newTeacher = { label: teacher.user.name, value: teacher.teacher_id };
        tempTeachers.push(newTeacher);
        tempMap.set(newTeacher.value, newTeacher.label);
      });

      teachers.value = tempTeachers;
      teacherMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching teachers active:", e);
  }
};

onMounted(() => {
  fetchCourseActive();
  fetchMajorsActive();
  fetchClassroomActive();
  fetchTeacherActive();
})


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
    header: 'Mã môn',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('course_name', {
    header: 'Tên môn',
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
                selectCourseId.value = row.original.course_id;
                selectedSemester.value = row.original.semester;
                console.log(row.original, selectCourseId.value, selectedSemester.value);
                visibleCreateModal.value = true;
              },
            }, [
              h('i', { class: 'fa fa-plus-circle text-lg text-primary' })
            ])
          ]
      );
    },
    meta: { headerClassName: 'whitespace-nowrap text-center'}
  })
];
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Danh lớp sách học phần" :isAction="true">
      <div class="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm mb-4">
        <InputField
            id="selectedMajor"
            name="selectedMajor"
            v-model="selectedMajorId"
            :dataOptions="majors"
            inputType="select2"
            :required="true"
            rules="required"
            inputClass="min-w-[220px] flex-1"
            selectPlaceholder="Chọn chuyên ngành"
        />
        <button
            type="button"
            class="px-6 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-colors duration-150"
            @click="fetchCoursesByMajorId"
        >
          Tìm kiếm
        </button>
      </div>
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
      <TableDefault :columns="columns" :data="coursesByMajorId" />
    </Card>
  </div>
  <CommonModal
      :visible="visibleCreateModal"
      title="Tạo mới"
      :body="deleteMessage"
      width="800px"
      @close="handleCloseFormCreate"
      @clickOutside="handleCloseFormCreate"
      @confirm="handleCreate"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">Mở lớp học phần</h2>
    </template>
    <VeeForm @submit="handleCreate" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <DynamicInputBox titleBox="Lớp" v-model="boxData" :fields="['classroom_id', 'course_id', 'major_id', 'weekdays', 'semester', 'max_student_count', 'lesson_start', 'lesson_end', 'start_date', 'end_date']"
                       :initial-values="{
                        major_id: selectedMajorId,
                        course_id: selectCourseId,
                        semester: selectedSemester,
                        }"
      >
        <template #default="{ box, updateBoxValue, fields }">
          <div :key="box.id">
            <InputField
                :id="'classroom' + '-' + box.id"
                :name="'classroom' + '-' + box.id"
                label="Phòng học"
                v-model="box.values[fields[0]]"
                :dataOptions="classrooms"
                inputType="select2"
                :required="true"
                rules="required"
                labelClass="w-[200px]"
                inputClass="flex-1"
                selectPlaceholder="Chọn lớp học"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[0], value)"
            />
            <InputField
                :id="'course' + '-' + box.id"
                :name="'course' + '-' + box.id"
                label="Môn học"
                v-model="box.values[fields[1]]"
                :dataOptions="courses"
                inputType="select2"
                :required="true"
                labelClass="w-[200px]"
                inputClass="flex-1"
                selectPlaceholder="Chọn môn học"
                :disabled="true"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[1], value)"
            />
            <InputField
                :id="'major' + '-' + box.id"
                :name="'major' + '-' + box.id"
                label="Chuyên ngành"
                v-model="box.values[fields[2]]"
                :dataOptions="majors"
                inputType="select2"
                :required="true"
                labelClass="w-[200px]"
                inputClass="flex-1"
                :disabled="true"
                selectPlaceholder="Chọn chuyên ngành"
                @update:modelValue="updateBoxValue(box.id, fields[2], 1)"
            />

            <TagSelector
                :id="'weekdays' + '-' + box.id"
                :name="'weekdays' + '-' + box.id"
                label="Ngày học"
                v-model="box.values[fields[3]]"
                :data-options="weekdaysOptions"
                inputType="select2"
                labelClass="w-[200px]"
                rules="required"
                inputClass="flex-1"
                :required="true"
                placeholder="Chọn ngày học"
                :multiple="true"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[3], value)"
            />

            <InputField
                :id="'semester' + '-' + box.id"
                inputType="number"
                :name="'semester' + '-' + box.id"
                label="Học kỳ"
                v-model="box.values[fields[4]]"
                :required="true"
                labelClass="w-[200px]"
                rules="required"
                inputClass="flex-1"
                @update:modelValue="updateBoxValue(box.id, fields[4], 1)"
            />

            <InputField
                :id="'max_student_count' + '-' + box.id"
                :name="'max_student_count' + '-' + box.id"
                label="Số lượng sinh viên"
                placeholder="Nhập số lượng sinh viên"
                v-model="box.values[fields[5]]"
                labelClass="w-[200px]"
                rules="required"
                inputClass="flex-1"
                :required="true"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[5], value)"
            />

            <InputField
                :id="'lesson_start' + '-' + box.id"
                inputType="number"
                :name="'lesson_start' + '-' + box.id"
                label="Tiết học bắt đầu"
                v-model="box.values[fields[6]]"
                :required="true"
                labelClass="w-[200px]"
                rules="required"
                inputClass="flex-1"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[6], value)"
            />

            <InputField
                :id="'lesson_end' + '-' + box.id"
                inputType="number"
                :name="'lesson_end' + '-' + box.id"
                label="Tiết học kết thúc"
                v-model="box.values[fields[7]]"
                rules="required"
                :required="true"
                labelClass="w-[200px]"
                inputClass="flex-1"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[7], value)"
            />

            <InputField
                :id="'start_date' + '-' + box.id"
                :name="'start_date' + '-' + box.id"
                label="Ngày bắt đầu"
                v-model="box.values[fields[8]]"
                inputType="date"
                :required="true"
                rules="required"
                labelClass="w-[200px]"
                inputClass="flex-1"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[8], value)"
            />

            <InputField
                :id="'end_date' + '-' + box.id"
                :name="'end_date' + '-' + box.id"
                label="Ngày kết thúc"
                :required="true"
                rules="required"
                v-model="box.values[fields[9]]"
                inputType="date"
                labelClass="w-[200px]"
                inputClass="flex-1"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[9], value)"
            />
          </div>
        </template>
      </DynamicInputBox>
      <!-- Add other input fields for course_id, classroom_id, teacher_id, weekdays, etc. -->
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.course_class_id ? 'Cập nhật' : 'Thêm mới'}}</button>
    </template>
  </CommonModal>

</template>
<style scoped lang="scss">

</style>
