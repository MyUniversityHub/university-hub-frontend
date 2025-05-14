<template>
  <div v-if="hidden"
       :class="[
            'mb-4 flex gap-2',
            labelPosition === 'top' ? 'flex-col' : 'lg:flex-row flex-col',
            labelPosition !== 'top' ? 'lg:items-center lg:justify-center' : '',
            labelPosition === 'border' ? 'relative' : ''
        ]">
    <!-- Label -->
    <div v-if="label" :class="[labelClass, labelPosition === 'border' ? 'label-border' : '']">
      <label class="block text-sm font-medium text-gray-900 dark:text-white" :for="id">
        {{ label }}
        <span class="text-danger" v-if="required">*</span>
      </label>
    </div>

    <!-- Input Field -->
    <div :class="inputClass">
      <!-- Normal Input -->
      <VeeField
          v-if="inputType === 'normal'"
          :id="id"
          :name="name"
          :class="['input', { 'is-invalid': errors[name], 'cursor-not-allowed': disabled  }]"
          :type="type"
          :maxlength="maxlength"
          :rules="rules"
          :label="label"
          :disabled="disabled"
          :placeholder="placeholder"
          v-model="model"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          @input="formatInput"
          @blur="emit('blur', $event)"
          @keyup.enter="emit('blur', $event)"
      />

      <!-- Number Input -->
      <VeeField
          v-if="inputType === 'number'"
          :id="id"
          :name="name"
          :class="{ 'is-invalid': errors[name] }"
          :type="inputType"
          :maxlength="maxlength"
          :rules="rules"
          :label="label"
          :disabled="disabled"
          :placeholder="placeholder"
          v-model="model"
          class="common-input w-full px-3 py-2  "
          @blur="emit('blur', $event)"
      />

      <!-- Price Input -->
      <div v-if="inputType === 'price'" class="flex items-center">
        <VeeField
            :id="id"
            :name="name"
            :class="{ 'is-invalid': errors[name] }"
            :type="type"
            :maxlength="maxlength"
            :rules="rules"
            :label="label"
            :disabled="disabled"
            :placeholder="placeholder"
            v-model="model"
            class="common-input w-full px-3 py-2  "
            @blur="emit('blur', $event)"
        />
        <span class="ml-2 text-gray-500">{{ $t(labelCurrency) }}</span>
      </div>

      <!-- Dropdown -->
      <VeeField
          v-if="inputType === 'dropdown'"
          as="select"
          :id="id"
          :name="name"
          :class="['select',{ 'is-invalid': errors[name] }]"
          :maxlength="maxlength"
          :rules="rules"
          :label="label"
          :disabled="disabled"
          :placeholder="selectPlaceholder"
          v-model="model"
          :value="value"
          class="common-input w-full px-3 py-2 leading-normal"
          @blur="emit('blur', $event)"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option v-for="item in dataOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </VeeField>

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
          class="common-input select2 w-full px-3 py-2   hidden"
          @blur="emit('blur', $event)"
          @keyup.enter="emit('blur', $event)"
      >
        <option v-for="item in dataOptions" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </VeeField>

      <!-- Text Area -->
      <VeeField
          v-if="inputType === 'textarea'"
          as="textarea"
          rows="4"
          :id="id"
          :name="name"
          :class="{ 'is-invalid': errors[name] }"
          :maxlength="maxlength"
          :rules="rules"
          :label="label"
          :disabled="disabled"
          :placeholder="placeholder"
          v-model="model"
          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 fw-500"
          @blur="emit('blur', $event)"
      />

      <!-- Radio Input -->
      <div v-if="inputType === 'radio'" class="flex gap-12">
        <label v-for="(item, index) in dataOptions" :key="index" class="form-label flex items-center gap-2.5 text-nowrap">
          <VeeField
              type="radio"
              :name="name"
              :value="item.value"
              v-model="model"
              :rules="rules"
              :label="label"
              :disabled="disabled"
              class="radio"
              @blur="emit('blur', $event)"
          />
          <span>{{ item.label }}</span>
        </label>
      </div>

      <!-- Checkbox Input -->
      <div v-if="inputType === 'checkbox'" class="flex flex-col gap-4">
        <label v-for="(item, index) in dataOptions" :key="index" class="form-label flex items-center gap-2.5">
          <VeeField
              type="checkbox"
              :name="name"
              :value="item.value"
              v-model="model"
              :rules="rules"
              :label="label"
              :disabled="disabled"
              class="checkbox"
              @change="dataOptions.length === 1 ? handleCheckboxChange($event, defaultValue) : null"
              @blur="emit('blur', $event)"
          />
          <span>{{ item.label }}</span>
        </label>
      </div>

      <div v-if="inputType === 'editor'" >
        <CkEditor
            :id="id"
            :name="name"
            :label="label"
            v-model="model"
            :rules="rules"
            :height="height"
            @blur="emit('blur', $event)"
        />
      </div>

      <!-- Input Password -->
      <div v-if="inputType === 'password'" class="flex flex-col gap-4 relative">
        <VeeField
            :id="id"
            :name="name"
            :class="['input', { 'is-invalid': errors[name] }]"
            :type="isVisiblePass ? 'text' : 'password'"
            :maxlength="maxlength"
            :rules="rules"
            :label="label"
            :disabled="disabled"
            :placeholder="placeholder"
            v-model="model"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            @blur="emit('blur', $event)"
        />
        <button type="button" class="absolute right-[12px] top-1/2 -translate-y-1/2" @click="togglePass">
          <i v-if="!isVisiblePass" class="ki-filled ki-eye text-gray-500"></i>
          <i v-else class="ki-filled ki-eye-slash text-gray-500"></i>
        </button>
      </div>

      <div v-if="inputType === 'date'" class="flex flex-col gap-4 relative">
        <VeeField
            v-slot="{ field, errors }"
            :id="id"
            :name="name"
            :rules="rules"
            :label="label"
            v-model="model"
        >
          <DatePicker
              v-bind="field"
              v-model:value="model"
              valueType="format"
              :format="'YYYY-MM-DD'"
              class=""
              style="width: 100%;"
              :placeholder="placeholder"
              :class="{ 'is-invalid': errors.length > 0 }"
          />
        </VeeField>
      </div>
      <div v-if="inputType === 'daterange'" class="flex flex-col gap-4 relative">
        <VeeField
            v-slot="{ field, errors }"
            :id="id"
            :name="name"
            :rules="rules"
            :label="label"
            v-model="model"
        >
          <DatePicker
              v-bind="field"
              v-model:value="model"
              range
              valueType="YYYY-MM-DD"
              :format=formatDate
              class=""
              style="width: 100%;"
              :placeholder="placeholder"
              :class="{ 'is-invalid': errors.length > 0 }"
          />
        </VeeField>
      </div>

      <!-- Character count input -->
      <div v-if="inputType === 'character-count'" class="w-full">
        <VeeField
            v-if="inputType === 'character-count'"
            :id="id"
            :name="name"
            :class="['input', { 'is-invalid': errors[name] }]"
            :type="type"
            :maxlength="maxlength"
            :rules="rules"
            :label="label"
            :disabled="disabled"
            :placeholder="placeholder"
            v-model="model"
            class="common-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring"
            @input="updateValue"
            @blur="emit('blur', $event)"
            @keyup.enter="emit('blur', $event)"
        />

        <div class="text-right text-sm text-gray-500 mt-1">
          Tổng số kí tự: {{ charCount }}
        </div>
      </div>

      <!-- Error Message -->
      <VeeErrorMessage :name="name" class="text-danger text-sm mt-1" />
    </div>
  </div>
