<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import {useNuxtApp} from "#app";
import Card from "~/components/molecules/Card.vue";

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

const params = reactive({
  payment_date_start: '',
  payment_date_end: '',
  status: '',
  payment_method: '',
});

// Payment method mapping
const paymentMethodMap = {
  1: 'Tiền mặt',
  2: 'Chuyển khoản',
  3: 'MoMo',
  4: 'VNPay',
  5: 'ZaloPay'
};

// Status mapping
const statusMap = {
  0: 'Thất bại',
  1: 'Thành công',
  2: 'Đang xử lý',
  3: 'Hoàn tiền'
};

// Payment method options
const paymentMethodOptions = ref([
  { value: '', label: 'Tất cả' },
  { value: '1', label: 'Tiền mặt' },
  { value: '2', label: 'Chuyển khoản' },
  { value: '3', label: 'MoMo' },
  { value: '4', label: 'VNPay' },
  { value: '5', label: 'ZaloPay' },
]);

const {
  dataList,
  totalRecords,
  currentPage,
  perPage,
  fetchData
} = useCommonList("/student/payments", params);

const fetchInfo = async () => {
  try {
    const response = await apiClient.get(`/student/info/${userStore.id}`);
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

onMounted(async () => {
  await fetchInfo();
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

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = (currentPage.value - 1) * perPage.value + row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.accessor('payment_id', {
    header: 'Mã giao dịch',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('payment_date', {
    header: 'Ngày thanh toán',
    cell: info => formatDate(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('amount', {
    header: 'Số tiền',
    cell: info => formatCurrency(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('payment_method', {
    header: 'Phương thức thanh toán',
    cell: info => paymentMethodMap[info.getValue()] || 'Không xác định',
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: info => {
      const status = info.getValue();
      let statusClass = '';
      
      switch(status) {
        case 0:
          statusClass = 'bg-red-100 text-red-800';
          break;
        case 1:
          statusClass = 'bg-green-100 text-green-800';
          break;
        case 2:
          statusClass = 'bg-yellow-100 text-yellow-800';
          break;
        case 3:
          statusClass = 'bg-blue-100 text-blue-800';
          break;
      }
      
      return h("span", { 
        class: `px-2 py-1 rounded-full text-xs font-medium ${statusClass}` 
      }, statusMap[status] || 'Không xác định');
    },
    meta: { headerClassName: 'min-w-[120px]', cellClassName: 'px-6 py-4 text-center'}
  })
];

// Reset filters
const resetFilters = () => {
  params.payment_date_start = '';
  params.payment_date_end = '';
  params.status = '';
  params.payment_method = '';
  fetchData();
};
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Lịch sử giao dịch" :isAction="true">
      <template #action>
        <div class="flex items-center justify-center gap-2 flex-wrap">
          <InputField
              id="payment_date_start"
              name="payment_date_start"
              label="Từ ngày"
              type="date"
              v-model="params.payment_date_start"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[180px]"
          />
          <InputField
              id="payment_date_end"
              name="payment_date_end"
              label="Đến ngày"
              type="date"
              v-model="params.payment_date_end"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[180px]"
          />
        </div>
      </template>
      <div v-if="dataList.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-2">
          <i class="fa-solid fa-receipt text-4xl"></i>
        </div>
        <p class="text-gray-500">Không có giao dịch nào</p>
      </div>
      <TableDefault v-else :columns="columns" :data="dataList" />
      <PaginationControls
          :totalRecords="totalRecords"
          :perPage="perPage"
          :currentPage="currentPage"
          @update:perPage="perPage = $event"
          @update:currentPage="currentPage = $event"
      />
    </Card>
  </div>
</template>

<style scoped lang="scss">
.transaction-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
}
</style>
