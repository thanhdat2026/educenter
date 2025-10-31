import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { PersonStatus, SalaryType } from '../types';
import { Button } from '../components/common/Button';
import { ICONS } from '../constants';

export const TeacherDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state } = useData();
    const { teachers, classes } = state;

    const teacher = useMemo(() => teachers.find(t => t.id === id), [teachers, id]);
    
    const assignedClasses = useMemo(() => 
        classes.filter(c => (c.teacherIds || []).includes(id!)),
    [classes, id]);

    if (!teacher) {
        return <div className="p-6 text-center text-red-500">Không tìm thấy giáo viên.</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="card-base">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{teacher.name}</h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400">{teacher.subject}</p>
                            <span className={`mt-1 px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${teacher.status === PersonStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {teacher.status === PersonStatus.ACTIVE ? 'Đang hoạt động' : 'Đã nghỉ'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 text-gray-600 dark:text-gray-300 border-t pt-6 dark:border-gray-700">
                        <div>
                            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin Liên hệ</h3>
                            <p><strong>Email:</strong> {teacher.email}</p>
                            <p><strong>Điện thoại:</strong> {teacher.phone}</p>
                            <p><strong>Địa chỉ:</strong> {teacher.address}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin Chuyên môn</h3>
                            <p><strong>Bằng cấp:</strong> {teacher.qualification}</p>
                            <p><strong>Chuyên môn:</strong> {teacher.subject}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Thông tin Lương</h3>
                            <p><strong>Hình thức:</strong> {teacher.salaryType === SalaryType.MONTHLY ? 'Lương cứng (tháng)' : 'Lương theo buổi'}</p>
                            <p><strong>Mức lương:</strong> {teacher.rate.toLocaleString('vi-VN')} VND</p>
                        </div>
                    </div>
                </div>

                <div className="card-base">
                    <h2 className="text-xl font-semibold mb-4">Các lớp đang phụ trách</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignedClasses.length > 0 ? (
                            assignedClasses.map(c => (
                                <Link key={c.id} to={`/class/${c.id}`} className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm">
                                    <p className="font-semibold text-primary">{c.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{c.subject} - Sĩ số: {(c.studentIds || []).length}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-4">Giáo viên chưa được phân công vào lớp học nào.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};