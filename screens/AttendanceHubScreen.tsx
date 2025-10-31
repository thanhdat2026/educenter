import React, { useMemo, useState, useRef } from 'react';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Calendar } from '../components/common/Calendar';
import { ClassSchedule, UserRole, AttendanceRecord } from '../types';
import { ROUTES, ICONS } from '../constants';
import { Button } from '../components/common/Button';

const dayOfWeekToNumber: Record<ClassSchedule['dayOfWeek'], number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
};

const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export const AttendanceHubScreen: React.FC = () => {
    const { state, updateAttendance } = useData();
    const { role, user } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedDate, setSelectedDate] = useState(new Date());

    const selectedMonth = selectedDate.getMonth() + 1;
    const selectedYear = selectedDate.getFullYear();
    
    const canManage = role === UserRole.ADMIN || role === UserRole.MANAGER;
    const canExport = canManage || role === UserRole.TEACHER;

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value, 10);
        setSelectedDate(new Date(selectedYear, newMonth - 1, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value, 10);
        setSelectedDate(new Date(newYear, selectedMonth - 1, 1));
    };

    const calendarEvents = useMemo(() => {
        const events = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const markedDates = new Set(state.attendance.map(a => `${a.classId}|${a.date}`));

        // Generate events for a range of dates, e.g., 60 days back and 30 days forward
        for (let i = -60; i <= 30; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dayOfWeek = date.getDay();
            const dateString = date.toISOString().split('T')[0];

            state.classes.forEach(cls => {
                if (cls.schedule && cls.schedule.some(s => dayOfWeekToNumber[s.dayOfWeek] === dayOfWeek)) {
                    const isMarked = markedDates.has(`${cls.id}|${dateString}`);
                    const isPast = date < today;

                    let color = '#6b7280'; // Gray for future/today unmarked
                    if (isMarked) {
                        color = '#10b981'; // Green for marked
                    } else if (isPast) {
                        color = '#ef4444'; // Red for past unmarked
                    }

                    events.push({
                        date: date,
                        title: cls.name,
                        link: ROUTES.ATTENDANCE_DETAIL.replace(':classId', cls.id).replace(':date', dateString),
                        color: color,
                    });
                }
            });
        }
        return events;
    }, [state.classes, state.attendance]);
        
    const handleExport = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        let recordsToExport = state.attendance.filter(a => a.date.startsWith(monthStr));

        if (role === UserRole.TEACHER) {
            const teacherClassIds = new Set(state.classes.filter(c => (c.teacherIds || []).includes(user!.id)).map(c => c.id));
            recordsToExport = recordsToExport.filter(a => teacherClassIds.has(a.classId));
        }

        if (recordsToExport.length === 0) {
            toast.info(`Không có dữ liệu điểm danh trong tháng ${selectedMonth}/${selectedYear} để xuất.`);
            return;
        }

        const exportData = {
            month: monthStr,
            records: recordsToExport,
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `diemdanh_thang_${selectedMonth}-${selectedYear}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Xuất dữ liệu thành công!');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Không thể đọc file.");
                
                const importedData = JSON.parse(text);

                if (!importedData.month || !Array.isArray(importedData.records)) {
                    throw new Error("Định dạng file không hợp lệ.");
                }

                await updateAttendance(importedData.records as AttendanceRecord[]);
                toast.success(`Đã nhập ${importedData.records.length} bản ghi điểm danh từ file. Dữ liệu đã được cập nhật.`);

            } catch (error: any) {
                toast.error(error.message || 'File không hợp lệ hoặc bị lỗi.');
            } finally {
                if(event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">Lịch điểm danh toàn trung tâm</h1>
            </div>
            
             <div className="card-base">
                <h2 className="text-xl font-semibold mb-3">Quản lý Dữ liệu Offline</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                     <div className="flex items-center gap-2">
                        <span className="font-medium">Chọn tháng:</span>
                        <select value={selectedMonth} onChange={handleMonthChange} className="form-select">
                            {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                        </select>
                        <select value={selectedYear} onChange={handleYearChange} className="form-select">
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                     <div className="flex items-center gap-2">
                        {canExport && (
                            <Button onClick={handleExport} variant="secondary">
                                {ICONS.export} Xuất Dữ liệu Tháng này
                            </Button>
                        )}
                        {canManage && (
                            <>
                                <Button onClick={handleImportClick} variant="secondary">
                                    {ICONS.restore} Nhập File Điểm danh
                                </Button>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-500 mr-2"></span> Đã điểm danh</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span> Trễ hạn điểm danh</div>
                <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-gray-500 mr-2"></span> Chưa tới giờ</div>
            </div>
            <Calendar events={calendarEvents} />
        </div>
    );
};
