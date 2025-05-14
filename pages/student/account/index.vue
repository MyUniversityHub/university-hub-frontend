<script setup lang="ts">
import InputImg from "~/components/atoms/InputImg.vue";
import InputField from "~/components/atoms/InputField.vue";
import { ref, onMounted } from "vue";
import { useFormData } from "~/composables/useFormData";
import { useUserStore } from "~/stores/userStore";
import {useNuxtApp} from "#app";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";

const userStore = useUserStore();

const defaultFormCreate = {
  student_id: '',
  user_id: '',
  student_code: '',
  avatar: '',
  phone_number: '',
  admission_year: '',
  address: '',
  birth_date: '',
  class_id: '',
  gender: 'male',
  name: '',
  email: '',
};

const changePassword = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);
const visibleChangePassModal = ref(false);

const handleCloseFormChangePass = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  visibleChangePassModal.value = false;
};

const handleChangePass = async () => {
  if(changePassword.value.new_password !== changePassword.value.new_password_confirmation) {
    useNuxtApp().$toast.warning('Mật khẩu mới nhập lại không trùng khớp');
    return;
  }
  const response = await apiClient.put(
      '/change-password',
      {
        current_password: changePassword.value.current_password,
        new_password: changePassword.value.new_password,
        new_password_confirmation: changePassword.value.new_password_confirmation,
      }
  );
  if (response && response.status) {
    useNuxtApp().$toast.success('Đổi mật khẩu thành công');
    visibleChangePassModal.value = false;
    changePassword.value.current_password = '';
    changePassword.value.new_password = '';
    changePassword.value.new_password_confirmation = '';
  } else {
    useNuxtApp().$toast.error('Đổi mật khẩu thất bại');
  }
};

const fetchStudentData = async () => {
  try {
    const response = await apiClient.get(`/student/${userStore.id}`);
    if(response && response.status) {
      const data = response.data;
      Object.assign(
          formData,
          Object.fromEntries(
              Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
          )
      );
    }
  } catch (error) {
    console.error("Failed to fetch student data:", error);
  }
};

onMounted(() => {
  fetchStudentData(); // Fetch data when the component is mounted
});

const handleSubmitForm = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/student/${formData.student_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      Object.assign(formData, response.data);
    } catch (e) {
      console.error("Error updating student:", e);
    }
  }
};
</script>

<template>
  <div>
    <button type="submit" class="btn btn-primary float-right" @click="visibleChangePassModal = true;">Thay đổi mật khẩu</button>
  </div>
  <VeeForm @submit="handleSubmitForm" id="triggerFormUpdate" class="text-2sm">
    <!-- Avatar -->
    <InputImg
      id="avatar"
      imgPreviewClass="w-[150px] h-[200px]"
      labelClass="w-[200px]"
      inputClass="flex-1"
      rules=""
      name="avatar"
      v-model="formData.avatar"
    />

    <!-- Student Code -->
    <InputField
      id="student_code"
      name="student_code"
      label="Mã sinh viên"
      v-model="formData.student_code"
      labelClass="w-[200px]"
      inputClass="flex-1"
      :disabled="true"
    />

    <!-- Name -->
    <InputField
      id="name"
      name="name"
      label="Tên sinh viên"
      v-model="formData.name"
      labelClass="w-[200px]"
      inputClass="flex-1"
      :disabled="true"
    />

    <!-- Email -->
    <InputField
      id="email"
      name="email"
      label="Email"
      v-model="formData.email"
      labelClass="w-[200px]"
      inputClass="flex-1"
      :disabled="true"
    />

    <!-- Năm nhập học -->
    <InputField
        id="admissionYear"
        name="admissionYear"
        label="Năm nhập học"
        v-model="formData.admission_year"
        labelClass="w-[200px]"
        inputClass="flex-1"
        :disabled="true"
    />

    <!-- Phone Number -->
    <InputField
      id="phone_number"
      name="phone_number"
      label="Số điện thoại"
      v-model="formData.phone_number"
      placeholder="Nhập số điện thoại"
      labelClass="w-[200px]"
      inputClass="flex-1"
    />

    <!-- Address -->
    <InputField
      id="address"
      name="address"
      label="Địa chỉ"
      v-model="formData.address"
      placeholder="Nhập địa chỉ"
      labelClass="w-[200px]"
      inputClass="flex-1"
    />

    <!-- Birth Date -->
    <InputField
      id="birth_date"
      name="birth_date"
      label="Ngày sinh"
      v-model="formData.birth_date"
      placeholder="Nhập ngày sinh"
      labelClass="w-[200px]"
      inputClass="flex-1"
      inputType="date"
    />

    <!-- Gender -->
    <InputField
      id="gender"
      name="gender"
      label="Giới tính"
      v-model="formData.gender"
      labelClass="w-[200px]"
      placeholder="Chọn giới tính"
      inputClass="flex-1"
      inputType="dropdown"
      :dataOptions="[
        { value: '0', label: 'Nam' },
        { value: '1', label: 'Nữ' },
        { value: '2', label: 'Khác' }
      ]"
    />

    <div class="mt-4 text-right">
      <button type="submit" class="btn btn-primary ml-auto">Cập nhật</button>
    </div>
  </VeeForm>
  <CommonModal
      :visible="visibleChangePassModal"
      title="Tạo mới"
      width="800px"
      @close="handleCloseFormChangePass"
      @clickOutside="handleCloseFormChangePass"
      @confirm="handleChangePass"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">Cập nhật mật khẩu</h2>
    </template>
    <VeeForm @submit="handleChangePass" id="triggerFormCreateUpdate">
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
      <button class="btn btn-light" @click="visibleChangePassModal = false">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">Cập nhật</button>
    </template>
  </CommonModal>
</template>

<style lang="scss">
/* Style for disabled InputField */
input:disabled {
  color: #4a5568 !important; /* Darker text color for better visibility */
  background-color: rgb(249 250 251) !important;
  border-color: #cbd5e0; /* Subtle border color */
  cursor: not-allowed; /* Show not-allowed cursor */
  opacity: 1; /* Ensure full opacity for better readability */
}
</style>