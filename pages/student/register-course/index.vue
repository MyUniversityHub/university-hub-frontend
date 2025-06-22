<script setup lang="ts">
import { createColumnHelper } from "@tanstack/vue-table";
import { h, ref, computed, onMounted, reactive } from "vue";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
import { useNuxtApp } from "#app";

// Types
interface CourseClass {
  course_class_id: number;
  course_name: string;
  course_class_code: string;
  weekdays_raw: string;
  weekdays: number[];
  lesson_start: number;
  lesson_end: number;
  teacher_name: string;
  current_student_count: number;
  max_student_count: number;
  room_name: string;
  has_active_classes: boolean;
}

interface CurrentSchedule {
  course_name: string;
  course_class_code: string;
  weekdays: number[];
  lesson_start: number;
  lesson_end: number;
  teacher_name: string;
  room_name: string;
}

// Data
const params = reactive({
  semester: '',
});

const visibleCollectionModal = ref(false);
const visibleUnregisterCourseModal = ref(false);
const selectedId = ref<number | null>(null);
const selectedCourseClassId = ref<number | null>(null);
const selectedCourseClass = ref<number | null>(null);
const courseClasses = ref<CourseClass[]>([]);
const currentSchedule = ref<CurrentSchedule[]>([]);
const userInfo = ref<any>({});
const dataList = ref<any[]>([]);

const weekdaysMap = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

// API Functions
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

const fetchCourseClassesActive = async () => {
  try {
    const response = await apiClient.get(`/student/course-classes/${selectedId.value}`);
    if (response && response.status) {
      courseClasses.value = response.data.map((item: any) => ({
        ...item,
        weekdays_raw: item.weekdays,
        weekdays: JSON.parse(item.weekdays || '[]'),
      }));
    }
  } catch (e) {
    console.error("Error fetching course classes active:", e);
    useNuxtApp().$toast.error("Lỗi khi tải danh sách lớp học phần");
  }
};

const fetchCurrentSchedule = async () => {
  try {
    const response = await apiClient.get('/student/class-schedule');
    if (response && response.status) {
      currentSchedule.value = response.data.map((item: any) => ({
        ...item,
        weekdays: JSON.parse(item.weekdays || '[]'),
      }));
    }
  } catch (e) {
    console.error("Error fetching current schedule:", e);
    useNuxtApp().$toast.error("Lỗi khi tải lịch học hiện tại");
  }
};

// Helper Functions
const showFormCollection = async (id: number) => {
  visibleCollectionModal.value = true;
  selectedCourseClass.value = null;
  selectedId.value = id;
  await fetchCourseClassesActive();
};

const checkScheduleConflict = (newClass: CourseClass) => {
  const newDays = newClass.weekdays;
  const newStart = newClass.lesson_start;
  const newEnd = newClass.lesson_end;

  for (const existingClass of currentSchedule.value) {
    for (const day of newDays) {
      if (existingClass.weekdays.includes(day)) {
        if (
            (newStart >= existingClass.lesson_start && newStart <= existingClass.lesson_end) ||
            (newEnd >= existingClass.lesson_start && newEnd <= existingClass.lesson_end) ||
            (newStart <= existingClass.lesson_start && newEnd >= existingClass.lesson_end)
        ) {
          return {
            conflict: true,
            existingClass,
            day: weekdaysMap[day]
          };
        }
      }
    }
  }

  return { conflict: false };
};

// Thêm vào script setup
const validateSchedule = (newClass: CourseClass) => {
  const errors = {
    timeConflict: false,
    sameCourse: false,
    fullClass: false,
    details: [] as string[]
  };

  // Kiểm tra lớp đã đầy chưa
  if (newClass.current_student_count >= newClass.max_student_count) {
    errors.fullClass = true;
    errors.details.push('Lớp học đã đầy');
  }

  // Kiểm tra trùng môn học
  const isSameCourseRegistered = currentSchedule.value.some(
      item => item.course_name === newClass.course_name
  );

  if (isSameCourseRegistered) {
    errors.sameCourse = true;
    errors.details.push('Bạn đã đăng ký môn học này');
  }

  // Kiểm tra trùng thời gian
  const newDays = newClass.weekdays;
  const newStart = newClass.lesson_start;
  const newEnd = newClass.lesson_end;

  for (const existingClass of currentSchedule.value) {
    for (const day of newDays) {
      if (existingClass.weekdays.includes(day)) {
        if (
            (newStart >= existingClass.lesson_start && newStart <= existingClass.lesson_end) ||
            (newEnd >= existingClass.lesson_start && newEnd <= existingClass.lesson_end) ||
            (newStart <= existingClass.lesson_start && newEnd >= existingClass.lesson_end)
        ) {
          errors.timeConflict = true;
          errors.details.push(
              `Trùng lịch với ${existingClass.course_name} (${existingClass.course_class_code}) vào ${weekdaysMap[day]}, tiết ${existingClass.lesson_start}-${existingClass.lesson_end}`
          );
          break;
        }
      }
    }
    if (errors.timeConflict) break;
  }

  return errors;
};

