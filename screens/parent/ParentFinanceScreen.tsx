import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useDataContext';
import { Table, SortConfig } from '../../components/common/Table';
import { Invoice, Student } from '../../types';
import { ListItemCard } from '../../components/common/ListItemCard';

export const ParentFinanceScreen: React.FC = () => {
    const { user } = useAuth();
    const { state } = useData();
    const student = user as Student;

    const [sortConfig, setSortConfig] = useState<SortConfig<Invoice> | null>({ key: 'generatedDate', direction: 'descending' });

    const handleSort = (key: keyof Invoice) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedInvoices = useMemo(() => {
        if (!student) return [];
        const studentInvoices = state.invoices.filter(inv => inv.studentId === student.id);
        
        if (sortConfig) {
            studentInvoices.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return studentInvoices;
    }, [student, state.invoices, sortConfig]);

    const columns = [
        { header: 'Mã Hóa đơn', accessor: 'id' as keyof Invoice, sortable: true },
        { header: 'Kỳ thanh toán', accessor: 'month' as keyof Invoice, sortable: true },
        { header: 'Ngày tạo', accessor: 'generatedDate' as keyof Invoice, sortable: true },
        { header: 'Số tiền', accessor: (item: Invoice) => `${item.amount.toLocaleString('vi-VN')} VND`, sortable: true, sortKey: 'amount' as keyof Invoice },
        { header: 'Trạng thái', accessor: (item: Invoice) => (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
                {item.status === 'PAID' ? `Đã trả (${item.paidDate})` : 'Chưa trả'}
            </span>
        ), sortable: true, sortKey: 'status' as keyof Invoice },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Thông tin Học phí</h1>
            
            <div className="md:bg-white md:dark:bg-gray-800 md:p-6 md:rounded-lg md:shadow-md">
                 {/* Desktop Table */}
                 <div className="hidden md:block">
                     <Table<Invoice>
                        columns={columns}
                        data={sortedInvoices}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                     />
                 </div>
                 {/* Mobile Cards */}
                 <div className="md:hidden space-y-4">
                    {sortedInvoices.map(inv => (
                        <ListItemCard 
                            key={inv.id}
                            title={<span className="font-semibold">Hóa đơn {inv.month}</span>}
                            details={[
                                { label: "Mã HĐ", value: inv.id },
                                { label: "Số tiền", value: `${inv.amount.toLocaleString('vi-VN')} ₫` }
                            ]}
                            status={{
                                text: inv.status === 'PAID' ? `Đã trả (${inv.paidDate})` : (inv.status === 'CANCELLED' ? 'Đã hủy' : 'Chưa trả'),
                                colorClasses: inv.status === 'PAID' 
                                    ? 'bg-green-100 text-green-800' 
                                    : (inv.status === 'UNPAID' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : 'bg-gray-100 text-gray-800')
                            }}
                        />
                    ))}
                 </div>
            </div>
        </div>
    );
};