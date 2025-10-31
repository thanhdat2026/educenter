import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Table, SortConfig } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Student, ProgressReport, Teacher, AttendanceRecord, PersonStatus, UserRole, AttendanceStatus, Announcement } from '../types';
import { ICONS, ROUTES } from '../constants';
import { ListItemCard } from '../components/common/ListItemCard';


const ProgressReportForm: React.FC<{
    classStudents: Student[];
    creatorId: string;
    classId: string;
    onSubmit: (report: Omit<ProgressReport, 'id'>) => void;
    onCancel: () => void;
    classAttendance: AttendanceRecord[];
}> = ({ classStudents, creatorId, classId, onSubmit, onCancel, classAttendance }) => {
    const [formData, setFormData] = useState({
        studentId: classStudents[0]?.id || '',
        score: 0,
        comments: '',
    });
    const scoreInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scoreInputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'score' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            classId,
            createdBy: creatorId,
            date: new Date().toISOString().split('T')[0],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Học viên</label>
                <select name="studentId" value={formData.studentId} onChange={handleChange} className="form-select mt-1">
                    {classStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium">Điểm số (thang 10)</label>
                <input ref={scoreInputRef} type="number" name="score" value={formData.score} onChange={handleChange} className="form-input mt-1" min="0" max="10" step="0.1" required />
            </div>
            <div>
                <label className="block text-sm font-medium">Nhận xét của giáo viên</label>
                <textarea name="comments" value={formData.comments} onChange={handleChange} rows={5} className="form-textarea mt-1" required />
            </div>
             <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Lưu Báo cáo</Button>
            </div>
        </form>
    );
};

type ClassDetailTab = 'students' | 'attendance' | 'reports' | 'announcements';


