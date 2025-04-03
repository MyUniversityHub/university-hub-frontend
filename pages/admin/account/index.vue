<script setup lang="ts">
import {useUserStore} from "~/stores/userStore";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
import {useNuxtApp} from "#app";
import {useFormData} from "~/composables/useFormData";
import {useFormValidation} from "~/composables/useFormValidation";

let userStore = useUserStore();

const defaultFormCreate = {
  id: 0,
  name: '',
  user_name: '',
  email: '',
};

const changePassword = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});

const visibleUpdateInfoModal = ref(false);
const visibleUpdatePasswordModal = ref(false);

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate)
const {handleInvalidSubmit} = useFormValidation();

const handleCloseFormUpdate = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  visibleUpdateInfoModal.value = false;
};

const handleUpdate = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/update-profile`, {...formData});
      useNuxtApp().$toast.success(response.message);
      Object.assign(userStore, response.data);
      resetForm();
      visibleUpdateInfoModal.value = false;
    } catch (e) {
      console.error("Error updating profile:", e);
    }
  }
};

const showFormUpdate = (data: any) => {
  Object.assign(
      formData,
      Object.fromEntries(
          Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
      )
  );
  visibleUpdateInfoModal.value = true;
}

const onSubmitChangePassword = async () => {
  if(changePassword.value.new_password !== changePassword.value.new_password_confirmation) {
    useNuxtApp().$toast.warning('Mật khẩu mới nhập lại không trùng khớp');
    return;
  }
  const response = await apiClient.put(
      '/admin/change-password',
      {
        current_password: changePassword.value.current_password,
        new_password: changePassword.value.new_password,
        new_password_confirmation: changePassword.value.new_password_confirmation,
      }
  );
  if (response && response.status) {
    useNuxtApp().$toast.success('Đổi mật khẩu thành công');
    visibleUpdatePasswordModal.value = false;
    changePassword.value.current_password = '';
    changePassword.value.new_password = '';
    changePassword.value.new_password_confirmation = '';
  } else {
    useNuxtApp().$toast.error('Đổi mật khẩu thất bại');
  }
};
</script>

<template>
  <Card title="Thông tin tài khoản" :isAction="false">
    <div class="flex gap-5">
      <div class="flex-1 shadow-md py-5 px-10 rounded-[9px]">
        <div class="mb-6">
          <i class="fa-solid fa-pen-to-square text-lg text-blue-600 float-end cursor-pointer" @click="showFormUpdate(userStore)"></i>
        </div>
        <div class="mb-6">
          <label for="default-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên người dùng</label>
          <input type="text" id="disabled-input" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" :value="userStore.name" disabled>
        </div>
        <div class="mb-6">
          <label for="default-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tên tài khoản</label>
          <input type="text" id="disabled-input" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" :value="userStore.user_name" disabled>
        </div>
        <div class="mb-6">
          <label for="default-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
          <input type="text" id="disabled-input" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" :value="userStore.email" disabled>
        </div>
      </div>
      <div class="flex-1 shadow-md py-5 px-10 rounded-[9px]">
        <div class="mb-6">
          <i class="fa-solid fa-pen-to-square text-lg text-blue-600 float-end cursor-pointer" @click="visibleUpdatePasswordModal = true"></i>
        </div>
        <div class="mb-6">
          <label for="default-input" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Mật khẩu</label>
          <input type="text" id="disabled-input" aria-label="disabled input" class="mb-6 bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" value="*****************" disabled>
        </div>
      </div>
    </div>
  </Card>
  <CommonModal
      :visible="visibleUpdateInfoModal"
      title="Tạo mới"
      width="800px"
      @close="handleCloseFormUpdate"
      @clickOutside="handleCloseFormUpdate"
      @confirm="handleUpdate"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">Cập nhật thông tin tài khoản</h2>
    </template>
    <VeeForm @submit="formData.id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="name"
          name="name"
          label="Tên người dùng"
          placeholder="Nhập tên người dùng"
          v-model="formData.name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|max:20|only_letters"
      />
      <InputField
          id="userName"
          name="userName"
          label="Tên tài khoản"
          placeholder="Nhập tên tài khoản"
          v-model="formData.user_name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|max:120"
      />
      <InputField
          id="email"
          name="email"
          label="Email"
          placeholder="Nhập email"
          v-model="formData.email"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|email|max:120"
      />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormUpdate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">Cập nhật</button>
    </template>
  </CommonModal>
  <CommonModal
      :visible="visibleUpdatePasswordModal"
      title="Tạo mới"
      width="800px"
      @close="visibleUpdatePasswordModal = false"
      @clickOutside="visibleUpdatePasswordModal = false"
      @confirm="onSubmitChangePassword"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">Cập nhật mật khẩu</h2>
    </template>
    <VeeForm @submit="onSubmitChangePassword" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="currentPass"
          name="currentPass"
          input-type="password"
          label="Mật khẩu hiện tại"
          rules="required|no_emojis|max:120"
          placeholder="Nhập mật khẩu hiện tại"
          :required="true"
          v-model="changePassword.current_password"
          labelClass="w-[200px]"
          inputClass="flex-1"
      />
      <InputField
          id="newPass1"
          name="newPass1"
          input-type="password"
          label="Mật khẩu mới"
          rules="required|no_emojis|max:120"
          placeholder="Nhập mật khẩu mới"
          :required="true"
          v-model="changePassword.new_password"
          labelClass="w-[200px]"
          inputClass="flex-1"
      />
      <InputField
        id="newPass2"
        name="newPass2"
        input-type="password"
        label="Nhập lại mật khẩu mới"
        rules="required|no_emojis|max:120"
        placeholder="Nhập lại mật khẩu mới"
        :required="true"
        v-model="changePassword.new_password_confirmation"
        labelClass="w-[200px]"
        inputClass="flex-1"
    />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="visibleUpdatePasswordModal = false">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">Cập nhật</button>
    </template>
  </CommonModal>
</template>

<style scoped lang="scss">

</style>