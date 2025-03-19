import { useNuxtApp, useRequestHeaders } from '#app';
import { tokenService } from '~/services/tokenService';

const toggleLoading = (show: boolean) => {
    if (process.client) {
        const loadingElement = document.querySelector('.load_data') as HTMLElement;
        if (loadingElement) {
            loadingElement.style.display = show ? 'flex' : 'none';
        }
    }
};

const getHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    const token = tokenService.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const makeRequest = async <T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    options: Partial<Parameters<typeof $fetch>[1]> = {},
    isLoading = true,
): Promise<T> => {
    const nuxtApp = useNuxtApp();
    const config = useRuntimeConfig();
    const headers = await getHeaders();
    const fullUrl = `${config.public.apiUrl}${url}`;

    if (isLoading && process.client) toggleLoading(true); // Chỉ hiển thị loading spinner trên client-side

    try {
        return await $fetch<T>(fullUrl, {
            ...options,
            method,
            headers: {
                ...options.headers,
                ...headers,
            },
        });
    } catch (error: any) {
        if (process.client) {
            if (error?.status === 422 && error?.data?.errors) {
                let firstError = 'Có lỗi xảy ra.';
                if (typeof error.data.errors === 'string') {
                    // Nếu errors là một chuỗi, dùng trực tiếp
                    firstError = error.data.errors;
                } else if (Array.isArray(error.data.errors)) {
                    // Nếu errors là một mảng, lấy phần tử đầu tiên
                    firstError = error.data.errors[0];
                } else if (typeof error.data.errors === 'object') {
                    // Nếu errors là object, lấy giá trị đầu tiên rồi kiểm tra có phải mảng không
                    const errorsArray = Object.values(error.data.errors).flat();
                    firstError = errorsArray.length > 0 ? errorsArray[0] : firstError;
                }
                nuxtApp.$toast?.error(firstError);
            } else {
                nuxtApp.$toast?.error(error?.data?.message || 'Something went wrong');
            }

        }
        throw error;
    } finally {
        if (isLoading && process.client) toggleLoading(false); // Tắt loading spinner trên client-side
    }
};

export const apiClient = {
    request: makeRequest,

    get: <T>(url: string, options?: Partial<Parameters<typeof $fetch>[1]>, isLoading = true) =>
        makeRequest<T>(url, 'GET', options, isLoading),

    post: <T>(url: string, body?: any, options?: Partial<Parameters<typeof $fetch>[1]>, isLoading = true) =>
        makeRequest<T>(url, 'POST', { ...options, body }, isLoading),

    put: <T>(url: string, body?: any, options?: Partial<Parameters<typeof $fetch>[1]>, isLoading = true) =>
        makeRequest<T>(url, 'PUT', { ...options, body }, isLoading),

    delete: <T>(url: string, options?: Partial<Parameters<typeof $fetch>[1]>, isLoading = true) =>
        makeRequest<T>(url, 'DELETE', options, isLoading),
};