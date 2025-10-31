import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useDataContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Table, SortConfig } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ICONS } from '../constants';
import { Transaction, ProgressReport, PersonStatus, TransactionType, Class, AttendanceStatus, UserRole } from '../types';
import { CurrencyInput } from '../components/common/CurrencyInput';
import { ListItemCard } from '../components/common/ListItemCard';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { PaymentModal } from '../components/finance/PaymentModal';

const transactionTypeMap: Record<TransactionType, string> = {
    [TransactionType.INVOICE]: 'Hóa đơn',
    [TransactionType.PAYMENT]: 'Thanh toán',
    [TransactionType.ADJUSTMENT_CREDIT]: 'Điều chỉnh Ghi có',
    [TransactionType.ADJUSTMENT_DEBIT]: 'Phí khác',
};

const AdjustmentForm: React.FC<{
    transactionToEdit?: Transaction;
    onSubmit: (data: { sign: 'CREDIT' | 'DEBIT'; amount: number; date: string; description: string; }) => void;
    onCancel: () => void;
}> = ({ transactionToEdit, onSubmit, onCancel }) => {
    const [sign, setSign] = useState<'CREDIT' | 'DEBIT'>(transactionToEdit && transactionToEdit.amount < 0 ? 'DEBIT' : 'CREDIT');
    const [amount, setAmount] = useState(transactionToEdit ? Math.abs(transactionToEdit.amount) : 0);
    const [description, setDescription] = useState(transactionToEdit?.description || '');
    const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
    
    const descriptionInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        descriptionInputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ sign, amount, date, description });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium mb-2">Loại giao dịch</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${sign === 'CREDIT' ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                        <input
                            type="radio"
                            name="sign"
                            value="CREDIT"
                            checked={sign === 'CREDIT'}
                            onChange={() => setSign('CREDIT')}
                            className="h-4 w-4 text-primary focus:ring-primary-dark"
                        />
                        <span className="ml-3 text-sm font-medium">Thanh toán / Ghi có (Tăng số dư)</span>
                    </label>
                    <label className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all ${sign === 'DEBIT' ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600'}`}>
                        <input
                            type="radio"
                            name="sign"
                            value="DEBIT"
                            checked={sign === 'DEBIT'}
                            onChange={() => setSign('DEBIT')}
                            className="h-4 w-4 text-primary focus:ring-primary-dark"
                        />
                        <span className="ml-3 text-sm font-medium">Phí / Ghi nợ (Giảm số dư)</span>
                    </label>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium">Mô tả</label>
                <input
                    ref={descriptionInputRef}
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="form-input mt-1"
                    required
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Số tiền (VND)</label>
                    <CurrencyInput value={amount} onChange={setAmount} className="form-input mt-1" required />
                </div>
                <div>
                    <label className="block text-sm font-medium">Ngày</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input mt-1" required />
                </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
                <Button type="submit">Lưu Giao dịch</Button>
            </div>
        </form>
    );
};

