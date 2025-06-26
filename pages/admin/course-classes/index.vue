<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import {useNuxtApp} from "#app";
import {useFormData} from "~/composables/useFormData";
import {useFormValidation} from "~/composables/useFormValidation";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
import {formatDate} from "~/utils/formatDate";

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
  status: '',
  classroom_id: '',
  teacher_id: ''
});

const visibleDeleteModal = ref(false);
const visibleCreateModal = ref(false);
const visibleAssignModal = ref(false);

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);
const isSingleDelete = ref<boolean>(false);
const {handleInvalidSubmit} = useFormValidation();

const majors = ref<Options[]>([]);
const majorMap = ref<Map<number, string>>(new Map());

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
  visibleCreateModal.value = false;
};

const handleCloseFormDelete = () => {
  if (isSingleDelete.value) {
    selectedIds.value.delete([...selectedIds.value].at(-1));
    isSingleDelete.value = false;
  }
  visibleDeleteModal.value = false;
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

const showFormAssign = (data: any) => {
  Object.assign(
      formData,
      Object.fromEntries(
          Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
      )
  );
  visibleAssignModal.value = true;
};

const showFormCreate = () => {
  resetForm();
  visibleCreateModal.value = true;
};

const handleCreate = async () => {
  if (formData) {
    try {
      const response = await apiClient.post(`/admin/course-classes`, {...formData});
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

const handleAssignTeacher = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/course-classes/assign-teacher/${formData.course_class_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleAssignModal.value = false;
    } catch (e) {
      console.error("Error updating course classes:", e);
    }
  }
};

const openCourseClass = async (id: number)=> {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/course-classes/open-course-class/${id}`);
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleAssignModal.value = false;
    } catch (e) {
      console.error("Error updating course classes:", e);
    }
  }
};

const closeCourseClass = async (id: number)=> {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/course-classes/close-course-class/${id}`);
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleAssignModal.value = false;
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

const courseClassStatus = {
  0: { title: "Chờ phân công", class: 'bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-purple-900 dark:text-purple-300' },
  1: { title: "Sẵn sàng mở", class: 'bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300' },
  2: { title: "Đã mở", class: 'bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300' },
  3: { title: "Đã đóng", class: 'bg-red-100 text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-red-900 dark:text-red-300' },
  4: { title: "Đã kết thúc", class: 'bg-gray-200 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300' }
};

const statusOptions = [
  { label: "Chờ phân công", value: 0 },
  { label: "Sẵn sàng mở", value: 1 },
  { label: "Đã mở", value: 2 },
  { label: "Đã đóng", value: 3 },
  { label: "Đã kết thúc", value: 4 }
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

const fetchTeacherByMajorId = async () => {
  try {
    const response = await apiClient.get(`/admin/teachers/major/${formData.major_id}`);
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
      const index = (currentPage.value - 1) * perPage.value + row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.display({
    id: "select-all",
    header: () => {
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          type: "checkbox",
          checked: selectedIds.value.size === dataList.value.length,
          class: "checkbox form-check-input pr-4",
          onChange: (e) => handleSelectAll(e.target.checked, 'course_class_id'),
        }),
      ]);
    },
    cell: ({ row }) => {
      const id = row.original?.course_class_id;
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          type: "checkbox",
          value: id,
          checked: selectedIds.value.has(id),
          class: "checkbox form-check-input pr-4",
          onChange: () => handleSelectMultiple(id),
        }),
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
  columnHelper.accessor('teacher_id', {
    header: 'Giảng viên',
    cell: ({row}) => {
      if(row.original?.status == 0) {
        return h('button', { class: 'text-primary underline', onClick: () => {
            showFormAssign(row.original);
          } }, 'Phân công');
      }else {
        return h('span', { class: 'capitalize font-medium text-gray-900 whitespace-nowrap dark:text-white' }, teacherMap.value.get(row.original?.teacher_id));
      }
    },
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
    cell: info => formatDate(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('end_date', {
    header: 'Ngày kết thúc',
    cell: info => formatDate(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('status', {
    header: 'Tình trạng',
    cell: info => {
      const status = courseClassStatus[info.getValue()];
      return status
          ? h('span', { class: status.class }, status.title)
          : info.getValue();
    },
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.display({
    header: 'Hành động',
    cell: ({row}) => {
      return h(
          'div',
          { class: 'menu-link flex gap-2 justify-center' },
          [
            (row.original?.status == 1 || row.original?.status == 3) && h('span', {
              class: 'text-center',
              onClick: () => openCourseClass(row.original?.course_class_id),
            }, [
              h('i', { class: 'fa fa-power-off text-lg text-green-600' })
            ]),
            (row.original?.status == 2) && h('span', {
              class: 'text-center',
              onClick: () => closeCourseClass(row.original?.course_class_id),
            }, [
              h('i', { class: 'fa fa-power-off text-lg text-danger' })
            ]),
            (row.original?.status != 2) && h('span', {
              class: 'text-center',
              onClick: () => showFormUpdate(row.original),
            }, [
              h('i', { class: 'fa-solid fa-pen-to-square text-lg text-blue-600' })
            ]),
            (row.original?.status != 2) && h('span', {
              class: 'menu-icon',
              onClick: () => {
                visibleDeleteModal.value = true;
                isSingleDelete.value = true;
                selectedIds.value.add(row.original?.course_class_id);
              },
            }, [
              h('i', { class: 'fa-solid fa-trash text-lg text-danger' })
            ])
          ]
      );
    },
  }),
];
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Danh lớp sách học phần" :isAction="true">
      <template #button>
        <MenuButtonAction :on-delete="showFormDelete"
                          :number="selectedIds.size"
                          :on-create="showFormCreate"/>
      </template>
      <template #action>

        <div class="flex items-center justify-center gap-2">
          <InputField
              id="courseClassCode"
              name="courseClassCode"
              label="Mã lớp học phần"
              placeholder="Tìm theo mã lớp học phần"
              v-model="params.code"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="status"
              name="status"
              label="Trạng thái"
              v-model="params.status"
              :dataOptions="statusOptions"
              inputType="select2"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
              selectPlaceholder="Chọn trạng thái"
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
      :visible="visibleCreateModal"
      title="Tạo mới"
      :body="deleteMessage"
      width="800px"
      @close="handleCloseFormCreate"
      @clickOutside="handleCloseFormCreate"
      @confirm="formData.course_class_id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.course_class_id ? 'Cập nhật' : 'Thêm mới'}} học phần</h2>
    </template>
    <VeeForm @submit="formData.course_class_id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="classroom"
          name="classroom"
          label="Phòng học"
          v-model="formData.classroom_id"
          :dataOptions="classrooms"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn lớp học"
      />
      <InputField
          id="course"
          name="course"
          label="Môn học"
          v-model="formData.course_id"
          :dataOptions="courses"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn môn học"
      />

      <InputField
          id="major"
          name="major"
          label="Chuyên ngành"
          v-model="formData.major_id"
          :dataOptions="majors"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn chuyên ngành"
          @change="fetchTeacherByMajorId"
      />

      <InputField
          id="teacher"
          name="teacher"
          label="Giảng viên"
          v-model="formData.teacher_id"
          :dataOptions="teachers"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn môn học"
      />

      <TagSelector
          id="weekdays"
          name="weekdays"
          label="Ngày học"
          v-model="formData.weekdays"
          :data-options="weekdaysOptions"
          inputType="select2"
          labelClass="w-[200px]"
          inputClass="flex-1"
          rules="required"
          placeholder="Chọn ngày học"
          :multiple="true"
      />

      <InputField
          id="semester"
          inputType="number"
          name="semester"
          label="Học kỳ"
          v-model="formData.semester"
          rules="required|numeric"
          :required="true"
          labelClass="w-[200px]"
          inputClass="flex-1"
          height="400"
      />

      <InputField
          id="max_student_count"
          name="max_student_count"
          label="Số lượng sinh viên"
          placeholder="Nhập số lượng sinh viên"
          v-model="formData.max_student_count"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|numeric|min:1|max:500"
      />

      <InputField
          id="lessonStart"
          inputType="number"
          name="lessonStart"
          label="Tiết học bắt đầu"
          v-model="formData.lesson_start"
          rules="required|numeric"
          :required="true"
          labelClass="w-[200px]"
          inputClass="flex-1"
          height="400"
      />

      <InputField
          id="lessonEnd"
          inputType="number"
          name="lessonEnd"
          label="Tiết học kết thúc"
          v-model="formData.lesson_end"
          rules="required|numeric"
          :required="true"
          labelClass="w-[200px]"
          inputClass="flex-1"
          height="400"
      />
      <InputField
          id="start_date"
          name="start_date"
          label="Ngày bắt đầu"
          v-model="formData.start_date"
          inputType="date"
          :required="true"
          rules="required"
          labelClass="w-[200px]"
          inputClass="flex-1"
      />
      <InputField
          id="end_date"
          name="end_date"
          label="Ngày kết thúc"
          :required="true"
          rules="required"
          v-model="formData.end_date"
          inputType="date"
          labelClass="w-[200px]"
          inputClass="flex-1"
      />

      <!-- Add other input fields for course_id, classroom_id, teacher_id, weekdays, etc. -->
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.course_class_id ? 'Cập nhật' : 'Thêm mới'}}</button>
    </template>
  </CommonModal>
  <CommonModal
      :visible="visibleAssignModal"
      title="Tạo mới"
      width="800px"
      @close="visibleAssignModal = false"
      @clickOutside="visibleAssignModal = false"
      @confirm="handleAssignTeacher"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">Phân công giảng viên</h2>
    </template>
    <VeeForm @submit="handleAssignTeacher" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
            <InputField
                id="teacher"
                name="teacher"
                label="Giảng viên"
                v-model="formData.teacher_id"
                :dataOptions="teachers"
                inputType="select2"
                :required="true"
                rules="required"
                inputClass="w-full"
                selectPlaceholder="Chọn giảng viên"
            />
      <!-- Add other input fields for course_id, classroom_id, teacher_id, weekdays, etc. -->
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="visibleAssignModal = false">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">Phân công</button>
    </template>
  </CommonModal>
  <CommonModal
      :visible="visibleDeleteModal"
      title="Xác nhận thao tác"
      :body="deleteMessage"
      @close="handleCloseFormDelete"
      @clickOutside="handleCloseFormDelete">
    <template #header>
      <h2 class="text-xl font-bold text-red-500">⚠️ Xác nhận xóa</h2>
    </template>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormDelete">Hủy</button>
      <button class="btn btn-danger" @click="handleDelete">Xóa</button>
    </template>
  </CommonModal>
</template>
<style scoped lang="scss">

</style>