// Sửa hàm registerCourse
const registerCourse = async () => {
  if (selectedCourseClass.value === null) {
    useNuxtApp().$toast.warning('Vui lòng chọn lớp học phần');
    return;
  }

  const selectedClass = courseClasses.value.find(
      item => item.course_class_id === selectedCourseClass.value
  );

  if (!selectedClass) return;

  // Validate trước khi đăng ký
  const validation = validateSchedule(selectedClass);

  if (validation.details.length > 0) {
    validation.details.forEach(error => {
      useNuxtApp().$toast.error(error);
    });
    return;
  }

  try {
    const response = await apiClient.post(`/student/register-course`, {
      course_class_id: selectedCourseClass.value
    });

    if (response && response.status) {
      visibleCollectionModal.value = false;
      selectedId.value = null;
      selectedCourseClass.value = null;
      courseClasses.value = [];
      useNuxtApp().$toast.success(response.message);
      await Promise.all([fetchCurriculumPrograms(), fetchCurrentSchedule()]);
    }
  } catch (e: any) {
    console.error("Error registering course:", e);
    useNuxtApp().$toast.error(e.response?.data?.message || "Đăng ký thất bại");
  }
};

const showFormUnregisterCourse = (course: any) => {
  visibleUnregisterCourseModal.value = true;
  selectedCourseClassId.value = course.course_class_id;
};

const unregisterCourse = async () => {
  try {
    const response = await apiClient.delete(`/student/unregister-course/${selectedCourseClassId.value}`);
    if(response && response.status) {
      useNuxtApp().$toast.success(response.message);
      await fetchCurrentSchedule();
      await fetchCurriculumPrograms();
      visibleUnregisterCourseModal.value = false;
    }
  } catch (e) {
    console.error("Error registering course:", e);
  }
};

// Thêm hàm hiển thị cảnh báo trên UI
const getClassValidationStatus = (courseClass: CourseClass) => {
  const validation = validateSchedule(courseClass);
  return {
    hasError: validation.details.length > 0,
    errors: validation.details
  };
};

const selectedCourseClassDetails = computed(() => {
  if (!selectedCourseClass.value) return null;
  return courseClasses.value.find(item => item.course_class_id === selectedCourseClass.value);
});

const isTimeSlotSelected = (dayIndex: number, lessonNumber: number) => {
  // Kiểm tra lớp đang chọn
  const selected = selectedCourseClassDetails.value;
  if (selected) {
    if (selected.weekdays.includes(dayIndex) &&
        lessonNumber >= selected.lesson_start &&
        lessonNumber <= selected.lesson_end) {
      return { isSelected: true, isCurrent: false };
    }
  }

  // Kiểm tra lịch hiện tại
  for (const item of currentSchedule.value) {
    if (item.weekdays.includes(dayIndex) &&
        lessonNumber >= item.lesson_start &&
        lessonNumber <= item.lesson_end) {
      return { isSelected: false, isCurrent: true };
    }
  }

  return { isSelected: false, isCurrent: false };
};

const getSelectedClassName = () => {
  const selected = selectedCourseClassDetails.value;
  if (!selected) return '';
  return selected.course_class_code;
};

// Table Columns
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
  columnHelper.display({
    header: 'Trạng thái',
    cell: ({row}) => {
      const isRegistered = row.original.is_registered;
      return h("div", {
        class: "d-flex justify-center items-center",
      }, [
        h("span", {
          class: isRegistered
              ? "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 whitespace-nowrap"
              : "bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 whitespace-nowrap"
        }, isRegistered ? "Đã đăng ký" : "Chưa đăng ký")
      ]);
    },
    meta: { headerClassName: 'whitespace-nowrap text-center'}
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
              class: `menu-icon cursor-pointer ${row.original.is_registered || !row.original.has_active_classes ? 'opacity-50 cursor-not-allowed' : ''}`,
              onClick: () => {
                if (!row.original.is_registered && row.original.has_active_classes) {
                  showFormCollection(row.original.course_id);
                }
              },
            }, [
              h('i', {
                class: `fa fa-arrow-circle-right text-lg ${row.original.is_registered ? 'text-gray-400' : 'text-primary'}`
              })
            ])
          ]
      );
    },
    meta: { headerClassName: 'whitespace-nowrap text-center'}
  })
];