const AttendanceSummaryWidget: React.FC<{ studentId: string, enrolledClasses: Class[] }> = ({ studentId, enrolledClasses }) => {
    const { state } = useData();
    const studentAttendance = state.attendance.filter(a => a.studentId === studentId);

    const summary = useMemo(() => {
        return enrolledClasses.map(cls => {
            const classAttendance = studentAttendance.filter(a => a.classId === cls.id);
            const present = classAttendance.filter(a => a.status === AttendanceStatus.PRESENT).length;
            const absent = classAttendance.filter(a => a.status === AttendanceStatus.ABSENT).length;
            const late = classAttendance.filter(a => a.status === AttendanceStatus.LATE).length;
            const total = classAttendance.length;
            const percentage = total > 0 ? (((present + late) / total) * 100).toFixed(0) : 'N/A';
            
            return {
                classId: cls.id,
                className: cls.name,
                present,
                absent,
                late,
                percentage
            };
        });
    }, [studentAttendance, enrolledClasses]);

    if (summary.length === 0) {
        return null;
    }

    return (
        <div className="card-base">
            <h2 className="text-xl font-semibold mb-4">Thống kê Chuyên cần</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.map(s => (
                    <div key={s.classId} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h3 className="font-semibold text-primary">{s.className}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mt-2 text-center">
                            <div>
                                <p className="font-bold text-lg text-green-600">{s.present}</p>
                                <p className="text-xs text-gray-500">Có mặt</p>
                            </div>
                             <div>
                                <p className="font-bold text-lg text-red-600">{s.absent}</p>
                                <p className="text-xs text-gray-500">Vắng</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-yellow-600">{s.late}</p>
                                <p className="text-xs text-gray-500">Trễ</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-blue-600">{s.percentage}%</p>
                                <p className="text-xs text-gray-500">Tỷ lệ</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const StudentDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state, addAdjustment, updateTransaction, deleteTransaction } = useData();
    const { toast } = useToast();
    const { role } = useAuth();
    const { students, classes, progressReports, transactions, attendance } = state;
    
    const [activeTab, setActiveTab] = useState('overview');
    const [transactionModal, setTransactionModal] = useState<{ open: boolean, item?: Transaction }>({ open: false });
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, item?: Transaction }>({ open: false });

    const canManage = role !== UserRole.VIEWER;
    const student = useMemo(() => students.find(s => s.id === id), [students, id]);
    
    const enrolledClasses = useMemo(() => 
        classes.filter(c => (c.studentIds || []).includes(id!)), 
    [classes, id]);
    
    const studentProgressReports = useMemo(() => 
        progressReports.filter(pr => pr.studentId === id),
    [progressReports, id]);

    const studentTransactions = useMemo(() => 
        transactions.filter(t => t.studentId === id),
    [transactions, id]);

    const studentAttendance = useMemo(() => 
        attendance.filter(a => a.studentId === id),
    [attendance, id]);

    const [transactionSortConfig, setTransactionSortConfig] = useState<SortConfig<Transaction & { endingBalance: number }> | null>({ key: 'date', direction: 'descending' });
    
    const transactionsWithEndingBalance = useMemo(() => {
        if (!studentTransactions) return [];
        let runningBalance = 0;
        return [...studentTransactions]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(t => {
                runningBalance += t.amount;
                return { ...t, endingBalance: runningBalance };
            });
    }, [studentTransactions]);

    const sortedTransactionsWithEndingBalance = useMemo(() => {
        let sortableItems = [...transactionsWithEndingBalance];
        if (transactionSortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = a[transactionSortConfig.key];
                const bValue = b[transactionSortConfig.key];

                if(transactionSortConfig.key === 'date') {
                    const aDate = new Date(a.date).getTime();
                    const bDate = new Date(b.date).getTime();
                    if (aDate < bDate) return transactionSortConfig.direction === 'ascending' ? -1 : 1;
                    if (aDate > bDate) return transactionSortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }

                if (aValue < bValue) return transactionSortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return transactionSortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [transactionsWithEndingBalance, transactionSortConfig]);

    const handleTransactionSort = (key: keyof (Transaction & { endingBalance: number })) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (transactionSortConfig && transactionSortConfig.key === key && transactionSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setTransactionSortConfig({ key, direction });
    };
    
    const [reportSortConfig, setReportSortConfig] = useState<SortConfig<ProgressReport> | null>({ key: 'date', direction: 'descending' });
    const handleReportSort = (key: keyof ProgressReport) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (reportSortConfig && reportSortConfig.key === key && reportSortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setReportSortConfig({ key, direction });
    };
    const sortedStudentProgressReports = useMemo(() => {
        let sortableItems = [...studentProgressReports];
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
    }, [studentProgressReports, reportSortConfig]);


    if (!student) {
        return <div className="p-6 text-center text-red-500">Không tìm thấy học viên.</div>;
    }
    
    const handleSaveTransaction = async (data: { sign: 'CREDIT' | 'DEBIT'; amount: number; date: string; description: string; }) => {
        try {
            if (transactionModal.item) { // Editing existing transaction
                const updatedTransaction: Transaction = {
                    ...transactionModal.item,
                    date: data.date,
                    description: data.description,
                    amount: data.sign === 'CREDIT' ? data.amount : -data.amount,
                    type: data.sign === 'CREDIT' ? (transactionModal.item.type === TransactionType.PAYMENT ? TransactionType.PAYMENT : TransactionType.ADJUSTMENT_CREDIT) : TransactionType.ADJUSTMENT_DEBIT,
                };
                await updateTransaction(updatedTransaction);
                toast.success('Đã cập nhật giao dịch.');
            } else { // Adding new transaction
                await addAdjustment({
                    studentId: student.id,
                    amount: data.amount,
                    date: data.date,
                    description: data.description,
                    type: data.sign
                });
                toast.success('Đã thêm giao dịch thành công.');
            }
            setTransactionModal({ open: false });
        } catch (error) {
            toast.error("Lỗi khi lưu giao dịch.");
        }
    };

    const handleDeleteTransaction = async () => {
        if (deleteConfirm.item) {
            try {
                await deleteTransaction(deleteConfirm.item.id);
                toast.success('Đã xóa giao dịch.');
            } catch (error) {
                toast.error('Lỗi khi xóa giao dịch.');
            }
        }
    };

    const isEditable = (type: TransactionType) => type !== TransactionType.INVOICE;

    const transactionColumns = [
        { header: 'Ngày', accessor: 'date' as keyof Transaction, sortable: true },
        { header: 'Loại', accessor: (item: Transaction) => transactionTypeMap[item.type], sortable: true, sortKey: 'type' as keyof Transaction },
        { header: 'Mô tả', accessor: 'description' as keyof Transaction, sortable: true },
        { header: 'Số tiền', accessor: (item: Transaction) => (
            <span className={item.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {item.amount.toLocaleString('vi-VN')} ₫
            </span>
        ), sortable: true, sortKey: 'amount' as keyof Transaction },
        { header: 'Số dư cuối kỳ', accessor: (item: Transaction & { endingBalance: number }) => (
            <span className={`font-semibold ${item.endingBalance < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>
                {item.endingBalance.toLocaleString('vi-VN')} ₫
            </span>
        ), sortable: true, sortKey: 'endingBalance' as keyof (Transaction & { endingBalance: number }) },
    ];
    
    const reportColumns = [
        { header: 'Ngày', accessor: 'date' as keyof ProgressReport, sortable: true },
        { header: 'Lớp học', accessor: (item: ProgressReport) => classes.find(c => c.id === item.classId)?.name || 'N/A', sortable: true, sortKey: 'classId' as keyof ProgressReport },
        { header: 'Điểm', accessor: 'score' as keyof ProgressReport, sortable: true },
        { header: 'Nhận xét', accessor: 'comments' as keyof ProgressReport },
    ];

    const balanceColor = student.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    const balanceBg = student.balance >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20';

    const TabButton: React.FC<{ tabId: string; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap ${activeTab === tabId ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'}`}
        >
            {children}
        </button>
    );

    return (
        <>
            <div className="space-y-6">
                 <div className="card-base">
                    <div className="flex justify-between items-start">
                         <div>
                            <h1 className="text-3xl font-bold">{student.name}</h1>
                            <span className={`mt-1 px-2 inline-flex text-sm leading-5 font-semibold rounded-full ${student.status === PersonStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.status === PersonStatus.ACTIVE ? 'Đang hoạt động' : 'Tạm nghỉ'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-2 overflow-x-auto" aria-label="Tabs">
                        <TabButton tabId="overview">Tổng quan</TabButton>
                        <TabButton tabId="transactions">Lịch sử Giao dịch ({studentTransactions.length})</TabButton>
                        <TabButton tabId="reports">Báo cáo Học tập ({studentProgressReports.length})</TabButton>
                    </nav>
                </div>

                {activeTab === 'overview' && (
                    <div className="space-y-6">
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 card-base">
                                <h2 className="text-xl font-bold mb-4">Thông tin Chi tiết</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600 dark:text-gray-300">
                                    <p><strong>Email:</strong> {student.email}</p>
                                    <p><strong>Điện thoại:</strong> {student.phone}</p>
                                    <p><strong>Ngày sinh:</strong> {student.dob}</p>
                                    <p><strong>Phụ huynh:</strong> {student.parentName}</p>
                                    <p className="col-span-1 md:col-span-2"><strong>Địa chỉ:</strong> {student.address}</p>
                                </div>
                            </div>
                             <div 
                                className={`card-base flex flex-col items-center justify-center text-center ${balanceBg} ${canManage && student.balance < 0 ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                onClick={() => canManage && student.balance < 0 && setPaymentModalOpen(true)}
                                title={canManage && student.balance < 0 ? 'Ghi nhận thanh toán' : ''}
                            >
                                <h2 className={`text-sm font-medium ${balanceColor} uppercase tracking-wider`}>Số dư tài khoản</h2>
                                <p className={`text-4xl font-bold mt-2 ${balanceColor}`}>{student.balance.toLocaleString('vi-VN')} ₫</p>
                                 {canManage && student.balance < 0 && (
                                    <div className="mt-2 text-xs font-semibold p-1 bg-black/10 rounded">
                                        Nhấn để ghi nhận thanh toán
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card-base">
                            <h2 className="text-xl font-semibold mb-4">Các lớp đang theo học</h2>
                            <div className="space-y-2">
                                {enrolledClasses.map(c => (
                                    <Link key={c.id} to={`/class/${c.id}`} className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <p className="font-semibold text-primary">{c.name}</p>
                                        <p className="text-sm text-gray-500">{c.subject}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <AttendanceSummaryWidget studentId={student.id} enrolledClasses={enrolledClasses} />
                    </div>
                )}
                
                {activeTab === 'transactions' && (
                     <div className="card-base">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h2 className="text-xl font-semibold">Sổ cái Giao dịch</h2>
                            {canManage && (
                                <Button onClick={() => setTransactionModal({ open: true })} className="w-full md:w-auto">
                                    {ICONS.plus} Thêm Giao dịch
                                </Button>
                            )}
                        </div>
                        <div className="hidden md:block">
                            <Table<Transaction & { endingBalance: number }>
                                columns={transactionColumns}
                                data={sortedTransactionsWithEndingBalance}
                                sortConfig={transactionSortConfig}
                                onSort={handleTransactionSort as any}
                                actions={(item) => canManage && isEditable(item.type) ? (
                                    <>
                                        <button onClick={() => setTransactionModal({ open: true, item })} className="text-indigo-600 hover:text-indigo-900">{ICONS.edit}</button>
                                        <button onClick={() => setDeleteConfirm({ open: true, item })} className="text-red-600 hover:text-red-900">{ICONS.delete}</button>
                                    </>
                                ) : null}
                            />
                        </div>
                         <div className="md:hidden space-y-4">
                            {sortedTransactionsWithEndingBalance.map(item => (
                                <ListItemCard
                                    key={item.id}
                                    title={<span className="font-semibold">{item.description}</span>}
                                    details={[
                                        { label: "Ngày", value: item.date },
                                        { label: "Số tiền", value: <span className={item.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{item.amount.toLocaleString('vi-VN')} ₫</span> },
                                        { label: "Số dư cuối kỳ", value: <span className={`font-semibold ${item.endingBalance < 0 ? 'text-red-600 dark:text-red-400' : ''}`}>{item.endingBalance.toLocaleString('vi-VN')} ₫</span> },
                                    ]}
                                    actions={canManage && isEditable(item.type) ? (
                                        <><Button variant="secondary" size="sm" onClick={() => setTransactionModal({ open: true, item })}>Sửa</Button><Button variant="danger" size="sm" onClick={() => setDeleteConfirm({ open: true, item })}>Xóa</Button></>
                                    ) : undefined}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                     <div className="card-base">
                        <h2 className="text-xl font-semibold mb-4">Lịch sử Báo cáo Tiến độ</h2>
                        <div className="hidden md:block">
                            <Table<ProgressReport>
                                columns={reportColumns}
                                data={sortedStudentProgressReports}
                                sortConfig={reportSortConfig}
                                onSort={handleReportSort}
                            />
                        </div>
                        <div className="md:hidden space-y-4">
                            {sortedStudentProgressReports.map(report => (
                                <ListItemCard
                                    key={report.id}
                                    title={<div className="flex justify-between w-full"><span>{classes.find(c => c.id === report.classId)?.name || 'N/A'}</span><span className="text-primary font-bold">{report.score}/10</span></div>}
                                    details={[
                                        { label: "Ngày", value: report.date },
                                        { label: "Nhận xét", value: <i className="truncate block">{report.comments}</i> },
                                    ]}
                                />
                            ))}
                         </div>
                    </div>
                )}


                <Modal isOpen={transactionModal.open} onClose={() => setTransactionModal({ open: false })} title={transactionModal.item ? 'Sửa Giao dịch' : 'Thêm Giao dịch Mới'}>
                    <AdjustmentForm
                        transactionToEdit={transactionModal.item}
                        onSubmit={handleSaveTransaction}
                        onCancel={() => setTransactionModal({ open: false })}
                    />
                </Modal>
                <ConfirmationModal
                    isOpen={deleteConfirm.open}
                    onClose={() => setDeleteConfirm({ open: false })}
                    onConfirm={handleDeleteTransaction}
                    title="Xác nhận Xóa Giao dịch"
                    message={<p>Bạn có chắc muốn xóa giao dịch "<strong>{deleteConfirm.item?.description}</strong>"? Hành động này sẽ hoàn lại số tiền vào số dư của học viên.</p>}
                />
                 <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    student={student}
                />
            </div>
        </>
    );
};