const AttendanceTab: React.FC<{ cls: any, attendance: AttendanceRecord[] }> = ({ cls, attendance }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    const attendanceHistory = useMemo(() => {
        const historyMap = new Map<string, { present: number, absent: number, late: number, total: number }>();
        const classAttendance = attendance.filter(a => a.classId === cls.id);

        classAttendance.forEach(a => {
            if (!historyMap.has(a.date)) {
                historyMap.set(a.date, { present: 0, absent: 0, late: 0, total: 0 });
            }
            const summary = historyMap.get(a.date)!;
            summary.total++;
            if (a.status === AttendanceStatus.PRESENT) summary.present++;
            if (a.status === AttendanceStatus.ABSENT) summary.absent++;
            if (a.status === AttendanceStatus.LATE) summary.late++;
        });

        return Array.from(historyMap.entries())
            .map(([date, summary]) => ({ date, summary }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [attendance, cls.id]);
    
    return (
        <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="font-semibold">Chọn ngày để điểm danh hoặc xem lại:</p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)}
                        className="form-input flex-grow"
                    />
                    <Button onClick={() => navigate(ROUTES.ATTENDANCE_DETAIL.replace(':classId', cls.id).replace(':date', selectedDate))} className="flex-shrink-0">
                        Điểm danh
                    </Button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-2">Lịch sử điểm danh</h3>
                {attendanceHistory.length > 0 ? (
                     <div className="space-y-3">
                        {attendanceHistory.map(({ date, summary }) => (
                            <div key={date} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold">{date}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Có mặt: <span className="text-green-600 font-semibold">{summary.present + summary.late}</span>, 
                                        Vắng: <span className="text-red-600 font-semibold">{summary.absent}</span>
                                    </p>
                                </div>
                                <Link to={ROUTES.ATTENDANCE_DETAIL.replace(':classId', cls.id).replace(':date', date)}>
                                    <Button variant="secondary">Xem / Sửa</Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">Chưa có lịch sử điểm danh.</p>
                )}
            </div>
        </div>
    );
}

const ClassAnnouncementForm: React.FC<{
    onSubmit: (data: { title: string; content: string }) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        titleInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, content });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Tiêu đề</label>
                <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input mt-1"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium">Nội dung</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="form-textarea mt-1"
                    required
                />
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Đăng Thông báo</Button>
            </div>
        </form>
    );
};

const AnnouncementsTab: React.FC<{
    classId: string;
}> = ({ classId }) => {
    const { state, addAnnouncement } = useData();
    const { user, role } = useAuth();
    const { toast } = useToast();
    const [isModalOpen, setModalOpen] = useState(false);

    const canManage = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.TEACHER;

    const classAnnouncements = useMemo(() => {
        return state.announcements
            .filter(ann => ann.classId === classId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [state.announcements, classId]);

    const handleAddAnnouncement = async (data: { title: string; content: string }) => {
        if (!user) return;
        try {
            await addAnnouncement({
                ...data,
                classId: classId,
                createdAt: new Date().toISOString().split('T')[0],
                createdBy: user.name,
            });
            toast.success('Đã gửi thông báo đến lớp học.');
            setModalOpen(false);
        } catch (error) {
            toast.error("Lỗi khi gửi thông báo.");
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Thông báo của Lớp</h2>
                {canManage && (
                    <Button onClick={() => setModalOpen(true)}>
                        {ICONS.plus} Tạo Thông báo
                    </Button>
                )}
            </div>
            {classAnnouncements.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có thông báo nào cho lớp này.</p>
            ) : (
                <div className="space-y-4">
                    {classAnnouncements.map(ann => (
                        <div key={ann.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <h3 className="font-semibold text-lg">{ann.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Đăng ngày {ann.createdAt} bởi {ann.createdBy}
                            </p>
                            <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
                        </div>
                    ))}
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Tạo Thông báo Lớp học">
                <ClassAnnouncementForm
                    onSubmit={handleAddAnnouncement}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </>
    );
}

export const ClassDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { state, addProgressReport } = useData();
    const { user, role } = useAuth();
    const { toast } = useToast();
    const { classes, students, teachers, progressReports, attendance } = state;
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ClassDetailTab>('students');

    useEffect(() => {
        if (location.state?.defaultTab) {
            setActiveTab(location.state.defaultTab);
        }
    }, [location.state]);

    const cls = classes.find(c => c.id === id);
    
    if (!cls) return <div>Lớp học không tồn tại.</div>;
    if (!user || !user.id) return <div>Lỗi xác thực người dùng.</div>;

    const teacherNames = useMemo(() => {
        return (cls.teacherIds || [])
            .map(id => teachers.find(t => t.id === id)?.name)
            .filter(Boolean)
            .join(', ');
    }, [cls.teacherIds, teachers]);

    const classStudents = useMemo(() => students.filter(s => (cls.studentIds || []).includes(s.id) && s.status === PersonStatus.ACTIVE), [students, cls.studentIds]);
    const classProgressReports = useMemo(() => progressReports.filter(pr => pr.classId === id), [progressReports, id]);
    const classAttendance = useMemo(() => attendance.filter(a => a.classId === id), [attendance, id]);

    const [studentSortConfig, setStudentSortConfig] = useState<SortConfig<Student> | null>({ key: 'name', direction: 'ascending' });
    const handleStudentSort = (key: keyof Student) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (studentSortConfig && studentSortConfig.key === key && studentSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setStudentSortConfig({ key, direction });
    };
    const sortedClassStudents = useMemo(() => {
        let sortableItems = [...classStudents];
        if (studentSortConfig) {
            const getLastName = (fullName: string) => {
                if (!fullName) return '';
                const parts = fullName.trim().split(/\s+/);
                return parts[parts.length - 1];
            };

            sortableItems.sort((a, b) => {
                if (studentSortConfig.key === 'name') {
                    const lastNameA = getLastName(a.name);
                    const lastNameB = getLastName(b.name);
                    
                    const lastNameComparison = lastNameA.localeCompare(lastNameB, 'vi');
                    
                    if (lastNameComparison !== 0) {
                        return studentSortConfig.direction === 'ascending' ? lastNameComparison : -lastNameComparison;
                    }

                    // If last names are the same, sort by full name for stability
                    const fullNameComparison = a.name.localeCompare(b.name, 'vi');
                    return studentSortConfig.direction === 'ascending' ? fullNameComparison : -fullNameComparison;
                }

                // Fallback for other columns
                const aValue = a[studentSortConfig.key];
                const bValue = b[studentSortConfig.key];
                
                if (aValue < bValue) return studentSortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return studentSortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [classStudents, studentSortConfig]);

    const [reportSortConfig, setReportSortConfig] = useState<SortConfig<ProgressReport> | null>({ key: 'date', direction: 'descending' });
    const handleReportSort = (key: keyof ProgressReport) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (reportSortConfig && reportSortConfig.key === key && reportSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setReportSortConfig({ key, direction });
    };
    const sortedClassProgressReports = useMemo(() => {
        let sortableItems = [...classProgressReports];
        if (reportSortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = a[reportSortConfig.key];
                const bValue = b[reportSortConfig.key];
                if (aValue < bValue) return reportSortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return reportSortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [classProgressReports, reportSortConfig]);
        
    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'N/A';

    const studentColumns = [
        { header: 'Mã HV', accessor: 'id' as keyof Student, sortable: true },
        { header: 'Họ tên', accessor: 'name' as keyof Student, sortable: true },
        { header: 'Email', accessor: 'email' as keyof Student, sortable: true },
        { header: 'Phụ huynh', accessor: 'parentName' as keyof Student, sortable: true },
    ];
    
    const reportColumns = [
        { header: 'Ngày', accessor: 'date' as keyof ProgressReport, sortable: true },
        { header: 'Học viên', accessor: (item: ProgressReport) => getStudentName(item.studentId) },
        { header: 'Điểm', accessor: 'score' as keyof ProgressReport, sortable: true },
        { header: 'Nhận xét', accessor: 'comments' as keyof ProgressReport },
    ];
    
    const handleAddReport = async (reportData: Omit<ProgressReport, 'id'>) => {
        try {
            await addProgressReport(reportData);
            toast.success(`Đã thêm báo cáo cho học viên ${getStudentName(reportData.studentId)}.`);
            setReportModalOpen(false);
        } catch (error) {
            toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
        }
    };

    const dayMap: Record<string, string> = {
        'Monday': 'Thứ Hai', 'Tuesday': 'Thứ Ba', 'Wednesday': 'Thứ Tư', 'Thursday': 'Thứ Năm',
        'Friday': 'Thứ Sáu', 'Saturday': 'Thứ Bảy', 'Sunday': 'Chủ Nhật'
    };
    
    const TabButton: React.FC<{ tabId: ClassDetailTab; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="card-base">
                <h1 className="text-3xl font-bold">{cls.name}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm">
                    <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full font-mono font-semibold">ID: {cls.id}</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-3 py-1 rounded-full font-semibold">Môn: {cls.subject}</span>
                    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full font-semibold">GV: {teacherNames}</span>
                </div>
                 <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                    {(cls.schedule || []).map((s, i) => (
                        <div key={i} className="font-semibold">{`${dayMap[s.dayOfWeek]}: ${s.startTime} - ${s.endTime}`}</div>
                    ))}
                </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabId="students">Học viên ({classStudents.length})</TabButton>
                    <TabButton tabId="attendance">Điểm danh</TabButton>
                    <TabButton tabId="reports">Báo cáo ({classProgressReports.length})</TabButton>
                    <TabButton tabId="announcements">Thông báo</TabButton>
                </nav>
            </div>
            
            <div className="card-base">
                {activeTab === 'students' && (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Danh sách học viên</h2>
                        <div className="hidden md:block">
                            <Table<Student>
                                columns={studentColumns}
                                data={sortedClassStudents}
                                sortConfig={studentSortConfig}
                                onSort={handleStudentSort}
                            />
                        </div>
                         <div className="md:hidden space-y-4">
                            {sortedClassStudents.map(student => (
                                <ListItemCard
                                    key={student.id}
                                    title={<Link to={`/student/${student.id}`} className="font-semibold text-primary hover:underline">{student.name}</Link>}
                                    details={[
                                        { label: "Mã HV", value: student.id },
                                        { label: "Phụ huynh", value: student.parentName }
                                    ]}
                                />
                            ))}
                        </div>
                    </>
                )}

                 {activeTab === 'attendance' && (
                    <AttendanceTab cls={cls} attendance={classAttendance} />
                )}

                {activeTab === 'reports' && (
                    <>
                         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h2 className="text-xl font-semibold">Sổ liên lạc - Báo cáo Tiến độ</h2>
                            <div className="relative group w-full md:w-auto">
                                <Button 
                                    onClick={() => setReportModalOpen(true)}
                                    disabled={classStudents.length === 0 || role === UserRole.VIEWER}
                                    className="w-full"
                                >
                                    {ICONS.plus} Thêm Báo cáo
                                </Button>
                                {classStudents.length === 0 && (
                                     <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                        Cần có học viên trong lớp để thêm báo cáo
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Table<ProgressReport>
                                columns={reportColumns}
                                data={sortedClassProgressReports}
                                sortConfig={reportSortConfig}
                                onSort={handleReportSort}
                            />
                        </div>
                         <div className="md:hidden space-y-4">
                            {sortedClassProgressReports.map(report => (
                                 <ListItemCard
                                    key={report.id}
                                    title={<div className="flex justify-between w-full"><span>{getStudentName(report.studentId)}</span><span className="text-primary font-bold">{report.score}/10</span></div>}
                                    details={[
                                        { label: "Ngày", value: report.date },
                                        { label: "Nhận xét", value: <i className="truncate block">{report.comments}</i> },
                                    ]}
                                />
                            ))}
                         </div>
                    </>
                )}

                {activeTab === 'announcements' && (
                    <AnnouncementsTab classId={cls.id} />
                )}
            </div>
            
            <Modal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} title="Thêm Báo cáo Tiến độ">
                <ProgressReportForm
                    classStudents={classStudents}
                    classId={cls.id}
                    creatorId={user.id}
                    onSubmit={handleAddReport}
                    onCancel={() => setReportModalOpen(false)}
                    classAttendance={classAttendance}
                />
            </Modal>
        </div>
    );
};