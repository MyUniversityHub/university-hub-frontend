import {useUserStore} from "~/stores/userStore";

export interface MenuItem {
    title: string;
    icon?: string;
    path?: string;
    children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: ' fas fa-home',
        path: '/admin/dashboard',
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
