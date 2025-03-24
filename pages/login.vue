<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import {tokenService} from "~/services/tokenService";
import {useUserStore} from "~/stores/userStore";


definePageMeta({
  layout: 'auth',
});

interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
  };
}

const formData = ref({
  user_name: '',
  password: '',
});

const router = useRouter();


type FormValues = {
  user_name: string;
  password: string;
};

const onSubmit = async () => {
  try {
    const response = await apiClient.post<LoginResponse>(
        '/login',
        {
          user_name: formData.value.user_name,
          password: formData.value.password
        }
    );

    // Kiểm tra nếu status là 200 và có access_token
    if (response && response.status) {
      // Lưu access_token vào cookie
      const { access_token, token_type, expires_in, refresh_token } = response.data;
      useCookie('auth_token').value = access_token;
      useCookie('token_type').value = token_type;
      useCookie('refresh_token').value = refresh_token;

      const expireTime = new Date().getTime() + expires_in * 1000;
      localStorage.setItem('token_expire_time', expireTime.toString());
      // Cập nhật token trong TokenService

      tokenService.setToken(access_token, expireTime);
      const userStore = useUserStore();
      await userStore.fetchUser();
      router.push('/');
    } else {
      // Nếu không có token trong response, báo lỗi
      useNuxtApp().$toast.error('Đăng nhập thất bại');
    }
  } catch (error: any) {
    useNuxtApp().$toast.error(error.response.data.message || 'Đăng nhập thất bại');
  }
};
</script>

<template>
  <div class="w-1/3 mx-auto mt-[150px]">
    <div class="flex items-center justify-center grow bg-center bg-no-repeat page-bg min-w-[400px]">
      <div class="card w-full">
        <VeeForm @submit="onSubmit" class="card-body flex flex-col gap-5 p-10" id="sign_in_form">
          <div class="text-center mb-2.5">
            <h3 class="text-lg font-medium text-gray-900 leading-none mb-2.5">
              Đăng nhập
            </h3>
          </div>
          <div>
            <InputField
                id="user_name"
                name="user_name"
                label="Tên đăng nhập"
                rules="required|no_emojis"
                placeholder="Nhập tên đăng nhập"
                labelPosition="top"
                :required="true"
                v-model="formData.user_name"
                labelClass="w-2/4"
                inputClass="flex-1"
            />
            <InputField
                id="password"
                name="password"
                input-type="password"
                label="Mật khẩu"
                rules="required|no_emojis"
                placeholder="Nhập mật khẩu"
                labelPosition="top"
                :required="true"
                v-model="formData.password"
                labelClass="w-2/4"
                inputClass="flex-1"
            />
          </div>
          <Button type="submit" label="Đăng nhập" class="btn-primary" />
        </VeeForm>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.page-bg {
  background-image: url('/assets/media/images/2600x1200/bg-10.png');
}

.dark .page-bg {
  background-image: url('/assets/media/images/2600x1200/bg-10-dark.png');
}
</style>
