<script setup>
import { useFormErrors } from 'vee-validate';
import { defineProps, defineEmits, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  id: String,
  name: String,
  classField: String,
  disabled: Boolean,
  maxlength: Number,
  required: Boolean,
  hidden: { type: Boolean, default: true },
  rules: String,
  label: String,
  placeholder: { type: String, default: 'Nhập giá trị' },
  value: String, // Comma-separated string
  inputType: { type: String, default: 'normal' },
  dataOptions: Array,
  labelPosition: { type: String, default: 'left' },
  labelClass: { type: String, default: 'w-full' },
  inputClass: { type: String, default: 'w-full' },
  modelValue: String, // Comma-separated string
  selectPlaceholder: { type: String, default: 'Chọn một giá trị' },
  multiple: { type: Boolean, default: false },
});
const errors = useFormErrors();

const emit = defineEmits(["update:modelValue"]);

onMounted(() => {
  nextTick(() => {
    const $select = $(`#${props.id}`);

    // Destroy any existing select2 instance
    if ($select.data("select2")) {
      $select.select2("destroy");
    }

    // Initialize select2 with multiple selection
    $select.select2({
      width: "100%",
      placeholder: props.placeholder,
      allowClear: true,
      multiple: true,
    });

    // Sync the value with v-model
    $select.on("change", () => {
      const selectedValues = $select.val();
      emit("update:modelValue", selectedValues ? selectedValues.join(",") : "");
    });

    // Set initial value
    if (props.modelValue) {
      const valuesArray = props.modelValue.split(",");
      $select.val(valuesArray).trigger("change");
    }
  });
});

// Watch for external changes to modelValue
watch(
    () => props.modelValue,
    (newValue) => {
      const $select = $(`#${props.id}`);
      const valuesArray = newValue ? newValue.split(",") : [];
      $select.val(valuesArray).trigger("change");
    }
);
</script>

<template>
  <div v-if="hidden"
       :class="['mb-4 flex gap-2', {
    'flex-col': labelPosition === 'top',
    'lg:flex-row flex-col': labelPosition !== 'top',
    'lg:items-center lg:justify-center': labelPosition !== 'top',
    'relative': labelPosition === 'border',
    }, classField]">
    <!-- Label -->
    <div v-if="label" :class="[labelClass, labelPosition === 'border' ? 'label-border' : '']">
      <label class="block font-medium text-gray-700" :for="id">
        {{ label }}
        <span class="text-danger" v-if="required">*</span>
      </label>
    </div>

    <!-- Input Field -->
    <div :class="inputClass">
      <!-- Select2 Dropdown -->
      <VeeField
          v-if="inputType === 'select2'"
          as="select"
          :id="id"
          :name="name"
          :class="{ 'border-danger': errors[name] }"
          :rules="rules"
          :label="label"
          :disabled="disabled"
          :placeholder="selectPlaceholder"
          v-model="model"
          :value="value"
          ref="select2-custom"
          class="common-input select2 w-full px-3 py-2 hidden"
          :multiple="multiple"
          @blur="emit('blur', $event)"
          @keyup.enter="emit('blur', $event)"
          autocomplete="off"
      >
        <option v-for="item in dataOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </VeeField>

      <!-- Error Message -->
      <VeeErrorMessage :name="name" class="text-danger text-sm mt-1" />
    </div>
  </div>
</template>