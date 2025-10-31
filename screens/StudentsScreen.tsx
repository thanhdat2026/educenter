import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { Table, SortConfig } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ICONS } from '../constants';
import { PersonStatus, Student, UserRole, Class } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { Pagination } from '../components/common/Pagination';
import { ListItemCard } from '../components/common/ListItemCard';
import { ResetPasswordModal } from '../components/auth/ChangePasswordModal';
import { PaymentModal } from '../components/finance/PaymentModal';


const ClassSelector: React.FC<{
    allClasses: Class[];
    selectedClassIds: string[];
    onChange: (selectedIds: string[]) => void;
}> = ({ allClasses, selectedClassIds, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClasses = useMemo(() => {
        return allClasses.filter(cls =>
            cls.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allClasses, searchTerm]);

    const handleToggle = (classId: string) => {
        const newSelectedIds = selectedClassIds.includes(classId)
            ? selectedClassIds.filter(id => id !== classId)
            : [...selectedClassIds, classId];
        onChange(newSelectedIds);
    };

    return (
        <div className="border rounded-md dark:border-gray-600 bg-white dark:bg-gray-800">
            <div className="p-2 border-b dark:border-gray-600">
                <input
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input w-full p-2"
                />
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
                {filteredClasses.length > 0 ? (
                    filteredClasses.map(cls => (
                        <label key={cls.id} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedClassIds.includes(cls.id)}
                                onChange={() => handleToggle(cls.id)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="ml-3 text-sm">{cls.name}</span>
                        </label>
                    ))
                ) : (
                    <p className="text-center text-sm text-gray-500 p-4">Không tìm thấy lớp học.</p>
                )}
            </div>
             <div className="p-2 border-t dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400">
                Đã chọn: {selectedClassIds.length} lớp học
            </div>
        </div>
    );
};


const StudentForm: React.FC<{ 
    student?: Student; 
    onSubmit: (payload: { student: Student, classIds: string[] }) => void; 
    onCancel: () => void;
    allClasses: Class[];
}> = ({ student, onSubmit, onCancel, allClasses }) => {
    const [formData, setFormData] = useState<Partial<Student>>({
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        dob: '',
        parentName: '',
        status: PersonStatus.ACTIVE,
        createdAt: '',
        balance: 0,
        password: '',
        ...student,
    });
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});
    const idInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        idInputRef.current?.focus();
        if (student) {
            const enrolledClassIds = allClasses
                .filter(c => c.studentIds.includes(student.id))
                .map(c => c.id);
            setSelectedClassIds(enrolledClassIds);
        }
    }, [student, allClasses]);
    
    const validate = () => {
        const newErrors: Partial<Record<keyof Student, string>> = {};
        if (!formData.id?.trim()) newErrors.id = "Mã học viên là bắt buộc.";
        if (!formData.name?.trim()) newErrors.name = "Họ tên là bắt buộc.";
        if (!formData.email?.trim()) {
            newErrors.email = "Email là bắt buộc.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email không hợp lệ.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const studentData = { ...formData };
            if (!studentData.password) {
                delete studentData.password;
            }
            onSubmit({ student: studentData as Student, classIds: selectedClassIds });
        }
    };

    const inputGroupClass = "grid grid-cols-1 md:grid-cols-2 gap-4";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="form-fieldset">
                <legend className="form-legend">Thông tin cá nhân</legend>
                <div className={`${inputGroupClass} mt-2`}>
                    <div>
                        <label className="block text-sm font-medium">Mã Học viên <span className="text-red-500">*</span></label>
                        <input ref={idInputRef} type="text" name="id" value={formData.id} onChange={handleChange} className="form-input mt-1" />
                        {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Họ tên <span className="text-red-500">*</span></label>
                        {/* FIX: Removed duplicate `value` attribute */}
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input mt-1" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Ngày sinh</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="form-input mt-1" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="form-select mt-1">
                            <option value={PersonStatus.ACTIVE}>Hoạt động</option>
                            <option value={PersonStatus.INACTIVE}>Tạm nghỉ</option>
                        </select>
                    </div>
                </div>
            </fieldset>

             <fieldset className="form-fieldset">
                <legend className="form-legend">Thông tin liên lạc & Tài khoản</legend>
                 <div className={`${inputGroupClass} mt-2`}>
                    <div>
                        <label className="block text-sm font-medium">Email <span className="text-red-500">*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input mt-1" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Số điện thoại</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Tên phụ huynh</label>
                        <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="form-input mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu</label>
                        <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="form-input mt-1" placeholder="Bỏ trống để dùng ngày sinh (ddmmyyyy)" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label className="block text-sm font-medium">Địa chỉ</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input mt-1" />
                </div>
            </fieldset>

            <fieldset className="form-fieldset">
                <legend className="form-legend">Ghi danh Lớp học</legend>
                 <ClassSelector
                    allClasses={allClasses}
                    selectedClassIds={selectedClassIds}
                    onChange={setSelectedClassIds}
                />
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">{student ? 'Lưu thay đổi' : 'Thêm học viên'}</Button>
            </div>
        </form>
    );
};


