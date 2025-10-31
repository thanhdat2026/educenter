import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Table, SortConfig, Column } from '../common/Table';
import { Button } from '../common/Button';
import { ICONS } from '../../constants';
import { Invoice, UserRole } from '../../types';
import { Pagination } from '../common/Pagination';
import { ListItemCard } from '../common/ListItemCard';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { TuitionFeeNoticeModal } from './TuitionFeeNoticeModal';

const ITEMS_PER_PAGE = 10;

const GenerateInvoicesModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (month: number, year: number) => Promise<void>;
}> = ({ isOpen, onClose, onGenerate }) => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const [year, setYear] = useState(lastMonth.getFullYear());
    const [month, setMonth] = useState(lastMonth.getMonth() + 1);
    const [isLoading, setIsLoading] = useState(false);

    const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const handleGenerate = async () => {
        setIsLoading(true);
        await onGenerate(month, year);
        setIsLoading(false);
        onClose();
    };

    return (
        <ConfirmationModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleGenerate}
            title="Chốt & Cập nhật Học phí"
            message={
                <div className="space-y-4">
                    <p>Chọn kỳ để chốt học phí. Hệ thống sẽ tự động:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 pl-2">
                        <li><strong className="font-semibold">Tạo mới</strong> hóa đơn cho những học viên chưa có trong kỳ.</li>
                        <li><strong className="font-semibold">Tính toán & cập nhật lại</strong> số tiền trên các hóa đơn <strong className="text-yellow-600">"Chưa trả"</strong> đã tồn tại nếu có thay đổi về dữ liệu điểm danh.</li>
                        <li><strong className="font-semibold">Bỏ qua</strong> các hóa đơn đã được thanh toán hoặc đã bị hủy.</li>
                    </ul>
                    <div className="flex items-center gap-4 pt-2">
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="form-select">
                            {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                        </select>
                        <select value={year} onChange={e => setYear(Number(e.target.value))} className="form-select">
                            {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                        </select>
                    </div>
                </div>
            }
            confirmButtonText={isLoading ? 'Đang xử lý...' : 'Xác nhận Chốt & Cập nhật'}
            confirmButtonVariant="primary"
        />
    );
};

