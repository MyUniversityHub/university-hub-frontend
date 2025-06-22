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
            icon: 'fas fa-gauge',
            path: '/admin/dashboard',
        },
        {
            title: 'Quản lý khoa',
            icon: 'fas fa-university',
            path: '/admin/departments',
        },
        {
            title: 'Quản lý chuyên ngành',
            icon: 'fas fa-layer-group',
            path: '/admin/majors',
        },
        {
            title: 'Quản lý lớp học',
            icon: 'fas fa-users-rectangle',
            path: '/admin/classes',
        },
        {
            title: 'Quản lý người dùng',
            icon: 'fas fa-user-gear',
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
            icon: 'fas fa-book-atlas',
            path: '/admin/courses',
        },
        {
            title: 'Mở lớp học phần',
            icon: 'fas fa-folder-plus',
            path: '/admin/curriculum-programs',
        },
        {
            title: 'Quản lý phòng học',
            icon: 'fas fa-school',
            path: '/admin/classrooms',
        },
        {
            title: 'Quản lý lớp học phần',
            icon: 'fas fa-clipboard-list',
            path: '/admin/course-classes',
        }
    ],
    STUDENT: [
        {
            title: 'Trang chủ',
            icon: 'fas fa-tachometer-alt', // Dashboard icon
            path: '/student/dashboard',
        },
        {
            title: 'Thời khóa biểu',
            icon: 'fas fa-calendar-days', // Modern calendar icon
            path: '/student/class-schedule',
        },
        {
            title: 'Đăng ký học phần',
            icon: 'fas fa-clipboard-check', // Registration icon
            path: '/student/register-course',
        },
        {
            title: 'Kết quả học tập',
            icon: 'fas fa-award', // Result/award icon
            path: '/student/results',
        },
        {
            title: 'Chương trình đào tạo',
            icon: 'fas fa-sitemap', // Curriculum/program icon
            path: '/student/curriculum-programs',
        },
        {
            title: 'Thanh toán công nợ',
            icon: 'fas fa-money-check-dollar', // Payment icon
            path: '/student/registration-fee-detail',
        },
        {
            title: 'Nạp tiền',
            icon: 'fas fa-piggy-bank', // Deposit icon
            path: '/student/payment',
        },
        {
            title: 'Lịch sử giao dịch',
            icon: 'fas fa-clock-rotate-left', // Transaction history icon
            path: '/student/transaction-histories',
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
            title: 'Quản lý lịch dạy',
            icon: 'fas fa-tasks',
            path: '/teacher/teaching-schedule',
        }
    ],
};

export const getFilteredMenuItems = (): MenuItem[] => {

    const userStore = useUserStore();
    const userRole = userStore.roleName;
    console.log('userRole', userRole);
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
    return filterMenuItems(allMenuItems[userRole] || []);
};
