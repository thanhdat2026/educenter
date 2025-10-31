
import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { Table, SortConfig, Column } from '../common/Table';
import { Payroll, Teacher } from '../../types';
import { ListItemCard } from '../common/ListItemCard';
import { Pagination } from '../common/Pagination';

const ITEMS_PER_PAGE = 10;

interface PayrollTabProps {
    period: 'this_month' | 'last_month' | 'this_year';
}

const getPeriodMonths = (period: 'this_month' | 'last_month' | 'this_year'): string[] => {
    const now = new Date();
    const months = [];
    switch (period) {
        case 'this_month':
            months.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
            break;
        case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            months.push(`${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`);
            break;
        case 'this_year':
            for (let i = 0; i < 12; i++) {
                months.push(`${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`);
            }
            break;
    }
    return months;
};

export const PayrollTab: React.FC<PayrollTabProps> = ({ period }) => {
    const { state } = useData();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<Payroll> | null>({ key: 'month', direction: 'descending' });

    const handleSort = (key: keyof Payroll) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const periodMonths = useMemo(() => new Set(getPeriodMonths(period)), [period]);

    const filteredPayrolls = useMemo(() => {
        let payrolls = state.payrolls.filter(p => periodMonths.has(p.month));
        
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            payrolls = payrolls.filter(p => p.teacherName.toLowerCase().includes(lowerQuery));
        }

        return payrolls;
    }, [state.payrolls, periodMonths, searchQuery]);

    const sortedPayrolls = useMemo(() => {
        let sortableItems = [...filteredPayrolls];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [filteredPayrolls, sortConfig]);

    const totalPages = Math.ceil(sortedPayrolls.length / ITEMS_PER_PAGE);
    const paginatedPayrolls = sortedPayrolls.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    useEffect(() => { setCurrentPage(1); }, [searchQuery, sortConfig, period]);

    const columns: Column<Payroll>[] = [
        { header: 'Tháng', accessor: 'month', sortable: true },
        { header: 'Tên Giáo viên', accessor: 'teacherName', sortable: true },
        { header: 'Số buổi dạy', accessor: 'sessionsTaught', sortable: true },
        { header: 'Lương Cơ bản', accessor: (item) => `${item.baseSalary.toLocaleString('vi-VN')} ₫`, sortable: true, sortKey: 'baseSalary' },
        { header: 'Tổng lương', accessor: (item) => `${item.totalSalary.toLocaleString('vi-VN')} ₫`, sortable: true, sortKey: 'totalSalary' },
    ];

    return (
        <div className="card-base">
            <h2 className="text-xl font-bold mb-4">Bảng lương Giáo viên</h2>
            <input 
                type="text"
                placeholder="Tìm theo tên giáo viên..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-input mb-4"
            />

            <div className="hidden md:block">
                <Table<Payroll> columns={columns} data={paginatedPayrolls} sortConfig={sortConfig} onSort={handleSort} />
            </div>
            <div className="md:hidden space-y-4">
                {paginatedPayrolls.map(item => (
                    <ListItemCard
                        key={item.id}
                        title={`${item.teacherName} - ${item.month}`}
                        details={[
                            { label: "Số buổi", value: item.sessionsTaught > 0 ? item.sessionsTaught : 'Lương cứng' },
                            { label: "Tổng lương", value: `${item.totalSalary.toLocaleString('vi-VN')} ₫` },
                        ]}
                    />
                ))}
            </div>

            {paginatedPayrolls.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={sortedPayrolls.length} itemsPerPage={ITEMS_PER_PAGE} />}
        </div>
    );
};
