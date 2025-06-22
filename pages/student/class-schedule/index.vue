<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const weekdays = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Dữ liệu từ API
const scheduleData = ref([]);
const isLoading = ref(true);
const currentWeekOffset = ref(0); // 0 = tuần hiện tại, 1 = tuần sau, -1 = tuần trước

// Lấy ngày bắt đầu và kết thúc của tuần
const getWeekRange = (offset = 0) => {
  const now = new Date();
  now.setDate(now.getDate() + offset * 7);
  const dayOfWeek = now.getDay() || 7; // Chủ nhật = 7
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (dayOfWeek - 1)); // Thứ 2

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6); // Chủ nhật

  return { startDate, endDate };
};

// Hiển thị phạm vi tuần
const currentWeekRange = computed(() => {
  const { startDate, endDate } = getWeekRange(currentWeekOffset.value);
  return {
    start: formatDate(startDate),
    end: formatDate(endDate)
  };
});

// Định dạng ngày
const formatDate = (date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Chuyển đổi giữa các tuần
const changeWeek = async (offset) => {
  currentWeekOffset.value += offset;
  await fetchScheduleData();
};

// Kiểm tra xem lớp học có trong tuần hiện tại không
const isClassInCurrentWeek = (classItem) => {
  if (!classItem.start_date || !classItem.end_date) return true;

  const { startDate, endDate } = getWeekRange(currentWeekOffset.value);
  const classStart = new Date(classItem.start_date);
  const classEnd = new Date(classItem.end_date);

  return classStart <= endDate && classEnd >= startDate;
};

// Hàm fetch dữ liệu từ API
const fetchScheduleData = async () => {
  try {
    // Lấy phạm vi ngày của tuần hiện tại
    const { startDate, endDate } = getWeekRange(currentWeekOffset.value);

    // Format ngày theo chuẩn MySQL (YYYY-MM-DD)
    const formatDateForMySQL = (date) => {
      return date.toISOString().split('T')[0];
    };

    const params = {
      start_date: formatDateForMySQL(startDate),
      end_date: formatDateForMySQL(endDate)
    };

    // Gọi API với params
    const response = await apiClient.get('/student/class-schedule', {
      params: params
    });

    const data = await response.data;
    scheduleData.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching schedule data:', error);
    scheduleData.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Hàm để lấy nội dung ô lịch
const getCellContent = (day, period) => {
  if (isLoading.value) return null;

  // Tìm lớp học phù hợp với ngày và tiết học
  const foundClasses = scheduleData.value.filter(classItem => {
    if (!isClassInCurrentWeek(classItem)) return false;

    try {
      // Parse weekdays từ string JSON sang array
      const classWeekdays = JSON.parse(classItem.weekdays.replace(/'/g, '"'));
      // Chuyển đổi weekday từ số sang tên (ví dụ: 2 -> 'Thứ 3')
      const weekdayNames = classWeekdays.map(w => w === 8 ? 'Chủ nhật' : `Thứ ${w}`);

      return weekdayNames.includes(day) &&
          period >= classItem.lesson_start &&
          period <= classItem.lesson_end;
    } catch (e) {
      console.error('Error parsing weekdays:', e);
      return false;
    }
  });

  if (foundClasses.length === 0) return null;

  // Trả về thông tin lớp học đầu tiên tìm thấy
  const classItem = foundClasses[0];
  return {
    course_name: `${classItem.course_name}`,
    course_class_code: classItem.course_class_code,
    teacher_name: classItem.teacher_name,
    room_name: classItem.room_name,
    id: classItem.course_id || 0 // Thêm id để dùng cho màu sắc
  };
};

// Hàm tạo màu sắc
const getClassColor = (courseId) => {
  const colors = [
    'from-blue-400 to-blue-500 shadow-blue-300',
    'from-green-400 to-green-500 shadow-green-300',
    'from-purple-400 to-purple-500 shadow-purple-300',
    'from-pink-400 to-pink-500 shadow-pink-300',
    'from-yellow-400 to-yellow-500 shadow-yellow-300',
    'from-red-400 to-red-500 shadow-red-300',
    'from-indigo-400 to-indigo-500 shadow-indigo-300',
    'from-cyan-400 to-cyan-500 shadow-cyan-300',
  ];
  return colors[courseId % colors.length];
};

// Fetch data khi component mounted
onMounted(fetchScheduleData);
</script>

<template>
  <div class="schedule-container p-4 bg-white rounded-xl">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </div>

    <!-- Schedule content -->
    <div v-else>
      <!-- Week navigation -->
      <div class="flex items-center justify-between mb-6">
        <button
            @click="changeWeek(-1)"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>

        <div class="text-center">
          <div class="font-medium text-lg">
            {{ currentWeekRange.start }} - {{ currentWeekRange.end }}
          </div>
          <div class="text-sm text-gray-500">
            {{ currentWeekOffset === 0 ? 'Tuần hiện tại' : currentWeekOffset > 0 ? `${currentWeekOffset} tuần sau` : `${Math.abs(currentWeekOffset)} tuần trước` }}
          </div>
        </div>

        <button
            @click="changeWeek(1)"
            class="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- Header - Weekdays -->
      <div class="grid grid-cols-8 gap-3 mb-5">
        <div class="font-medium text-gray-400 text-center"></div>
        <div v-for="day in weekdays" :key="day" class="day-header">
          {{ day }}
        </div>
      </div>

      <!-- Schedule Body -->
      <div class="space-y-4">
        <!-- Morning Session -->
        <div>
          <div class="session-label mb-2">
            <span class="bg-blue-100 text-blue-800 font-medium rounded-lg px-3 py-1 text-sm">Buổi sáng</span>
          </div>

          <div class="space-y-2">
            <div class="grid grid-cols-8 gap-3 mb-2" v-for="period in [1, 2, 3, 4, 5, 6]" :key="`period-${period}`">
              <div class="period-cell">
                <span class="period-number">{{ period }}</span>
              </div>

              <div v-for="day in weekdays" :key="`${period}-${day}`"
                   class="lesson-cell"
                   :class="{'empty-cell': !getCellContent(day, period)}">
                <div v-if="getCellContent(day, period)"
                     class="class-card bg-gradient-to-br text-white"
                     :class="getClassColor(getCellContent(day, period).id)">
                  <div class="class-name">{{ getCellContent(day, period).course_name }}</div>
                  <div class="class-code">Mã HP: {{ getCellContent(day, period).course_class_code }}</div>
                  <div class="text-xs opacity-80">GV: {{ getCellContent(day, period).teacher_name }}</div>
                  <div class="text-xs opacity-80">Phòng: {{ getCellContent(day, period).room_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Afternoon Session -->
        <div>
          <div class="session-label mb-2 mt-6">
            <span class="bg-orange-100 text-orange-800 font-medium rounded-lg px-3 py-1 text-sm">Buổi chiều</span>
          </div>

          <div class="space-y-2">
            <div class="grid grid-cols-8 gap-3 mb-2" v-for="period in [7, 8, 9, 10, 11, 12]" :key="`period-${period}`">
              <div class="period-cell">
                <span class="period-number">{{ period }}</span>
              </div>

              <div v-for="day in weekdays" :key="`${period}-${day}`"
                   class="lesson-cell"
                   :class="{'empty-cell': !getCellContent(day, period)}">
                <div v-if="getCellContent(day, period)"
                     class="class-card bg-gradient-to-br text-white"
                     :class="getClassColor(getCellContent(day, period).id)">
                  <div class="class-name">{{ getCellContent(day, period).course_name }}</div>
                  <div class="class-code">Mã HP: {{ getCellContent(day, period).course_class_code }}</div>
                  <div class="text-xs opacity-80">GV: {{ getCellContent(day, period).teacher_name }}</div>
                  <div class="text-xs opacity-80">Phòng: {{ getCellContent(day, period).room_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Giữ nguyên các style như trước */
.schedule-container {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
}

.day-header {
  font-weight: 600;
  text-align: center;
  padding: 0.5rem;
  color: #374151;
  border-bottom: 2px solid #f3f4f6;
}

.period-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.period-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #f3f4f6;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
}

.lesson-cell {
  min-height: 80px;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.empty-cell {
  background-color: #f9fafb;
  border: 1px dashed #e5e7eb;
}

.class-card {
  height: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.class-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px -1px rgba(0, 0, 0, 0.15);
}

.class-name {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.1rem;
  line-height: 1.2;
}

.class-code {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.1rem;
}

.session-label {
  margin-left: -0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .schedule-container {
    overflow-x: auto;
  }

  .grid {
    min-width: 800px;
  }
}
</style>