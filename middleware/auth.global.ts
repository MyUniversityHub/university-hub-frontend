export default defineNuxtRouteMiddleware((to, from) => {
    const authToken = useCookie('auth_token').value;

    // Tránh vòng lặp điều hướng khi logout
    if (!authToken && to.path !== '/login') {
        return navigateTo('/login');
    }
});
