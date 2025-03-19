import { defineNuxtPlugin } from '#app';
import { useUserStore } from '~/stores/userStore';
import { useRolesStore } from '~/stores/rolesStore';
import { tokenService } from '~/services/tokenService';
import { watch } from 'vue';

export default defineNuxtPlugin(async (nuxtApp) => {
    const userStore = useUserStore();
    const token = tokenService.getToken();
    if (token && !userStore.id) {
        try {
            await userStore.fetchUser();
        } catch (error) {
            console.error('Error fetching user data in plugin:', error);
            // tokenService.removeToken(); // Xóa token nếu fetchUser thất bại
        }
    }
});
