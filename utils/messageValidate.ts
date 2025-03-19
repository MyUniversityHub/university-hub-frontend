 export function validateMessage(type, ...params) {
    const messages = {
        required: ([field]) => `${field} là bắt buộc.`,
        minLength: ([field, length]) => `${field} phải ít nhât ${length} kí tự.`
    };

    return messages[type] ? messages[type](params) : "Invalid validation type.";
}