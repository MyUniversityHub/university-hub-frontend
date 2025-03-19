<script setup lang="ts">
import {useRouter} from 'vue-router';
import {useUserStore} from "~/stores/userStore";

const router = useRouter();

async function logout() {
  try {
    // Gửi yêu cầu logout tới server
    await apiClient.post('/logout');
  } catch (error: any) {
    // Xử lý lỗi
    console.error(error);
  } finally {
    // Xóa token và token_type khỏi cookie
    useCookie('auth_token').value = null;
    useCookie('token_type').value = null;
    useCookie('refresh_token').value = null;
    // Xóa thời gian hết hạn token khỏi localStorage
    localStorage.removeItem('token_expire_time');
    router.push('/login');
  }
}

const userStore = useUserStore();
</script>

<template>
  <!-- Header -->
  <header
      class="header fixed top-0 z-10 start-0 end-3 flex justify-center items-stretch shrink-0 bg-[--tw-page-bg]"
      data-sticky="true" data-sticky-class="shadow-sm" data-sticky-name="header" id="header">
    <!-- Container -->
    <div class="container flex justify-between items-stretch lg:gap-4" id="header_container">
      <!-- Mobile Logo -->
      <div class="flex gap-1 lg:hidden items-center -ms-1">
        <NuxtLink class="shrink-0" to="/">
          <img class="max-h-[25px] w-full" src="/assets/media/app/logo.svg"/>
        </NuxtLink>

        <div class="flex items-center">
          <button class="btn btn-icon btn-light btn-clear btn-sm" data-drawer-toggle="#sidebar">
            <i class="ki-filled ki-menu">
            </i>
          </button>
        </div>
      </div>
      <!-- End of Mobile Logo -->
      <!--Megamenu Contaoner-->
      <div class="flex items-stretch" id="mega_menu_container">
        <!--Megamenu Inner-->
        <div class="flex items-stretch" data-reparent="true" data-reparent-mode="prepend|lg:prepend"
             data-reparent-target="body|lg:#mega_menu_container">
          <!--Megamenu Wrapper-->
          <div class="hidden lg:flex lg:items-stretch" data-drawer="true"
               data-drawer-class="drawer drawer-start fixed z-10 top-0 bottom-0 w-full me-5 max-w-[250px] p-5 lg:p-0 overflow-auto"
               data-drawer-enable="true|lg:false" id="mega_menu_wrapper">
          </div>
          <!--End of Megamenu Wrapper-->
        </div>
        <!--End of Megamenu Inner-->
      </div>
      <!--End of Megamenu Contaoner-->
      <!-- Topbar -->
      <div class="flex items-center gap-2 lg:gap-3.5">
        <div class="menu" data-menu="true">
          <div class="menu-item" data-menu-item-offset="20px, 10px" data-menu-item-offset-rtl="-20px, 10px"
               data-menu-item-placement="bottom-end" data-menu-item-placement-rtl="bottom-start"
               data-menu-item-toggle="dropdown" data-menu-item-trigger="click|lg:click">
            <div class="menu-toggle btn btn-icon rounded-full">
              <img alt="" class="size-9 rounded-full border-2 border-success shrink-0"
                   src="/assets/media/avatars/300-2.png">
              </img>
            </div>
            <div class="menu-dropdown menu-default light:border-gray-300 w-screen max-w-[250px]">
              <div class="flex items-center justify-between px-5 py-1.5 gap-1.5">
                <div class="flex items-center gap-2">
                  <img alt="" class="size-9 rounded-full border-2 border-success"
                       src="/assets/media/avatars/300-2.png"/>
                  <div class="flex flex-col gap-1.5">
              <span class="text-sm text-gray-800 font-semibold leading-none">
                {{ userStore.name }}
              </span>
                    <a class="text-xs text-gray-600 hover:text-primary font-medium leading-none"
                    >
                      {{ userStore.email }}
                    </a>
                  </div>
                </div>
                <!--                <span class="badge badge-xs badge-primary badge-outline">-->
                <!--            Pro-->
                <!--           </span>-->
              </div>
              <div class="menu-separator">
              </div>
              <div class="flex flex-col">
                <div class="menu-item">
                  <NuxtLink class="menu-link" :to="'/profile'">
             <span class="menu-icon">
              <i class="ki-filled ki-profile-circle">
              </i>
             </span>
                    <span class="menu-title">
              Tài khoản
             </span>
                  </NuxtLink>
                </div>
              </div>
              <div class="menu-separator">
              </div>
              <div class="flex flex-col">
                <div class="menu-item px-4 py-1.5">
                  <a class="btn btn-sm btn-light justify-center" @click="logout">
                    Đăng xuất
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- End of Topbar -->
    </div>
    <!-- End of Container -->
  </header>
  <!-- End of Header -->

</template>
