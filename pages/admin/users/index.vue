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
import id from "@redocly/ajv/lib/vocabularies/core/id";
const defaultFormCreate = {
  id: 0,
  name: '',
  user_name: '',
  email: '',
  password: '',
  role_id: '',
  class_id: 0,
  active: 1,
};

const params = reactive({
  name: '',
  courseYear: '',
  major: ''
});

type Options = {
  value: number,
  label: string
};

const allClasses = ref<Options[]>([]);
const majors = ref<Options[]>([]);
const majorMap = ref<Map<number, string>>(new Map());

const roles = ref<Options[]>([]);
const roleMap = ref<Map<number, string>>(new Map());

const departments = ref<Options[]>([]);
const departmentMap = ref<Map<number, string>>(new Map());

const classes = ref<Options[]>([]);

const visibleDeleteModal = ref(false)
const visibleCreateModal = ref(false)

const selectedDepartment = ref(0);
const selectedMajor = ref(0);

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
} = useCommonList("/admin/users", params);

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
    const res = await apiClient.delete('/admin/classes/bulk-delete', {
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

const fetchRolesActive = async () => {
  try {
    const response = await apiClient.get(`/admin/roles/active`);
    if(response && response.status) {
      const tempRoles: Role[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((role: any) => {
        const newRole = { label: role.name, value: role.id };
        tempRoles.push(newRole);
        tempMap.set(newRole.value, newRole.label);
      });

      roles.value = tempRoles;
      roleMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

const fetchMajorsByDepartment = async () => {
  try {
    const response = await apiClient.get(`/admin/majors/department/${selectedDepartment.value}`);
    if(response && response.status) {
      const tempMajors: Major[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((major: any) => {
        const newMajor = { label: major.name, value: major.id };
        tempMajors.push(newMajor);
        tempMap.set(newMajor.value, newMajor.label);
      });

      majors.value = tempMajors;
      majorMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

const fetchDepartmentsActive = async () => {
  try {
    const response = await apiClient.get(`/admin/departments/active`);
    if(response && response.status) {
      const tempDepartments: Department[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((department: any) => {
        const newDepartment = { label: department.name, value: department.id };
        tempDepartments.push(newDepartment);
        tempMap.set(newDepartment.value, newDepartment.label);
      });

      departments.value = tempDepartments;
      departmentMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

const fetchClassesByMajor = async () => {
  try {
    const response = await apiClient.get(`/admin/classes/major/${selectedMajor.value}`);
    if(response && response.status) {
      const tempClasses: Class[] = [];
      // const tempMap = new Map<number, string>();

      response.data.forEach((classes: any) => {
        const newClass = { label: classes.name, value: classes.id };
        tempClasses.push(newClass);
        // tempMap.set(newDepartment.value, newDepartment.label);
      });

      classes.value = tempClasses;
      // departmentMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

const fetchClassesActive = async () => {
  try {
    const response = await apiClient.get(`/admin/classes/active`);
    if(response && response.status) {
      const tempClasses: Class[] = [];
      // const tempMap = new Map<number, string>();

      response.data.forEach((classes: any) => {
        const newClass = { label: classes.name, value: classes.id };
        tempClasses.push(newClass);
        // tempMap.set(newDepartment.value, newDepartment.label);
      });

      allClasses.value = tempClasses;
      // departmentMap.value = tempMap;
    }
  } catch (e) {
    console.error("Error fetching departments active:", e);
  }
};

onMounted(() => {
  fetchRolesActive();
  fetchDepartmentsActive();
  fetchClassesActive();
})


const deleteMessage = computed(() => {
  const count = selectedIds.value.size;
  if(isSingleDelete.value) return `Bạn có chắc chắn muốn xóa lớp học với ID ${[...selectedIds.value].at(-1)} không?`
  return count === 1
      ? `Bạn có chắc chắn muốn xóa lớp học với ID ${[...selectedIds.value][0]} không?`
      : `Bạn có chắc chắn muốn xóa ${count} lớp học này không?`;
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

const handleCreate = async () => {
  if (formData) {
    formData.major_id = Number(formData.major_id);
    try {
      const response = await apiClient.post(`/admin/classes`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error creating classes:", e);
    }
  }
};

const handleUpdate = async () => {
  if (formData) {
    formData.major_id = Number(formData.major_id);
    try {
      const response = await apiClient.put(`/admin/classes/${formData.id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error updating classes:", e);
    }
  }
};

const handleUpdateStatus = async (event: Event, id: number) => {
  const checkbox = event.target as HTMLInputElement;
  const isCheck = checkbox.checked;
  try {
    const response = await apiClient.put(`/admin/classes/${id}/update-status`, {active: isCheck});
    useNuxtApp().$toast.success(response.message);
    await fetchData();
    resetForm()
    visibleCreateModal.value = false;
  } catch (e) {
    console.error("Error updating active classes:", e);
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
      const id = row.original?.id;
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
  columnHelper.accessor('name', {
    header: 'Tên người dùng',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('user_name', {
    header: 'Tên tài khoản',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('role_id', {
    header: 'Vai trò',
    cell: info => roleMap.value.get(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('active', {
    header: 'Trạng thái',
    cell: ({ row }) => {
      const id = row.original?.id;
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
                selectedIds.value.add(row.original?.id);
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
    <Card title="Danh sách lớp học" :isAction="true">
      <template #button>
        <MenuButtonAction :on-delete="showFormDelete"
                          :number="selectedIds.size"
                          :on-create="showFormCreate"/>
      </template>
      <template #action>
        <div class="flex items-center justify-center gap-2">
          <InputField
              id="classParams"
              name="classParams"
              label="Lớp"
              v-model="params.major"
              :dataOptions="allClasses"
              inputType="select2"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
              selectPlaceholder="Chọn lớp"
          />
          <InputField
              id=""
              name="className"
              label="Tên lớp học"
              placeholder="Tìm theo tên lớp học"
              v-model="params.name"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="courseYear"
              name="courseYear"
              label="Năm học"
              placeholder="Tìm theo năm học"
              v-model="params.courseYear"
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
      @confirm="formData.id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.id ? 'Cập nhật' : 'Thêm mới'}} người dùng</h2>
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
          rules="required|latin_numbers_only|max:50"
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
          rules="required|latin_numbers_only|max:50"
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
          rules="required|max:50"
      />
      <InputField
          id="password"
          name="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          v-model="formData.password"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|max:50"
      />
      <InputField
          id="typeUser"
          name="typeUser"
          label="Vai trò"
          v-model="formData.role_id"
          :dataOptions="roles"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn quyền"
      />
      <div v-if="formData.role_id === '2' || formData.role_id === '3'">
        <InputField
            id="department"
            name="department"
            label="Khoa"
            v-model="selectedDepartment"
            :dataOptions="departments"
            inputType="select2"
            :required="true"
            rules="required"
            inputClass="w-full"
            selectPlaceholder="Chọn quyền"
            @change="fetchMajorsByDepartment"
        />
        <InputField
            id="major"
            name="major"
            label="Chuyên ngành"
            v-model="selectedMajor"
            :dataOptions="majors"
            inputType="select2"
            :required="true"
            rules="required"
            inputClass="w-full"
            selectPlaceholder="Chọn chuyên ngành"
            @change="fetchClassesByMajor"
        />
        <div v-if="formData.role_id === '2'">
          <InputField
              id="classes"
              name="classes"
              label="Lớp"
              v-model="formData.class_id"
              :dataOptions="classes"
              inputType="select2"
              :required="true"
              rules="required"
              inputClass="w-full"
              selectPlaceholder="Chọn lớp"
          />
        </div>
      </div>
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.id ? 'Cập nhật' : 'Thêm mới'}}</button>
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