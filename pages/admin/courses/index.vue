<script setup lang="ts">
import {useCommonList} from "~/composables/useCommonList";
import {createColumnHelper} from "@tanstack/vue-table";
import {h, ref} from "vue";
import {useNuxtApp} from "#app";
import {useFormData} from "~/composables/useFormData";
import {useFormValidation} from "~/composables/useFormValidation";
import Card from "~/components/molecules/Card.vue";
import CommonModal from "~/components/atoms/modal/CommonModal.vue";

const defaultFormCreate = {
  course_id: 0,
  course_code: '',
  course_name: '',
  credit_hours: '',
  prerequisites: '',
  active: 1,
};

const params = reactive({
  course_code: '',
  course_name: ''
});

const visibleDeleteModal = ref(false);
const visibleCreateModal = ref(false);

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
} = useCommonList("/admin/courses", params);

const courseOptions = computed(() =>
    dataList.value.map((course: any) => ({
      label: course.course_name,
      value: course.course_id,
    }))
);

const typeOptions = [
  { label: "Tiên quyết", value: 1 },
  { label: "Song song", value: 2 },
];

const handleDelete = async () => {
  visibleDeleteModal.value = false;
  const ids = ref([]);
  if (isSingleDelete.value) {
    ids.value.push([...selectedIds.value].at(-1));
    selectedIds.value.delete(ids.value);
    isSingleDelete.value = false;
  } else {
    ids.value = [...selectedIds.value];
  }
  try {
    const res = await apiClient.delete('/admin/courses/bulk-delete', {
      body: { ids: ids.value }
    });
    if (res.status) {
      useNuxtApp().$toast.success(res.message);
    }
  } catch (error) {
    console.log(error);
  } finally {
    fetchData();
  }
};

const deleteMessage = computed(() => {
  const count = selectedIds.value.size;
  if (isSingleDelete.value) return `Bạn có chắc chắn muốn xóa môn học với ID ${[...selectedIds.value].at(-1)} không?`;
  return count === 1
      ? `Bạn có chắc chắn muốn xóa môn học với ID ${[...selectedIds.value][0]} không?`
      : `Bạn có chắc chắn muốn xóa ${count} môn học này không?`;
});

const handleCloseFormCreate = () => {
  if (isFormDirty.value) {
    const confirmClose = window.confirm("Dữ liệu đã thay đổi. Bạn có chắc chắn muốn đóng?");
    if (!confirmClose) return;
  }
  visibleCreateModal.value = false;
};

const handleCloseFormDelete = () => {
  if (isSingleDelete.value) {
    selectedIds.value.delete([...selectedIds.value].at(-1));
    isSingleDelete.value = false;
  }
  visibleDeleteModal.value = false;
};

const showFormDelete = () => {
  if (selectedIds.value.size === 0) {
    useNuxtApp().$toast.warning("Chưa có bản ghi nào được chọn");
    return;
  }
  visibleDeleteModal.value = true;
};

const showFormUpdate = (data: any) => {
  const transformedPrerequisites = data.prerequisites.map((prerequisite: any) => ({
    id: `${prerequisite.course_id}-${prerequisite.prerequisite_course_id}`,
    values: {
      prerequisite_course_id: prerequisite.prerequisite_course_id,
      type: prerequisite.type,
    },
  }));

  Object.assign(
      formData,
      Object.fromEntries(
          Object.keys(defaultFormCreate).map((key) => [
            key,
            key === "prerequisites" ? transformedPrerequisites : data[key] ?? defaultFormCreate[key],
          ])
      )
  );

  visibleCreateModal.value = true;
};

const showFormCreate = () => {
  resetForm();
  visibleCreateModal.value = true;
};

const handleCreate = async () => {
  if (formData) {
    try {
      const response = await apiClient.post(`/admin/courses`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error creating courses:", e);
    }
  }
};

const handleUpdate = async () => {
  if (formData) {
    try {
      const response = await apiClient.put(`/admin/courses/${formData.course_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm();
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error updating courses:", e);
    }
  }
};

const handleUpdateStatus = async (event: Event, id: number) => {
  const checkbox = event.target as HTMLInputElement;
  const isCheck = checkbox.checked;
  try {
    const response = await apiClient.put(`/admin/courses/${id}/update-active`, {active: isCheck});
    useNuxtApp().$toast.success(response.message);
    await fetchData();
    resetForm();
    visibleCreateModal.value = false;
  } catch (e) {
    console.error("Error updating active courses:", e);
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
          onChange: (e) => handleSelectAll(e.target.checked, 'id'),
        }),
      ]);
    },
    cell: ({ row }) => {
      const id = row.original?.course_id;
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
  columnHelper.accessor('course_code', {
    header: 'Mã môn học',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('course_name', {
    header: 'Tên môn học',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('credit_hours', {
    header: 'Số tín chỉ',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('active', {
    header: 'Trạng thái',
    cell: ({ row }) => {
      const id = row.original?.course_id;
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
                selectedIds.value.add(row.original?.course_id);
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
    <Card title="Danh sách môn học" :isAction="true">
      <template #button>
        <MenuButtonAction :on-delete="showFormDelete"
                          :number="selectedIds.size"
                          :on-create="showFormCreate"/>
      </template>
      <template #action>
        <div class="flex items-center justify-center gap-2">
          <InputField
              id="courseCode"
              name="courseCode"
              label="Mã môn học"
              placeholder="Tìm theo mã môn học"
              v-model="params.course_code"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="courseName"
              name="courseName"
              label="Tên môn học"
              placeholder="Tìm theo tên môn học"
              v-model="params.course_name"
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
      @confirm="formData.course_id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.course_id ? 'Cập nhật' : 'Thêm mới'}} môn học</h2>
    </template>
    <VeeForm @submit="formData.course_id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="course_name"
          name="course_name"
          label="Tên môn học"
          placeholder="Nhập tên môn học"
          v-model="formData.course_name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|max:120"
      />
      <DynamicInputBox titleBox="Môn học" v-model="formData.prerequisites" :fields="['prerequisite_course_id', 'type']">
        <template #default="{ box, updateBoxValue, fields }">
          <div :key="box.id">
            <InputField
                :id="'prerequisiteCourse' + '-' + box.id"
                :name="'prerequisiteCourse' + '-' + box.id"
                labelPosition="border"
                label="Môn học tiên quyết"
                v-model="box.values[fields[0]]"
                :dataOptions="courseOptions"
                inputType="select2"
                labelClass="hidden"
                inputClass="w-[200px]"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[0], value)"
            />
            <InputField
                :id="'type' + '-' + box.id"
                :name="'type' + '-' + box.id"
                labelPosition="border"
                label="Loại tiên quyết"
                v-model="box.values[fields[1]]"
                :dataOptions="typeOptions"
                inputType="select2"
                labelClass="hidden"
                inputClass="w-[200px]"
                @update:modelValue="(value) => updateBoxValue(box.id, fields[1], value)"
            />
          </div>
        </template>
      </DynamicInputBox>
      <InputField
          id="credit_hours"
          name="credit_hours"
          label="Số tín chỉ"
          placeholder="Nhập số tín chỉ"
          v-model="formData.credit_hours"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|numeric|min:1|max:10"
      />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.course_id ? 'Cập nhật' : 'Thêm mới'}}</button>
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
</template>
<style scoped lang="scss">

</style>
