import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { AttendanceRecord, AttendanceStatus, PersonStatus, UserRole } from '../types';
import { Button } from '../components/common/Button';
import { ICONS } from '../constants';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

export const AttendanceScreen: React.FC = () => {
    const { classId, date } = useParams<{ classId: string; date: string }>();
    const navigate = useNavigate();
    const { state, updateAttendance, deleteAttendanceForDate } = useData();
    const { toast } = useToast();
    const { role } = useAuth();
    const { classes, students, attendance } = state;

    const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceStatus>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);

    const isViewer = role === UserRole.VIEWER;
    const canTakeAttendance = !isViewer;

    const cls = classes.find(c => c.id === classId);

    const classStudents = useMemo(() => {
        if (!cls) return [];
        
        const getLastName = (fullName: string) => {
            if (!fullName) return '';
            const parts = fullName.trim().split(/\s+/);
            return parts[parts.length - 1];
        };

        return students.filter(s => cls.studentIds.includes(s.id) && s.status === PersonStatus.ACTIVE)
            .sort((a, b) => {
                const lastNameA = getLastName(a.name);
                const lastNameB = getLastName(b.name);
                
                const lastNameComparison = lastNameA.localeCompare(lastNameB, 'vi');
                
                if (lastNameComparison !== 0) {
                    return lastNameComparison;
                }

                return a.name.localeCompare(b.name, 'vi');
            });
    }, [cls, students]);

    const hasExistingData = useMemo(() => {
        return attendance.some(a => a.classId === classId && a.date === date);
    }, [attendance, classId, date]);

    const attendanceCounts = useMemo(() => {
        if (!classId || !date) return new Map<string, number>();

        const counts = new Map<string, number>();
        const classAttendanceRecords = attendance.filter(a => a.classId === classId);

        classStudents.forEach(student => {
            const studentPastAttendance = classAttendanceRecords.filter(a =>
                a.studentId === student.id &&
                a.date <= date! &&
                (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
            );
            counts.set(student.id, studentPastAttendance.length);
        });

        return counts;
    }, [attendance, classId, date, classStudents]);


    useEffect(() => {
        const initialData = new Map<string, AttendanceStatus>();
        classStudents.forEach(student => {
            const record = attendance.find(a => a.classId === classId && a.studentId === student.id && a.date === date);
            initialData.set(student.id, record ? record.status : AttendanceStatus.PRESENT);
        });
        setAttendanceData(initialData);
    }, [classId, date, attendance, classStudents]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        if (!canTakeAttendance) return;
        setAttendanceData(prev => new Map(prev).set(studentId, status));
    };

    const handleBulkChange = (status: AttendanceStatus) => {
        if (!canTakeAttendance) return;
        const newMap = new Map<string, AttendanceStatus>();
        classStudents.forEach(student => {
            newMap.set(student.id, status);
        });
        setAttendanceData(newMap);
    };
    
    const handleSubmit = async () => {
        if (!canTakeAttendance) return;
        setIsLoading(true);
        const newRecords: AttendanceRecord[] = [];
        for (const [studentId, status] of attendanceData.entries()) {
            if (status !== AttendanceStatus.UNMARKED) {
                const existingRecord = attendance.find(a => a.classId === classId && a.studentId === studentId && a.date === date);
                newRecords.push({
                    id: existingRecord?.id || `A-${Date.now()}-${studentId}`,
                    classId: classId!,
                    studentId,
                    date: date!,
                    status,
                });
            }
        }
        try {
            await updateAttendance(newRecords);
            toast.success('Đã lưu điểm danh thành công!');
            navigate(`/class/${classId}`);
        } catch (error) {
            toast.error('Lỗi khi lưu điểm danh. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!classId || !date || !canTakeAttendance) return;
        setIsDeleting(true);
        try {
            await deleteAttendanceForDate({ classId, date });
            toast.success(`Đã xóa điểm danh ngày ${date} cho lớp ${cls?.name}.`);
            navigate(`/class/${classId}`);
        } catch (error) {
            toast.error('Lỗi khi xóa điểm danh.');
        } finally {
            setIsDeleting(false);
            setConfirmDeleteModalOpen(false);
        }
    };

    if (!cls) return <div className="p-6">Lớp học không tồn tại.</div>;
    
    const StatusButton: React.FC<{current: AttendanceStatus, target: AttendanceStatus, onClick: () => void, label: string, color: string, icon: React.ReactNode}> = ({current, target, onClick, label, color, icon}) => (
        <button
            onClick={onClick}
            title={label}
            disabled={!canTakeAttendance}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 font-semibold text-xs ${current === target ? `${color} text-white shadow-md` : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {icon}
        </button>
    );

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-6">
                         <Button variant="secondary" onClick={() => navigate(`/class/${classId}`)} className="mb-4">
                            {ICONS.chevronLeft} Quay lại lớp học
                        </Button>
                        <h1 className="text-2xl md:text-3xl font-bold">Điểm danh lớp {cls.name}</h1>
                        <p className="text-gray-600 dark:text-gray-300">Ngày: {date}</p>
                    </div>
                    
                    {classStudents.length > 0 && canTakeAttendance && (
                        <div className="mb-4 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg text-blue-800 dark:text-blue-200 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                           <p>Mặc định tất cả học viên đều "Có mặt". Chỉ cần đánh dấu các trường hợp vắng hoặc trễ.</p>
                           <div className="flex gap-2 flex-shrink-0">
                                <Button variant="secondary" onClick={() => handleBulkChange(AttendanceStatus.PRESENT)} disabled={!canTakeAttendance}>Tất cả có mặt</Button>
                                <Button variant="danger" onClick={() => handleBulkChange(AttendanceStatus.ABSENT)} disabled={!canTakeAttendance}>Tất cả vắng</Button>
                           </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        {classStudents.length > 0 ? (
                            classStudents.map(student => (
                                <div key={student.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{student.name}</span>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                            Buổi {attendanceCounts.get(student.id) || 0}
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <StatusButton current={attendanceData.get(student.id)!} target={AttendanceStatus.PRESENT} onClick={() => handleStatusChange(student.id, AttendanceStatus.PRESENT)} label="Có mặt" color="bg-green-500" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>} />
                                        <StatusButton current={attendanceData.get(student.id)!} target={AttendanceStatus.ABSENT} onClick={() => handleStatusChange(student.id, AttendanceStatus.ABSENT)} label="Vắng" color="bg-red-500" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>} />
                                        <StatusButton current={attendanceData.get(student.id)!} target={AttendanceStatus.LATE} onClick={() => handleStatusChange(student.id, AttendanceStatus.LATE)} label="Trễ" color="bg-yellow-500" icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 card-base">
                                <p className="text-gray-500 dark:text-gray-400">Không có học viên nào đang hoạt động trong lớp này để điểm danh.</p>
                            </div>
                        )}
                    </div>
                </div>

                 <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-lg sticky bottom-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            {hasExistingData && canTakeAttendance && (
                                <Button
                                    onClick={() => setConfirmDeleteModalOpen(true)}
                                    variant="danger"
                                    isLoading={isDeleting}
                                    disabled={isLoading}
                                    className="p-2 sm:px-4 sm:py-2"
                                    title="Xóa Điểm danh"
                                >
                                    {ICONS.delete}
                                    <span className="hidden sm:inline ml-2">Xóa Điểm danh</span>
                                </Button>
                            )}
                        </div>
                        
                        <div className="flex-1 flex justify-end">
                            {classStudents.length > 0 && canTakeAttendance && (
                                <Button
                                    onClick={handleSubmit}
                                    className="min-w-[80px] sm:min-w-[120px]"
                                    isLoading={isLoading}
                                    disabled={isDeleting}
                                >
                                    <span className="mr-2">{ICONS.check}</span>
                                    Lưu
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={confirmDeleteModalOpen}
                onClose={() => setConfirmDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Xác nhận Xóa Điểm danh"
                message={`Bạn có chắc chắn muốn xóa toàn bộ dữ liệu điểm danh cho lớp ${cls?.name} vào ngày ${date}? Hành động này không thể hoàn tác.`}
            />
        </>
    );
};