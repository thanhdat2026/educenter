import React, { useMemo, useRef, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { ICONS, ROUTES } from '../constants';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { PersonStatus, UserRole, Teacher, Announcement, Class, Student, AttendanceRecord, AttendanceStatus, TransactionType } from '../types';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const AnnouncementsWidget: React.FC<{announcements: Announcement[]}> = ({announcements}) => (
    <div className="card-base h-full">
        <h2 className="text-xl font-bold mb-4">Thông báo gần đây</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
            {announcements.length > 0 ? (
                announcements.slice(0, 5).map(ann => (
                    <div key={ann.id} className="p-3 bg-indigo-50 dark:bg-slate-700/50 rounded-lg">
                        <h3 className="font-semibold text-indigo-800 dark:text-indigo-300">{ann.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{ann.content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">{ann.createdAt} - {ann.createdBy}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Chưa có thông báo nào.</p>
            )}
        </div>
    </div>
);

const TodaysScheduleWidget: React.FC<{ classes: Class[], teachers: Teacher[] }> = ({ classes, teachers }) => {
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const dayOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

    const sessionsToday = useMemo(() => {
        const sessions: (Class & { singleSchedule: Class['schedule'][0] })[] = [];
        classes.forEach(cls => {
            (cls.schedule || []).forEach(s => {
                if (s.dayOfWeek === dayOfWeekEn) {
                    sessions.push({ ...cls, singleSchedule: s });
                }
            });
        });
        return sessions.sort((a, b) => a.singleSchedule.startTime.localeCompare(b.singleSchedule.startTime));
    }, [classes, dayOfWeekEn]);

    const getTeacherNames = (teacherIds: string[]) => {
        if (!teacherIds || teacherIds.length === 0) return 'N/A';
        return teacherIds.map(id => teachers.find(t => t.id === id)?.name || 'N/A').join(', ');
    };

    return (
        <div className="card-base h-full">
            <h2 className="text-xl font-bold mb-4">Lịch học Hôm nay</h2>
            <div className="space-y-3 max-h-[40rem] overflow-y-auto">
                {sessionsToday.length > 0 ? (
                    sessionsToday.map(session => (
                        <div key={`${session.id}-${session.singleSchedule.startTime}`} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div>
                                <Link to={`/class/${session.id}`} className="font-semibold text-primary hover:underline">{session.name}</Link>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {session.singleSchedule.startTime} - {session.singleSchedule.endTime} • GV: {getTeacherNames(session.teacherIds)}
                                </p>
                            </div>
                            <Link to={ROUTES.ATTENDANCE_DETAIL.replace(':classId', session.id).replace(':date', todayDateString)} className="w-full sm:w-auto">
                                <Button variant="secondary" className="w-full">Điểm danh</Button>
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Không có lớp học nào diễn ra hôm nay.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const HighDebtWidget: React.FC<{ students: Student[] }> = ({ students }) => {
    const highDebtStudents = useMemo(() => {
        return students
            .filter(s => s.balance < 0)
            .sort((a, b) => a.balance - b.balance) // most negative first
            .slice(0, 5);
    }, [students]);

    return (
        <Link to="/finance" state={{ defaultTab: 'debt_report' }} className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
            <div className="card-base">
                <h2 className="text-xl font-bold mb-4">Cảnh báo: Học viên nợ nhiều</h2>
                <div className="space-y-3">
                    {highDebtStudents.length > 0 ? (
                        highDebtStudents.map(student => (
                            <div key={student.id} className="flex justify-between items-center text-sm">
                                <span className="font-semibold">{student.name}</span>
                                <span className="font-bold text-red-500 dark:text-red-400">{Math.abs(student.balance).toLocaleString('vi-VN')} ₫</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Không có học viên nào có công nợ.</p>
                    )}
                </div>
            </div>
        </Link>
    );
};

const HighAbsenceWidget: React.FC<{ students: Student[], attendance: AttendanceRecord[] }> = ({ students, attendance }) => {
    const highAbsenceStudents = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        const absenceCounts = new Map<string, number>();
        
        const activeStudentIds = new Set(students.filter(s => s.status === PersonStatus.ACTIVE).map(s => s.id));

        attendance.forEach(record => {
            if (activeStudentIds.has(record.studentId) && record.status === AttendanceStatus.ABSENT && record.date >= thirtyDaysAgoStr) {
                absenceCounts.set(record.studentId, (absenceCounts.get(record.studentId) || 0) + 1);
            }
        });
        
        const studentMap = new Map(students.map(s => [s.id, s.name]));

        return Array.from(absenceCounts.entries())
            .map(([studentId, count]) => ({ studentId, studentName: studentMap.get(studentId), count }))
            .filter(item => item.studentName && item.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [students, attendance]);

    return (
        <Link to="/reports" state={{ defaultReport: 'attendance' }} className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
            <div className="card-base">
                <h2 className="text-xl font-bold mb-4">Cảnh báo: Học viên vắng nhiều</h2>
                <p className="text-xs text-gray-400 -mt-3 mb-3">(Trong 30 ngày qua)</p>
                <div className="space-y-3">
                    {highAbsenceStudents.length > 0 ? (
                        highAbsenceStudents.map(item => (
                            <div key={item.studentId} className="flex justify-between items-center text-sm">
                                <span className="font-semibold">{item.studentName}</span>
                                <span className="font-bold text-yellow-600 dark:text-yellow-400">{item.count} buổi</span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Không có học viên nào vắng trong 30 ngày qua.</p>
                    )}
                </div>
            </div>
        </Link>
    );
};


const AdminDashboard: React.FC = () => {
    const { state } = useData();
    const { role } = useAuth();
    const { students, classes, announcements, income, teachers, attendance, transactions } = state;

    const totalStudents = students.filter(s => s.status === PersonStatus.ACTIVE).length;
    const activeClasses = classes.length;
    
    const canViewFinancials = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.ACCOUNTANT;

    const monthlyRevenue = useMemo(() => {
        if (!canViewFinancials) return 0;
        
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        const tuitionCollected = (transactions || [])
            .filter(t => {
                const isPayment = t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT;
                const isWithinMonth = t.date.startsWith(monthStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
                return isPayment && isWithinMonth && isNotRefund && t.amount > 0;
            })
            .reduce((sum, t) => sum + t.amount, 0);
            
        const otherIncomeThisMonth = (income || [])
            .filter(i => i.date.startsWith(monthStr))
            .reduce((sum, i) => sum + i.amount, 0);

        return tuitionCollected + otherIncomeThisMonth;
    }, [transactions, income, canViewFinancials]);
    
    const totalReceivables = useMemo(() => {
        if (!canViewFinancials) return 0;
        return students
            .filter(s => s.balance < 0)
            .reduce((sum, s) => sum + s.balance, 0);
    }, [students, canViewFinancials]);


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Học viên đang học" value={totalStudents} icon={ICONS.students} color="text-blue-600 dark:text-blue-400" />
                <Card title="Lớp học hoạt động" value={activeClasses} icon={ICONS.classes} color="text-green-600 dark:text-green-400" />
                {canViewFinancials && (
                    <>
                        <Card title="Doanh thu tháng này" value={`${monthlyRevenue.toLocaleString('vi-VN')} ₫`} icon={ICONS.finance} color="text-yellow-600 dark:text-yellow-400" />
                        <Card title="Tổng nợ phải thu" value={`${Math.abs(totalReceivables).toLocaleString('vi-VN')} ₫`} icon={ICONS.dashboard} color="text-red-600 dark:text-red-400" />
                    </>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                     <TodaysScheduleWidget classes={classes} teachers={teachers} />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <HighDebtWidget students={students} />
                    <HighAbsenceWidget students={students} attendance={attendance} />
                    <AnnouncementsWidget announcements={announcements} />
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard: React.FC = () => {
    const { state } = useData();
    const { user } = useAuth();
    const { classes, announcements, students } = state;
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    const dayOfWeekEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];

    const dayMap: Record<string, string> = {
        'Monday': 'T2', 'Tuesday': 'T3', 'Wednesday': 'T4', 'Thursday': 'T5',
        'Friday': 'T6', 'Saturday': 'T7', 'Sunday': 'CN'
    };

    const getActiveStudentCount = (studentIds: string[] | undefined) => {
        if (!studentIds) return 0;
        return studentIds.filter(id => {
            const student = students.find(s => s.id === id);
            return student && student.status === PersonStatus.ACTIVE;
        }).length;
    };

    const assignedClasses = useMemo(() => {
        const teacherId = (user as Teacher)?.id;
        if (!teacherId) return [];
        return classes.filter(cls => (cls.teacherIds || []).includes(teacherId))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [classes, user]);
    
    const relevantAnnouncements = useMemo(() => {
        const teacherId = (user as Teacher)?.id;
        if (!teacherId) {
            return announcements.filter(a => !a.classId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        const teacherClassIds = new Set(
            classes.filter(cls => (cls.teacherIds || []).includes(teacherId)).map(c => c.id)
        );

        return announcements
            .filter(ann => !ann.classId || teacherClassIds.has(ann.classId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [classes, user, announcements]);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <h1 className="text-2xl font-bold">Lớp học của tôi</h1>
                {assignedClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignedClasses.map(cls => {
                            const hasSessionToday = (cls.schedule || []).some(s => s.dayOfWeek === dayOfWeekEn);
                            return (
                                <div key={cls.id} className="card-base flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-primary">
                                            <Link to={`/class/${cls.id}`} className="hover:underline">{cls.name}</Link>
                                        </h2>
                                        <p className="font-semibold">{cls.subject}</p>
                                        <p className="text-gray-500 dark:text-gray-400">Sĩ số: {getActiveStudentCount(cls.studentIds)}</p>
                                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                            {(cls.schedule || []).map((s, i) => (
                                                <div key={i}>{`${dayMap[s.dayOfWeek]}: ${s.startTime} - ${s.endTime}`}</div>
                                            ))}
                                            {(cls.schedule || []).length === 0 && <p className="text-xs italic text-gray-500">Chưa có lịch học</p>}
                                        </div>
                                    </div>
                                    {hasSessionToday && (
                                        <div className="mt-4 flex justify-end">
                                            <Link to={ROUTES.ATTENDANCE_DETAIL.replace(':classId', cls.id).replace(':date', todayDateString)}>
                                                <Button>Điểm danh hôm nay</Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card-base text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Bạn chưa được phân công vào lớp học nào.</p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1">
                <AnnouncementsWidget announcements={relevantAnnouncements} />
            </div>
        </div>
    );
}

export const DashboardScreen: React.FC = () => {
    const { role } = useAuth();
    
    if (role === UserRole.TEACHER) {
        return <TeacherDashboard />;
    }
    
    // Admin, Manager, Accountant all see the main dashboard, but with different cards
    return <AdminDashboard />;
};