import { watch, reactive, toRefs } from "vue";
import { useNuxtApp } from "#app";
import { apiClient } from "~/utils/fetchClient";
import { useDebounceFn } from "@vueuse/core";

export function useCommonList(apiEndpoint: string, initialParams = {}, isPaginate = true, watchImmediate = true) {
    const { $toast } = useNuxtApp();

    const state = reactive({
        dataList: [] as any[],
        totalRecords: 0,
        currentPage: 1,
        perPage: 10,
        from: 1,
        isLoading: false,
        error: null as any,
        params: initialParams,
        selectedIds: new Set<number>(),
        isPaginate: isPaginate ?? true,
    });

    const fetchData = async () => {
        state.isLoading = true;
        state.error = null;

        try {
            const filteredParams = Object.fromEntries(
                Object.entries({
                    per_page: state.perPage,
                    page: state.currentPage,
                    ...state.params,
                }).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
            );
            const response = await apiClient.get(apiEndpoint, {
                params: filteredParams,
                responseType: "json",
            });
            if (!response?.status || !response.data) {
                $toast.error("Failed to fetch data");
                return;
            }
            if (state.isPaginate && response.data?.data) {
                state.dataList = response.data.data;
                state.from = response.data.from;
                state.totalRecords = response.data.total ?? 0;
                state.selectedIds.clear();
            } else {
                state.dataList = Array.isArray(response.data) ? response.data : [response.data];
            }

        } catch (e) {
            console.error("Error fetching data:", e);
            $toast.error("Có lỗi xảy ra !");
            state.error = e;
        } finally {
            state.isLoading = false;
        }
    };

    const debouncedFetch = useDebounceFn(fetchData, 500);

    watch(
        () => state.params,
        (newParams, oldParams) => {
            const hasValue = Object.values(newParams).some(value => value !== '' && value !== null && value !== 'all' && value !== 0);
            if (hasValue) {
                state.currentPage = 1;
            }
            debouncedFetch();
        },
        { deep: true }
    );

    watch(
        () => [state.currentPage, state.perPage],
        () => {
            debouncedFetch();
        },
        { immediate: watchImmediate, deep: true }
    );

    watch(
        () => state.selectedIds,
        (newVal, oldVal) => {
            console.log("selectedIds đã thay đổi:", newVal);
        },
        { deep: true }
    );

    const handleSelectAll = (checked: boolean , id: string = 'id') => {
        if (checked) {
            state.selectedIds = new Set(state.dataList.map(item => item[id]));
        } else {
            state.selectedIds.clear();
        }
    };

    const handleSelectMultiple = (id: number) => {
        if (state.selectedIds.has(id)) {
            state.selectedIds.delete(id);
        } else {
            state.selectedIds.add(id);
        }
    };

    return {
        ...toRefs(state),
        fetchData,
        handleSelectAll,
        handleSelectMultiple,
    };
}