// Initialize
onMounted(async () => {
  await fetchUserInfo();
  await Promise.all([fetchCurriculumPrograms(), fetchCurrentSchedule()]);
});
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <!-- Thêm phần thời khóa biểu đã đăng ký -->
    <Card title="Thời khóa biểu đã đăng ký" :isAction="false">
      <div class="timetable-registered">
        <!-- Time header -->
        <div class="grid grid-cols-8 gap-1">
          <div class="bg-gray-100 p-2 text-center text-xs font-medium">Tiết/Ngày</div>
          <div
              v-for="(day, i) in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']"
              :key="i"
              class="bg-gray-100 p-2 text-center text-xs font-medium"
          >
            {{ day }}
          </div>
        </div>

        <!-- Timetable rows -->
        <div v-for="lesson in 12" :key="lesson" class="grid grid-cols-8 gap-1 border-t">
          <div class="p-2 text-center text-xs font-medium">{{ lesson }}</div>
          <template v-for="day in 7" :key="`${lesson}-${day}`">
            <div class="relative p-2 min-h-[40px] border text-xs">
              <template v-for="course in currentSchedule" :key="course.course_class_code">
                <div
                    v-if="course.weekdays.includes(day-1) && lesson >= course.lesson_start && lesson <= course.lesson_end"
                    class="absolute inset-0 bg-blue-100 border border-blue-300 p-1 flex flex-col"
                >
                  <div class="flex justify-between items-start">
                    <div class="text-xs font-medium truncate">{{ course.course_name }}</div>
                    <button
                        @click="showFormUnregisterCourse(course)"
                        class="text-red-500 hover:text-red-700 text-xs"
                        title="Hủy đăng ký"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div class="text-xs truncate">{{ course.teacher_name }}</div>
                  <div class="text-xs truncate">{{ course.room_name }}</div>
                </div>
              </template>
            </div>
          </template>
        </div>
      </div>
    </Card>
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
  </div>

  <CommonModal
      :visible="visibleCollectionModal"
      title="Đăng ký lớp học phần"
      width="1200px"
      @close="() => visibleCollectionModal = false"
      @clickOutside="() => visibleCollectionModal = false"
  >
    <template #header>
      <h2 class="text-xl font-bold">Đăng ký lớp học phần</h2>
    </template>
    <div class="p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Column 1: Course class list -->
      <div class="space-y-4">
        <h3 class="font-semibold text-lg">Danh sách lớp học phần</h3>
        <ul class="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          <li v-for="(item, index) in courseClasses" :key="index">
            <input
                type="radio"
                v-model="selectedCourseClass"
                :id="'class-' + index"
                :value="item.course_class_id"
                class="hidden peer"
                :disabled="getClassValidationStatus(item).hasError"
            />
            <label
                :for="'class-' + index"
                :class="[
      'inline-flex items-center justify-between w-full p-5 border rounded-lg cursor-pointer',
      'peer-checked:border-blue-600 peer-checked:text-blue-600',
      getClassValidationStatus(item).hasError
        ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400'
        : 'bg-white text-gray-900 hover:bg-gray-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500',
      getClassValidationStatus(item).hasError ? 'cursor-not-allowed' : ''
    ]"
            >
              <div class="block w-full">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="text-lg font-semibold">{{ item.course_name }}</div>
                    <div class="text-gray-500 dark:text-gray-300">{{ item.course_class_code }}</div>
                  </div>
                  <div v-if="item.current_student_count >= item.max_student_count"
                       class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded dark:bg-red-900 dark:text-red-300">
                    Đã đầy
                  </div>
                </div>

                <div class="flex flex-wrap gap-1 my-1">
        <span
            v-for="(day, i) in item.weekdays"
            :key="i"
            :class="[
            'text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm',
            getClassValidationStatus(item).hasError
              ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          ]"
        >
          {{ weekdaysMap[day] }}
        </span>
                </div>

                <div class="text-gray-500 dark:text-gray-300">Tiết: {{ item.lesson_start }} → {{ item.lesson_end }}</div>
                <div class="text-gray-500 dark:text-gray-300">Giảng viên: {{ item.teacher_name }}</div>
                <div class="text-gray-500 dark:text-gray-300">Phòng: {{ item.room_name }}</div>
                <div class="text-gray-500 dark:text-gray-300">
                  Số lượng: {{ item.current_student_count }}/{{ item.max_student_count }}
                </div>

                <!-- Hiển thị lỗi nếu có -->
                <div v-if="getClassValidationStatus(item).hasError" class="mt-2 text-red-600 dark:text-red-400 text-sm">
                  <div v-for="(error, i) in getClassValidationStatus(item).errors" :key="i" class="flex items-start">
                    <i class="fas fa-exclamation-circle mt-0.5 mr-1"></i>
                    <span>{{ error }}</span>
                  </div>
                </div>
              </div>

              <svg
                  v-if="!getClassValidationStatus(item).hasError"
                  class="w-4 h-4 ms-3 rtl:rotate-180 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
              >
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
              </svg>
            </label>
          </li>
        </ul>
        <button
            class="text-white inline-flex w-full justify-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            @click="registerCourse"
            :disabled="!selectedCourseClass"
        >
          Đăng ký
        </button>
      </div>

      <!-- Column 2: Timetable visualization -->
      <div class="border rounded-lg p-4">
        <h3 class="font-semibold text-lg mb-3">Thời khóa biểu</h3>
        <div class="timetable-container">
          <!-- Time header -->
          <div class="grid grid-cols-8 gap-1">
            <div class="bg-gray-100 p-2 text-center text-xs font-medium">Tiết/Ngày</div>
            <div
                v-for="(day, i) in ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']"
                :key="i"
                class="bg-gray-100 p-2 text-center text-xs font-medium"
            >
              {{ day }}
            </div>
          </div>

          <!-- Timetable rows -->
          <div v-for="lesson in 12" :key="lesson" class="grid grid-cols-8 gap-1 border-t">
            <div class="p-2 text-center text-xs font-medium">{{ lesson }}</div>
            <template v-for="day in 7" :key="`${lesson}-${day}`">
              <div
                  :class="[
                  'p-2 min-h-[40px] border text-xs flex items-center justify-center',
                  isTimeSlotSelected(day-1, lesson).isSelected ? 'bg-blue-100 border-blue-500' : '',
                  isTimeSlotSelected(day-1, lesson).isCurrent ? 'bg-red-100 border-red-500' : ''
                ]"
              >
                <template v-if="isTimeSlotSelected(day-1, lesson).isSelected">
                  {{ getSelectedClassName() }}
                </template>
                <template v-else-if="isTimeSlotSelected(day-1, lesson).isCurrent">
                  Đã đăng ký
                </template>
              </div>
            </template>
          </div>
        </div>
        <div class="mt-4 flex gap-4">
          <div class="flex items-center">
            <div class="w-4 h-4 bg-blue-100 border border-blue-500 mr-2"></div>
            <span class="text-xs">Lớp đang chọn</span>
          </div>
          <div class="flex items-center">
            <div class="w-4 h-4 bg-red-100 border border-red-500 mr-2"></div>
            <span class="text-xs">Lớp đã đăng ký</span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-light" @click="() => visibleCollectionModal = false">Hủy</button>
    </template>
  </CommonModal>
  <CommonModal
      :visible="visibleUnregisterCourseModal"
      title="Xác nhận thao tác"
      body="Bạn có chắc chắn muốn hủy đăng ký lớp học phần này?"
      @close="() => visibleUnregisterCourseModal = false"
      @clickOutside="() => visibleUnregisterCourseModal = false">
    <template #header>
      <h2 class="text-xl font-bold text-red-500">Xác nhận hủy</h2>
    </template>
    <template #footer>
      <button class="btn btn-light" @click="() => visibleUnregisterCourseModal = false">Hủy</button>
      <button class="btn btn-danger" @click="unregisterCourse">Xóa</button>
    </template>
  </CommonModal>
</template>

<style scoped lang="scss">
.timetable-container {
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}

.menu-icon {
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
}

input[type="radio"]:disabled + label {
  opacity: 0.6;
  cursor: not-allowed;
}

.timetable-registered {
  overflow-x: auto;

  .grid-cols-8 {
    grid-template-columns: 50px repeat(7, 1fr);
  }

  .relative {
    min-height: 60px;
  }

  .absolute {
    z-index: 1;
    overflow: hidden;
  }
}

/* Giữ nguyên các style hiện có */
.timetable-container {
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}

.menu-icon {
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
}

input[type="radio"]:disabled + label {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>