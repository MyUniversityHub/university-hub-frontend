<script setup>
import { ref, computed } from 'vue'

const amount = ref(20000)
const isLoading = ref(false)
const error = ref(null)
const orderInfo = ref(null)
const payUrl = ref(null)

const formattedAmount = computed(() => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount.value)
})

const createMomoPayment = async () => {
  if (amount.value < 10000) {
    error.value = 'Số tiền tối thiểu là 10,000 VND';
    return;
  }

  try {
    error.value = null;
    isLoading.value = true;
    payUrl.value = null;

    const response = await apiClient.post('/student/generate-momo-qr', {
      amount: amount.value,
      orderInfo: 'Nạp tiền vào ví sinh viên'
    });

    if (response && response.status) {
      payUrl.value = response.data.payUrl;
      // Tự động chuyển hướng đến trang thanh toán MoMo
      window.location.href = payUrl.value;
    } else {
      error.value = 'Không thể tạo liên kết thanh toán';
    }

    orderInfo.value = {
      id: 'MOMO-' + Math.floor(Math.random() * 1000000),
      amount: amount.value,
      date: new Date().toLocaleString('vi-VN'),
    };
  } catch (err) {
    error.value = err.data?.message || err.message || 'Lỗi khi tạo thanh toán';
    console.error('Payment error:', err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <div class="p-6 bg-gradient-to-r from-pink-500 to-red-600">
      <h3 class="text-xl font-bold text-white">Nạp tiền bằng MoMo</h3>
      <p class="text-pink-100 mt-1">Thanh toán nhanh chóng qua ví MoMo</p>
    </div>

    <div class="p-6">
      <div class="mb-4">
        <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Số tiền (VND)</label>
        <div class="flex items-center">
          <input
              type="number"
              id="amount"
              v-model="amount"
              min="10000"
              step="1000"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              placeholder="Nhập số tiền"
          />
        </div>
        <p class="text-sm text-gray-500 mt-1">Số tiền tối thiểu: 10,000 VND</p>
        <p class="text-lg font-medium text-red-600 mt-2">{{ formattedAmount }}</p>
      </div>

      <div class="mt-4">
        <button
            @click="createMomoPayment"
            class="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            :disabled="isLoading || amount < 10000"
        >
          <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isLoading ? 'Đang xử lý...' : 'Thanh toán qua MoMo' }}
        </button>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
        {{ error }}
      </div>

      <div v-if="payUrl" class="mt-6 text-center">
        <p class="text-sm text-gray-600 mb-4">Nếu không tự động chuyển hướng, vui lòng nhấn vào nút bên dưới</p>
        <a
            :href="payUrl"
            class="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          <img
              src="https://developers.momo.vn/v3/vi/img/logo.svg"
              alt="MoMo"
              class="h-5 mr-2"
          />
          Đến trang thanh toán MoMo
        </a>
      </div>

      <div v-if="orderInfo" class="mt-6 w-full bg-gray-50 p-4 rounded-md border border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Thông tin giao dịch</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <div class="flex justify-between">
            <span>Mã giao dịch:</span>
            <span class="font-medium">{{ orderInfo.id }}</span>
          </div>
          <div class="flex justify-between">
            <span>Số tiền:</span>
            <span class="font-medium">{{ formattedAmount }}</span>
          </div>
          <div class="flex justify-between">
            <span>Thời gian:</span>
            <span class="font-medium">{{ orderInfo.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>