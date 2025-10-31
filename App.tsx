import React, { useMemo, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { DataProvider } from './context/DataContext';
import { useData } from './hooks/useDataContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';

// Layouts
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ParentHeader } from './components/layout/ParentHeader';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { StudentsScreen } from './screens/StudentsScreen';
import { TeachersScreen } from './screens/TeachersScreen';
import { StaffScreen } from './screens/StaffScreen';
import { ClassesScreen } from './screens/ClassesScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ClassDetailScreen } from './screens/ClassDetailScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { AttendanceHubScreen } from './screens/AttendanceHubScreen';
import { FinanceScreen } from './screens/FinanceScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { StudentDetailScreen } from './screens/StudentDetailScreen';
import { TeacherDetailScreen } from './screens/TeacherDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AnnouncementsScreen } from './screens/AnnouncementsScreen';
// Parent Portal Screens
import { ParentDashboardScreen } from './screens/parent/ParentDashboardScreen';
import { ParentReportsScreen } from './screens/parent/ParentReportsScreen';
import { ParentFinanceScreen } from './screens/parent/ParentFinanceScreen';


import { UserRole } from './types';
import { ROUTES, ICONS } from './constants';
import { Button } from './components/common/Button';

// --- Components ---

const ThemeStyle: React.FC<{ themeColor: string; sidebarColor?: string }> = ({ themeColor, sidebarColor }) => {
  const styleContent = `
    :root { 
      --color-primary: ${themeColor}; 
      --color-primary-dark: ${themeColor}dd; 
      --color-sidebar-bg-dark: ${sidebarColor || '#1f2937'};
    }
  `;
  return <style>{styleContent}</style>;
};

const ProtectedRoute: React.FC<{children: React.ReactNode, allowedRoles: UserRole[]}> = ({ children, allowedRoles }) => {
    const { role, isAuthenticated } = useAuth();
    if (!isAuthenticated || !role || !allowedRoles.includes(role)) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }
    return <>{children}</>;
};

// --- Layouts ---

const AppLayout: React.FC = () => {
    const location = useLocation();
    const { error } = useData();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const pageTitle = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith(ROUTES.CLASS_DETAIL.split('/:')[0])) return 'Chi tiết Lớp học';
        if (path.startsWith(ROUTES.STUDENT_DETAIL.split('/:')[0])) return 'Chi tiết Học viên';
        if (path.startsWith(ROUTES.TEACHER_DETAIL.split('/:')[0])) return 'Chi tiết Giáo viên';
        if (path.startsWith(ROUTES.ATTENDANCE_DETAIL.split('/:')[0])) return 'Điểm danh';

        switch (path) {
            case ROUTES.DASHBOARD: return 'Bảng điều khiển';
            case ROUTES.STUDENTS: return 'Quản lý Học viên';
            case ROUTES.TEACHERS: return 'Quản lý Giáo viên';
            case ROUTES.STAFF: return 'Quản lý Nhân viên';
            case ROUTES.CLASSES: return 'Quản lý Lớp học';
            case ROUTES.ATTENDANCE_HUB: return 'Lịch điểm danh';
            case ROUTES.FINANCE: return 'Quản lý Tài chính';
            case ROUTES.ANNOUNCEMENTS: return 'Quản lý Thông báo';
            case ROUTES.REPORTS: return 'Báo cáo & Thống kê';
            case ROUTES.SETTINGS: return 'Cài đặt Trung tâm';
            default: return 'EduCenter Pro';
        }
    }, [location.pathname]);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header pageTitle={pageTitle} onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    {error && (
                        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded-md" role="alert">
                            <p className="font-bold">Thông báo</p>
                            <p>{error}</p>
                        </div>
                    )}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const ParentLayout: React.FC = () => {
    const { error } = useData();
    return (
        <div className="flex flex-col min-h-screen">
            <ParentHeader />
            <main className="flex-1 container mx-auto px-4 py-6">
                {error && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
                        <p className="font-bold">Thông báo</p>
                        <p>{error}</p>
                    </div>
                )}
                <Outlet />
            </main>
        </div>
    );
};

