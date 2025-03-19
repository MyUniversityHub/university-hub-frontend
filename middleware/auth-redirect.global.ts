import {useUserStore} from "~/stores/userStore";

export default defineNuxtRouteMiddleware((to, from) => {
    const userStore = useUserStore();
    const userRole = userStore.roleName;

    const authToken = useCookie('auth_token').value;
    if (!authToken) {
        return;
    }

    if (userRole === 'ADMIN' && !to.fullPath.startsWith('/admin')) {
        return navigateTo('/admin/dashboard') // Điều hướng admin
    }
    if (userRole === 'TEACHER' && !to.fullPath.startsWith('/teacher')) {
        return navigateTo('/teacher/dashboard') // Điều hướng teacher
    }
    if (userRole === 'STUDENT' && !to.fullPath.startsWith('/student')) {
        return navigateTo('/student/dashboard') // Điều hướng student
    }
});
