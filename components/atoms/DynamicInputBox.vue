<template>
  <div :class="className">
    <div v-for="(box, index) in boxes" :key="box.id" class="border p-4 rounded-lg shadow-md space-y-2 relative">
      <div class="flex justify-between items-center">
        <span class="font-semibold">{{ titleBox }} #{{ index + 1 }}</span>
        <div
            class="rounded-md h-10 flex items-center px-2.5 gap-1 cursor-pointer border border-solid border-gray-300 text-danger"
            @click="removeBox(box.id)"
        >
          <i class="ki-filled ki-trash text-lg"></i>
          <span class="text-sm font-medium">Xóa</span>
        </div>
      </div>
      <slot :box="box" :update-box-value="updateBoxValue" :fields="props.fields" :index="index"></slot>
    </div>

    <div
        class="rounded-md h-10 inline-flex items-center px-2.5 gap-1 cursor-pointer border border-solid border-gray-300 text-primary mt-4"
        @click="addBox"
    >
      <i class="ki-filled ki-additem text-lg"></i>
      <span class="text-sm font-medium">Thêm mới</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, toRef } from "vue";

interface Box {
  id: number;
  values: Record<string, any>;
}

const props = defineProps({
  modelValue: {
    type: Array as () => Array<{ id: number; values: Record<string, any> }>,
    required: true
  },
  fields: {
    type: Array as () => string[],
    default: () => []
  },
  className: {
    type: String,
    default: ""
  },
  titleBox: {
    type: String,
    default: "Box"
  },
  initialValues: {
    type: Object as () => Record<string, any>,
    default: () => ({})
  }
});

const emit = defineEmits(["update:modelValue"]);

// Sử dụng toRef để giữ tính reactive của initialValues
const initialValuesRef = toRef(props, 'initialValues');
const initialFields = props.fields ?? [];
const boxes = ref<Box[]>([]);

// Theo dõi modelValue (boxData) để fill vào các input
watch(
    () => props.modelValue,
    (newValue) => {
      if (!Array.isArray(newValue)) return;
      boxes.value = newValue;
    },
    { immediate: true, deep: true }
);

watch(initialValuesRef, (newValues) => {
  boxes.value.forEach(box => {
    Object.keys(newValues).forEach(key => {
      if (box.values[key] === '' || box.values[key] === undefined) {
        box.values[key] = newValues[key];
        updateModelValue();
      }
    });
  });
}, { deep: true });

const updateBoxValue = (boxId: number, field: string, value: any) => {
  const box = boxes.value.find((b) => b.id === boxId);
  if (box) {
    box.values[field] = value;
    updateModelValue();
  }
};

const updateModelValue = () => {
  emit("update:modelValue", boxes.value);
};

const addBox = () => {
  const newBox = {
    id: Date.now(),
    values: {
      ...Object.fromEntries(initialFields.map((key) => [key, ""])),
      ...initialValuesRef.value // Sử dụng .value để lấy giá trị từ ref
    }
  };
  boxes.value.push(newBox);
  updateModelValue();
};

const removeBox = (id: number) => {
  boxes.value = boxes.value.filter((box) => box.id !== id);
  updateModelValue();
};
</script>