export const StudentsScreen: React.FC = () => {
    const { state, addStudent, updateStudent, deleteStudent } = useData();
    const { role } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | undefined>(undefined);
    const [confirmModalState, setConfirmModalState] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
    const [resetPasswordModalState, setResetPasswordModalState] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<Student> | null>({ key: 'createdAt', direction: 'descending' });
    const ITEMS_PER_PAGE = 10;

    const canManage = role === UserRole.ADMIN || role === UserRole.MANAGER;

    const handleSort = (key: keyof Student) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredStudents = useMemo(() => {
        let studentsToFilter = state.students;

        if (classFilter !== 'all') {
            const selectedClass = state.classes.find(c => c.id === classFilter);
            if (selectedClass) {
                const studentIdsInClass = new Set(selectedClass.studentIds);
                studentsToFilter = studentsToFilter.filter(s => studentIdsInClass.has(s.id));
            }
        }

        if (!searchQuery) return studentsToFilter;
        
        const lowercasedQuery = searchQuery.toLowerCase();
        return studentsToFilter.filter(s => 
            s.id.toLowerCase().includes(lowercasedQuery) ||
            s.name.toLowerCase().includes(lowercasedQuery) ||
            s.email.toLowerCase().includes(lowercasedQuery) ||
            s.phone.includes(searchQuery)
        );
    }, [state.students, state.classes, searchQuery, classFilter]);
    
    const sortedStudents = useMemo(() => {
        let sortableItems = [...filteredStudents];
        if (sortConfig !== null) {
            const getLastName = (fullName: string) => {
                if (!fullName) return '';
                const parts = fullName.trim().split(/\s+/);
                return parts[parts.length - 1];
            };

            sortableItems.sort((a, b) => {
                if (sortConfig.key === 'name') {
                    const lastNameA = getLastName(a.name);
                    const lastNameB = getLastName(b.name);
                    
                    const lastNameComparison = lastNameA.localeCompare(lastNameB, 'vi');
                    
                    if (lastNameComparison !== 0) {
                        return sortConfig.direction === 'ascending' ? lastNameComparison : -lastNameComparison;
                    }

                    // If last names are the same, sort by full name for stability
                    const fullNameComparison = a.name.localeCompare(b.name, 'vi');
                    return sortConfig.direction === 'ascending' ? fullNameComparison : -fullNameComparison;
                }

                // Fallback for other columns
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredStudents, sortConfig]);

    const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = sortedStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, classFilter, sortConfig]);


    const columns = [
        { header: 'Mã HV', accessor: 'id' as keyof Student, sortable: true },
        { 
            header: 'Họ tên', 
            accessor: (item: Student) => (
                <Link to={`/student/${item.id}`} className="text-primary dark:text-indigo-400 hover:underline font-semibold">
                    {item.name}
                </Link>
            ),
            sortable: true,
            sortKey: 'name' as keyof Student,
        },
        { header: 'Số điện thoại', accessor: 'phone' as keyof Student },
        { 
            header: 'Số dư', 
            accessor: (item: Student) => {
                const balanceText = (
                    <span className={`font-semibold ${item.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {item.balance.toLocaleString('vi-VN')} ₫
                    </span>
                );

                if (role === UserRole.VIEWER || item.balance >= 0) {
                    return balanceText;
                }

                return (
                    <button 
                        onClick={() => setPaymentModalState({ isOpen: true, student: item })}
                        className="font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline"
                        title="Ghi nhận thanh toán"
                    >
                        {item.balance.toLocaleString('vi-VN')} ₫
                    </button>
                );
            },
            sortable: true,
            sortKey: 'balance' as keyof Student
        },
        { header: 'Trạng thái', accessor: (item: Student) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === PersonStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
                {item.status === PersonStatus.ACTIVE ? 'Hoạt động' : 'Tạm nghỉ'}
            </span>
        ), sortable: true, sortKey: 'status' as keyof Student },
    ];

    const handleOpenModal = (student?: Student) => {
        setEditingStudent(student);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingStudent(undefined);
        setModalOpen(false);
    };

    const handleSubmit = async (payload: { student: Student; classIds: string[] }) => {
        try {
            if (editingStudent) {
                await updateStudent({ 
                    originalId: editingStudent.id, 
                    updatedStudent: payload.student,
                    classIds: payload.classIds 
                });
                toast.success(`Đã cập nhật thông tin học viên ${payload.student.name}`);
            } else {
                await addStudent(payload);
                toast.success(`Đã thêm học viên mới ${payload.student.name}`);
            }
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    const handleDeleteClick = (student: Student) => {
        setConfirmModalState({ isOpen: true, student: student });
    };

    const handleConfirmDelete = async () => {
        if (confirmModalState.student) {
            try {
                await deleteStudent(confirmModalState.student.id);
                toast.success(`Đã xoá học viên ${confirmModalState.student.name}`);
            } catch (error) {
                toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại.');
            }
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold">Quản lý Học viên</h1>
                {canManage && (
                    <Button onClick={() => handleOpenModal()}>
                        {ICONS.plus} Thêm học viên
                    </Button>
                )}
            </div>
            <div className="card-base p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm học viên (mã, tên, email, SĐT)..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                    <select
                        value={classFilter}
                        onChange={e => setClassFilter(e.target.value)}
                        className="form-select"
                    >
                        <option value="all">Lọc theo lớp - Tất cả</option>
                        {state.classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden md:block">
                 <Table<Student>
                    columns={columns}
                    data={paginatedStudents}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    actions={canManage ? (student) => (
                        <>
                            <button onClick={() => setResetPasswordModalState({ isOpen: true, student: student })} className="text-gray-500 hover:text-gray-800" title="Đặt lại mật khẩu">{React.cloneElement(ICONS.key as React.ReactElement<{ width?: number | string; height?: number | string }>, {width: 20, height: 20})}</button>
                            <button onClick={() => handleOpenModal(student)} className="text-indigo-600 hover:text-indigo-900">{ICONS.edit}</button>
                            <button onClick={() => handleDeleteClick(student)} className="text-red-600 hover:text-red-900">{ICONS.delete}</button>
                        </>
                    ) : undefined}
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {paginatedStudents.map(student => (
                    <ListItemCard 
                        key={student.id}
                        title={
                            <Link to={`/student/${student.id}`} className="font-semibold text-primary hover:underline">
                                {student.name}
                            </Link>
                        }
                        details={[
                            { label: "Mã HV", value: student.id },
                            { 
                                label: "Số dư", 
                                value: (
                                    <span
                                        className={`font-semibold ${student.balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                    >
                                        {student.balance.toLocaleString('vi-VN')} ₫
                                    </span>
                                ) 
                            }
                        ]}
                        status={{
                            text: student.status === PersonStatus.ACTIVE ? 'Hoạt động' : 'Tạm nghỉ',
                            colorClasses: student.status === PersonStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }}
                        actions={canManage ? (
                           <div className="flex items-center space-x-2">
                                {student.balance < 0 && (
                                     <button onClick={() => setPaymentModalState({ isOpen: true, student: student })} className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50" title="Ghi nhận thanh toán">
                                        {React.cloneElement(ICONS.finance as React.ReactElement<{ width?: number | string; height?: number | string }>, {width: 20, height: 20})}
                                    </button>
                                )}
                                <button onClick={() => setResetPasswordModalState({ isOpen: true, student: student })} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700" title="Đặt lại mật khẩu">{React.cloneElement(ICONS.key as React.ReactElement<{ width?: number | string; height?: number | string }>, {width: 20, height: 20})}</button>
                                <button onClick={() => handleOpenModal(student)} className="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/50" title="Sửa">{ICONS.edit}</button>
                                <button onClick={() => handleDeleteClick(student)} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" title="Xóa">{ICONS.delete}</button>
                           </div>
                        ) : undefined}
                    />
                ))}
            </div>

            {paginatedStudents.length > 0 && (
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={sortedStudents.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}
           
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStudent ? 'Chỉnh sửa Học viên' : 'Thêm Học viên mới'}>
                <StudentForm 
                    student={editingStudent} 
                    onSubmit={handleSubmit} 
                    onCancel={handleCloseModal}
                    allClasses={state.classes}
                />
            </Modal>
             <ConfirmationModal
                isOpen={confirmModalState.isOpen}
                onClose={() => setConfirmModalState({ isOpen: false, student: null })}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Học viên"
                message={
                    <p>
                        Bạn có chắc chắn muốn xoá học viên <strong>{confirmModalState.student?.name}</strong>?
                        <br /><br />
                        <span className="font-bold text-red-500">CẢNH BÁO:</span> Toàn bộ dữ liệu học phí, điểm danh và báo cáo của học viên này cũng sẽ bị XOÁ VĨNH VIỄN.
                    </p>
                }
            />
            <ResetPasswordModal
                isOpen={resetPasswordModalState.isOpen}
                onClose={() => setResetPasswordModalState({ isOpen: false, student: null })}
                user={resetPasswordModalState.student}
                role={UserRole.PARENT}
            />
             <PaymentModal
                isOpen={paymentModalState.isOpen}
                onClose={() => setPaymentModalState({ isOpen: false, student: null })}
                student={paymentModalState.student}
            />
        </div>
    );
};