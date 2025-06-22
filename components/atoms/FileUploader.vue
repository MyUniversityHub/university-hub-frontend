<template>
  <div class="flex flex-col items-center justify-center w-full">
    <label :for="inputId"
           class="flex flex-col items-center justify-center w-full border border-gray-300 border-solid rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600">
      <div class="flex flex-col items-center justify-center p-2.5">
        <p class="text-sm font-normal text-center">
          {{ description }}
        </p>
        <div class="text-success rounded-md h-10 flex items-center px-2.5 gap-1 cursor-pointer max-w-fit border border-solid border-gray-300 mt-2">
          <i class="ki-filled ki-file-up text-lg"></i>
          <span class="text-sm font-medium">Import</span>
        </div>
        <!-- Display error -->
        <p v-if="errorMessage" class="mt-2 text-sm text-red-500">
          {{ errorMessage }}
        </p>

        <!-- Display selected file name -->
        <p v-if="modelValue" class="mt-2 text-sm text-gray-700">
          {{ modelValue.name }}
        </p>
      </div>
      <input :id="inputId" type="file" class="hidden" @change="handleFileChange" :accept="accept" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: { type: Object, default: null }, // Bind selected file via v-model
  accept: { type: String, default: "" }, // Allowed file formats (e.g., ".xls,.xlsx")
  description: { type: String, default: "Chọn file để upload" },
  inputId: { type: String, default: "file-uploader" },
});

const emit = defineEmits(["update:modelValue"]);
const errorMessage = ref("");

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const allowedFormats = props.accept.split(",").map(ext => ext.replace(".", "").trim().toLowerCase());
  const fileExtension = file.name.split(".").pop().toLowerCase();

  if (!allowedFormats.includes(fileExtension)) {
    errorMessage.value = `Vui lòng chọn file đúng định dạng: ${props.accept}`;
    emit("update:modelValue", null); // Reset modelValue
    event.target.value = ""; // Reset input to allow re-selection
  } else {
    errorMessage.value = "";
    emit("update:modelValue", file); // Update modelValue with the selected file
  }
};
</script>