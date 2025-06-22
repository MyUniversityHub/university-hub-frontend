<script setup lang="ts">
import {useRouter} from 'vue-router';
import {useUserStore} from "~/stores/userStore";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
import {ref} from "vue";

const router = useRouter();
const visibleUpdateModal = ref(false);
const notifications = ref<any[]>([]);

const userStore = useUserStore();
const accountPath = computed(() => {
  const role = userStore.roleName.toLowerCase();
  return `/${role}/account`;
});

const handleCloseFormCreate = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  visibleCreateModal.value = false;
};

async function logout() {
  try {
    await apiClient.post('/logout');
  } catch (error: any) {
    console.error(error);
  } finally {
    useCookie('auth_token').value = null;
    useCookie('token_type').value = null;
    useCookie('refresh_token').value = null;
    localStorage.removeItem('token_expire_time');
    router.push('/login');
  }
}

const fetchNotifications = async () => {
  try {
    const response = await apiClient.get(`/notifications`);
    if(response && response.status) {
      notifications.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

onMounted(() => {
  fetchNotifications();
});

// Notification states
const hidden = ref(false);
const notificationHidden = ref(false);
// const notifications = ref([
//   { id: 1, title: 'Thông báo mới', content: 'Bạn có một tin nhắn mới', read: false, time: '10 phút trước' },
//   { id: 2, title: 'Cập nhật hệ thống', content: 'Hệ thống sẽ bảo trì vào 2h sáng', read: false, time: '1 giờ trước' },
//   { id: 3, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//   { id: 4, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//   { id: 5, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//   { id: 6, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//   { id: 7, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//   { id: 8, title: 'Hoàn thành nhiệm vụ', content: 'Nhiệm vụ của bạn đã được hoàn thành', read: true, time: '2 ngày trước' },
//
// ]);

const unreadCount = computed(() => {
  return notifications.value.filter(n => n.status === 0).length;
});

const openPopup = () => {
  hidden.value = !hidden.value;
  notificationHidden.value = false; // Đóng popup thông báo nếu đang mở
};

const openNotificationPopup = async () => {
  notificationHidden.value = !notificationHidden.value;
  hidden.value = false;

  // Đánh dấu tất cả thông báo là đã đọc trên frontend
  notifications.value = notifications.value.map(n => ({
    ...n,
    status: 1
  }));

  try {
    await apiClient.put('/notifications/read');
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};
</script>

<template>
  <!-- Header -->
  <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start rtl:justify-end">
          <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
            <span class="sr-only">Open sidebar</span>
            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path clip-rule="evenodd" fill-rule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
          </button>
          <a href="https://flowbite.com" class="flex ms-2 md:me-24">
            <img src="https://flowbite.com/docs/images/logo.svg" class="h-8 me-3" alt="FlowBite Logo" />
            <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">Flowbite</span>
          </a>
        </div>
        <div class="flex items-center gap-4">
          <!-- Notification Bell -->
          <div class="relative">
            <button @click="openNotificationPopup" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              <span v-if="unreadCount > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                {{ unreadCount }}
              </span>
            </button>

            <!-- Notification Dropdown -->
            <div v-if="notificationHidden" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg dark:bg-gray-700 z-50">
              <div class="p-3 border-b border-gray-200 dark:border-gray-600">
                <h3 class="font-medium text-gray-900 dark:text-white">Thông báo</h3>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div v-for="notification in notifications" :key="notification.id"
                     class="p-3 border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                     :class="{ 'bg-gray-50 dark:bg-gray-600': !notification.status }">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-medium text-gray-900 dark:text-white">{{ notification.title }}</h4>
                      <p class="text-sm text-gray-500 dark:text-gray-300">{{ notification.message }}</p>
                    </div>
                    <span class="text-xs text-gray-400">{{ notification.time }}</span>
                  </div>
                </div>
                <div v-if="notifications.length === 0" class="p-3 text-center text-gray-500 dark:text-gray-300">
                  Không có thông báo mới
                </div>
              </div>
              <div class="p-3 text-center border-t border-gray-200 dark:border-gray-600">
                <a href="#" class="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">Xem tất cả</a>
              </div>
            </div>
          </div>

          <!-- User Avatar -->
          <div class="flex items-center ms-3 relative" @click="openPopup">
            <div>
              <button type="button" class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                <span class="sr-only">Open user menu</span>
                <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo">
              </button>
            </div>
            <div v-if="hidden" class="absolute right-0 top-[20px] my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-sm shadow-sm dark:bg-gray-700 dark:divide-gray-600" id="dropdown-user" style="z-index: 100;">
              <div class="px-4 py-3" role="none">
                <p class="text-sm text-gray-900 dark:text-white" role="none">
                  {{ userStore.name }}
                </p>
                <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">
                  {{ userStore.email }}
                </p>
              </div>
              <ul class="py-1" role="none">
                <li>
                  <NuxtLink :to="accountPath" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Tài khoản</NuxtLink>
                </li>
                <li @click="logout">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white" role="menuitem">Đăng xuất</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>

</template>