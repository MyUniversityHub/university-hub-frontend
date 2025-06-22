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
  major_id: 0,
  major_code: '',
  department_id: '',
  major_name: '',
  active: 1,
};

const params = reactive({
  major_code: '',
  major_name: '',
  department: '',
});

type Options = {
  value: number,
  label: string
};

const courseCreate = ref({
  major_id: '',
  course_id: '',
  semester: '',
});

const departments = ref<Options[]>([]);
const departmentMap = ref<Map<number, string>>(new Map());

const visibleDeleteModal = ref(false)
const visibleCreateModal = ref(false)
const visibleCollectionModal = ref(false)
const visibleImportModal = ref(false);
const selectedFile = ref<File | null>(null);

const selectedMajorId = ref<number>(0);

const coursesByMajorId = ref<any[]>([]);
const selectedCourse = ref<{
  course_id: number,
  major_id: number
}>(null);

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
} = useCommonList("/admin/majors", params);

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
    const res = await apiClient.delete('/admin/majors/bulk-delete', {
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

const handleCreateCourse = async () => {
  courseCreate.value.major_id = selectedMajorId.value;
  try {
    const response = await apiClient.post(`/admin/curriculum-programs`, {...courseCreate.value});
    useNuxtApp().$toast.success(response.message);
    courseCreate.value.course_id = '';
    courseCreate.value.semester = '';
    await fetchCoursesByMajorId();
  } catch (e) {
    console.error("Error creating course:", e);
  }
};

const fetchDepartmentsActive = async () => {
  try {
    const response = await apiClient.get(`/admin/departments/active`);
    if(response && response.status) {
      const tempDepartments: Department[] = [];
      const tempMap = new Map<number, string>();

      response.data.forEach((department: any) => {
        const newDepartment = { label: department.department_name, value: department.department_id };
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

const coursesActive = ref<any[]>([]);

const fetchCourseActive = async () => {
  try {
    const response = await apiClient.get(`/admin/courses/active`);
    if (response && response.status) {
      coursesActive.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching courses active:", e);
  }
};

const courseOptions = computed(() =>
    coursesActive.value.map((course: any) => ({
      label: course.course_name,
      value: course.course_id,
    }))
);


onMounted(() => {
  fetchDepartmentsActive();
  fetchCourseActive();
})


const deleteMessage = computed(() => {
  const count = selectedIds.value.size;
  if(isSingleDelete.value) return `Bạn có chắc chắn muốn xóa chuyên ngành với ID ${[...selectedIds.value].at(-1)} không?`
  return count === 1
      ? `Bạn có chắc chắn muốn xóa chuyên ngành với ID ${[...selectedIds.value][0]} không?`
      : `Bạn có chắc chắn muốn xóa ${count} chuyên ngành này không?`;
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

const showFormCollection = async () => {
  await fetchCoursesByMajorId();
  visibleCollectionModal.value = true;
}

const fetchCoursesByMajorId = async () => {
  try {
    const response = await apiClient.get(`/admin/curriculum-programs/major/${selectedMajorId.value}`);
    if(response && response.status) {
      coursesByMajorId.value = response.data;
    }
  } catch (e) {
    console.error("Error fetching courses by major ID:", e);
  }
};

const handleCreate = async () => {
  if (formData) {
    formData.department_id = Number(formData.department_id);
    try {
      const response = await apiClient.post(`/admin/majors`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error creating majors:", e);
    }
  }
};

const handleUpdate = async () => {
  if (formData) {
    formData.department_id = Number(formData.department_id);
    try {
      const response = await apiClient.put(`/admin/majors/${formData.major_id}`, {...formData});
      useNuxtApp().$toast.success(response.message);
      await fetchData();
      resetForm()
      visibleCreateModal.value = false;
    } catch (e) {
      console.error("Error updating majors:", e);
    }
  }
};

const handleUpdateStatus = async (event: Event, id: number) => {
  const checkbox = event.target as HTMLInputElement;
  const isCheck = checkbox.checked;
  try {
    const response = await apiClient.put(`/admin/majors/${id}/update-status`, {active: isCheck});
    useNuxtApp().$toast.success(response.message);
    await fetchData();
    resetForm()
    visibleCreateModal.value = false;
  } catch (e) {
    console.error("Error updating active majors:", e);
  }
};

const handleSingleDelete = async (data: any) => {
  try {
    const response = await apiClient.delete(`/admin/curriculum-programs`, {
      body: {
        course_id: data.course_id,
        major_id: data.major_id,
      }
    });
    useNuxtApp().$toast.success(response.message);
    await fetchCoursesByMajorId();
  } catch (e) {
    console.error("Error updating active majors:", e);
  }
};

const confirmImport = () => {
  selectedFile.value = "";
  visibleImportModal.value = true;
};

const handleCloseImportModal = () => {
  visibleImportModal.value = false;
  selectedFile.value = null;
};

const handleImport = async () => {
  if (!selectedFile.value) {
    useNuxtApp().$toast.error("Vui lòng chọn tệp trước khi import!");
    return;
  }
  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    await apiClient.post(`/admin/majors/import-excel`, formData);
    useNuxtApp().$toast.success("Import chuyên ngành thành công!");
    await fetchData();
    if (dataList.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
    selectedFile.value = null;
    visibleImportModal.value = false;
  } catch (e) {
    console.error("Error importing majors:", e);
  }
};

const handleExport = async () => {
  try {
    const response = await apiClient.get(`/admin/majors/export-excel`);
    const url = window.URL.createObjectURL(response);
    const a = document.createElement("a");
    a.href = url;
    a.download = 'majors.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    useNuxtApp().$toast.success("Export chuyên ngành thành công");
  } catch (e) {
    console.error("Error exporting majors:", e);
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
          onChange: (e) => handleSelectAll(e.target.checked, 'major_id'),
        }),
      ]);
    },
    cell: ({ row }) => {
      const id = row.original?.major_id;
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
  columnHelper.accessor('major_code', {
    header: 'Mã chuyên ngành',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('major_name', {
    header: 'Tên chuyên ngành',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('department_id', {
    header: 'Tên khoa',
    cell: info => departmentMap.value.get(info.getValue()),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.display({
    header: 'Chương trình',
    cell: ({row}) => {
      return h("div", { class: "flex justify-center items-center cursor-pointer" }, [
        h("i", {
          class: "fa fa-bars",
          onClick: () => {
            selectedMajorId.value = row.original?.major_id;
            showFormCollection();
          }
        })
      ]);
    },
  }),
  columnHelper.accessor('status', {
    header: 'Trạng thái',
    cell: ({ row }) => {
      const id = row.original?.major_id;
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
                selectedIds.value.add(row.original?.major_id);
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

const courseColumns = [
  columnHelper.display({
    header: 'STT',
    cell: ({row}) => {
      const index = row.index + 1;
      return h("div", { class: "d-flex justify-center items-center" }, [
        h("span", index),
      ]);
    },
  }),
  // columnHelper.display({
  //   id: "select-all",
  //   header: () => {
  //     return h("div", { class: "flex justify-center items-center" }, [
  //       h("input", {
  //         'data-tooltip': selectedIds.value.size === dataList.value.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả',
  //         type: "checkbox",
  //         checked: selectedIds.value.size === dataList.value.length,
  //         class: "checkbox form-check-input pr-4",
  //         onChange: (e) => handleSelectAll(e.target.checked, 'id'),
  //       }),
  //     ]);
  //   },
  //   cell: ({ row }) => {
  //     const id = row.original?.major_id;
  //     return h("div", { class: "flex justify-center items-center" }, [
  //       h("input", {
  //         'data-tooltip': selectedIds.value.has(id) ? 'Bỏ chọn' : 'Chọn',
  //         type: "checkbox",
  //         value: id,
  //         checked: selectedIds.value.has(id),
  //         class: "checkbox form-check-input pr-4",
  //         onChange: () => handleSelectMultiple(id),
  //       }),
  //     ]);
  //   },
  // }),
  columnHelper.accessor('course_code', {
    header: 'Mã môn',
    cell: info => info.getValue(),
    meta: { headerClassName: '', cellClassName: 'px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('course_name', {
    header: 'Tên môn',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('semester', {
    header: 'Học kỳ',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
  }),
  columnHelper.accessor('prerequisite_code', {
    header: 'Mã môn tiên quyết',
    cell: info => info.getValue(),
    meta: { headerClassName: 'min-w-[165px]', cellClassName: 'capitalize px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'}
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
              class: 'menu-icon',
              onClick: () => {
                selectedCourse.value = {
                  course_id: row.original?.course_id,
                  major_id: selectedMajorId.value
                };
                handleSingleDelete(selectedCourse.value);
              },
            }, [
              h('i', { class: 'fa fa-times text-lg text-danger' })
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
    <Card title="Danh sách chuyên ngành" :isAction="true">
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
              id="department"
              name="department"
              label="Khoa"
              v-model="params.department"
              :dataOptions="departments"
              inputType="select2"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
              selectPlaceholder="Chọn khoa"
          />
          <InputField
              id="departmentCode"
              name="departmentCode"
              label="Tên mã chuyên ngành"
              placeholder="Tìm theo mã chuyên ngành"
              v-model="params.major_code"
              labelPosition="border"
              labelClass="hidden"
              inputClass="w-[200px]"
          />
          <InputField
              id="departmentName"
              name="departmentName"
              label="Tên chuyên ngành"
              placeholder="Tìm theo tên chuyên ngành"
              v-model="params.major_name"
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
      @confirm="formData.major_id ? handleUpdate() : handleCreate()"
      :isFormDirty="isFormDirty">
    <template #header>
      <h2 class="text-xl font-bold">{{formData.major_id ? 'Cập nhật' : 'Thêm mới'}} chuyên ngành</h2>
    </template>
    <VeeForm @submit="formData.major_id ? handleUpdate() : handleCreate()" @invalid-submit="handleInvalidSubmit" id="triggerFormCreateUpdate">
      <p class="italic mb-3">Những ô có dấu (<span class="text-danger">*</span>) là bắt buộc phải nhập</p>
      <InputField
          id="departmentId"
          name="departmentId"
          label="Khoa"
          v-model="formData.department_id"
          :dataOptions="departments"
          inputType="select2"
          :required="true"
          rules="required"
          inputClass="w-full"
          selectPlaceholder="Chọn khoa"
      />
      <InputField
          id="name"
          name="name"
          label="Tên chuyên ngành"
          placeholder="Nhập tên chuyên ngành"
          v-model="formData.major_name"
          labelClass="w-[200px]"
          inputClass="flex-1"
          :required="true"
          rules="required|valid_department_name|max:120"
      />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseFormCreate">Hủy</button>
      <button type="submit" form="triggerFormCreateUpdate" class="btn btn-primary">{{formData.major_id ? 'Cập nhật' : 'Thêm mới'}}</button>
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
      :visible="visibleCollectionModal"
      title="Danh sách môn học"
      width="1200px"
      @close="visibleCollectionModal = false"
      @clickOutside="visibleCollectionModal = false">
    <template #header>
      <h2 class="text-xl font-bold">Danh sách môn học</h2>
    </template>
    <div class="flex flex-col gap-4 p-4 bg-gray-50 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
            id="major"
            name="major"
            label="Chuyên ngành"
            v-model="courseCreate.course_id"
            :dataOptions="courseOptions"
            inputType="select2"
            :required="true"
            rules="required"
            inputClass="w-full"
            selectPlaceholder="Chọn môn học"
        />
        <InputField
            id="semester"
            inputType="number"
            name="semester"
            label="Học kỳ"
            v-model="courseCreate.semester"
            rules="required|numeric"
            :required="true"
            labelClass="w-[200px]"
            inputClass="flex-1"
        />
      </div>
      <div class="flex justify-end">
        <button
            type="button"
            class="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition"
            @click="handleCreateCourse"
        >
          Thêm
        </button>
      </div>
    </div>
    <TableDefault :columns="courseColumns" :data="coursesByMajorId" />
    <template #footer>
      <div></div>
    </template>
  </CommonModal>
  <CommonModal
      className="max-w-[600px] top-[15%]" title="Import chuyên ngành" :isAction="true"
      :visible="visibleImportModal"
      @close="handleCloseImportModal"
      @clickOutside="handleCloseImportModal"
  >
    <VeeForm id="import_major_confirm" @submit="handleImport">
      <FileUploader v-model="selectedFile" accept=".xls,.xlsx" description="Chọn file Excel hoặc kéo thả vào đây (định dạng .xls, .xlsx, tối đa 5MB)" />
    </VeeForm>
    <template #footer>
      <button class="btn btn-light" @click="handleCloseImportModal">Hủy</button>
      <button class="btn btn-primary" type="submit" form="import_major_confirm">Xác nhận</button>
    </template>
  </CommonModal>
</template>
<style scoped lang="scss">

</style>
