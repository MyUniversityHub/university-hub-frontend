<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from "#app";
import { formatDate } from "../../../utils/formatDate";

const stats = ref<any>({});
const notifications = ref<any[]>([]);
const todayEvents = ref<any[]>([]);
const chartData = ref<any>({ labels: [], data: [] });

// Cập nhật các trường thống kê mới
const cards = [
  { key: 'total_students', title: 'Sinh viên' },
  { key: 'total_teachers', title: 'Giảng viên' },
  { key: 'total_departments', title: 'Khoa/Phòng' },
  { key: 'total_majors', title: 'Ngành học' },
  { key: 'total_classes', title: 'Lớp' },
  { key: 'total_courses', title: 'Môn học' },
  { key: 'total_course_classes', title: 'Lớp học phần đang mở' },
  { key: 'total_classrooms', title: 'Phòng học' },
];

const fetchStats = async () => {
  try {
    // Truyền name qua body (POST)
    const res = await apiClient.get('/admin/statistics');
    if (res && res.status) {
      // Giả sử API trả về dạng { statistics: [{name: ..., value: ...}, ...], majors_list: [...] }
      if (Array.isArray(res.data)) {
        // Chuyển mảng statistics thành object {key: value}
        stats.value = res.data.reduce((acc: any, item: any) => {
          acc[item.name] = item.value;
          return acc;
        }, {});
      } else {
        stats.value = {};
      }
      // Dữ liệu cho chart (ví dụ: số SV theo ngành)
      if (Array.isArray(res.data.majors_list)) {
        chartData.value.labels = res.data.majors_list.map((m: any) => m.name);
        chartData.value.data = res.data.majors_list.map((m: any) => m.students_count);
      }
      console.log(stats.value);
    }
  } catch (e) {
    stats.value = {};
  }
};

const fetchNotifications = async () => {
  try {
    const res = await apiClient.get(`/notifications`);
    if (res && res.status) {
      notifications.value = res.data;
    }
  } catch (e) {
    notifications.value = [];
  }
};

// const fetchTodayEvents = async () => {
//   try {
//     const today = new Date();
//     const params = {
//       start_date: today.toISOString().split('T')[0],
//       end_date: today.toISOString().split('T')[0]
//     };
//     const res = await apiClient.post('/admin/events', { ...params, name: 'today' });
//     if (res && res.status) {
//       todayEvents.value = res.data;
//     }
//   } catch (e) {
//     todayEvents.value = [];
//   }
// };

const renderChart = () => {
  if (!window.Chart) return;
  const ctx = document.getElementById('adminMajorChart');
  if (!ctx) return;
  new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.value.labels.length ? chartData.value.labels : ['CNTT', 'Kinh tế', 'Toán'],
      datasets: [{
        label: 'Số SV',
        data: chartData.value.data.length ? chartData.value.data : [120, 80, 60],
        backgroundColor: '#409EFF'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
};

onMounted(async () => {
  await Promise.all([
    fetchStats(),
    fetchNotifications(),
    // fetchTodayEvents()
  ]);
  setTimeout(renderChart, 300); // Đợi DOM render xong
});
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div v-for="item in cards" :key="item.key" class="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
        <div class="text-3xl font-bold text-blue-600">{{ stats[item.key] ?? '-' }}</div>
        <div class="text-gray-700 mt-2">{{ item.title }}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="font-semibold text-lg mb-3">Thông báo mới</h2>
        <div v-if="notifications.length === 0" class="text-gray-400">Không có thông báo mới</div>
        <ul v-else>
          <li v-for="noti in notifications.slice(0, 4)" :key="noti.id" class="mb-2">
            <div class="font-medium">{{ noti.title }}</div>
            <div class="text-xs text-gray-400">{{ formatDate(noti.created_at) }}</div>
          </li>
        </ul>
      </div>
    </div>
    <div class="bg-white rounded-lg shadow p-4">
      <h2 class="font-semibold text-lg mb-3">Sự kiện hôm nay</h2>
      <div v-if="todayEvents.length === 0" class="text-gray-400">Không có sự kiện hôm nay</div>
      <ul v-else>
        <li v-for="event in todayEvents" :key="event.id" class="mb-2">
          <div class="font-medium">{{ event.title }}</div>
          <div class="text-xs text-gray-400">{{ formatDate(event.date) }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Có thể bổ sung style tùy ý */
</style>
