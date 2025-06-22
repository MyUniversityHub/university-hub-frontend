<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {useCommonList} from "~/composables/useCommonList";

// Dữ liệu mẫu, thay bằng API thực tế khi có
const teacherName = ref('TS. Nguyễn Văn B')
const currentSemester = ref('Học kỳ 2 - 2024')
const teachingClasses = ref(4)
const totalStudents = ref(120)
const todaySchedule = ref([]) // Sẽ cập nhật từ API
const notifications = ref([
  { id: 1, title: 'Nộp điểm giữa kỳ trước 10/6', date: '2024-06-01' },
  { id: 2, title: 'Họp hội đồng khoa', date: '2024-05-28' }
])

const {
  dataList,
  totalRecords,
  currentPage,
  perPage,
  fetchData
} = useCommonList("/teacher/course-classes");

const fetchTeacherData = async () => {
  try {
    const response = await apiClient.get(`/teacher/info`);
    if(response && response.status) {
      const data = response.data;
      teacherName.value = data.name;
    }
  } catch (error) {
    console.error("Failed to fetch teacher data:", error);
  }
};

const fetchCourseClassByTeacher = async (courseClassId: number) => {
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

// Hàm lấy lịch dạy hôm nay từ API
const fetchTodaySchedule = async () => {
  try {
    // Lấy ngày hôm nay theo định dạng yyyy-mm-dd
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    // Gọi API lấy lịch dạy trong ngày
    const response = await apiClient.get('/teacher/teaching-schedule', {
      params: {
        start_date: todayStr,
        end_date: todayStr
      }
    });
    const data = Array.isArray(response.data) ? response.data : [];
    // Chuyển đổi dữ liệu thành dạng hiển thị
    todaySchedule.value = data.map(item => {
      // Xác định tiết bắt đầu/kết thúc
      const tietBatDau = item.lesson_start;
      const tietKetThuc = item.lesson_end;
      return {
        course: item.course_name,
        room: item.room_name,
        classCode: item.course_class_code,
        time: `Tiết ${tietBatDau} - Tiết ${tietKetThuc}`
      }
    });
  } catch (e) {
    todaySchedule.value = [];
  }
};

onMounted(async () => {
  await fetchTeacherData();
  await fetchTodaySchedule();
})
</script>

<template>
  <div class="p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Chào mừng, {{ teacherName }}</h1>
      <!--      <div class="text-gray-500">{{ currentSemester }}</div>-->
    </div>
    <div class="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-blue-600">{{ totalRecords }}</div>
        <div class="text-gray-700 mt-2">Lớp đang dạy</div>
      </div>
<!--      <div class="bg-green-50 rounded-lg p-4 flex flex-col items-center">-->
<!--        <div class="text-3xl font-bold text-green-600">{{ totalStudents }}</div>-->
<!--        <div class="text-gray-700 mt-2">Tổng sinh viên</div>-->
<!--      </div>-->
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Lịch dạy hôm nay</h2>
        <div v-if="todaySchedule.length === 0" class="text-gray-400">Không có lịch dạy hôm nay</div>
        <ul v-else>
          <li v-for="item in todaySchedule" :key="item.classCode" class="mb-2">
            <div class="font-medium">{{ item.course }}</div>
            <div class="text-sm text-gray-500">{{ item.time }} | Phòng: {{ item.room }} | Mã lớp: {{ item.classCode }}</div>
          </li>
        </ul>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Thông báo mới</h2>
        <div v-if="notifications.length === 0" class="text-gray-400">Không có thông báo mới</div>
        <ul v-else>
          <li v-for="noti in notifications" :key="noti.id" class="mb-2">
            <div class="font-medium">{{ noti.title }}</div>
            <div class="text-xs text-gray-400">{{ noti.date }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Có thể bổ sung style tùy ý */
</style>
