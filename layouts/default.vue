<template>
  <Header/>
  <Sidebar/>
  <!-- Content -->
  <div class="p-4 sm:ml-64">
    <div class="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
      <slot></slot>
    </div>
  </div>


  <Loading/>
</template>

<script setup>
// const flashMessage = useFlash();
// const route = useRoute();
// const showToast = () => {
//   if (flashMessage.value) {
//     useNuxtApp().$toast.success(flashMessage.value);
//     flashMessage.value = null;
//   }
// };
// watch(route, () => {
//   showToast();
// });
import Sidebar from "~/components/Sidebar.vue";
</script>