const OfflineScreen: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center flex-col p-8 text-center bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M17.657 17.657A10 10 0 1 1 6.343 6.343m11.314 0l-11.314 11.314"/></svg>
        <h1 className="text-2xl font-bold mt-4">Không có kết nối mạng</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm">Ứng dụng cần tải dữ liệu ban đầu. Vui lòng kiểm tra kết nối internet của bạn và thử lại.</p>
        <Button onClick={() => window.location.reload()} className="mt-6">
            Thử lại
        </Button>
    </div>
);


const AppRoutes: React.FC = () => {
    const { isAuthenticated, role, isAuthLoading } = useAuth();
    const { state, isInitialOffline } = useData();

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(state.settings.theme === 'dark' ? 'light' : 'dark');
        root.classList.add(state.settings.theme);
    }, [state.settings.theme]);

    useEffect(() => {
        if (state.settings.name) {
            document.title = state.settings.name;
        }
    }, [state.settings.name]);
    
    if (state.loading || isAuthLoading) {
         return (
            <div className="flex h-screen w-screen items-center justify-center">
                {ICONS.loading}
                <span className="ml-4 text-xl">Đang tải dữ liệu...</span>
            </div>
        )
    }

    if (isInitialOffline) {
        return <OfflineScreen />;
    }
    
    return (
        <>
            <ThemeStyle themeColor={state.settings.themeColor} sidebarColor={state.settings.sidebarColor} />
            <Routes>
                <Route path={ROUTES.LOGIN} element={<LoginScreen />} />
                
                {/* Admin/Staff Routes */}
                <Route element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.ACCOUNTANT, UserRole.TEACHER, UserRole.VIEWER]}>
                        <AppLayout />
                    </ProtectedRoute>
                }>
                    <Route path={ROUTES.DASHBOARD} element={<DashboardScreen />} />
                    <Route path={ROUTES.CLASSES} element={<ClassesScreen />} />
                    <Route path={ROUTES.CLASS_DETAIL} element={<ClassDetailScreen />} />
                    <Route path={ROUTES.ATTENDANCE_DETAIL} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.TEACHER, UserRole.VIEWER]}><AttendanceScreen /></ProtectedRoute>} />

                    {/* Role-protected routes */}
                    <Route path={ROUTES.STUDENTS} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><StudentsScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.STUDENT_DETAIL} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><StudentDetailScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.TEACHERS} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><TeachersScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.TEACHER_DETAIL} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><TeacherDetailScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.STAFF} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><StaffScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.ATTENDANCE_HUB} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><AttendanceHubScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.FINANCE} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.VIEWER]}><FinanceScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.REPORTS} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><ReportsScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.SETTINGS} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.VIEWER]}><SettingsScreen /></ProtectedRoute>} />
                    <Route path={ROUTES.ANNOUNCEMENTS} element={<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.VIEWER]}><AnnouncementsScreen /></ProtectedRoute>} />
                </Route>

                {/* Parent Portal Routes */}
                <Route element={
                    <ProtectedRoute allowedRoles={[UserRole.PARENT]}>
                        <ParentLayout />
                    </ProtectedRoute>
                }>
                    <Route path={ROUTES.PARENT_DASHBOARD} element={<ParentDashboardScreen />} />
                    <Route path={ROUTES.PARENT_REPORTS} element={<ParentReportsScreen />} />
                    <Route path={ROUTES.PARENT_FINANCE} element={<ParentFinanceScreen />} />
                </Route>

                <Route path="*" element={<Navigate to={isAuthenticated ? (role === UserRole.PARENT ? ROUTES.PARENT_DASHBOARD : ROUTES.DASHBOARD) : ROUTES.LOGIN} replace />} />
            </Routes>
        </>
    );
};

const App: React.FC = () => {
  return (
    <DataProvider>
        <AuthProvider>
            <ToastProvider>
                <HashRouter>
                    <AppRoutes />
                </HashRouter>
                <ToastContainer />
            </ToastProvider>
        </AuthProvider>
    </DataProvider>
  );
};

export default App;