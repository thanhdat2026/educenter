import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { Student, Class, Invoice, ProgressReport, AttendanceRecord, AttendanceStatus, Announcement, ClassSchedule } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const InfoCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-primary mt-1">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{description}</p>
    </div>
);

const AnnouncementsWidget: React.FC<{announcements: Announcement[]}> = ({announcements}) => (
    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Thông báo từ Trung tâm</h2>
        <div className="space-y-4 max-h-72 overflow-y-auto">
            {announcements.length > 0 ? (
                announcements.slice(0, 5).map(ann => (
                    <div key={ann.id} className="p-3 bg-indigo-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">{ann.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{ann.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">{ann.createdAt}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Chưa có thông báo nào.</p>
            )}
        </div>
    </div>
);

const ScheduleWidget: React.FC<{ enrolledClasses: Class[] }> = ({ enrolledClasses }) => {
    const dayOrder: ClassSchedule['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayMap: Record<ClassSchedule['dayOfWeek'], string> = {
        'Monday': 'Thứ Hai', 'Tuesday': 'Thứ Ba', 'Wednesday': 'Thứ Tư', 'Thursday': 'Thứ Năm',
        'Friday': 'Thứ Sáu', 'Saturday': 'Thứ Bảy', 'Sunday': 'Chủ Nhật'
    };

    const weeklySchedule = useMemo(() => {
        const scheduleByDay: { [key in ClassSchedule['dayOfWeek']]?: { name: string; time: string }[] } = {};
        
        enrolledClasses.forEach(cls => {
            (cls.schedule || []).forEach(s => {
                if (!scheduleByDay[s.dayOfWeek]) {
                    scheduleByDay[s.dayOfWeek] = [];
                }
                scheduleByDay[s.dayOfWeek]!.push({ name: cls.name, time: `${s.startTime} - ${s.endTime}` });
            });
        });

        // Sort classes within each day by start time
        for (const day in scheduleByDay) {
            scheduleByDay[day as ClassSchedule['dayOfWeek']]?.sort((a, b) => a.time.localeCompare(b.time));
        }

        return scheduleByDay;
    }, [enrolledClasses]);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Lịch học trong tuần</h2>
            <div className="space-y-4">
                {dayOrder.map(day => (
                    <div key={day}>
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">{dayMap[day]}</h3>
                        {weeklySchedule[day] && weeklySchedule[day]!.length > 0 ? (
                            <div className="mt-1 space-y-2">
                                {weeklySchedule[day]!.map((session, index) => (
                                    <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
                                        <p className="font-semibold">{session.name}</p>
                                        <p className="text-xs text-gray-500">{session.time}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 mt-1 italic">Không có lịch học.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ParentDashboardScreen: React.FC = () => {
    const { user } = useAuth();
    const { state } = useData();
    const student = user as Student;

    const studentData = useMemo(() => {
        if (!student) return null;

        const enrolledClasses = state.classes.filter(c => c.studentIds.includes(student.id));
        const studentAttendance = state.attendance.filter(a => a.studentId === student.id);
        const presentCount = studentAttendance.filter(a => a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE).length;
        const totalSessions = studentAttendance.length;
        const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(0) : "N/A";
        
        const latestReport = state.progressReports
            .filter(pr => pr.studentId === student.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        return {
            enrolledClasses,
            attendanceRate,
            latestScore: latestReport ? `${latestReport.score}/10` : "N/A",
        };
    }, [student, state]);

    const relevantAnnouncements = useMemo(() => {
        if (!student) return [];
        const enrolledClassIds = new Set(
            state.classes.filter(c => c.studentIds.includes(student.id)).map(c => c.id)
        );
        return state.announcements
            .filter(ann => !ann.classId || enrolledClassIds.has(ann.classId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [student, state.classes, state.announcements]);

    if (!student || !studentData) {
        return <div>Đang tải dữ liệu học viên...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Chào mừng, Phụ huynh {student.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InfoCard 
                    title="Số dư Tài khoản" 
                    value={`${student.balance.toLocaleString('vi-VN')} ₫`} 
                    description={student.balance < 0 ? "Công nợ cần thanh toán" : "Số dư hiện có"} 
                />
                <InfoCard 
                    title="Tỷ lệ chuyên cần" 
                    value={`${studentData.attendanceRate}%`}
                    description="Tỷ lệ tham gia các buổi học"
                />
                <InfoCard 
                    title="Điểm gần nhất" 
                    value={studentData.latestScore} 
                    description="Điểm số trong báo cáo tiến độ mới nhất" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ScheduleWidget enrolledClasses={studentData.enrolledClasses} />
                </div>
                <div>
                    <AnnouncementsWidget announcements={relevantAnnouncements} />
                </div>
            </div>
        </div>
    );
};