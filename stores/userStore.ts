import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
    const id = ref<number | null>(null);
    const name = ref<string | null>(null);
    const email = ref<string | null>(null);
    const username = ref<string | null>(null);
    const roleId = ref<number | null>(null);
    const roleName = ref<string | null>(null);
    const active = ref<boolean | null>(null);
    const createdAt = ref<string | null>(null);
    const updatedAt = ref<string | null>(null);

    const user = computed(() => ({
        id: id.value,
        name: name.value,
        email: email.value,
        username: username.value,
        roleId: roleId.value,
        roleName: roleName.value,
        active: active.value,
        createdAt: createdAt.value,
        updatedAt: updatedAt.value,
    }));

    const setUser = (userData: {
        info: {
            id: number;
            name: string;
            user_name: string; // Đổi từ `username` thành `user_name` cho đúng dữ liệu đầu vào
            email: string;
            role_id: number;
            created_at: string;
            updated_at: string;
        };
        role: {
            id: number;
            name: string;
            active: string;
        };
    }) => {
        // Lưu thông tin user
        id.value = userData.info.id;
        name.value = userData.info.name;
        username.value = userData.info.user_name; // Đảm bảo đúng key
        email.value = userData.info.email;
        roleId.value = userData.info.role_id;
        createdAt.value = userData.info.created_at;
        updatedAt.value = userData.info.updated_at;

        // Lưu role (nếu cần)
        roleName.value = userData.role.name;

    };


    const clearUser = () => {
        id.value = null;
        name.value = null;
        email.value = null;
        username.value = null;
        roleId.value = null;
        roleName.value = null;
        active.value = null;
        createdAt.value = null;
        updatedAt.value = null;
    };

    const fetchUser = async () => {
        try {
            const response = await apiClient.get('/me');

            if (response && response.status) {
                setUser(response.data);
            } else {
                if (process.client) {
                    useNuxtApp().$toast.error('Failed to fetch user information');
                }
            }
        } catch (e) {
            console.error('Error fetching user:', e);
        }
    };

    return {
        id,
        name,
        email,
        username,
        roleId,
        roleName,
        active,
        createdAt,
        updatedAt,
        user,
        setUser,
        clearUser,
        fetchUser,
    };
});
