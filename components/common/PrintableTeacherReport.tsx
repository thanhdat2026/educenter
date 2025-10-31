import React from 'react';
import { Teacher, Class, PersonStatus } from '../../types';
import { useData } from '../../hooks/useDataContext';

interface PrintableTeacherReportProps {
    teacher: Teacher;
    assignedClasses: Class[];
}

export const PrintableTeacherReport: React.FC<PrintableTeacherReportProps> = ({ teacher, assignedClasses }) => {
    const { state } = useData();

    const getActiveStudentCount = (studentIds: string[] | undefined) => {
        if (!studentIds) return 0;
        return studentIds.filter(id => {
            const student = state.students.find(s => s.id === id);
            return student && student.status === PersonStatus.ACTIVE;
        }).length;
    };

    return (
        <div className="bg-white p-4 text-gray-900 font-sans">
            <header className="text-center pb-4 border-b">
                <h1 className="text-2xl font-bold">{state.settings.name}</h1>
                <p className="text-sm">{state.settings.address}</p>
                <h2 className="text-xl font-bold mt-6">HỒ SƠ GIÁO VIÊN</h2>
            </header>

            <section className="mt-6 text-sm">
                    <div className="grid grid-cols-2 gap-x-8">
                    <div>
                        <h3 className="text-base font-bold border-b pb-1 mb-2">Thông tin cá nhân</h3>
                        <p><strong className="w-28 inline-block">Mã giáo viên:</strong> {teacher.id}</p>
                        <p><strong className="w-28 inline-block">Họ tên:</strong> {teacher.name}</p>
                        <p><strong className="w-28 inline-block">Ngày sinh:</strong> {teacher.dob}</p>
                        <p><strong className="w-28 inline-block">Điện thoại:</strong> {teacher.phone}</p>
                        <p><strong className="w-28 inline-block">Email:</strong> {teacher.email}</p>
                    </div>
                    <div>
                        <h3 className="text-base font-bold border-b pb-1 mb-2">Thông tin chuyên môn</h3>
                        <p><strong className="w-28 inline-block">Trạng thái:</strong> {teacher.status === 'ACTIVE' ? 'Đang dạy' : 'Đã nghỉ'}</p>
                        <p><strong className="w-28 inline-block">Ngày vào làm:</strong> {teacher.createdAt}</p>
                            <p><strong className="w-28 inline-block">Bằng cấp:</strong> {teacher.qualification}</p>
                        <p><strong className="w-28 inline-block">Chuyên môn:</strong> {teacher.subject}</p>
                    </div>
                </div>
            </section>
            
            <section className="mt-6 text-sm">
                <h3 className="text-base font-bold border-b pb-1 mb-2">Các lớp phụ trách</h3>
                {assignedClasses.length > 0 ? (
                        <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-1">Tên lớp</th>
                                <th className="py-1">Môn học</th>
                                <th className="py-1">Sĩ số</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedClasses.map(cls => (
                                <tr key={cls.id} className="border-b border-gray-200">
                                    <td className="py-1">{cls.name}</td>
                                    <td className="py-1">{cls.subject}</td>
                                    <td className="py-1">{getActiveStudentCount(cls.studentIds)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Chưa phụ trách lớp nào.</p>
                )}
            </section>
        </div>
    );
};
