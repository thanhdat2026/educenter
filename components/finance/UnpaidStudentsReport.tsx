import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Table, SortConfig, Column } from '../common/Table';
import { Button } from '../common/Button';
import { Student, UserRole } from '../../types';
import { downloadAsCSV } from '../../services/csvExport';
import { ICONS } from '../../constants';
import { ListItemCard } from '../common/ListItemCard';
import { BulkDebtPrintModal } from './BulkDebtPrintModal';
import { PaymentModal } from './PaymentModal';

export const UnpaidStudentsReport: React.FC = () => {
    const { state } = useData();
    const { role } = useAuth();
    const { students, classes } = state;
    const { toast } = useToast();
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState<SortConfig<Student & { classNames: string }> | null>({ key: 'balance', direction: 'ascending' });
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; student: Student | null }>({ isOpen: false, student: null });

    const isViewer = role === UserRole.VIEWER;

    const handleSort = (key: keyof (Student & { classNames: string })) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const unpaidStudents = useMemo(() => {
        let studentsToFilter = students;

        if (classFilter !== 'all') {
            const selectedClass = classes.find(c => c.id === classFilter);
            if (selectedClass) {
                const studentIdsInClass = new Set(selectedClass.studentIds);
                studentsToFilter = studentsToFilter.filter(s => studentIdsInClass.has(s.id));
            }
        }
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            studentsToFilter = studentsToFilter.filter(s => 
                s.name.toLowerCase().includes(lowerQuery) || 
                s.id.toLowerCase().includes(lowerQuery)
            );
        }

        return studentsToFilter
            .filter(s => s.balance < 0)
            .map(s => ({
                ...s,
                classNames: classes.filter(c => (c.studentIds || []).includes(s.id)).map(c => c.name).join(', ')
            }));
    }, [students, classes, classFilter, searchQuery]);
    
    const sortedUnpaidStudents = useMemo(() => {
        let sortableItems = [...unpaidStudents];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [unpaidStudents, sortConfig]);

    const totalDebt = useMemo(() => {
        return unpaidStudents.reduce((sum, s) => sum + s.balance, 0);
    }, [unpaidStudents]);

    const columns: Column<Student & { classNames: string }>[] = [
        { header: 'Họ tên', accessor: 'name', sortable: true },
        { header: 'Các lớp học', accessor: 'classNames' },
        {
            header: 'Số tiền nợ',
            accessor: (item) => {
                const balanceText = <span className="font-bold text-red-600">{Math.abs(item.balance).toLocaleString('vi-VN')} ₫</span>;
                if (isViewer) {
                    return balanceText;
                }
                return (
                    <button
                        onClick={() => setPaymentModalState({ isOpen: true, student: item })}
                        className="font-bold text-red-600 hover:text-red-800 hover:underline"
                        title="Ghi nhận thanh toán"
                    >
                        {Math.abs(item.balance).toLocaleString('vi-VN')} ₫
                    </button>
                );
            },
            sortable: true,
            sortKey: 'balance'
        },
    ];
    
    const handleExport = () => {
        const dataToExport = sortedUnpaidStudents.map(s => ({
            name: s.name,
            classNames: s.classNames,
            balance: Math.abs(s.balance)
        }));
        downloadAsCSV(dataToExport, { name: "Họ Tên", classNames: "Các Lớp Học", balance: "Số Tiền Nợ" }, `BaoCaoCongNo.csv`);
    };
    
    const selectedStudentsForPrint = useMemo(() => {
        return sortedUnpaidStudents.filter(s => selectedStudentIds.includes(s.id));
    }, [sortedUnpaidStudents, selectedStudentIds]);

    return (
        <>
            <div className="card-base">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold">Báo cáo Công nợ Học phí</h2>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                            onClick={() => setIsPrintModalOpen(true)} 
                            disabled={selectedStudentIds.length === 0}
                        >
                            {ICONS.download} Xuất Thông báo ({selectedStudentIds.length})
                        </Button>
                        <Button onClick={handleExport} variant="secondary">{ICONS.export} Xuất CSV</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc mã HV..."
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
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <p className="mb-4">
                    Tổng số nợ: <span className="font-bold text-red-600">{Math.abs(totalDebt).toLocaleString('vi-VN')} VND</span>
                </p>
                <div className="hidden md:block">
                    <Table<Student & { classNames: string }> 
                        columns={columns} 
                        data={sortedUnpaidStudents} 
                        sortConfig={sortConfig} 
                        onSort={handleSort} 
                        selectedIds={selectedStudentIds}
                        onSelectionChange={setSelectedStudentIds}
                    />
                </div>
                <div className="md:hidden space-y-4">
                     {sortedUnpaidStudents.map(s => (
                        <ListItemCard
                            key={s.id}
                            title={<span className="font-semibold">{s.name}</span>}
                            details={[
                                { label: "Mã HV", value: s.id },
                                { 
                                    label: "Nợ", 
                                    value: isViewer ? (
                                        <span className="font-bold text-red-500">{Math.abs(s.balance).toLocaleString('vi-VN')} ₫</span>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPaymentModalState({ isOpen: true, student: s });
                                            }}
                                            className="font-bold text-red-500 hover:underline"
                                        >
                                            {Math.abs(s.balance).toLocaleString('vi-VN')} ₫
                                        </button>
                                    )
                                },
                            ]}
                            actions={!isViewer ? (
                                <button 
                                    onClick={() => setPaymentModalState({ isOpen: true, student: s })} 
                                    className="p-2 rounded-full text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50" 
                                    title="Ghi nhận thanh toán"
                                >
                                    {React.cloneElement(ICONS.finance as React.ReactElement<{ width?: number | string; height?: number | string }>, {width: 20, height: 20})}
                                </button>
                            ) : undefined}
                        />
                     ))}
                </div>
            </div>
             <BulkDebtPrintModal 
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                students={selectedStudentsForPrint}
            />
            <PaymentModal
                isOpen={paymentModalState.isOpen}
                onClose={() => setPaymentModalState({ isOpen: false, student: null })}
                student={paymentModalState.student}
            />
        </>
    )
}