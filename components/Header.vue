<script setup lang="ts">
import {useRouter} from 'vue-router';
import {useUserStore} from "~/stores/userStore";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";

const router = useRouter();
const visibleUpdateModal = ref(false);

const userStore = useUserStore();
const accountPath = computed(() => {
  const role = userStore.roleName.toLowerCase(); // Get the role and convert it to lowercase
  return `/${role}/account`; // Construct the path dynamically
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
    // Gửi yêu cầu logout tới server
    await apiClient.post('/logout');
  } catch (error: any) {
    // Xử lý lỗi
    console.error(error);
  } finally {
    // Xóa token và token_type khỏi cookie
    useCookie('auth_token').value = null;
    useCookie('token_type').value = null;
    useCookie('refresh_token').value = null;
    // Xóa thời gian hết hạn token khỏi localStorage
    localStorage.removeItem('token_expire_time');
    router.push('/login');
  }
}

const hidden = ref(false);

const openPopup = () => {
  hidden.value = !hidden.value;
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
        <div class="flex items-center">
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
  <!-- End Header -->
  <CommonModal
      :visible="visibleUpdateModal"
      title="Thay đổi mật khẩu"
      width="800px"
      @close="handleCloseFormCreate"
      @clickOutside="handleCloseFormCreate"
      @confirm="formData.id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.id ? 'Cập nhật' : 'Thêm mới'}} khoa</h2>
    </template>
    <VeeForm @submit="formData.id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="code"
          name="code"
          label="Mã khoa"
          placeholder="Nhập mã khoa"
          v-model="formData.code"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|max:20|latin_numbers_only"
      />
      <InputField
          id="name"
          name="name"
          label="Tên khoa"
          placeholder="Nhập tên khoa"
          v-model="formData.name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|only_letters|max:120"
      />
      <InputField
          id="description"
          name="description"
          input-type="textarea"
          label="Mô tả"
          placeholder="Nhập mô tả"
          v-model="formData.description"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|no_emojis"
      />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.id ? 'Cập nhật' : 'Thêm mới'}}</button>
    </template>
  </CommonModal>
</template>
