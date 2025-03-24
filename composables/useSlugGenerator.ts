import { ref, watch } from "vue";

export function useSlugGenerator(fieldName = "name", aliasName = "alias") {
    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .normalize("NFD") // Chuẩn hóa Unicode
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
            .replace(/-+/g, "-")
            .trim();
    };

    const field = ref("");
    const alias = ref("");

    watch(field, (newValue) => {
        alias.value = generateSlug(newValue);
    });

    return {
        [fieldName]: field,
        [aliasName]: alias,
    };
}