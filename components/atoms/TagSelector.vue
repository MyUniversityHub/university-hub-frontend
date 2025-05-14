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
        {{ typeof label === 'string' ? label : $t(label) }}
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
          v-model="internalValue"
          :class="{ 'border-danger': errors[name] }"
          :rules="rules"
          :label="label"
          :disabled="disabled"
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

<script setup>
import { useFormErrors } from 'vee-validate';
import { defineProps, defineEmits, onMounted, nextTick, ref, watch } from 'vue';

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
  value: [Number, String],
  inputType: { type: String, default: 'normal' },
  dataOptions: Array,
  labelPosition: { type: String, default: 'left' },
  labelClass: { type: String, default: 'w-full' },
  inputClass: { type: String, default: 'w-full' },
  modelValue: [Number, String, Array],
  multiple: { type: Boolean, default: false },
});
const errors = useFormErrors();

const emit = defineEmits(["update:modelValue"]);

const internalValue = ref(props.modelValue);

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
      multiple: props.multiple,
    });

    // Sync the value with v-model
    $select.on("change", () => {
      const selectedValues = $select.val();
      if (JSON.stringify(internalValue.value) !== JSON.stringify(selectedValues)) {
        internalValue.value = selectedValues || [];
      }
    });

    // Set initial value
    if (Array.isArray(props.modelValue)) {
      $select.val(props.modelValue).trigger("change");
    }
  });
});

// Watch for external changes to modelValue
watch(
    () => props.modelValue,
    (newValue) => {
      if (JSON.stringify(internalValue.value) !== JSON.stringify(newValue)) {
        internalValue.value = newValue;
        const $select = $(`#${props.id}`);
        $select.val(newValue).trigger("change");
      }
    }
);

// Emit changes to parent
watch(internalValue, (newValue) => {
  if (JSON.stringify(props.modelValue) !== JSON.stringify(newValue)) {
    emit("update:modelValue", newValue);
  }
});
</script>