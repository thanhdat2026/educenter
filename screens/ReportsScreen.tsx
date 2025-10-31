import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../hooks/useDataContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ICONS } from '../constants';
import { LineChart } from '../components/common/LineChart';
import { PieChart } from '../components/common/PieChart';
import { downloadAsCSV } from '../services/csvExport';
import { AttendanceStatus, FeeType, PersonStatus, TransactionType, Student } from '../types';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';
import { Table, SortConfig, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { ListItemCard } from '../components/common/ListItemCard';


const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const today = new Date();

type ReportTab = 'overview' | 'attendance';

interface AttendanceReportData {
    id: string;
    name: string;
    classNames: string;
    attendanceCount: number;
}

const PrintableAttendanceReport: React.FC<{
    data: AttendanceReportData[];
    title: string;
}> = ({ data, title }) => {
    return (
        <div className="bg-white p-6 text-black font-sans">
            <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã HV</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Họ tên</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Các lớp học</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Số buổi có mặt</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map(item => (
                        <tr key={item.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.id}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{item.name}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{item.classNames}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-center">{item.attendanceCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const AttendanceReportTab: React.FC<{ selectedMonth: number; selectedYear: number; classFilter: string; }> = ({ selectedMonth, selectedYear, classFilter }) => {
    const { state } = useData();
    const { students, classes, attendance } = state;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;
    const [sortConfig, setSortConfig] = useState<SortConfig<AttendanceReportData> | null>({ key: 'attendanceCount', direction: 'descending' });
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExportingImage, setIsExportingImage] = useState(false);

    const reportData = useMemo(() => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        
        let relevantStudents = students.filter(s => s.status === PersonStatus.ACTIVE);
        if (classFilter !== 'all') {
            const classStudentIds = new Set(classes.find(c => c.id === classFilter)?.studentIds || []);
            relevantStudents = relevantStudents.filter(s => classStudentIds.has(s.id));
        }

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            relevantStudents = relevantStudents.filter(s => s.name.toLowerCase().includes(lowerQuery) || s.id.toLowerCase().includes(lowerQuery));
        }

        const monthlyAttendance = attendance.filter(a => 
            a.date.startsWith(monthStr) &&
            (classFilter === 'all' || a.classId === classFilter) &&
            (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
        );

        const attendanceCounts = new Map<string, number>();
        monthlyAttendance.forEach(a => {
            attendanceCounts.set(a.studentId, (attendanceCounts.get(a.studentId) || 0) + 1);
        });

        return relevantStudents.map(student => ({
            id: student.id,
            name: student.name,
            classNames: classes.filter(c => c.studentIds.includes(student.id)).map(c => c.name).join(', '),
            attendanceCount: attendanceCounts.get(student.id) || 0
        }));

    }, [students, classes, attendance, selectedYear, selectedMonth, classFilter, searchQuery]);
    
    const sortedData = useMemo(() => {
        let sortableItems = [...reportData];
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
    }, [reportData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const handleSort = (key: keyof AttendanceReportData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const handleExport = () => {
        downloadAsCSV(sortedData, {
            id: 'Mã HV',
            name: 'Họ tên',
            classNames: 'Các lớp học',
            attendanceCount: `Số buổi có mặt (T${selectedMonth}/${selectedYear})`
        }, `BaoCaoChuyenCan_T${selectedMonth}_${selectedYear}.csv`);
    };
    
    const handleExportImage = () => {
        if (reportRef.current && window.html2canvas) {
            setIsExportingImage(true);
            window.html2canvas(reportRef.current, { scale: 2, useCORS: true }).then((canvas: any) => {
                const link = document.createElement('a');
                link.download = `BaoCaoChuyenCan_T${selectedMonth}_${selectedYear}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }).catch((err: any) => {
                console.error("Lỗi xuất ảnh:", err);
            }).finally(() => {
                setIsExportingImage(false);
            });
        }
    };

    const columns: Column<AttendanceReportData>[] = [
        { header: 'Mã HV', accessor: 'id', sortable: true },
        { header: 'Họ tên', accessor: 'name', sortable: true },
        { header: 'Các lớp học', accessor: 'classNames', sortable: false },
        { header: 'Số buổi có mặt', accessor: 'attendanceCount', sortable: true },
    ];

    return (
        <>
            <div ref={reportRef} style={{ position: 'absolute', left: '-9999px', width: '210mm' }}>
                <PrintableAttendanceReport
                    data={sortedData}
                    title={`Thống kê Chuyên cần Tháng ${selectedMonth}/${selectedYear}`}
                />
            </div>
            <div className="card-base">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Thống kê Chuyên cần Tháng {selectedMonth}/{selectedYear}</h2>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleExportImage} variant="secondary" isLoading={isExportingImage}>
                            {ICONS.download} Xuất ảnh
                        </Button>
                        <Button onClick={handleExport} variant="secondary">{ICONS.export} Xuất CSV</Button>
                    </div>
                </div>
                <input 
                    type="text"
                    placeholder="Tìm học viên..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="form-input mb-4"
                />
                <div className="hidden md:block">
                    <Table
                        columns={columns}
                        data={paginatedData}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </div>
                <div className="md:hidden space-y-4">
                     {paginatedData.map(item => (
                        <ListItemCard
                            key={item.id}
                            title={item.name}
                            details={[
                                { label: 'Mã HV', value: item.id },
                                { label: `Số buổi có mặt (T${selectedMonth})`, value: <span className="font-bold text-lg text-primary">{item.attendanceCount}</span> }
                            ]}
                        />
                    ))}
                </div>
                 {paginatedData.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={sortedData.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                    />
                )}
            </div>
        </>
    );
};


export const ReportsScreen: React.FC = () => {
    const { state } = useData();
    const { students, classes, invoices, income, expenses, attendance, transactions } = state;
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
    const [classFilter, setClassFilter] = useState('all');
    const [activeTab, setActiveTab] = useState<ReportTab>('overview');
    const [detailModal, setDetailModal] = useState<{
        isOpen: boolean;
        title: string;
        items: { description: string; date: string; amount?: number; type?: 'credit' | 'debit' }[];
    }>({ isOpen: false, title: '', items: [] });

    const filteredStudentIds = useMemo(() => {
        if (classFilter === 'all') {
            return null; // Represents all students
        }
        const selectedClass = classes.find(c => c.id === classFilter);
        return new Set(selectedClass?.studentIds || []);
    }, [classFilter, classes]);


    // Data for the whole year, used for the line chart
    const yearlyTrendAnalytics = useMemo(() => {
        const data = Array.from({ length: 12 }, (_, i) => ({
            label: `T${i + 1}`,
            values: [0, 0], // [Revenue, Expense]
        }));

        const yearTuitionPayments = transactions.filter(t => {
            const isPayment = t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT;
            const isWithinYear = t.date.startsWith(String(selectedYear));
            const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
            const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
            return isPayment && isWithinYear && isNotRefund && t.amount > 0 && studentIsInClass;
        });

        const yearIncome = income.filter(i => i.date.startsWith(String(selectedYear)));
        const yearExpenses = expenses.filter(e => e.date.startsWith(String(selectedYear)));

        yearTuitionPayments.forEach(t => {
            const monthIndex = new Date(t.date).getMonth();
            data[monthIndex].values[0] += t.amount;
        });
        
        // Only add 'other income' if not filtering by class
        if (!filteredStudentIds) {
            yearIncome.forEach(inc => {
                const monthIndex = new Date(inc.date).getMonth();
                data[monthIndex].values[0] += inc.amount;
            });
        }

        // Expenses are always global
        yearExpenses.forEach(exp => {
            const monthIndex = new Date(exp.date).getMonth();
            data[monthIndex].values[1] += exp.amount;
        });

        return data;
    }, [transactions, income, expenses, selectedYear, filteredStudentIds]);

    // KPIs for the selected month
    const monthlyKpiData = useMemo(() => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        
        const tuitionFeesCollected = transactions
            .filter(t => {
                const isPayment = t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT;
                const isWithinMonth = t.date.startsWith(monthStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn'); // Exclude invoice cancellation refunds
                const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
                return isPayment && isWithinMonth && isNotRefund && t.amount > 0 && studentIsInClass;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const otherIncome = income
            .filter(i => i.date.startsWith(monthStr))
            .reduce((sum, i) => sum + i.amount, 0);

        // Revenue depends on filter
        const totalRevenue = tuitionFeesCollected + (filteredStudentIds ? 0 : otherIncome);
        
        // Expenses are always global
        const totalExpense = expenses
            .filter(e => e.date.startsWith(monthStr))
            .reduce((sum, e) => sum + e.amount, 0);

        let provisionalTuitionFee = 0;
        const monthlyAttendance = attendance.filter(a => 
            a.date.startsWith(monthStr) && 
            (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
        );
        const attendanceCountMap = new Map<string, number>();
        monthlyAttendance.forEach(a => {
            const key = `${a.studentId}-${a.classId}`;
            attendanceCountMap.set(key, (attendanceCountMap.get(key) || 0) + 1);
        });
        
        const studentsForProvisional = students.filter(s => 
            (s.status === PersonStatus.ACTIVE) && 
            (filteredStudentIds ? filteredStudentIds.has(s.id) : true)
        );
        const activeStudentIds = new Set(studentsForProvisional.map(s => s.id));
        
        const classesToCalculate = filteredStudentIds ? classes.filter(c => c.id === classFilter) : classes;

        classesToCalculate.forEach(c => {
            const activeStudentsInClass = c.studentIds.filter(id => activeStudentIds.has(id));

            if (c.fee.type === FeeType.MONTHLY) {
                provisionalTuitionFee += activeStudentsInClass.length * c.fee.amount;
            } else if (c.fee.type === FeeType.PER_SESSION) {
                activeStudentsInClass.forEach(studentId => {
                    const key = `${studentId}-${c.id}`;
                    const attendedSessions = attendanceCountMap.get(key) || 0;
                    provisionalTuitionFee += attendedSessions * c.fee.amount;
                });
            }
        });

        return {
            totalRevenue,
            totalExpense: filteredStudentIds ? 0 : totalExpense, // Show 0 expense if filtering for a class
            profit: totalRevenue - (filteredStudentIds ? 0 : totalExpense),
            tuitionFeesCollected,
            provisionalTuitionFee,
        };
    }, [invoices, income, expenses, students, classes, attendance, transactions, selectedYear, selectedMonth, classFilter, filteredStudentIds]);
    
    // KPIs for the whole year
    const yearlyKpiData = useMemo(() => {
        const totalRevenue = yearlyTrendAnalytics.reduce((sum, month) => sum + month.values[0], 0);
        const totalExpense = yearlyTrendAnalytics.reduce((sum, month) => sum + month.values[1], 0);
        const newStudents = students.filter(s => 
            s.createdAt.startsWith(String(selectedYear)) &&
            (filteredStudentIds ? filteredStudentIds.has(s.id) : true)
        ).length;
         return {
            profit: totalRevenue - totalExpense,
            newStudents,
        };
    }, [yearlyTrendAnalytics, students, selectedYear, filteredStudentIds]);


    const revenueByClass = useMemo(() => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const revenueMap = new Map<string, number>();
        const paidInvoices = invoices.filter(inv => 
            inv.status === 'PAID' && 
            inv.paidDate?.startsWith(monthStr) &&
            (filteredStudentIds ? filteredStudentIds.has(inv.studentId) : true)
        );

        paidInvoices.forEach(invoice => {
            const studentClasses = classes.filter(c => (c.studentIds || []).includes(invoice.studentId));
            if (studentClasses.length > 0) {
                const amountPerClass = invoice.amount / studentClasses.length;
                studentClasses.forEach(c => {
                    revenueMap.set(c.name, (revenueMap.get(c.name) || 0) + amountPerClass);
                });
            }
        });
        
        let finalData = Array.from(revenueMap.entries())
            .map(([label, value]) => ({ label, value, color: '' }))
            .sort((a,b) => b.value - a.value);

        if (classFilter !== 'all') {
            finalData = finalData.filter(d => {
                const cls = classes.find(c => c.id === classFilter);
                return cls?.name === d.label;
            });
        }
        
        return finalData;

    }, [invoices, classes, selectedYear, selectedMonth, classFilter, filteredStudentIds]);
    
    const handleExportAttendance = () => {
        const dataToExport = attendance
            .filter(a => 
                a.date.startsWith(String(selectedYear)) &&
                (filteredStudentIds ? filteredStudentIds.has(a.studentId) : true)
            )
            .map(a => {
                const studentName = students.find(s => s.id === a.studentId)?.name || 'N/A';
                const className = classes.find(c => c.id === a.classId)?.name || 'N/A';
                let statusText = 'Chưa điểm danh';
                if(a.status === AttendanceStatus.PRESENT) statusText = 'Có mặt';
                if(a.status === AttendanceStatus.ABSENT) statusText = 'Vắng';
                if(a.status === AttendanceStatus.LATE) statusText = 'Trễ';
                
                return {
                    date: a.date,
                    studentName,
                    className,
                    status: statusText,
                }
            });
        
        downloadAsCSV(dataToExport, {
            date: 'Ngày',
            studentName: 'Học viên',
            className: 'Lớp học',
            status: 'Trạng thái',
        }, `BaoCaoDiemDanh_${selectedYear}.csv`);
    };
    
    // --- Detail Modal Handlers ---

    const handleShowProvisionalTuitionDetails = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const items: { description: string; date: string; amount: number; type: 'credit' }[] = [];

        const monthlyAttendance = attendance.filter(a => 
            a.date.startsWith(monthStr) && 
            (a.status === AttendanceStatus.PRESENT || a.status === AttendanceStatus.LATE)
        );
        const attendanceCountMap = new Map<string, number>();
        monthlyAttendance.forEach(a => {
            const key = `${a.studentId}-${a.classId}`;
            attendanceCountMap.set(key, (attendanceCountMap.get(key) || 0) + 1);
        });
        
        const activeStudents = students.filter(s => s.status === PersonStatus.ACTIVE && (filteredStudentIds ? filteredStudentIds.has(s.id) : true));
        const studentMap = new Map(students.map(s => [s.id, s.name]));

        const classesToCalculate = filteredStudentIds ? classes.filter(c => c.id === classFilter) : classes;

        classesToCalculate.forEach(c => {
            const activeStudentsInClass = c.studentIds.filter(id => activeStudents.some(s => s.id === id));

            activeStudentsInClass.forEach(studentId => {
                const studentName = studentMap.get(studentId) || 'Không rõ';
                if (c.fee.type === FeeType.MONTHLY) {
                    const key = `${studentId}-${c.id}`;
                    if (attendanceCountMap.has(key)) {
                        items.push({
                            description: `[${c.name}] ${studentName} (HP tháng)`,
                            date: monthStr,
                            amount: c.fee.amount,
                            type: 'credit'
                        });
                    }
                } else if (c.fee.type === FeeType.PER_SESSION) {
                    const key = `${studentId}-${c.id}`;
                    const attendedSessions = attendanceCountMap.get(key) || 0;
                    if (attendedSessions > 0) {
                        items.push({
                            description: `[${c.name}] ${studentName} (${attendedSessions} buổi)`,
                            date: monthStr,
                            amount: attendedSessions * c.fee.amount,
                            type: 'credit'
                        });
                    }
                }
            });
        });

        setDetailModal({
            isOpen: true,
            title: `Chi tiết Học phí Tạm tính (T${selectedMonth}/${selectedYear})`,
            items: items.sort((a,b) => a.description.localeCompare(b.description))
        });
    };

    const handleShowTuitionCollectedDetails = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const items = transactions
            .filter(t => {
                const isPayment = t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT;
                const isWithinMonth = t.date.startsWith(monthStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
                const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
                return isPayment && isWithinMonth && isNotRefund && t.amount > 0 && studentIsInClass;
            })
            .map(t => {
                const studentName = students.find(s => s.id === t.studentId)?.name || 'Không rõ';
                return {
                    description: `${studentName} - ${t.description}`,
                    date: t.date,
                    amount: t.amount,
                    type: 'credit' as const
                }
            });

        setDetailModal({
            isOpen: true,
            title: `Chi tiết Học phí đã thu (T${selectedMonth}/${selectedYear})`,
            items: items
        });
    };

    const handleShowRevenueDetails = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const tuitionItems = transactions
            .filter(t => {
                const isPayment = t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT;
                const isWithinMonth = t.date.startsWith(monthStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
                const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
                return isPayment && isWithinMonth && isNotRefund && t.amount > 0 && studentIsInClass;
            })
            .map(t => {
                const studentName = students.find(s => s.id === t.studentId)?.name || 'Không rõ';
                return {
                    description: `[HP] ${studentName} - ${t.description}`,
                    date: t.date,
                    amount: t.amount,
                    type: 'credit' as const
                };
            });
        
        const otherIncomeItems = classFilter === 'all' ? income
            .filter(i => i.date.startsWith(monthStr))
            .map(i => ({
                description: `[Thu khác] ${i.description}`,
                date: i.date,
                amount: i.amount,
                type: 'credit' as const
            })) : [];

        const allItems = [...tuitionItems, ...otherIncomeItems].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDetailModal({ isOpen: true, title: `Chi tiết Doanh thu (T${selectedMonth}/${selectedYear})`, items: allItems });
    };

    const handleShowExpenseDetails = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const items = expenses
            .filter(e => e.date.startsWith(monthStr))
            .map(e => ({
                description: e.description,
                date: e.date,
                amount: e.amount,
                type: 'debit' as const
            }));
        setDetailModal({ isOpen: true, title: `Chi tiết Chi phí (T${selectedMonth}/${selectedYear})`, items: items });
    };

    const handleShowProfitDetails = () => {
        const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
        const tuitionItems = transactions
            .filter(t => {
                const isPayment = (t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT);
                const isWithinMonth = t.date.startsWith(monthStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
                const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
                return isPayment && isWithinMonth && isNotRefund && t.amount > 0 && studentIsInClass;
            })
            .map(t => ({
                description: `[Doanh thu HP] ${t.description}`,
                date: t.date,
                amount: t.amount,
                type: 'credit' as const
            }));

        const revenueItems = [
            ...tuitionItems,
            ...(classFilter === 'all' ? income.filter(i => i.date.startsWith(monthStr)).map(i => ({ description: `[Doanh thu khác] ${i.description}`, date: i.date, amount: i.amount, type: 'credit' as const })) : [])
        ];
        
        const expenseItems = classFilter === 'all' ? expenses.filter(e => e.date.startsWith(monthStr)).map(e => ({ description: `[Chi phí] ${e.description}`, date: e.date, amount: e.amount, type: 'debit' as const })) : [];
        
        const allItems = [...revenueItems, ...expenseItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDetailModal({ isOpen: true, title: `Chi tiết Lợi nhuận (T${selectedMonth}/${selectedYear})`, items: allItems });
    };

    const handleShowYearlyProfitDetails = () => {
        const yearStr = String(selectedYear);
        const tuitionItems = transactions
            .filter(t => {
                const isPayment = (t.type === TransactionType.PAYMENT || t.type === TransactionType.ADJUSTMENT_CREDIT);
                const isWithinYear = t.date.startsWith(yearStr);
                const isNotRefund = !t.description.toLowerCase().includes('hủy hóa đơn');
                const studentIsInClass = filteredStudentIds ? filteredStudentIds.has(t.studentId) : true;
                return isPayment && isWithinYear && isNotRefund && t.amount > 0 && studentIsInClass;
            })
            .map(t => ({
                description: `[Doanh thu HP] ${t.description}`,
                date: t.date,
                amount: t.amount,
                type: 'credit' as const
            }));

        const revenueItems = [
            ...tuitionItems,
            ...(classFilter === 'all' ? income.filter(i => i.date.startsWith(yearStr)).map(i => ({ description: `[Doanh thu khác] ${i.description}`, date: i.date, amount: i.amount, type: 'credit' as const })) : [])
        ];
        const expenseItems = classFilter === 'all' ? expenses.filter(e => e.date.startsWith(yearStr)).map(e => ({ description: `[Chi phí] ${e.description}`, date: e.date, amount: e.amount, type: 'debit' as const })) : [];
        const allItems = [...revenueItems, ...expenseItems].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDetailModal({ isOpen: true, title: `Chi tiết Lợi nhuận (Năm ${selectedYear})`, items: allItems });
    };

    const handleShowNewStudentsDetails = () => {
        const items = students
            .filter(s => s.createdAt.startsWith(String(selectedYear)) && (filteredStudentIds ? filteredStudentIds.has(s.id) : true))
            .map(s => ({
                description: s.name,
                date: s.createdAt,
            }));
        setDetailModal({ isOpen: true, title: `Chi tiết Học viên mới (Năm ${selectedYear})`, items: items });
    };
    
    const TabButton: React.FC<{ tabId: ReportTab; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold">Trung tâm Báo cáo & Phân tích</h1>
                <div className="flex items-center gap-2 flex-wrap">
                    <label className="font-semibold">Lọc:</label>
                    <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="form-select p-2">
                        <option value="all">Tất cả các lớp</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="form-select p-2">
                        {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="form-select p-2">
                        {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                    <TabButton tabId="overview">Tổng quan Tài chính</TabButton>
                    <TabButton tabId="attendance">Báo cáo Chuyên cần</TabButton>
                </nav>
            </div>

            <div>
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="cursor-pointer transition-transform hover:scale-105" onClick={handleShowProvisionalTuitionDetails}>
                                <Card title={`HP Tạm tính T${selectedMonth}`} value={`${monthlyKpiData.provisionalTuitionFee.toLocaleString('vi-VN')} ₫`} icon={ICONS.calendar} color="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="cursor-pointer transition-transform hover:scale-105" onClick={handleShowTuitionCollectedDetails}>
                                <Card title={`HP Đã thu T${selectedMonth}`} value={`${monthlyKpiData.tuitionFeesCollected.toLocaleString('vi-VN')} ₫`} icon={ICONS.checkCircle} color="text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="cursor-pointer transition-transform hover:scale-105" onClick={handleShowRevenueDetails}>
                                <Card title={`Doanh thu T${selectedMonth}`} value={`${monthlyKpiData.totalRevenue.toLocaleString('vi-VN')} ₫`} icon={ICONS.finance} color="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="cursor-pointer transition-transform hover:scale-105" onClick={handleShowExpenseDetails}>
                                <Card title={`Chi phí T${selectedMonth}`} value={`${monthlyKpiData.totalExpense.toLocaleString('vi-VN')} ₫`} icon={ICONS.logout} color="text-red-600 dark:text-red-400" />
                            </div>
                            <div className="cursor-pointer transition-transform hover:scale-105" onClick={handleShowProfitDetails}>
                                <Card title={`Lợi nhuận T${selectedMonth}`} value={`${monthlyKpiData.profit.toLocaleString('vi-VN')} ₫`} icon={ICONS.reports} color="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer transition-transform hover:scale-105" onClick={handleShowYearlyProfitDetails}>
                                <p className="text-sm font-medium text-gray-500">Lợi nhuận cả năm {selectedYear}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{yearlyKpiData.profit.toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer transition-transform hover:scale-105" onClick={handleShowNewStudentsDetails}>
                                <p className="text-sm font-medium text-gray-500">Học viên mới trong năm {selectedYear}</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{yearlyKpiData.newStudents}</p>
                            </div>
                        </div>

                        <div className="card-base">
                            <LineChart
                                title={`Xu hướng Tài chính năm ${selectedYear}${classFilter !== 'all' ? ` - ${classes.find(c=>c.id === classFilter)?.name}` : ''}`}
                                data={yearlyTrendAnalytics}
                                series={[
                                    { name: 'Doanh thu', color: '#10b981' },
                                    { name: 'Chi phí', color: '#ef4444' },
                                ]}
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card-base">
                                <PieChart title={`Cơ cấu Doanh thu theo Lớp (Tháng ${selectedMonth}/${selectedYear})`} data={revenueByClass} />
                            </div>
                            <div className="card-base">
                                <h3 className="text-lg font-semibold mb-4">Xuất Dữ liệu</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 border dark:border-gray-700 rounded-lg">
                                        <span>Báo cáo Điểm danh năm {selectedYear}</span>
                                        <Button onClick={handleExportAttendance} variant="secondary">
                                            {ICONS.export} Xuất CSV
                                        </Button>
                                    </div>
                                    {/* Placeholder for more export options */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'attendance' && (
                     <AttendanceReportTab 
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        classFilter={classFilter}
                    />
                )}
            </div>
            
            <ReportDetailModal 
                isOpen={detailModal.isOpen}
                onClose={() => setDetailModal({ isOpen: false, title: '', items: [] })}
                title={detailModal.title}
                items={detailModal.items}
            />
        </div>
    );
};