</template>

<script setup>
import { useFormErrors } from 'vee-validate';
import { defineProps, defineEmits, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  id: String,
  name: String,
  classField: String,
  disabled: Boolean,
  maxlength: Number,
  required: Boolean,
  hidden: { type: Boolean, default: true },
  type: { type: String, default: 'text' },
  rules: String,
  label: String,
  placeholder: { type: String, default: 'Nhập giá trị'},
  value: [Number, String],
  inputType: { type: String, default: 'normal' },
  labelCurrency: { type: String, default: 'common.currency' },
  dataOptions: Array,
  labelPosition: { type: String, default: 'left' },
  labelClass: { type: String, default: 'w-full' },
  inputClass: { type: String, default: 'w-full' },
  modelValue: [Number, String, Array],
  selectPlaceholder: { type: String, default: 'Chọn một giá trị' },
  height: Number,
  formatDate: { type: String, default: "DD/MM/YYYY" },
  formatInput: { type: Function, default: () => {} },
  defaultValue: { type: [Number, String], default: 0 }
});
const emit = defineEmits(['update:modelValue', 'blur']);
const isVisiblePass = ref(false);
const togglePass = () => {
  isVisiblePass.value = !isVisiblePass.value;
};
const errors = useFormErrors();
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
const charCount = computed(() => (model.value ? model.value.length : 0));
const updateValue = (event) => {
  model.value = event.target.value.slice(0, props.maxlength);
  emit("update:modelValue", model.value);
};
watch(() => props.modelValue, (newValue) => {
  emit('update:modelValue', newValue);
});
const handleCheckboxChange = (event, uncheckedValue) => {
  const target = event.target;
  model.value = target.checked ? Number(target.value) : uncheckedValue;
};
onMounted(() => {
  nextTick(() => {
    $('.select2').each(function () {
      let $this = $(this);
      if ($this.data('select2')) {
        $this.select2('destroy');
      }

      let placeholderText = $this.attr('placeholder');
      $this.select2({
        width: '100%',
        placeholder: placeholderText,
        allowClear: true
      }).on('change', function () {
        const selectedValue = $(this).val();

        // Cập nhật modelValue
        if ($this.attr('id') === props.id) {
          emit('update:modelValue', selectedValue);
        }

        // Nếu component có sự kiện @change thì gọi nó
        emit('change', selectedValue);
      });
    });
  });
});

</script>
<style lang="scss" scoped>
.is-invalid {
  border: 1px solid red !important;
}
.border-danger + .tox-tinymce .tox-sidebar-wrap {
  border: 1px solid red !important;
}
.label-border {
  position: absolute;
  width: fit-content;
  display: inline;
  padding: 0 5px;
  top: -8px;
  left: 10px;
  background-color: white;
  font-size: 14px;
  line-height: 14px;
  //z-index: 50;
}
textarea::placeholder {
  color: #a0a5b1; /* Màu xám nhạt */
  font-style: normal;
  font-size: 14px;
  font-weight: 500;
}

</style>
