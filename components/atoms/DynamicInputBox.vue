<template>
  <div :class="className">
    <div v-for="(box, index) in boxes" :key="box.id" class="border p-4 rounded-lg shadow-md space-y-2 relative">
      <div class="flex justify-between items-center">
        <span class="font-semibold">{{titleBox}} #{{ index + 1 }}</span>
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
import { ref, defineProps, defineEmits } from "vue";

interface Box {
  id: number;
  values: Record<string, string>;
}

const props = defineProps<{
  modelValue: Array<{ id: number; values: Record<string, any>; districtOptions?: Array<any> }>;
  fields?: string[],
  className?: string,
  titleBox: {
    type: string,
    default: "Box"
  }
}>();
const emit = defineEmits(["update:modelValue"]);

const initialFields = props.fields ?? []; // Nếu fields không tồn tại, dùng mảng rỗng
const boxes = ref<Box[]>([
  { id: Date.now(), values: Object.fromEntries(initialFields.map((key) => [key, ""])) }
]);

// Theo dõi modelValue (boxData) để fill vào các input
watch(
    () => props.modelValue,
    (newValue) => {
      if (!Array.isArray(newValue)) return;
      boxes.value = newValue;
    },
    { immediate: true }
);


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
  boxes.value.push({
    id: Date.now(), // Unique ID for the box
    values: Object.fromEntries(initialFields.map((key) => [key, ""])),
  });
  updateModelValue();
};
const removeBox = (id: number) => {
  boxes.value = boxes.value.filter((box) => box.id !== id);
  updateModelValue();
};
</script>

