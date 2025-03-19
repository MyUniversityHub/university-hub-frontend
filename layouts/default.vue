<template>
  <div class="flex grow">
    <Sidebar/>
    <div class="wrapper flex grow flex-col">
      <Header/>
      <!-- Content -->
      <main class="grow content pt-5 flex justify-center" id="content" role="content">
        <!-- Container -->
        <!--        <div class="container-fixed" id="content_container">-->
        <!--        </div>-->
        <!-- End of Container -->
        <!-- Container -->
        <div class="container">
          <slot></slot>
        </div>
        <!-- End of Container -->
      </main>
      <!-- Footer -->
      <Footer/>
      <!-- End of Footer -->
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
