import React, { useMemo } from 'react';
import { useData } from '../../hooks/useDataContext';
import { useAuth } from '../../hooks/useAuth';
import { Table } from '../common/Table';
import { Payroll, Teacher, UserRole } from '../../types';
import { ListItemCard } from '../common/ListItemCard';

interface TeacherPayrollTabProps {
    period: 'this_month' | 'last_month' | 'this_year';
}

const getPeriodDateRange = (period: 'this_month' | 'last_month' | 'this_year'): { startYear: number, endYear: number, startMonth: number, endMonth: number } => {
    const now = new Date();
    switch (period) {
        case 'this_month':
            return { startYear: now.getFullYear(), endYear: now.getFullYear(), startMonth: now.getMonth() + 1, endMonth: now.getMonth() + 1 };
        case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return { startYear: lastMonth.getFullYear(), endYear: lastMonth.getFullYear(), startMonth: lastMonth.getMonth() + 1, endMonth: lastMonth.getMonth() + 1 };
        case 'this_year':
            return { startYear: now.getFullYear(), endYear: now.getFullYear(), startMonth: 1, endMonth: 12 };
    }
};

export const TeacherPayrollTab: React.FC<TeacherPayrollTabProps> = ({ period }) => {
    const { state } = useData();
    const { user, role } = useAuth();

    const teacherPayrolls = useMemo(() => {
        if (!user || role !== UserRole.TEACHER) return [];
        
        const { startYear, endYear, startMonth, endMonth } = getPeriodDateRange(period);

        return state.payrolls
            .filter(p => {
                const [pYear, pMonth] = p.month.split('-').map(Number);
                const payrollDate = new Date(pYear, pMonth - 1);
                const startDate = new Date(startYear, startMonth - 1);
                const endDate = new Date(endYear, endMonth - 1);

                return p.teacherId === (user as Teacher).id &&
                       payrollDate >= startDate &&
                       payrollDate <= endDate;
            })
            .sort((a, b) => b.month.localeCompare(a.month));
    }, [state.payrolls, user, role, period]);

    const columns = [
        { header: 'Tháng', accessor: 'month' as keyof Payroll },
        { header: 'Số buổi dạy', accessor: 'sessionsTaught' as keyof Payroll },
        { header: 'Mức lương', accessor: (item: Payroll) => `${item.baseSalary.toLocaleString('vi-VN')} VND` },
        { header: 'Tổng lương', accessor: (item: Payroll) => `${item.totalSalary.toLocaleString('vi-VN')} VND` },
    ];

    return (
        <div className="card-base">
            <h2 className="text-xl font-bold mb-4">Lịch sử Lương</h2>
            <div className="hidden md:block">
                <Table<Payroll>
                    columns={columns}
                    data={teacherPayrolls}
                    sortConfig={null}
                    onSort={() => {}}
                />
            </div>
             <div className="md:hidden space-y-4">
                {teacherPayrolls.map(item => (
                    <ListItemCard
                        key={item.id}
                        title={<span className="font-semibold">Bảng lương {item.month}</span>}
                        details={[
                            { label: "Số buổi", value: item.sessionsTaught > 0 ? item.sessionsTaught : 'N/A' },
                            { label: "Tổng lương", value: `${item.totalSalary.toLocaleString('vi-VN')} VND` },
                        ]}
                    />
                ))}
            </div>
        </div>
    );
};