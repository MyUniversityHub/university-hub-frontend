<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import {useNuxtApp} from "#app";
import {useFormData} from "~/composables/useFormData";
import {useSlugGenerator} from "~/composables/useSlugGenerator";
import {useFormValidation} from "~/composables/useFormValidation";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";
const defaultFormCreate = {
  department_id: 0,
  department_code: '',
  department_name: '',
  description: '',
  active: 1,
};

const params = reactive({
  department_code: '',
  department_name: ''
});

const visibleDeleteModal = ref(false)
const visibleCreateModal = ref(false)
const visibleImportModal = ref(false);

const selectedFile = ref<File | null>(null);

const { formData, resetForm, isFormDirty } = useFormData(defaultFormCreate);
const isSingleDelete = ref<boolean>(false);
const {handleInvalidSubmit} = useFormValidation();

const {
  dataList,
  totalRecords,
  currentPage,
  perPage, from,
  selectedIds,
  handleSelectAll,
  handleSelectMultiple,
  fetchData
} = useCommonList("/admin/departments", params);

const handleDelete = async () => {
  visibleDeleteModal.value = false;
  const ids = ref([]);
  if(isSingleDelete.value) {
    ids.value.push([...selectedIds.value].at(-1));
    selectedIds.value.delete(ids.value);
    isSingleDelete.value = false;
  } else {
    ids.value = [...selectedIds.value];
  }
  try {
    const res = await apiClient.delete('/admin/departments/bulk-delete', {
      body: { ids: ids.value }
    });
    if (res.status) {
      useNuxtApp().$toast.success(res.message);
    }
    isDelete.value = 0;
  } catch (error) {
    console.log(error);
  } finally {
    fetchData();
  }
};

const deleteMessage = computed(() => {
  const count = selectedIds.value.size;
  if(isSingleDelete.value) return `Bạn có chắc chắn muốn xóa khoa với ID ${[...selectedIds.value].at(-1)} không?`
  return count === 1
      ? `Bạn có chắc chắn muốn xóa khoa với ID ${[...selectedIds.value][0]} không?`
      : `Bạn có chắc chắn muốn xóa ${count} khoa này không?`;
});

const handleCloseFormCreate = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  visibleCreateModal.value = false;
};

const handleCloseFormDelete = () => {
  if(isSingleDelete.value) {
    selectedIds.value.delete([...selectedIds.value].at(-1));
    isSingleDelete.value = false;
  }
  visibleDeleteModal.value = false;
}

const showFormDelete = () => {
  if(selectedIds.value.size === 0) {
    useNuxtApp().$toast.warning("Chưa có bản ghi nào được chọn");
    return;
  }
  visibleDeleteModal.value = true;
}

const showFormUpdate = (data: any) => {
  Object.assign(
      formData,
      Object.fromEntries(
          Object.keys(defaultFormCreate).map((key) => [key, data[key] ?? defaultFormCreate[key]])
      )
  );
  visibleCreateModal.value = true;
}

const showFormCreate = () => {
  resetForm();
  visibleCreateModal.value = true;
}

const confirmImport = () => {
  selectedFile.value = "";
  visibleImportModal.value = true;
};

const handleImport = async () => {
  // Check if a file is selected
  if (!selectedFile.value) {
    useNuxtApp().$toast.error("Vui lòng chọn tệp trước khi import!");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    await apiClient.post(`/admin/departments/import-excel`, formData);
    useNuxtApp().$toast.success("Import Khoa thành công!");
    await fetchData();
    if (dataList.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
    selectedFile.value = null; // Reset the selected file
    visibleImportModal.value = false;
  } catch (e) {
    console.error("Error importing departments:", e);
  }
};

const handleExport = async () => {
  try {
    const response = await apiClient.get(`/admin/departments/export-excel`);
    const url = window.URL.createObjectURL(response);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'departments.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    useNuxtApp().$toast.success("Export Khoa thành công");
  } catch (e) {
    console.error("Error exporting departments:", e);
  }
};

const handleCreate = async () => {
  if (formData) {
    try {
      const response = await apiClient.post(`/admin/departments`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error creating departments:", e);
    }
  }
};

const handleUpdate = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/departments/${formData.department_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error updating departments:", e);
    }
  }
};

