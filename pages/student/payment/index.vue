<script setup>
import QRCodeGenerator from '~/components/QRCodeGenerator.vue'
import {useFormData} from "~/composables/useFormData.js";
import {useUserStore} from "~/stores/userStore.js";

const defaultFormCreate = {
  student_id: '',
  user_id: '',
  student_code: '',
  avatar: '',
  phone_number: '',
  admission_year: '',
  address: '',
  birth_date: '',
  course_fee_debt: '',
  wallet_balance: '',
  class_id: '',
  gender: '',
  name: '',
  email: '',
};

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);

const userStore = useUserStore();
const fetchInfo = async () => {
  try {
    const response = await apiClient.get(`/student/info`);
    if (response && response.status) {
      const data = response.data;
      Object.assign(
          formData,
          Object.fromEntries(
              Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
          )
      );
    }
  } catch (e) {
    console.error("Error fetching info:", e);
  }
};

onMounted(() => {
  fetchInfo();
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Nạp tiền vào tài khoản</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <QRCodeGenerator />
      </div>

      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 bg-gradient-to-r from-green-500 to-emerald-600">
          <h3 class="text-xl font-bold text-white">Thông tin tài khoản</h3>
          <p class="text-green-100 mt-1">Kỳ học: HK1 2023-2024</p>
        </div>

        <div class="p-6">
          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-600">Số dư tài khoản:</span>
              <span class="font-medium">{{formatCurrency(formData.wallet_balance)}}</span>
            </div>
<!--            <div class="flex justify-between items-center py-2 border-b border-gray-200">-->
<!--              <span class="text-gray-600">Đã thanh toán:</span>-->
<!--              <span class="font-medium text-green-600">5,000,000 VND</span>-->
<!--            </div>-->
            <div class="flex justify-between items-center py-2 border-b border-gray-200">
              <span class="text-gray-600">Số tiền nợ:</span>
              <span class="font-medium text-red-600">{{formatCurrency(formData.course_fee_debt)}}</span>
            </div>
<!--            <div class="flex justify-between items-center py-2 border-b border-gray-200">-->
<!--              <span class="text-gray-600">Hạn nộp:</span>-->
<!--              <span class="font-medium">30/12/2023</span>-->
<!--            </div>-->
          </div>

<!--          <div class="mt-6">-->
<!--            <h4 class="text-sm font-medium text-gray-700 mb-2">Lịch sử thanh toán</h4>-->
<!--            <div class="space-y-3">-->
<!--              <div class="bg-gray-50 rounded-md p-3 text-sm">-->
<!--                <div class="flex justify-between items-center">-->
<!--                  <span class="font-medium">Đợt 1</span>-->
<!--                  <span class="text-green-600">5,000,000 VND</span>-->
<!--                </div>-->
<!--                <div class="text-gray-500 mt-1">-->
<!--                  <span>Ngày: 15/09/2023</span>-->
<!--                  <span class="mx-2">•</span>-->
<!--                  <span>Mã GD: VNP12345678</span>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <div class="mt-6 text-sm text-gray-500">
            <p>Mọi thắc mắc về học phí vui lòng liên hệ Phòng Kế hoạch - Tài chính.</p>
            <p class="mt-1">Điện thoại: (028) 3838-3838</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
