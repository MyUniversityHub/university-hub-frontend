<script setup lang="ts">
import {defineProps} from "vue";

defineProps({
  title: {
    required: true,
  },
  isAction: {
    type: Boolean,
    default: true,
  },
  modelValue: String,
});

defineEmits(["update:modelValue"]);

</script>
<template>
  <div class="card overflow-x-auto">
    <div class="card-header flex-wrap py-5">
      <h3 class="card-title text-xl font-bold">
        {{ title }}
      </h3>
      <div class="flex flex-col items-end gap-6">
        <slot name="button"></slot>
      </div>
      <div v-if="isAction" class="flex flex-wrap gap-2 lg:gap-5 justify-end w-full mt-5">
        <slot name="action">
          <div class="relative">
            <i class="ki-filled ki-magnifier leading-none text-md text-gray-500 absolute top-1/2 start-0 -translate-y-1/2 ms-3">
            </i>
            <input class="input input-sm ps-8"
                   data-datatable-search="#teams_table"
                   placeholder="Tìm kiếm..."
                   type="text"
                   :value="modelValue"
                   @input="$emit('update:modelValue', $event.target.value)"
                   @keyup.enter="$emit('search')"
            >
          </div>
        </slot>
      </div>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>
