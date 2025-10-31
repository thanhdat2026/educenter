import React, { useMemo } from 'react';
import { Student, Class, Transaction, ProgressReport, AttendanceRecord, AttendanceStatus } from '../../types';
import { useData } from '../../hooks/useDataContext';

interface PrintableStudentReportProps {
    student: Student;
    enrolledClasses: Class[];
    transactions: Transaction[];
    progressReports: ProgressReport[];
    attendanceRecords: AttendanceRecord[];
}

const formatCurrency = (amount: number) => `${Math.round(amount).toLocaleString('vi-VN')} ₫`;

export const PrintableStudentReport: React.FC<PrintableStudentReportProps> = ({ student, enrolledClasses, transactions, progressReports, attendanceRecords }) => {
    const { state } = useData();

    const balance = transactions.reduce((acc, t) => acc + t.amount, 0);

    const attendanceSummary = useMemo(() => {
        return enrolledClasses.map(cls => {
            const classAttendance = attendanceRecords.filter(a => a.classId === cls.id);
            const present = classAttendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
            const absent = classAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
            const late = classAttendance.filter(a => a.status === AttendanceStatus.LATE).length;
            const total = classAttendance.length;
            const percentage = total > 0 ? (((present + late) / total) * 100).toFixed(0) : 'N/A';
            
            return {
                className: cls.name,
                present,
                absent,
                late,
                percentage
            };
        });
    }, [attendanceRecords, enrolledClasses]);

    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    const recentReports = [...progressReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="bg-white p-4 text-gray-900 font-sans text-sm">
            {/* Header */}
            <header className="text-center pb-4 border-b">
                <h1 className="text-2xl font-bold">{state.settings.name}</h1>
                <p className="text-sm">{state.settings.address}</p>
                <h2 className="text-xl font-bold mt-6">BÁO CÁO TỔNG HỢP HỌC VIÊN</h2>
            </header>

            {/* Student Info */}
            <section className="mt-6">
                <div className="grid grid-cols-2 gap-x-8">
                    <div>
                        <h3 className="text-base font-bold border-b pb-1 mb-2">Thông tin cá nhân</h3>
                        <p><strong className="w-28 inline-block">Mã học viên:</strong> {student.id}</p>
                        <p><strong className="w-28 inline-block">Họ tên:</strong> {student.name}</p>
                        <p><strong className="w-28 inline-block">Ngày sinh:</strong> {student.dob}</p>
                        <p><strong className="w-28 inline-block">Phụ huynh:</strong> {student.parentName}</p>
                        <p><strong className="w-28 inline-block">Điện thoại:</strong> {student.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-base font-bold border-b pb-1 mb-2">Thông tin học vụ</h3>
                        <p><strong className="w-28 inline-block">Trạng thái:</strong> {student.status === 'ACTIVE' ? 'Đang học' : 'Tạm nghỉ'}</p>
                        <p><strong className="w-28 inline-block">Ngày nhập học:</strong> {student.createdAt}</p>
                        <p><strong className="w-28 inline-block">Số dư:</strong> 
                            <span className={balance < 0 ? 'font-bold text-red-600' : 'font-bold'}>
                                {formatCurrency(balance)}
                            </span>
                        </p>
                    </div>
                </div>
            </section>
            
            {/* Attendance */}
            <section className="mt-6">
                <h3 className="text-base font-bold border-b pb-1 mb-2">Thống kê Chuyên cần</h3>
                {attendanceSummary.length > 0 ? (
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-1 px-2 font-semibold">Lớp học</th>
                                <th className="py-1 px-2 font-semibold text-center">Có mặt</th>
                                <th className="py-1 px-2 font-semibold text-center">Vắng</th>
                                <th className="py-1 px-2 font-semibold text-center">Trễ</th>
                                <th className="py-1 px-2 font-semibold text-center">Tỷ lệ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceSummary.map(s => (
                                <tr key={s.className} className="border-b">
                                    <td className="py-1 px-2">{s.className}</td>
                                    <td className="py-1 px-2 text-center">{s.present}</td>
                                    <td className="py-1 px-2 text-center">{s.absent}</td>
                                    <td className="py-1 px-2 text-center">{s.late}</td>
                                    <td className="py-1 px-2 text-center font-bold">{s.percentage}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-xs text-gray-500">Chưa có dữ liệu chuyên cần.</p>}
            </section>

            {/* Progress Reports */}
            <section className="mt-6">
                <h3 className="text-base font-bold border-b pb-1 mb-2">Báo cáo Học tập Gần đây</h3>
                {recentReports.length > 0 ? (
                     <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-1 px-2 font-semibold">Ngày</th>
                                <th className="py-1 px-2 font-semibold">Lớp học</th>
                                <th className="py-1 px-2 font-semibold text-center">Điểm</th>
                                <th className="py-1 px-2 font-semibold">Nhận xét</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentReports.map(r => (
                                <tr key={r.id} className="border-b">
                                    <td className="py-1 px-2">{r.date}</td>
                                    <td className="py-1 px-2">{state.classes.find(c => c.id === r.classId)?.name}</td>
                                    <td className="py-1 px-2 text-center font-bold">{r.score}/10</td>
                                    <td className="py-1 px-2">{r.comments}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-xs text-gray-500">Chưa có báo cáo học tập.</p>}
            </section>
            
            {/* Transactions */}
            <section className="mt-6">
                <h3 className="text-base font-bold border-b pb-1 mb-2">Lịch sử Giao dịch Gần đây</h3>
                {recentTransactions.length > 0 ? (
                     <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-1 px-2 font-semibold">Ngày</th>
                                <th className="py-1 px-2 font-semibold">Diễn giải</th>
                                <th className="py-1 px-2 font-semibold text-right">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.map(t => (
                                <tr key={t.id} className="border-b">
                                    <td className="py-1 px-2">{t.date}</td>
                                    <td className="py-1 px-2">{t.description}</td>
                                    <td className={`py-1 px-2 text-right ${t.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(t.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-xs text-gray-500">Chưa có giao dịch nào.</p>}
            </section>
            
            <footer className="text-center text-xs text-gray-500 mt-6 pt-2 border-t">
                <p>Báo cáo được in vào ngày {new Date().toLocaleDateString('vi-VN')}</p>
            </footer>
        </div>
    );
};
