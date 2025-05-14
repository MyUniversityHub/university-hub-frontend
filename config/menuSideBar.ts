import {useUserStore} from "~/stores/userStore";

export interface MenuItem {
    title: string;
    icon?: string;
    path?: string;
    children?: MenuItem[];
}

const allMenuItems: Record<string, MenuItem[]> = {
    ADMIN: [
        {
            title: 'Trang chủ',
            icon: 'fas fa-home',
            path: '/admin/dashboard',
        },
        {
            title: 'Quản lý khoa',
            icon: 'fas fa-building',
            path: '/admin/departments',
        },
        {
            title: 'Quản lý chuyên ngành',
            icon: 'fas fa-book',
            path: '/admin/majors',
        },
        {
            title: 'Quản lý lớp học',
            icon: 'fas fa-chalkboard',
            path: '/admin/classes',
        },
        {
            title: 'Quản lý người dùng',
            icon: 'fas fa-users',
            path: '/admin/users',
            children: [
                {
                    title: 'Quản lý admin',
                    path: '/admin/admins',
                },
                {
                    title: 'Quản lý sinh viên',
                    path: '/admin/students',
                },
                {
                    title: 'Quản lý giảng viên',
                    path: '/admin/teachers',
                },
            ],
        },
        {
            title: 'Quản lý môn học',
            icon: 'fas fa-book',
            path: '/admin/courses',
        },
        {
            title: 'Quản lý phòng học',
            icon: 'fas fa-door-open',
            path: '/admin/classrooms',
        },
        {
            title: 'Quản lý lớp học phần',
            icon: 'fas fa-door-open',
            path: '/admin/course-classes',
        }
    ],
    STUDENT: [
        {
            title: 'Trang chủ',
            icon: 'fas fa-home',
            path: '/student/dashboard',
        },
        {
            title: 'Lớp học của tôi',
            icon: 'fas fa-chalkboard-teacher',
            path: '/student/my-classes',
        },
        {
            title: 'Bài tập',
            icon: 'fas fa-tasks',
            path: '/student/assignments',
        },
        {
            title: 'Kết quả học tập',
            icon: 'fas fa-chart-line',
            path: '/student/results',
        },
    ],
    TEACHER: [
        {
            title: 'Trang chủ',
            icon: 'fas fa-home',
            path: '/teacher/dashboard',
        },
        {
            title: 'Lớp học của tôi',
            icon: 'fas fa-chalkboard-teacher',
            path: '/teacher/my-classes',
        },
        {
            title: 'Quản lý bài tập',
            icon: 'fas fa-tasks',
            path: '/teacher/assignments',
        },
        {
            title: 'Kết quả học tập',
            icon: 'fas fa-chart-line',
            path: '/teacher/results',
        },
    ],
};

export const getFilteredMenuItems = (): MenuItem[] => {

    const userStore = useUserStore();
    const userRole = userStore.roleName;
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
    return filterMenuItems(allMenuItems[userRole]);
};
