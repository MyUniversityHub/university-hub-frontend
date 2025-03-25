 export function validateMessage(type, ...params) {
    const messages = {
        required: ([field]) => `${field} là bắt buộc.`,
        minLength: ([field, length]) => `${field} phải ít nhât ${length} kí tự.`,
        max: ([field, length]) => `${field} tối đa ${length} kí tự.`
    };

    return messages[type] ? messages[type](params) : "Invalid validation type.";
}