<script setup lang="ts">
import { ref, watch } from "vue";

const selectedOption = ref("");
const options = ref([
  { label: "Option 1", value: 1 },
  { label: "Option 2", value: 2 },
  { label: "Option 3", value: 3 },
]);

</script>

<template>
  <!-- TagSelecter Component -->
  <TagSelecter
      id="classes"
      name="classes"
      label="Lớp"
      v-model="selectedOption"
      :data-options="options"
      inputType="select2"
      :required="true"
      rules="required"
      inputClass="w-full"
      selectPlaceholder="Chọn lớp"
  />

  <!-- Textarea for manual input -->
  <textarea v-model="selectedOption" class="w-full mt-4"></textarea>
</template>

<style scoped lang="scss">
/* Add any necessary styles here */
</style>