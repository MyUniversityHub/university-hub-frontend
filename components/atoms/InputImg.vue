<template>
  <div v-if="hidden" :class="`mb-4 flex ${labelPosition === 'top' ? 'flex-col' : 'flex-col items-center justify-center lg:flex-row'} gap-2`">
    <!-- Label -->
    <div v-if="label" :class="labelClass">
      <label class="block font-medium text-gray-700" :for="id">
        {{ label }}
        <span class="text-danger" v-if="required">*</span>
      </label>
    </div>

    <!-- Input Field -->
    <div class="flex flex-col" :class="inputClass">
      <div class="image-input relative" :class="[imgPreviewClass]" data-image-input="true" @click="triggerFileInput">
        <VeeField
            ref="fileInput"
            type="file"
            :id="id"
            :accept="accept"
            :name="name"
            :rules="rules"
            class="hidden"
            @change="onFileChange"
            :label="label"
        />
        <VeeField type="hidden" :name="`${name}_remove`" />

        <div
            class="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -right-0.5 rounded-full"
            @click.stop="removeImage"
            data-tooltip="Click to remove or revert"
            data-tooltip-trigger="hover"
        >
          <i class="ki-outline ki-cross"></i>
        </div>
        <div
            class="image-input-placeholder image-input-empty:border-gray-300 object-cover rounded-md border border-gray-300"
            :class="{ 'is-invalid': errors[name] }"
            :style="{ backgroundImage: `url(${imagePreview})` }"
        >
          <div class="image-input-preview rounded-full"></div>
          <div class="flex items-center justify-center cursor-pointer h-5 left-0 right-0 bottom-0 bg-dark-clarity absolute">
            <svg class="fill-light opacity-80" height="12" viewBox="0 0 14 12" width="14" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M11.6665 2.64585H11.2232C11.0873 2.64749 10.9538 2.61053 10.8382 2.53928C10.7225 2.46803 10.6295 2.36541 10.5698 2.24335L10.0448 1.19918C9.91266 0.931853 9.70808 0.707007 9.45438 0.550249C9.20068 0.393491 8.90806 0.311121 8.60984 0.312517H5.38984C5.09162 0.311121 4.799 0.393491 4.5453 0.550249C4.2916 0.707007 4.08701 0.931853 3.95484 1.19918L3.42984 2.24335C3.37021 2.36541 3.27716 2.46803 3.1615 2.53928C3.04584 2.61053 2.91234 2.64749 2.7765 2.64585H2.33317C1.90772 2.64585 1.49969 2.81486 1.19885 3.1157C0.898014 3.41654 0.729004 3.82457 0.729004 4.25002V10.0834C0.729004 10.5088 0.898014 10.9168 1.19885 11.2177C1.49969 11.5185 1.90772 11.6875 2.33317 11.6875H11.6665C12.092 11.6875 12.5 11.5185 12.8008 11.2177C13.1017 10.9168 13.2707 10.5088 13.2707 10.0834V4.25002C13.2707 3.82457 13.1017 3.41654 12.8008 3.1157C12.5 2.81486 12.092 2.64585 11.6665 2.64585Z"
                  fill=""
              ></path>
            </svg>
          </div>
        </div>
      </div>
      <VeeErrorMessage :name="name" class="text-danger text-sm mt-1" />
    </div>
  </div>
</template>
<script setup>
import { ref, watch, defineEmits, defineProps } from 'vue';
import {useField, useFormErrors} from 'vee-validate';

const props = defineProps({
  id: String,
  name: String,
  modelValue: String, // Giá trị hình ảnh hiện tại (URL)
  hidden: { type: Boolean, default: true },
  labelPosition: { type: String, default: 'left' },
  label: String,
  labelClass: { type: String, default: 'w-full' },
  required: Boolean,
  inputClass: { type: String, default: 'w-full' },
  imgPreviewClass: { type: String },
  rules: String,
  accept: {
    type: String,
    default: '.png, .jpg, .jpeg',
  },
  base64: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const defaultImage = '/assets/media/images/600x400/default-blog-img.jpg';
const imagePreview = ref(props.modelValue || defaultImage);
imagePreview.value = imagePreview.value.replace(/ /g, '%20'); // Thay thế khoảng trắng bằng %20 (Nếu đường dẫn có khoảng trắng)
const { value: model, errorMessage } = useField(props.name, props.rules, {
  initialValue: props.modelValue,
  validateOnValueUpdate: true,
});

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
      if (props.base64) {
        emit('update:modelValue', e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }
};
// const onFileChange = (event) => {
//   const file = event.target.files[0];
//
//   if (file) {
//     imagePreview.value = URL.createObjectURL(file); // Hiển thị ảnh preview
//     emit('update:modelValue', file); // Trả về file thay vì base64
//   }
// };


const errors = useFormErrors();
const fileInput = ref(null);
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.$el.click();
  }
};

const removeImage = () => {
  imagePreview.value = defaultImage;
  emit('update:modelValue', null);
};

watch(() => props.modelValue, (newValue) => {
  imagePreview.value = newValue || defaultImage;
});
</script>
<style lang="scss" scoped>
.is-invalid {
  border: 1px solid red;
}
.common-input {
  border-radius: 4px !important;
  &:focus {
    outline: none !important;
    border: 1px solid #007580 !important;
  }
}
.border-danger + .tox-tinymce .tox-sidebar-wrap {
  border: 1px solid red !important;
}

.image-input-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: contain; /* Ensure the image fits within the container */
  background-repeat: no-repeat; /* Prevent the image from repeating */
  background-position: center; /* Center the image */
  width: 100%; /* Use the width provided by the parent */
  height: 100%; /* Use the height provided by the parent */
  border-radius: 8px; /* Optional: Add rounded corners */
  border: 1px solid #d1d5db; /* Optional: Add a border */
}
</style>
