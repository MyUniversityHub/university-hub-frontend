<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import Card from "~/components/molecules/Card.vue";
import {useUserStore} from "~/stores/userStore";
import {useFormData} from "~/composables/useFormData";
import {useNuxtApp} from "#app";

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

const completedPayments = ref([]);
const pendingPayments = ref([]);
const info = ref([]);

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);

const {
  dataList,
  selectedIds,
  handleSelectAll,
  handleSelectMultiple,
  fetchData
} = useCommonList("/student/registration-fee-detail/0/status");

const userStore = useUserStore();

const totalTuitionFee = computed(() => {
  return Array.from(selectedIds.value).reduce((total, id) => {
    const course = dataList.value.find((item) => item.course_class_id === id);
    return total + (course ? course.total_amount : 0);
  }, 0);
});

const handlePayTuitionFee = async () => {
  const allSelectedIds = Array.from(selectedIds.value);
  try {
    const response = await apiClient.put(`/student/registration-fee-detail/payTuitionFee`, {ids: allSelectedIds});
    if (response && response.status) {
      useNuxtApp().$toast.success(response.message);
      await Promise.all([fetchData(), fetchInfo(), fetchCompletedPayments(), fetchPendingPayments()]);
    }
  } catch (e) {
    console.error("Error paying tuition fee:", e);
  }
};

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
const fetchCompletedPayments = async () => {
  try {
    const response = await apiClient.get("/student/registration-fee-detail/1/status");
    if (response && response.status) {
      completedPayments.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching completed payments:", e);
  }
};

const fetchPendingPayments = async () => {
  try {
    const response = await apiClient.get("/student/registration-fee-detail/0/status");
    if (response && response.status) {
      pendingPayments.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching pending payments:", e);
  }
};

onMounted(async () => {
  await Promise.all([fetchInfo(), fetchCompletedPayments(), fetchPendingPayments()]);
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const status = ['Chưa thanh toán', 'Đã thanh toán'];
const statusClass = ['capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white','capitalize px-6 py-4 font-medium text-primary whitespace-nowrap dark:text-white']

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.accessor('fee_code', {
    header: 'Mã khoản thu',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('fee_name', {
    header: 'Khoản thu',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('credit_count', {
    header: 'Số tín chỉ',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('unit_price', {
    header: 'Đơn giá',
    cell: info => formatCurrency(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('total_amount', {
    header: 'Thành tiền (vnđ)',
    cell: info => formatCurrency(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: info => h("span", { class: statusClass[info.getValue()] }, status[info.getValue()]),
    meta: { headerClassName: 'min-w-[165px]' }
  }),
  columnHelper.display({
    id: "select-all",
    header: () => {
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          type: "checkbox",
          class: "checkbox form-check-input pr-4",
          onChange: (e) => handleSelectAll(e.target.checked, 'course_class_id'),
        }),
      ]);
    },
    cell: ({ row }) => {
      const id = row.original?.course_class_id;
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          type: "checkbox",
          value: id,
          checked: selectedIds.value.has(id),
          class: "checkbox form-check-input pr-4",
          onChange: () => handleSelectMultiple(id),
        }),
      ]);
    },
  }),
];

const columns2 = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  columnHelper.accessor('fee_code', {
    header: 'Mã khoản thu',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('fee_name', {
    header: 'Khoản thu',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('credit_count', {
    header: 'Số tín chỉ',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('unit_price', {
    header: 'Đơn giá',
    cell: info => formatCurrency(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('total_amount', {
    header: 'Thành tiền (vnđ)',
    cell: info => formatCurrency(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: info => h("span", { class: statusClass[info.getValue()] }, status[info.getValue()]),
    meta: { headerClassName: 'min-w-[165px]' }
  })
];
</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Danh sách môn học" :isAction="false">
      <TableDefault :columns="columns" :data="pendingPayments" />
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div class="space-y-4 p-6">
          <!-- Header -->
          <div class="pb-2 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Thanh toán học phí</h3>
          </div>

          <!-- Debt Information -->
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Số tiền đăng ký học phần còn nợ:</span>
            <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(formData.course_fee_debt) }}</span>
          </div>

          <!-- Wallet Balance -->
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Số tiền trong tài khoản:</span>
            <span class="font-semibold text-blue-600 dark:text-blue-400">{{ formatCurrency(formData.wallet_balance) }}</span>
          </div>

          <!-- Amount to Deduct -->
          <div class="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Số tiền hệ thống sẽ trừ:</span>
            <span class="font-semibold text-red-600 dark:text-red-400">{{ formatCurrency(totalTuitionFee) }}</span>
          </div>

          <!-- Payment Button -->
          <div class="flex justify-end pt-2">
            <button
                @click="handlePayTuitionFee"
                class="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-colors"
            >
              Thanh toán ngay
            </button>
          </div>

          <!-- Footer Note (optional) -->
          <p class="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            Hệ thống sẽ tự động trừ tiền từ tài khoản của bạn
          </p>
        </div>
      </div>
      <TableDefault :columns="columns2" :data="completedPayments" />
    </Card>
  </div>

</template>
<style scoped lang="scss">

</style>
