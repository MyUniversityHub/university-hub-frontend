<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useForm } from 'vee-validate';
// import * as yup from 'yup';
import {tokenService} from "~/services/tokenService";
import {useUserStore} from "~/stores/userStore";
import {ref} from "vue";


definePageMeta({
  layout: 'auth',
  name: 'login',
});

</script>
<template>
  <button class="btn btn-light btn-success">
    Button 1
  </button>
</template>

<style scoped lang="scss">
//.page-bg {
//  background-image: url('/assets/media/images/2600x1200/bg-10.png');
//}
//
//.dark .page-bg {
//  background-image: url('/assets/media/images/2600x1200/bg-10-dark.png');
//}
</style>
