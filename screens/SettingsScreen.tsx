import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../hooks/useDataContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/common/Button';
import { CenterSettings, UserRole } from '../types';
import { ICONS } from '../constants';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';

const AdminPasswordSettings: React.FC = () => {
    const { state, updateSettings } = useData();
    const { toast } = useToast();
    const { role } = useAuth();
    const isViewer = role === UserRole.VIEWER;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        const actualCurrentPassword = state.settings.adminPassword || '123456';
        if (currentPassword !== actualCurrentPassword) {
            setError('Mật khẩu hiện tại không đúng.');
            return;
        }

        setIsLoading(true);
        try {
            await updateSettings({ ...state.settings, adminPassword: newPassword });
            toast.success('Đổi mật khẩu Quản trị viên thành công!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error('Đã xảy ra lỗi khi đổi mật khẩu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card-base">
            <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu Quản trị viên</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                 <div>
                    <label className="block text-sm font-medium">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-input mt-1"
                        required
                        disabled={isViewer}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Mật khẩu mới</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input mt-1"
                        required
                        disabled={isViewer}
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Xác nhận mật khẩu mới</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input mt-1"
                        required
                        disabled={isViewer}
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                 <div className="pt-2 flex justify-end">
                    <Button type="submit" isLoading={isLoading} disabled={isViewer}>Lưu Mật khẩu</Button>
                </div>
            </form>
        </div>
    );
};


export const SettingsScreen: React.FC = () => {
    const { state, updateSettings, backupData, restoreData, resetToMockData, clearCollections, deleteAttendanceByMonth } = useData();
    const { toast } = useToast();
    const { role } = useAuth();
    const [settings, setSettings] = useState<CenterSettings>(state.settings);
    const [isSaving, setIsSaving] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
    const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
    
    const [collectionsToClear, setCollectionsToClear] = useState<('students' | 'teachers' | 'staff' | 'classes')[]>([]);
    const [clearDataModalOpen, setClearDataModalOpen] = useState(false);
    const [confirmDeleteAtt, setConfirmDeleteAtt] = useState(false);
    
    const [deleteAttMonth, setDeleteAttMonth] = useState(new Date().getMonth() + 1);
    const [deleteAttYear, setDeleteAttYear] = useState(new Date().getFullYear());

    const isViewer = role === UserRole.VIEWER;


    useEffect(() => {
        // Ensure viewerAccountActive is always a boolean in the local state
        setSettings({
            ...state.settings,
            viewerAccountActive: state.settings.viewerAccountActive ?? true,
        });
    }, [state.settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Ensure the value being saved is a boolean, not undefined
            const settingsToSave = {
                ...settings,
                viewerAccountActive: !!settings.viewerAccountActive,
            };
            await updateSettings(settingsToSave);
            toast.success('Đã cập nhật cài đặt trung tâm.');
        } catch (error) {
            toast.error("Lỗi khi cập nhật cài đặt.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleBackup = async () => {
        try {
            const dataToBackup = await backupData();
            const dataStr = JSON.stringify(dataToBackup, null, 2);
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `EduCenterPro_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success('Sao lưu dữ liệu thành công!');
        } catch (error) {
            console.error("Backup failed:", error);
            toast.error('Sao lưu dữ liệu thất bại.');
        }
    };
    
    const handleRestoreFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File could not be read");
                const restoredData = JSON.parse(text);
                
                if (restoredData.students && (restoredData.settings || restoredData.centerInfo)) {
                    setRestoreConfirm({ open: true, data: restoredData });
                } else {
                    throw new Error("Invalid backup file format");
                }
            } catch (error) {
                console.error("Restore failed:", error);
                toast.error('Phục hồi thất bại. File sao lưu không hợp lệ.');
            } finally {
                event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleConfirmRestore = async () => {
        if (restoreConfirm.data) {
            try {
                await restoreData(restoreConfirm.data);
                toast.success('Phục hồi dữ liệu thành công! Trang sẽ được tải lại.');
                setTimeout(() => window.location.reload(), 1500);
            } catch (error) {
                toast.error("Lỗi khi phục hồi dữ liệu.");
            }
        }
    };

    const handleConfirmReset = async () => {
        try {
            await resetToMockData();
            toast.success('Đã khôi phục dữ liệu thành công! Trang sẽ được tải lại.');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error("Lỗi khi khôi phục dữ liệu.");
        }
    };

    const handleCheckboxChange = (collection: 'students' | 'teachers' | 'staff' | 'classes') => {
        setCollectionsToClear(prev => 
            prev.includes(collection) 
                ? prev.filter(c => c !== collection)
                : [...prev, collection]
        );
    };

    const handleClearData = async () => {
        try {
            await clearCollections(collectionsToClear);
            toast.success('Dữ liệu đã chọn đã được xóa thành công! Trang sẽ được tải lại.');
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            toast.error('Lỗi khi xóa dữ liệu.');
        } finally {
            setClearDataModalOpen(false);
            setCollectionsToClear([]);
        }
    };

    const handleDeleteAttendanceByMonth = async () => {
        try {
            await deleteAttendanceByMonth({ month: deleteAttMonth, year: deleteAttYear });
            toast.success(`Đã xóa toàn bộ dữ liệu điểm danh của tháng ${deleteAttMonth}/${deleteAttYear}.`);
        } catch (error) {
            toast.error('Lỗi khi xóa dữ liệu điểm danh.');
        }
    };

    const dataTypes: { key: 'students' | 'teachers' | 'staff' | 'classes'; label: string }[] = [
        { key: 'students', label: 'Học viên (bao gồm học phí, điểm danh,...)' },
        { key: 'teachers', label: 'Giáo viên (bao gồm bảng lương)' },
        { key: 'staff', label: 'Nhân viên (Quản lý, Kế toán)' },
        { key: 'classes', label: 'Lớp học (bao gồm điểm danh, báo cáo)' },
    ];
    
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);


    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">Cài đặt</h1>

            <form onSubmit={handleSettingsSubmit} className="space-y-8">
                {role === UserRole.ADMIN && (
                     <div className="card-base">
                        <h2 className="text-2xl font-bold mb-6">Quản lý Tài khoản</h2>
                         <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-gray-200">Tài khoản Viewer (Chỉ đọc)</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Cho phép đăng nhập với quyền xem toàn bộ dữ liệu nhưng không thể chỉnh sửa.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="viewerAccountActive"
                                    checked={settings.viewerAccountActive}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                    disabled={isViewer}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                <span className={`ml-3 text-sm font-medium ${settings.viewerAccountActive ? 'text-green-600' : 'text-gray-500'}`}>
                                    {settings.viewerAccountActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                <AdminPasswordSettings />

                <div className="card-base">
                    <h2 className="text-2xl font-bold mb-6">Cài đặt Trung tâm</h2>
                    <div className="space-y-6">
                        <fieldset className="form-fieldset" disabled={isViewer}>
                            <legend className="form-legend">Thông tin chung</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium">Tên trung tâm</label>
                                    <input type="text" name="name" value={settings.name} onChange={handleChange} className="form-input mt-1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Số điện thoại</label>
                                    <input type="text" name="phone" value={settings.phone || ''} onChange={handleChange} className="form-input mt-1" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium">Địa chỉ</label>
                                <input type="text" name="address" value={settings.address || ''} onChange={handleChange} className="form-input mt-1" />
                            </div>
                        </fieldset>
                        
                         <fieldset className="form-fieldset" disabled={isViewer}>
                            <legend className="form-legend">Tùy chỉnh Giao diện</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                 <div>
                                    <label className="block text-sm font-medium">Màu chủ đạo</label>
                                    <input type="color" name="themeColor" value={settings.themeColor} onChange={handleChange} className="form-input mt-1 h-12" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">Màu nền Menu (Dark mode)</label>
                                    <input type="color" name="sidebarColor" value={settings.sidebarColor || '#1f2937'} onChange={handleChange} className="form-input mt-1 h-12" />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-fieldset" disabled={isViewer}>
                            <legend className="form-legend">Tùy chỉnh Trang đăng nhập</legend>
                            <div className="mt-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">Nội dung Tiêu đề</label>
                                    <textarea
                                        name="loginHeaderContent"
                                        value={settings.loginHeaderContent || ''}
                                        onChange={handleChange}
                                        rows={6}
                                        className="form-textarea mt-1 font-mono"
                                        placeholder="Nhập văn bản hoặc mã HTML..."
                                    />
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Bạn có thể sử dụng các thẻ HTML cơ bản để định dạng, ví dụ:
                                        <br />
                                        <code>&lt;strong&gt;Chữ in đậm&lt;/strong&gt;</code>, <code>&lt;img src="..." /&gt;</code>, hoặc nhúng video YouTube.
                                    </p>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="form-fieldset" disabled={isViewer}>
                            <legend className="form-legend">Thông tin Thanh toán (cho mã QR)</legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="block text-sm font-medium">Tên ngân hàng</label>
                                    <input type="text" name="bankName" value={settings.bankName || ''} onChange={handleChange} className="form-input mt-1" placeholder="VD: Vietcombank" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Ngân hàng (Mã BIN)</label>
                                    <input type="text" name="bankBin" value={settings.bankBin || ''} onChange={handleChange} className="form-input mt-1" placeholder="VD: 970436" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">Số tài khoản</label>
                                    <input type="text" name="bankAccountNumber" value={settings.bankAccountNumber || ''} onChange={handleChange} className="form-input mt-1" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium">Tên chủ tài khoản</label>
                                    <input type="text" name="bankAccountHolder" value={settings.bankAccountHolder || ''} onChange={handleChange} className="form-input mt-1" placeholder="NGUYEN VAN A" />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>

                 {!isViewer && (
                     <div className="flex justify-end pt-4">
                        <Button type="submit" isLoading={isSaving}>Lưu Cài đặt</Button>
                    </div>
                )}
            </form>
            
            <div className="card-base">
                <h2 className="text-2xl font-bold mb-6">Quản lý Dữ liệu</h2>
                <div className="space-y-6">
                     <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200">Sao lưu & Phục hồi</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 mb-3">Tạo bản sao lưu toàn bộ dữ liệu hoặc phục hồi từ một file sao lưu.</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleBackup} variant="secondary" disabled={isViewer}>
                                {ICONS.backup} Sao lưu Dữ liệu
                            </Button>
                            <label htmlFor="restore-input" className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold bg-blue-600 text-white ${isViewer ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}>
                                {ICONS.restore} Phục hồi từ File
                            </label>
                            <input id="restore-input" type="file" accept=".json" onChange={handleRestoreFileSelect} className="hidden" disabled={isViewer} />
                        </div>
                    </div>

                    <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-red-800 dark:text-red-200">Khu vực Nguy hiểm</h3>
                        
                        <div className="mt-4">
                            <h4 className="font-semibold">Xóa dữ liệu theo Module</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1 mb-3">Thao tác này sẽ xóa vĩnh viễn tất cả dữ liệu trong các module được chọn. Hãy cẩn thận.</p>
                            <div className="space-y-2">
                                {dataTypes.map(type => (
                                    <label key={type.key} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={collectionsToClear.includes(type.key)}
                                            onChange={() => handleCheckboxChange(type.key)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                            disabled={isViewer}
                                        />
                                        <span className="ml-2 text-sm">{type.label}</span>
                                    </label>
                                ))}
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => setClearDataModalOpen(true)}
                                disabled={collectionsToClear.length === 0 || isViewer}
                                className="mt-4"
                            >
                                Xóa {collectionsToClear.length} Module đã chọn
                            </Button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-700">
                            <h4 className="font-semibold">Xóa Dữ liệu Điểm danh theo Tháng</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1 mb-3">Thao tác này sẽ xóa vĩnh viễn toàn bộ dữ liệu điểm danh trong tháng đã chọn. Dùng để dọn dẹp dữ liệu.</p>
                             <div className="flex items-center gap-4">
                                <select value={deleteAttMonth} onChange={e => setDeleteAttMonth(Number(e.target.value))} className="form-select w-auto" disabled={isViewer}>
                                    {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                                </select>
                                <select value={deleteAttYear} onChange={e => setDeleteAttYear(Number(e.target.value))} className="form-select w-auto" disabled={isViewer}>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <Button variant="danger" onClick={() => setConfirmDeleteAtt(true)} disabled={isViewer}>
                                    Xóa Điểm danh
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-700">
                            <h4 className="font-semibold">Khôi phục Dữ liệu Mặc định</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1 mb-3">Thao tác này sẽ xóa TẤT CẢ dữ liệu hiện tại và thay thế bằng bộ dữ liệu mặc định của hệ thống. Dùng khi bạn muốn bắt đầu lại.</p>
                            <Button variant="danger" onClick={() => setResetConfirmOpen(true)} disabled={isViewer}>
                                Khôi phục Dữ liệu Mặc định
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={restoreConfirm.open}
                onClose={() => setRestoreConfirm({ open: false, data: null })}
                onConfirm={handleConfirmRestore}
                title="Xác nhận Phục hồi Dữ liệu"
                message={<p>Bạn có chắc chắn muốn phục hồi dữ liệu từ file đã chọn? <span className="font-bold text-red-500">Toàn bộ dữ liệu hiện tại sẽ bị ghi đè.</span></p>}
                confirmButtonText="Xác nhận Phục hồi"
                confirmButtonVariant="danger"
            />
            <ConfirmationModal
                isOpen={resetConfirmOpen}
                onClose={() => setResetConfirmOpen(false)}
                onConfirm={handleConfirmReset}
                title="Xác nhận Khôi phục Dữ liệu Mặc định"
                message="Hành động này không thể hoàn tác. Toàn bộ dữ liệu hiện tại của bạn sẽ bị xóa và thay thế bằng dữ liệu mặc định."
                confirmationKeyword="KHÔI PHỤC"
                confirmButtonVariant="danger"
            />
            <ConfirmationModal
                isOpen={clearDataModalOpen}
                onClose={() => setClearDataModalOpen(false)}
                onConfirm={handleClearData}
                title="Xác nhận Xóa Dữ liệu"
                message={`Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ dữ liệu của ${collectionsToClear.length} module đã chọn?`}
                confirmationKeyword="XÓA"
                confirmButtonVariant="danger"
            />
             <ConfirmationModal
                isOpen={confirmDeleteAtt}
                onClose={() => setConfirmDeleteAtt(false)}
                onConfirm={handleDeleteAttendanceByMonth}
                title="Xác nhận Xóa Dữ liệu Điểm danh"
                message={`Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ dữ liệu điểm danh trong tháng ${deleteAttMonth}/${deleteAttYear}? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};