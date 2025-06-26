<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {useNuxtApp} from "#app";
import {formatDate} from "../../../utils/formatDate";

// Dữ liệu mẫu, thay bằng API thực tế khi có
const userInfo = ref<any>({});
const currentYear = ref(new Date().getFullYear());
const notifications = ref<any[]>([]);
const enrolledCourses = ref<number>(0);
const averageGpa = ref<number>(0);
const todaySchedule = ref([
  { time: '07:00 - 09:00', subject: 'Toán cao cấp', room: 'A101', teacher: 'TS. Trần Văn B' },
  { time: '09:15 - 11:15', subject: 'Lập trình C++', room: 'B202', teacher: 'ThS. Nguyễn Thị C' }
])
// const notifications = ref([
//   { id: 1, title: 'Thông báo lịch thi cuối kỳ', date: '2024-06-01' },
//   { id: 2, title: 'Cập nhật quy chế học vụ mới', date: '2024-05-28' }
// ])
const progress = ref([
  { label: 'Tín chỉ đã tích lũy', value: 0, max: 0 },
  { label: 'Tín chỉ đang học', value: 0, max: 30 }
])
const events = ref([
  { id: 1, title: 'Hạn đăng ký học phần', date: '2024-06-10' },
  { id: 2, title: 'Bắt đầu thi cuối kỳ', date: '2024-06-20' }
])

const fetchUserInfo = async () => {
  try {
    const response = await apiClient.get('/student/info');
    if (response && response.status) {
      userInfo.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching user info:", e);
    useNuxtApp().$toast.error("Lỗi khi tải thông tin sinh viên");
  }
};

const fetchNotifications = async () => {
  try {
    const response = await apiClient.get(`/notifications`);
    if (response && response.status) {
      notifications.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching notifications:", e);
    useNuxtApp().$toast.error("Lỗi khi tải thông báo");
  }
};

const fetchCoursesResultsByStudying = async () => {
  try {
    const response = await apiClient.get('/student/course-results/1/status');
    if (response && response.status) {
      enrolledCourses.value = response.data.length;
      const totalCredits = response.data.reduce((sum: number, course: any) => sum + (course.credit_hours || 0), 0);
      progress.value[1].value = totalCredits;
    }
  } catch (e) {
    console.error("Error fetching enrolled courses:", e);
  }
};

const fetchCoursesResultsByCompleted  = async () => {
  try {
    const response = await apiClient.get('/student/course-results/2/status');
    if (response && response.status) {
      const totalCredits = response.data.reduce((sum: number, course: any) => sum + (course.credit_hours || 0), 0);
      progress.value[0].value = totalCredits;
    }
  } catch (e) {
    console.error("Error fetching enrolled courses:", e);
  }
};


const fetchCurriculumPrograms = async () => {
  try {
    const response = await apiClient.get(`/student/curriculum-programs/major/${userInfo.value.major_id}`);
    if (response && response.status) {
      const totalCredits = response.data.reduce((sum: number, course: any) => sum + (course.credit_hours || 0), 0);
      progress.value[0].max = totalCredits;
    }
  } catch (e) {
    console.error("Error fetching enrolled courses:", e);
  }
};

const fetchAvarageScore = async () => {
  try {
    const response = await apiClient.get('/student/average-score');
    if (response && response.status) {
      averageGpa.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching average score:", e);
  }
};

// Add this function to get today's schedule
const fetchTodaySchedule = async () => {
  try {
    // Get today's date
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // Format date for API
    const formatDateForMySQL = (date) => {
      return date.toISOString().split('T')[0];
    };

    const params = {
      start_date: formatDateForMySQL(today),
      end_date: formatDateForMySQL(today)
    };

    // Call API with today's date
    const response = await apiClient.get('/student/class-schedule', {
      params: params
    });

    // Transform data for display
    if (Array.isArray(response.data) && response.data.length > 0) {
      todaySchedule.value = response.data.map(item => ({
        subject: item.course_name,
        room: item.room_name,
        teacher: item.teacher_name,
        // Format lesson periods instead of time
        time: `Tiết ${item.lesson_start} - Tiết ${item.lesson_end}`
      }));
    } else {
      todaySchedule.value = [];
    }
  } catch (error) {
    console.error('Error fetching today schedule:', error);
    todaySchedule.value = [];
  }
};

onMounted(async () => {
  await Promise.all([
    fetchUserInfo(),
    fetchNotifications(),
    fetchCoursesResultsByStudying(),
    fetchCoursesResultsByCompleted(),
    fetchAvarageScore(),
    fetchTodaySchedule() // Add this new function
  ]);
  await fetchCurriculumPrograms();
})
</script>

<template>
  <div class="p-4">
    <div class="mb-6">
      <h1 class="text-2xl font-bold">Chào mừng, {{ userInfo.name }}</h1>
      <div class="text-gray-500">Học kỳ {{ userInfo.current_semester }} - {{ currentYear }}</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-blue-600">{{ enrolledCourses }}</div>
        <div class="text-gray-700 mt-2">Môn đang học</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-green-600">{{ averageGpa }}</div>
        <div class="text-gray-700 mt-2">Điểm trung bình</div>
      </div>
      <div class="bg-green-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-green-600">{{ progress[0].value }}/{{ progress[0].max }}</div>
        <div class="text-gray-700 mt-2">{{ progress[0].label }}</div>
      </div>
      <div class="bg-purple-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-purple-600">{{ progress[1].value }}/{{ progress[1].max }}</div>
        <div class="text-gray-700 mt-2">{{ progress[1].label }}</div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Lịch học hôm nay</h2>
        <div v-if="todaySchedule.length === 0" class="text-gray-400">Không có lịch học hôm nay</div>
        <ul v-else>
          <li v-for="item in todaySchedule" :key="item.subject" class="mb-2">
            <div class="font-medium">{{ item.subject }}</div>
            <div class="text-sm text-gray-500">{{ item.time }} | Phòng: {{ item.room }} | GV: {{ item.teacher }}</div>
          </li>
        </ul>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Thông báo mới</h2>
        <div v-if="notifications.length === 0" class="text-gray-400">Không có thông báo mới</div>
        <ul v-else>
          <li v-for="noti in notifications.slice(0, 2)" :key="noti.id" class="mb-2">
            <div class="font-medium">{{ noti.title }}</div>
            <div class="text-xs text-gray-400">{{ formatDate(noti.created_at) }}</div>
          </li>
        </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Tiến độ học tập</h2>
        <div v-for="item in progress" :key="item.label" class="mb-4">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ item.label }}</span>
            <span>{{ item.value }}/{{ item.max }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-blue-500 h-2.5 rounded-full" :style="{ width: (item.value/item.max*100)+'%' }"></div>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Sự kiện sắp tới</h2>
        <div v-if="events.length === 0" class="text-gray-400">Không có sự kiện</div>
        <ul v-else>
          <li v-for="event in events" :key="event.id" class="mb-2">
            <div class="font-medium">{{ event.title }}</div>
            <div class="text-xs text-gray-400">{{ event.date }}</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Có thể bổ sung style tùy ý */
</style>