const handleUpdateStatus = async (event: Event, id: number) => {
  const checkbox = event.target as HTMLInputElement;
  const isCheck = checkbox.checked ? 1 : 0;
  try {
    const response = await apiClient.put(`/admin/departments/${id}/update-status`, {active: isCheck});
    useNuxtApp().$toast.success(response.message);
    await fetchData();
    resetForm()
    visibleCreateModal.value = false;
  } catch (e) {
    console.error("Error updating active departments:", e);
  }
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
  columnHelper.display({
    id: "select-all",
    header: () => {
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          'data-tooltip': selectedIds.value.size === dataList.value.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả',
          type: "checkbox",
          checked: selectedIds.value.size === dataList.value.length,
          class: "checkbox form-check-input pr-4",
          onChange: (e) => handleSelectAll(e.target.checked, 'department_id'),
        }),
      ]);
    },
    cell: ({ row }) => {
      const id = row.original?.department_id;
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          'data-tooltip': selectedIds.value.has(id) ? 'Bỏ chọn' : 'Chọn',
          type: "checkbox",
          value: id,
          checked: selectedIds.value.has(id),
          class: "checkbox form-check-input pr-4",
          onChange: () => handleSelectMultiple(id),
        }),
      ]);
    },
  }),
  columnHelper.accessor('department_code', {
    header: 'Mã khoa',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('department_name', {
    header: 'Tên khoa',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('active', {
    header: 'Trạng thái',
    cell: ({ row }) => {
      const id = row.original?.department_id;
      const active = row.original?.active;
      return h("div", { class: "flex justify-center items-center" }, [
        h("input", {
          'data-tooltip': active ? 'Bỏ chọn' : 'Chọn',
          type: "checkbox",
          value: id,
          checked: active,
          class: "checkbox form-check-input pr-4 text-center",
          onChange: (e) => handleUpdateStatus(e, id)
        }),
      ]);
    },
  }),
  columnHelper.display({
    header: 'Hành động',
    cell: ({row}) => {
      return h(
          'div',
          {
            class: 'menu-link flex gap-2 justify-center',
          },
          [
            h('span', {
              class: 'text-center',
              onClick: () => {
                showFormUpdate(row.original);
              },
            }, [
              h('i', { class: 'fa-solid fa-pen-to-square text-lg text-blue-600',})
            ]),
            h('span', {
              class: 'menu-icon',
              onClick: () => {
                visibleDeleteModal.value = true;
                isSingleDelete.value = true;
                selectedIds.value.add(row.original?.department_id);
              },
            }, [
              h('i', { class: 'fa-solid fa-trash text-lg text-danger' })
            ])
          ]
      );
    },
    meta: { headerClassName: 'whitespace-nowrap text-center'}
  })
];

</script>

<template>
  <div class="grid gap-5 lg:gap-7.5">
    <Card title="Danh sách khoa" :isAction="true">
      <template #button>
        <MenuButtonAction :on-delete="showFormDelete"
                          :number="selectedIds.size"
                          :on-create="showFormCreate"
                          :on-import="confirmImport"
                          :on-export="handleExport"/>

      </template>
      <template #action>
        <div class="flex items-center justify-center gap-2">
          <InputField
              id="departmentCode"
              name="departmentCode"
              label="Tên mã khoa"
              placeholder="Tìm theo mã khoa"
              v-model="params.department_code"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="departmentName"
              name="departmentName"
              label="Tên khoa"
              placeholder="Tìm theo tên khoa"
              v-model="params.department_name"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
        </div>
      </template>
      <TableDefault :columns="columns" :data="dataList" />
      <PaginationControls
          :totalRecords="totalRecords"
          :perPage="perPage"
          :currentPage="currentPage"
          @update:perPage="perPage = $event"
          @update:currentPage="currentPage = $event"
      />
    </Card>
  </div>
  <CommonModal
      :visible="visibleCreateModal"
      title="Tạo mới"
      :body="deleteMessage"
      width="800px"
      @close="handleCloseFormCreate"
      @clickOutside="handleCloseFormCreate"
      @confirm="formData.department_id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.department_id ? 'Cập nhật' : 'Thêm mới'}} khoa</h2>
    </template>
    <VeeForm @submit="formData.department_id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="name"
          name="name"
          label="Tên khoa"
          placeholder="Nhập tên khoa"
          v-model="formData.department_name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|valid_department_name|max:120"
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
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.department_id ? 'Cập nhật' : 'Thêm mới'}}</button>
    </template>
  </CommonModal>
  <CommonModal
      :visible="visibleDeleteModal"
      title="Xác nhận thao tác"
      :body="deleteMessage"
      @close="handleCloseFormDelete"
      @clickOutside="handleCloseFormDelete">
    <template #header>
      <h2 class="text-xl font-bold text-red-500">⚠️ Xác nhận xóa</h2>
    </template>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormDelete">Hủy</button>
      <button class="btn btn-danger" @click="handleDelete">Xóa</button>
    </template>
  </CommonModal>

  <CommonModal
      className="max-w-[600px] top-[15%]" title="Import Khoa" :isAction="true"
      :visible="visibleImportModal"
      @close="handleCloseImportModal"
      @clickOutside="handleCloseImportModal"
  >
    <VeeForm id="import_redirect_confirm" @submit="handleImport">
      <FileUploader v-model="selectedFile" accept=".xls,.xlsx" description="Chọn file Excel hoặc kéo thả vào đây (định dạng .xls, .xlsx, tối đa 5MB)" />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseImportModal">Hủy</button>
      <button class="btn btn-primary" type="submit" form="import_redirect_confirm">Xác nhận</button>
    </template>
  </CommonModal>
</template>
<style scoped lang="scss">

</style>