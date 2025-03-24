import { reactive, computed } from 'vue';

export function useFormData<T extends Record<string, any>>(defaultValues: T) {
    const formData = reactive({ ...defaultValues });

    const resetForm = () => {
        Object.assign(formData, { ...defaultValues });
    };

    const isFormDirty = computed(() => {
        return JSON.stringify(formData) !== JSON.stringify(defaultValues);
    });

    const handleInvalidSubmit = ({ errors, evt }) => {
        if (Object.keys(errors).length > 0) {
            const formElement = evt.target; // Lấy form từ event
            const firstErrorField = Object.keys(errors)[0]; // Lấy input đầu tiên bị lỗi
            const element = formElement.querySelector(`[name="${firstErrorField}"]`); // Tìm input trong form

            if (element) {
                element.focus(); // Focus vào input có lỗi
            }
        }
    };

    return { formData, resetForm, isFormDirty, handleInvalidSubmit };
}
