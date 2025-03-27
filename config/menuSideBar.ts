import {useUserStore} from "~/stores/userStore";

export interface MenuItem {
    title: string;
    icon?: string;
    path?: string;
    children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    {
        title: 'Trang chủ',
        icon: ' fas fa-home',
        path: '/admin/dashboard',
    },
    {
        title: 'Quản lý khoa',
        icon: ' fas fa-home',
        path: '/admin/departments',
    },
    {
        title: 'Quản lý chuyên ngành',
        icon: ' fas fa-home',
        path: '/admin/majors',
    },
    {
        title: 'Quản lý lớp học',
        icon: ' fas fa-home',
        path: '/admin/classes',
    },
    {
        title: 'Quản lý người dùng',
        icon: ' fas fa-home',
        path: '/admin/departments',
    }
];

export const getFilteredMenuItems = (): MenuItem[] => {
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .map(item => {
                // Lọc menu con nếu có
                const filteredChildren = item.children ? filterMenuItems(item.children) : undefined;
                return {
                    ...item,
                    children: filteredChildren, // Gắn menu con đã lọc
                };
            })
            .filter(Boolean) as MenuItem[]; // Loại bỏ các giá trị null
    };
    return filterMenuItems(menuItems);
};
