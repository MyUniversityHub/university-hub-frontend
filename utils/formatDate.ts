export const formatDate = (timestamp: string | number): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};