export const InvoicesTab: React.FC = () => {
    const { state, generateInvoices, cancelInvoice } = useData();
    const { role } = useAuth();
    const { toast } = useToast();
    const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
    const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
    const [cancelConfirm, setCancelConfirm] = useState<Invoice | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<Invoice> | null>({ key: 'generatedDate', direction: 'descending' });

    const canManage = role === UserRole.ADMIN || role === UserRole.ACCOUNTANT;

    const handleSort = (key: keyof Invoice) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredInvoices = useMemo(() => {
        let invoicesToFilter = state.invoices;

        if (classFilter !== 'all') {
            const selectedClass = state.classes.find(c => c.id === classFilter);
            if (selectedClass) {
                const studentIdsInClass = new Set(selectedClass.studentIds);
                invoicesToFilter = invoicesToFilter.filter(inv => studentIdsInClass.has(inv.studentId));
            }
        }

        if (!searchQuery) return invoicesToFilter;
        
        const lowerQuery = searchQuery.toLowerCase();
        return invoicesToFilter.filter(inv => 
            inv.id.toLowerCase().includes(lowerQuery) ||
            inv.studentName.toLowerCase().includes(lowerQuery) ||
            inv.month.includes(lowerQuery)
        );
    }, [state.invoices, state.classes, searchQuery, classFilter]);

    const sortedInvoices = useMemo(() => {
        let sortableItems = [...filteredInvoices];
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
    }, [filteredInvoices, sortConfig]);

    const totalPages = Math.ceil(sortedInvoices.length / ITEMS_PER_PAGE);
    const paginatedInvoices = sortedInvoices.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, classFilter, sortConfig]);

    const getStatusBadge = (item: Invoice) => {
        switch (item.status) {
            case 'PAID':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Đã trả ({item.paidDate})</span>;
            case 'UNPAID':
                 return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Chưa trả</span>;
            case 'CANCELLED':
                 return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Đã hủy</span>;
        }
    };

    const columns: Column<Invoice>[] = [
        { header: 'Mã HĐ', accessor: 'id', sortable: true },
        { header: 'Học viên', accessor: 'studentName', sortable: true },
        { header: 'Tháng', accessor: 'month', sortable: true },
        { header: 'Số tiền', accessor: (item) => `${item.amount.toLocaleString('vi-VN')} ₫`, sortable: true, sortKey: 'amount' },
        { header: 'Ngày tạo', accessor: 'generatedDate', sortable: true },
        { header: 'Trạng thái', accessor: getStatusBadge, sortable: true, sortKey: 'status' },
    ];

    const handleGenerate = async (month: number, year: number) => {
        try {
            await generateInvoices({ month, year });
            toast.success(`Đã chốt/cập nhật hóa đơn cho tháng ${month}/${year}.`);
        } catch (error) {
            toast.error('Lỗi khi xử lý hóa đơn.');
        }
    };
    
    const handleCancelInvoice = async () => {
        if (cancelConfirm) {
            try {
                await cancelInvoice(cancelConfirm.id);
                toast.success('Hóa đơn đã được hủy.');
            } catch (error: any) {
                toast.error(error.message || 'Lỗi khi hủy hóa đơn.');
            }
        }
    };

    return (
        <div className="card-base">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold">Quản lý Hóa đơn</h2>
                {canManage && (
                    <Button onClick={() => setGenerateModalOpen(true)}>
                        {ICONS.calendar} Chốt & Cập nhật Học phí
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm hóa đơn (mã, tên HV, tháng)..."
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
                    {state.classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="hidden md:block">
                <Table<Invoice>
                    columns={columns}
                    data={paginatedInvoices}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    actions={(item) => (
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewInvoice(item)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" title="Xem chi tiết">{ICONS.search}</button>
                            {canManage && item.status === 'UNPAID' && (
                                <button onClick={() => setCancelConfirm(item)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500" title="Hủy hóa đơn">{ICONS.delete}</button>
                            )}
                        </div>
                    )}
                />
            </div>
             <div className="md:hidden space-y-4">
                {paginatedInvoices.map(inv => (
                    <ListItemCard
                        key={inv.id}
                        title={<span className="font-semibold">{inv.studentName} - {inv.month}</span>}
                        details={[
                            { label: "Mã HĐ", value: inv.id },
                            { label: "Số tiền", value: `${inv.amount.toLocaleString('vi-VN')} ₫` },
                        ]}
                        status={{
                            text: inv.status,
                            colorClasses: inv.status === 'PAID' ? 'bg-green-100 text-green-800' : (inv.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800')
                        }}
                        actions={(
                             <div className="flex items-center gap-2">
                                <Button onClick={() => setViewInvoice(inv)} size="sm" variant="secondary">Xem</Button>
                                {canManage && inv.status === 'UNPAID' && (
                                    <Button onClick={() => setCancelConfirm(inv)} size="sm" variant="danger">Hủy</Button>
                                )}
                            </div>
                        )}
                    />
                ))}
            </div>

            {paginatedInvoices.length > 0 && (
                 <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={sortedInvoices.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            )}
            
            <GenerateInvoicesModal
                isOpen={isGenerateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                onGenerate={handleGenerate}
            />
            <TuitionFeeNoticeModal
                isOpen={!!viewInvoice}
                onClose={() => setViewInvoice(null)}
                invoice={viewInvoice}
            />
            <ConfirmationModal
                isOpen={!!cancelConfirm}
                onClose={() => setCancelConfirm(null)}
                onConfirm={handleCancelInvoice}
                title="Xác nhận Hủy Hóa đơn"
                message={<p>Bạn có chắc chắn muốn hủy hóa đơn <strong>#{cancelConfirm?.id}</strong>? Một giao dịch đảo ngược sẽ được tạo để điều chỉnh lại công nợ của học viên.</p>}
            />
        </div>
    );
};