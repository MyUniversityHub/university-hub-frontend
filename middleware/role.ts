import {useUserStore} from "~/stores/userStore";
export default defineNuxtRouteMiddleware(async (to, from) => {
    const userStore = useUserStore();
    const userRole = userStore.roleName; // Lấy role từ store
    const allowedRoles = to.meta.roles || [];
    if (!userRole || !allowedRoles.includes(userRole)) {
        return navigateTo('/403'); // Chuyển hướng đến trang không có quyền truy cập
    }
});
